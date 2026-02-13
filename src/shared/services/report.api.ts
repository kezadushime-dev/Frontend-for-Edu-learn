import { getToken } from '../../features/auth/utils/auth.storage';
import { ApiError, request } from './apiBase';
import { normalizeReportRequest, normalizeRequestCollection } from '../report/report.utils';
import type { ReportDecision, ReportRequest } from '../types/report';

type RequestDownloadInput = {
  courseId?: string;
  courseName?: string;
  classLevel?: string;
  quizId?: string;
  quizTitle?: string;
  quiz?: string;
};

type ReportRequestFilters = {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL';
  courseId?: string;
};

type DownloadReportResult =
  | {
      type: 'blob';
      blob: Blob;
      fileName: string;
    }
  | {
      type: 'url';
      url: string;
      fileName: string;
    };

const baseUrl =
  (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_BASE_URL ||
  'https://backend-for-edulearn.onrender.com/api/v1';

const toRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {};

const pickRequestLikeObject = (payload: unknown): unknown => {
  const body = toRecord(payload);
  const data = toRecord(body.data);
  return (
    data.request ||
    data.reportRequest ||
    data.report ||
    body.request ||
    body.reportRequest ||
    body.report ||
    payload
  );
};

const getRequestList = (payload: unknown): ReportRequest[] => {
  const body = toRecord(payload);
  const data = toRecord(body.data);
  const candidates = [
    data.reports,
    data.requests,
    data.reportRequests,
    data.items,
    body.reports,
    body.requests,
    body.reportRequests,
    body.items,
    payload
  ];

  for (const candidate of candidates) {
    const normalized = normalizeRequestCollection(candidate);
    if (normalized.length) return normalized;
  }

  return [];
};

const getMostRecentRequest = (items: ReportRequest[]): ReportRequest | null => {
  if (!items.length) return null;
  return [...items]
    .sort((a, b) => {
      const aDate = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const bDate = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return bDate - aDate;
    })
    .at(0) || null;
};

const extractSingleRequest = (payload: unknown): ReportRequest | null => {
  const fromList = getMostRecentRequest(getRequestList(payload));
  if (fromList) return fromList;

  const requestLike = normalizeReportRequest(pickRequestLikeObject(payload));
  return requestLike.id || requestLike.studentId ? requestLike : null;
};

const stringifyQuery = (filters: ReportRequestFilters): string => {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
  if (filters.courseId) params.set('courseId', filters.courseId);
  const query = params.toString();
  return query ? `?${query}` : '';
};

const isNotFound = (error: unknown): boolean => error instanceof ApiError && error.status === 404;

const tryFallback = async <T>(calls: Array<() => Promise<T>>): Promise<T> => {
  let lastError: unknown = null;
  for (const call of calls) {
    try {
      return await call();
    } catch (error) {
      lastError = error;
      if (!isNotFound(error)) break;
    }
  }
  throw lastError ?? new Error('No matching endpoint for report workflow.');
};

const parseFileName = (contentDisposition: string | null): string | null => {
  if (!contentDisposition) return null;

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]).replace(/['"]/g, '');
  }

  const plainMatch = contentDisposition.match(/filename="?([^"]+)"?/i);
  if (plainMatch?.[1]) {
    return plainMatch[1];
  }

  return null;
};

