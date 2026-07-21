import { API_BASE_URL } from "../config/env";

export const resolveMediaUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }
  // Strip starting slash if present and combine with API_BASE_URL
  const cleanUrl = url.startsWith("/") ? url.slice(1) : url;
  return `${API_BASE_URL}/${cleanUrl}`;
};
