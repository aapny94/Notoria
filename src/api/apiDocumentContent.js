const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "app_token";

// src/api/apiDocumentContent.js
async function fetchJson(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(
      `HTTP ${res.status} on ${url}: ${text || res.statusText}`
    );
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function authHeaders() {
  const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "app_token";
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function isNumericId(v) {
  return typeof v === "string" ? /^[0-9]+$/.test(v) : Number.isInteger(v);
}

// Accepts either numeric id ("5") or v5 documentId ("qnbctys78...").
// If a numeric id is passed, we fetch by filter and then return the entry (with its documentId).
export async function getDocByKey(key) {
  const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;
  const headers = authHeaders();

  // If looks like a documentId (non-numeric), call findOne by path immediately
  if (!isNumericId(key)) {
    const data = await fetchJson(`${STRAPI_URL}/api/docs/${key}?populate=*`, {
      headers,
    });
    return data?.data;
  }

  // Else numeric: resolve via filters and return the first match
  const list = await fetchJson(
    `${STRAPI_URL}/api/docs?filters[id][$eq]=${key}&publicationState=preview&populate=*`,
    { headers }
  );
  if (list?.data?.length) return list.data[0];
  throw new Error(`Document with id=${key} not found`);
}

// Update by either numeric id or documentId. If numeric, resolve to documentId first.
export async function updateDoc(key, payload) {
  const STRAPI_URL = import.meta.env.VITE_STRAPI_URL;
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
  };

  // If numeric -> resolve
  let documentId = key;
  if (isNumericId(key)) {
    const found = await fetchJson(
      `${STRAPI_URL}/api/docs?filters[id][$eq]=${key}&publicationState=preview&fields[0]=documentId`,
      { headers }
    );
    if (!found?.data?.length)
      throw new Error(`Cannot resolve numeric id ${key} to documentId`);
    documentId =
      found.data[0].documentId || found.data[0].attributes?.documentId;
  }

  // Use documentId for v5 findOne/update route
  const resp = await fetch(`${STRAPI_URL}/api/docs/${documentId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: payload }),
  });
  if (!resp.ok) {
    const txt = await resp.text().catch(() => "");
    throw new Error(
      `HTTP ${resp.status} on ${resp.url}: ${txt || resp.statusText}`
    );
  }
  const json = await resp.json();
  return json?.data ?? json;
}

// Back-compat: old name
export async function getDocById(id) {
  return getDocByKey(id);
}
