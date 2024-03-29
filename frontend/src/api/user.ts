import { env } from '@/env';
import { HttpError } from '@/errors/httpError/httpError';

export type UserData = {
  uuid: string;
  email: string;
  username: string;
  isAdmin: boolean;
  emailActive: boolean;
  profilePictureUrl: string;
};

export const getUserData = async () => {
  const res = await fetch(`${env.VITE_BACKEND_HOST}/user`, {
    credentials: 'include',
  });
  if (!res.ok) {
    throw new HttpError({
      message: await res.text(),
      statusCode: res.status,
    });
  }

  return (await res.json()) as UserData;
};
