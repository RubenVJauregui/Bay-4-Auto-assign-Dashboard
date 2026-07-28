export type AssignmentTaskType = "pick" | "load" | "receive";

export interface AssigneeOption {
  userId: string;
  name: string;
}

export interface AssignmentRequest {
  taskId: string;
  taskType: AssignmentTaskType;
  assigneeUserId: string;
}

export interface AssignmentResponse {
  success: boolean;
  message: string;
}
