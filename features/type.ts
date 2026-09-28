export type AppResponse<T> = {
  data: T;
  success: boolean;
  message: string | null;
};
