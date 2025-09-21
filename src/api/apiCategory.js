// src/api/apiCategory.js
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "app_token";
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || "http://localhost:1337";

async function fetchJson(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(
      `HTTP ${res.status} on ${url}: ${text || res.statusText}`
    );
    err.status = res.status;
    err.body = text;
    throw err;
  }
  return res.json();
}

export const getUserCategories = async () => {
  const token = localStorage.getItem(TOKEN_KEY);
  // If there's no token, short-circuit to public categories
  if (!token) {
    return getCategories();
  }
  try {
    const data = await fetchJson(
      `${STRAPI_URL}/api/categories?publicationState=preview&pagination[pageSize]=1000&populate=parent,children,categories`,
      {
        headers,
      }
    );
    // Support both wrapped and raw
    return Array.isArray(data) ? data : data.data || [];
  } catch (e) {
    // If /categories/me doesn't exist or errors, fall back to normal categories
    console.error(
      "getUserCategories failed, falling back to getCategories:",
      e
    );
    return getCategories();
  }
};

export async function getCategories() {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const data = await fetchJson(
    `${STRAPI_URL}/api/categories?publicationState=preview&pagination[pageSize]=1000`,
    {
      headers,
    }
  );
  return data.data || [];
}
