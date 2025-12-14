const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "app_token";
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;

export async function getArticleById(id) {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(
    `${STRAPI_URL}/api/docs?filters[id][$eq]=${id}&populate=*`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  if (!response.ok) throw new Error("Failed to fetch article");
  const data = await response.json();
  return data.data?.[0] || null;
};