import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "";
const api = axios.create({ baseURL: BASE_URL });

// Fetch a document by id or slug
export const getDocumentByIdOrSlug = async (idOrSlug) => {
  if (!idOrSlug) {
    console.warn("getDocumentByIdOrSlug called without idOrSlug — skipping request");
    return null;
  }
  try {
    const { data } = await api.get(`/api/docs/${idOrSlug}`);
    return data;
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
};

// Update a document
export const updateDocument = async (idOrSlug, payload) => {
  if (!idOrSlug) throw new Error("updateDocument requires idOrSlug");
  const { data } = await api.put(`/api/docs/${idOrSlug}`, payload);
  return data;
};