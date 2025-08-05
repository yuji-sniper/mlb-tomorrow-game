import { ERROR_CODE } from '@/shared/constants/error';

export type ApiResponse<T> =
  ApiSuccessResponse<T> |
  ApiErrorResponse;

export type ApiSuccessResponse<T> = {
  ok: true;
  data: T;
}

export type ApiErrorResponse = {
  ok: false;
  error: {
    code: keyof typeof ERROR_CODE;
    message: string;
    data?: Record<string, unknown>;
  }
}
