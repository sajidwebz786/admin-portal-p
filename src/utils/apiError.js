export function apiErrorMessage(error) {
  const data = error?.response?.data;
  const details = Array.isArray(data?.errors) ? data.errors
    .map(item => item.msg || item.message).filter(Boolean) : [];
  if (details.length) return [...new Set(details)].join(' ');
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error === 'string') return data.error;
  if (error?.response?.status === 403) return 'You do not have permission to perform this action.';
  if (error?.response?.status === 404) return 'This record no longer exists. Refresh the list and try again.';
  if (error?.response?.status === 429) return 'Too many requests. Please wait a few minutes and try again.';
  if (error?.code === 'ECONNABORTED') return 'The server is taking longer to respond. Please try again.';
  if (!error?.response) return 'Unable to reach the server. Check your connection and try again.';
  return 'The request could not be completed. Please try again.';
}

export function normalizePayload(value) {
  if (Array.isArray(value)) return value.map(normalizePayload);
  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizePayload(item)]));
  }
  return value === '' ? null : value;
}
