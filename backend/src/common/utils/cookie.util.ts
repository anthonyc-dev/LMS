import { Response } from 'express';

export const setAuthCookies = (
  response: Response,
  accessToken: string,
  refreshToken: string,
) => {
  // const isProduction =
  //   process.env.NODE_ENV === 'production' ||
  //   (process.env.CORS_ORIGIN && !process.env.CORS_ORIGIN.includes('localhost'));

  response.cookie('accessToken', accessToken, {
    httpOnly: false,
    secure: true,
    sameSite: 'none',
    maxAge: 15 * 60 * 1000,
  });

  response.cookie('refreshToken', refreshToken, {
    httpOnly: false,
    secure: true,
    sameSite: 'none',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (response: Response) => {
  response.clearCookie('accessToken');
  response.clearCookie('refreshToken');
};
