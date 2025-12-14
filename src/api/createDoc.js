

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "app_token";
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;

export async function createDoc(payload) {
  const token = localStorage.getItem(TOKEN_KEY); // Or your token key
  const res = await fetch(`${STRAPI_URL}/api/docs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Failed to create document");
  }

  return await res.json();
}