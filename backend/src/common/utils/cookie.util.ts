import { Response } from 'express';

export const setAuthCookies = (
  response: Response,
  accessToken: string,
  refreshToken: string,
) => {
  const isProd = process.env.NODE_ENV === 'production';

  response.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ('none' as const) : ('lax' as const),
    maxAge: 15 * 60 * 1000,
  });

  response.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ('none' as const) : ('lax' as const),
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (response: Response) => {
  response.clearCookie('accessToken');
  response.clearCookie('refreshToken');
};
