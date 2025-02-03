export interface ActionResponse<Data = any, Error = any> {
  success: boolean;
  data?: Data;
  error?: Error;
} 