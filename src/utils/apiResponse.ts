import type { Response } from "express";

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message: string;
}

export interface ApiErrorResponse {
  error: {
    message: string;
    code: string;
    details?: unknown;
    stack?: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

type Pagination = {
  rpp: number;
  page: number;
  totalItems: number;
  totalPages: number;
};

export const sendSuccess = <T>(
  res: Response<ApiResponse<T>>,
  data: T,
  message: string,
  options?: {
    status?: number;
    pagination?: Pagination;
  },
) => {
  const { status = 200, pagination } = options ?? {};
  return res.status(status).json({
    success: true,
    message,
    ...(pagination && { pagination }),
    data,
  });
};
