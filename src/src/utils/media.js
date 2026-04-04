import { API_BASE_URL } from "../config";

export const resolveMediaUrl = (url) => {
  if (!url) return "";

  if (url.startsWith("http://localhost:8080")) {
    return url.replace("http://localhost:8080", API_BASE_URL);
  }

  if (url.startsWith("/")) {
    return `${API_BASE_URL}${url}`;
  }

  return url;
};