"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import type {
  AssigneeOption,
  AssignmentResponse,
  AssignmentTaskType,
} from "@/lib/assignment-types";

interface AssignmentControlsProps {
  taskId: string;
  taskType: AssignmentTaskType | null;
  assigneeOptions: AssigneeOption[];
  staticAssigneeNames: string[];
  recommendedUserId: string;
  recommendedName: string;
  noTaskMessage: string;
  confirmationDetails: Array<{ label: string; value: string }>;
  confirmationNote: string;
}

type Feedback = { tone: "success" | "error"; message: string } | null;

function normalizedName(name: string): string {
  return name.trim().toLocaleUpperCase();
}

export function AssignmentControls({
  taskId,
  taskType,
  assigneeOptions,
  staticAssigneeNames,
  recommendedUserId,
  recommendedName,
  noTaskMessage,
  confirmationDetails,
  confirmationNote,
}: AssignmentControlsProps) {
  const router = useRouter();
  const options = useMemo(() => {
    const optionsByUserId = new Map<string, AssigneeOption>();
    assigneeOptions.forEach((option) => {
      if (option.userId && option.name) optionsByUserId.set(option.userId, option);
    });
    if (recommendedUserId && recommendedName) {
      optionsByUserId.set(recommendedUserId, { userId: recommendedUserId, name: recommendedName });
    }
    return Array.from(optionsByUserId.values()).sort((left, right) => left.name.localeCompare(right.name));
  }, [assigneeOptions, recommendedName, recommendedUserId]);
  const unavailableNames = useMemo(() => {
    const resolvedNames = new Set(options.map((option) => normalizedName(option.name)));
    return staticAssigneeNames.filter((name) => !resolvedNames.has(normalizedName(name)));
  }, [options, staticAssigneeNames]);
  const resolvedRecommendedUserId = recommendedUserId || options.find(
    (option) => normalizedName(option.name) === normalizedName(recommendedName),
  )?.userId || "";
  const [selectedUserId, setSelectedUserId] = useState(resolvedRecommendedUserId);
  const selectedAssignee = options.find((option) => option.userId === selectedUserId) ?? null;
  const [isConfirming, setIsConfirming] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (!isConfirming) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isAssigning) setIsConfirming(false);
    }
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isAssigning, isConfirming]);

  function handleAssign() {
    if (!taskId || !taskType) {
      setFeedback({ tone: "error", message: noTaskMessage });
      return;
    }
    if (!selectedUserId) {
      setFeedback({
        tone: "error",
        message: recommendedName
          ? "The recommended assignee’s WMS ID is unavailable."
          : "Select an available assignee.",
      });
      return;
    }

    if (!selectedAssignee) {
      setFeedback({ tone: "error", message: "The selected assignee’s WMS ID is unavailable." });
      return;
    }

    setFeedback(null);
    setIsConfirming(true);
  }

  async function handleConfirm() {
    setIsAssigning(true);
    try {
      const response = await fetch("/api/assign-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, taskType, assigneeUserId: selectedUserId }),
      });
      const result = await response.json() as AssignmentResponse;
      if (!response.ok || !result.success) {
        setFeedback({
          tone: "error",
          message: result.message || "Assignment could not be completed. Refresh and try again.",
        });
        return;
      }

      setFeedback({ tone: "success", message: result.message || "Assignment saved." });
      router.refresh();
    } catch {
      setFeedback({ tone: "error", message: "Assignment could not be completed. Refresh and try again." });
    } finally {
      setIsAssigning(false);
      setIsConfirming(false);
    }
  }

  return (
    <>
      <td>
        <select
          className="control-select"
          value={selectedUserId}
          disabled={isAssigning || isConfirming}
          onChange={(event) => {
            setSelectedUserId(event.target.value);
            setFeedback(null);
          }}
          aria-label="Assignee"
        >
          <option value="">Select assignee</option>
          {options.map((option) => (
            <option key={option.userId} value={option.userId}>{option.name}</option>
          ))}
          {unavailableNames.map((name) => (
            <option key={`unavailable-${name}`} disabled value="">{name} — unavailable</option>
          ))}
        </select>
      </td>
      <td className="assignment-action-cell">
        <button
          className="assign-button"
          type="button"
          disabled={isAssigning || isConfirming}
          onClick={handleAssign}
        >
          {isAssigning ? "Assigning..." : "Assign"}
        </button>
        {feedback ? (
          <span className={`assignment-feedback ${feedback.tone}`} role="status" aria-live="polite">
            {feedback.message}
          </span>
        ) : null}
      </td>
      {isConfirming && selectedAssignee ? createPortal(
        <div
          className="assignment-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isAssigning) setIsConfirming(false);
          }}
        >
          <div
            className="assignment-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`assignment-title-${taskId}`}
          >
            <h3 id={`assignment-title-${taskId}`}>Confirm Assignment</h3>
            <div className="assignment-modal-details">
              {confirmationDetails.map((detail) => (
                <p key={`${detail.label}-${detail.value}`}>
                  <span>{detail.label}:</span>
                  <strong>{detail.value || "—"}</strong>
                </p>
              ))}
              <p>
                <span>Assign to:</span>
                <strong className="assignment-modal-assignee">{selectedAssignee.name}</strong>
              </p>
            </div>
            <p className="assignment-modal-note">{confirmationNote}</p>
            <div className="assignment-modal-actions">
              <button
                className="assignment-modal-button secondary"
                type="button"
                disabled={isAssigning}
                onClick={() => setIsConfirming(false)}
              >
                Cancel
              </button>
              <button
                className="assignment-modal-button primary"
                type="button"
                disabled={isAssigning}
                onClick={handleConfirm}
              >
                {isAssigning ? "Assigning..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
