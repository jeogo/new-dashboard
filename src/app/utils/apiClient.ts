// src/utils/apiClient.ts

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://storebot.fra1.zeabur.app";

export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${BASE_URL}${endpoint}`);
    if (!response.ok)
      throw new Error(`GET request failed: ${response.statusText}`);
    return response.json();
  },

  post: async (endpoint: string, body: Record<string, any>) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok)
      throw new Error(`POST request failed: ${response.statusText}`);
    return response.json();
  },

  put: async (endpoint: string, body: Record<string, any>) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok)
      throw new Error(`PUT request failed: ${response.statusText}`);
    return response.json();
  },

  delete: async (endpoint: string) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
    });
    if (!response.ok)
      throw new Error(`DELETE request failed: ${response.statusText}`);
    return response.json();
  },
};
