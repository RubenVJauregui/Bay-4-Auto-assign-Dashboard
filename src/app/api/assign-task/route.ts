import type { AssignmentRequest, AssignmentTaskType } from "@/lib/assignment-types";
import { assignWmsTask } from "@/lib/wms-loader";

const taskTypes = new Set<AssignmentTaskType>(["pick", "load", "receive"]);

function stringField(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const requestHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (origin && requestHost && new URL(origin).host !== requestHost) {
    return Response.json(
      { success: false, message: "Assignment request could not be verified." },
      { status: 403 },
    );
  }

  let body: Record<string, unknown>;
  try {
    const parsedBody: unknown = await request.json();
    if (!parsedBody || typeof parsedBody !== "object" || Array.isArray(parsedBody)) throw new Error("Invalid body");
    body = parsedBody as Record<string, unknown>;
  } catch {
    return Response.json(
      { success: false, message: "Choose an assignee and try again." },
      { status: 400 },
    );
  }

  const taskId = stringField(body.taskId);
  const taskType = stringField(body.taskType) as AssignmentTaskType;
  const assigneeUserId = stringField(body.assigneeUserId);
  if (!taskId || !taskTypes.has(taskType)) {
    return Response.json(
      { success: false, message: "No active task is available for assignment." },
      { status: 400 },
    );
  }
  if (!assigneeUserId) {
    return Response.json(
      { success: false, message: "The selected assignee’s WMS ID is unavailable." },
      { status: 400 },
    );
  }

  const assignment: AssignmentRequest = { taskId, taskType, assigneeUserId };
  const result = await assignWmsTask(assignment);
  return Response.json(result, { status: result.success ? 200 : 502 });
}
