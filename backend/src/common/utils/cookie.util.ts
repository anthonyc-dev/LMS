import { Response } from 'express';

export const setAuthCookies = (
  response: Response,
  accessToken: string,
  refreshToken: string,
) => {
  const isProd = process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

  response.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd ? true : false,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000,
  });

  response.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd ? true : false,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (response: Response) => {
  response.clearCookie('accessToken');
  response.clearCookie('refreshToken');
};
