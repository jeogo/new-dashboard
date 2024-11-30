// src/utils/apiClient.ts

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://storebot-ouuf.onrender.com";

export const apiClient = {
  get: async (endpoint: string) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      // Remove 'credentials: "include"' if not needed
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(`GET request failed: ${errorMessage}`);
    }
    return response.json();
  },

  post: async (endpoint: string, body: Record<string, any>) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // Remove 'credentials: "include"' if not needed
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(`POST request failed: ${errorMessage}`);
    }
    return response.json();
  },

  put: async (endpoint: string, body?: Record<string, any>) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      // Remove 'credentials: "include"' if not needed
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(`PUT request failed: ${errorMessage}`);
    }
    return response.json();
  },

  delete: async (endpoint: string) => {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      // Remove 'credentials: "include"' if not needed
    });
    if (!response.ok) {
      const errorMessage = await getErrorMessage(response);
      throw new Error(`DELETE request failed: ${errorMessage}`);
    }
    return response.json();
  },
};

// Helper function to extract error message from response
async function getErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data.error || response.statusText;
  } catch {
    return response.statusText;
  }
}
