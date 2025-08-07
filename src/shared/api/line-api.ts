import { CustomError } from "@/shared/errors/error";
import { ERROR_CODE } from "@/shared/constants/error";

type VerifyLineTokenApiSuccessResponse = {
  sub: string;
  aud: string;
  name: string;
  picture: string;
  email: string;
}

type VerifyLineTokenApiErrorResponse = {
  error: string;
  error_description: string;
}

export async function verifyLineTokenApi(
  lineIdToken: string,
): Promise<VerifyLineTokenApiSuccessResponse> {
  const clientId = process.env.NEXT_PUBLIC_LINE_CHANNEL_ID;
  if (!clientId) {
    throw new CustomError(
      ERROR_CODE.INTERNAL_SERVER_ERROR,
      'LINE_CHANNEL_ID is not set in environment variables',
    );
  }

  const res = await fetch(
    'https://api.line.me/oauth2/v2.1/verify',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `id_token=${encodeURIComponent(lineIdToken)}&client_id=${encodeURIComponent(clientId)}`,
    }
  );

  const data = await res.json();

  if (!res.ok) {
    const lineVerifyData = data as VerifyLineTokenApiErrorResponse;
    throw new CustomError(
      ERROR_CODE.UNAUTHORIZED,
      `Failed to verify LINE ID token: ${lineVerifyData.error_description}`,
    );
  }

  return data as VerifyLineTokenApiSuccessResponse;
}