export const reportService = {
  requestDownload: async (input: RequestDownloadInput = {}): Promise<ReportRequest> => {
    const response = await tryFallback<unknown>([
      () => request('/reports', { method: 'PATCH', json: input }),
      () => request('/reports/', { method: 'PATCH', json: input }),
      () => request('/reports/request-download', { method: 'PATCH', json: input })
    ]);
    return normalizeReportRequest(extractSingleRequest(response) || pickRequestLikeObject(response));
  },

  getLearnerRequest: async (): Promise<ReportRequest | null> => {
    try {
      const response = await tryFallback<unknown>([
        () => request('/reports/request-download', { method: 'GET' }),
        () => request('/reports/request-download/status', { method: 'GET' }),
        () => request('/reports/requests/me', { method: 'GET' }),
        () => request('/reports', { method: 'GET' }),
        () => request('/reports/', { method: 'GET' })
      ]);

      return extractSingleRequest(response);
    } catch (error) {
      if (isNotFound(error)) return null;
      throw error;
    }
  },

  listRequests: async (filters: ReportRequestFilters = {}): Promise<ReportRequest[]> => {
    const query = stringifyQuery(filters);
    const response = await tryFallback<unknown>([
      () => request(`/reports${query}`),
      () => request(`/reports/${query ? `?${query.slice(1)}` : ''}`),
      () => request(`/reports/requests${query}`),
      () => request(`/reports/request-download/requests${query}`),
      () => request(`/reports/request-download${query ? `${query}&scope=all` : '?scope=all'}`)
    ]);

    return getRequestList(response);
  },

  decideRequest: async (requestId: string, decision: ReportDecision): Promise<ReportRequest> => {
    const payload = { status: decision };
    const response = await tryFallback<unknown>([
      () => request(`/reports/${requestId}/decision`, { method: 'PATCH', json: payload }),
      () => request(`/reports/${requestId}`, { method: 'PATCH', json: payload }),
      () => request('/reports', { method: 'PATCH', json: { requestId, ...payload } }),
      () => request('/reports/', { method: 'PATCH', json: { requestId, ...payload } }),
      () => request(`/reports/requests/${requestId}/decision`, { method: 'PATCH', json: payload }),
      () => request(`/reports/requests/${requestId}`, { method: 'PATCH', json: payload }),
      () => request(`/reports/request-download/${requestId}`, { method: 'PATCH', json: payload }),
      () => request('/reports/request-download', { method: 'PATCH', json: { requestId, ...payload } })
    ]);

    return normalizeReportRequest(pickRequestLikeObject(response));
  },

  downloadApprovedReport: async (params: { requestId?: string; courseId?: string; quizId?: string } = {}): Promise<DownloadReportResult> => {
    const token = getToken();
    const headers = new Headers();
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const query = new URLSearchParams();
    if (params.requestId) query.set('requestId', params.requestId);
    if (params.courseId) query.set('courseId', params.courseId);
    if (params.quizId) query.set('quizId', params.quizId);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const withSlashQueryString = queryString ? `/?${query.toString()}` : '/';
    const candidates = [
      `${baseUrl}/reports/download${queryString}`,
      `${baseUrl}/reports/`,
      `${baseUrl}/reports`,
      `${baseUrl}/reports${queryString}`,
      `${baseUrl}/reports${withSlashQueryString}`
    ];

    let lastError: unknown = null;

    for (const url of candidates) {
      const response = await fetch(url, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        const asJson = contentType.includes('application/json')
          ? await response.json().catch(() => ({}))
          : null;
        const message =
          (asJson && toRecord(asJson).message && String(toRecord(asJson).message)) ||
          (asJson && toRecord(asJson).error && String(toRecord(asJson).error)) ||
          'Unable to download report.';
        const error = new ApiError(response.status, message);
        lastError = error;
        if (response.status === 404 || response.status === 405) {
          continue;
        }
        if (response.status === 401 || response.status === 403) {
          throw error;
        }
        continue;
      }

      const contentType = response.headers.get('content-type') || '';
      const fileName =
        parseFileName(response.headers.get('content-disposition')) || `edulearn-report-${Date.now()}.pdf`;

      if (contentType.includes('application/json')) {
        const body = await response.json().catch(() => ({}));
        const data = toRecord(toRecord(body).data);
        const urlValue = data.url || data.downloadUrl || data.reportUrl || data.fileUrl || toRecord(body).url;
        if (typeof urlValue === 'string' && urlValue.length) {
          return { type: 'url', url: urlValue, fileName };
        }

        const extractedRequest = extractSingleRequest(body);
        if (extractedRequest?.status && extractedRequest.status !== 'APPROVED') {
          throw new ApiError(403, `Report is ${extractedRequest.status}. Approval is required before download.`);
        }

        lastError = new Error('Report download did not return a PDF file.');
        continue;
      }

      const blob = await response.blob();
      return { type: 'blob', blob, fileName };
    }

    throw lastError instanceof Error ? lastError : new Error('Unable to download report.');
  }
};

export type { DownloadReportResult, ReportRequestFilters, RequestDownloadInput };
