// src/api/apiCategory.js
const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "app_token";
const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || "http://localhost:1337";

function authHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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

function isNumericId(v) {
  return typeof v === "string" ? /^[0-9]+$/.test(v) : Number.isInteger(v);
}

export const getUserCategories = async () => {
  const headers = authHeaders();
  const userStr = localStorage.getItem(TOKEN_KEY + "_user");
  const currentUserId = userStr ? JSON.parse(userStr).id : null;

  if (!currentUserId) {
    console.warn("No current user ID found, returning all categories.");
    return getCategories();
  }

  try {
    // URL-encode filter for Strapi relation
    const url = `${STRAPI_URL}/api/categories?populate=users_permissions_user&filters%5Busers_permissions_user%5D%5Bid%5D%5B%24eq%5D=${currentUserId}`;
    const data = await fetchJson(url, { headers });
    return Array.isArray(data) ? data : data.data || [];
  } catch (e) {
    console.error(
      "getUserCategories failed, falling back to getCategories:",
      e
    );
    return getCategories();
  }
};

export async function getCategories() {
  const headers = authHeaders();
  const data = await fetchJson(
    `${STRAPI_URL}/api/categories?publicationState=preview&pagination[pageSize]=1000`,
    { headers }
  );
  return data.data || [];
}

export async function getAllCategories() {
  const headers = authHeaders();
  const res = await fetch(`${STRAPI_URL}/api/categories`, { headers });
  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return data.data || [];
}

export async function createCategory(payload) {
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
  };
  const res = await fetch(`${STRAPI_URL}/api/categories`, {
    method: "POST",
    headers,
    body: JSON.stringify({ data: payload }),
  });

  if (!res.ok) {
    let errorJson = {};
    try {
      errorJson = await res.json();
    } catch {}
    console.error("Strapi createCategory error:", errorJson);
    throw new Error(
      errorJson?.error?.message ||
        errorJson?.message ||
        "Failed to create category"
    );
  }

  return await res.json();
}

export async function updateCategory(idOrDocId, fields) {
  const headers = {
    "Content-Type": "application/json",
    ...authHeaders(),
  };

  // Resolve numeric id -> documentId (v5 single-item routes use documentId)
  let docId = idOrDocId;
  if (isNumericId(idOrDocId)) {
    const resolved = await fetchJson(
      `${STRAPI_URL}/api/categories?publicationState=preview&fields[0]=documentId&filters[id][$eq]=${idOrDocId}`,
      { headers: authHeaders() }
    );
    docId =
      resolved?.data?.[0]?.documentId ||
      resolved?.data?.[0]?.attributes?.documentId ||
      null;
    if (!docId) throw new Error(`Category id ${idOrDocId} not found`);
  }

  const res = await fetch(`${STRAPI_URL}/api/categories/${docId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ data: fields }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to update category");
  }
  return await res.json();
}

export async function deleteCategory(id) {
  const baseHeaders = authHeaders();
  const headers = { "Content-Type": "application/json", ...baseHeaders };

  // 1. Fetch category by numeric id, populate docs
  const cat = await fetchJson(
    `${STRAPI_URL}/api/categories?filters[id][$eq]=${id}&populate=docs`,
    { headers: baseHeaders }
  );

  const catData = cat?.data?.[0];
  if (!catData) throw new Error("Category not found");

  // 2. Check for linked docs
  const linkedDocs = catData?.docs || catData?.attributes?.docs?.data || [];
  if (Array.isArray(linkedDocs) && linkedDocs.length > 0) {
    throw new Error("Can't delete, this category still has docs linked to it");
  }

  // 3. Get documentId from category
  const documentId =
    catData?.documentId ||
    catData?.attributes?.documentId ||
    null;
  if (!documentId) throw new Error("No documentId found for this category");

  // 4. Delete category using documentId
  const del = await fetch(`${STRAPI_URL}/api/categories/${documentId}`, {
    method: "DELETE",
    headers,
  });

  if (del.status === 204) return true;
  if (!del.ok) {
    const txt = await del.text().catch(() => "");
    throw new Error(txt || "Failed to delete category");
  }

  // Optional: verify deletion
  try {
    await fetchJson(`${STRAPI_URL}/api/categories/${documentId}`, {
      headers: baseHeaders,
    });
    throw new Error("Delete reported success but category still exists");
  } catch (e) {
    // 404 means it's gone
    return true;
  }
}