/**
 * Controller Response DTO
 */
export interface ControllerResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
}
