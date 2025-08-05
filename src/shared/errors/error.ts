import { CLIENT_ERROR_CODE, ERROR_CODE } from '@/shared/constants/error';

export class ServerError extends Error {
  constructor(
    public code: keyof typeof ERROR_CODE,
    message: string,
    public data?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ServerError';
  }
}

export class ClientError extends Error {
  constructor(
    public code: keyof typeof CLIENT_ERROR_CODE,
    message: string,
    public data?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'ClientError';
  }
}
