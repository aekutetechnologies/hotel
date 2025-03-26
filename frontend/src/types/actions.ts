export interface ActionResponse<TData, TError = unknown> {
  data: TData | null
  error?: TError | null
} 