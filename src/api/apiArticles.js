
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "app_token";
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;

export async function getArticles() {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${STRAPI_URL}/api/docs?populate=category`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch articles");
  const data = await response.json();
  return data.data || [];
}