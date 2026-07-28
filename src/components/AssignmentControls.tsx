"use client";

import { useMemo, useState } from "react";
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
  const [isAssigning, setIsAssigning] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function handleAssign() {
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

    setIsAssigning(true);
    setFeedback(null);
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
    }
  }

  return (
    <>
      <td>
        <select
          className="control-select"
          value={selectedUserId}
          disabled={isAssigning}
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
          disabled={isAssigning}
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
    </>
  );
}
