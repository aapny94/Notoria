import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;

export const getDocumentByIdOrSlug = async (idOrSlug) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/docs/${idOrSlug}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching document:", error);
    throw error;
  }
};