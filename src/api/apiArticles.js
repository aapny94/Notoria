const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "app_token";
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;

export async function getArticles() {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const pageSize = 100;
  let page = 1;
  let pageCount = 1;
  const allDocs = [];

  while (page <= pageCount) {
    const params = new URLSearchParams({
      populate: "category",
      publicationState: "preview",
      "pagination[page]": String(page),
      "pagination[pageSize]": String(pageSize),
    });

    const response = await fetch(`${STRAPI_URL}/api/docs?${params.toString()}`, {
      headers,
    });
    if (!response.ok) throw new Error("Failed to fetch articles");

    const payload = await response.json();
    const data = Array.isArray(payload?.data) ? payload.data : [];
    allDocs.push(...data);

    pageCount = Number(payload?.meta?.pagination?.pageCount || 1);
    page += 1;
  }

  return allDocs;
}
