// src/api/apiMenuTree.js
import { getUserCategories, getCategories } from "./apiCategory.js";

export async function listMenu() {
  // Prefer the safe fallbackable call
  const payload = await getUserCategories(); // will fall back to getCategories() on 404/500
  // Accept either array or wrapped
  const raw = Array.isArray(payload) ? payload : payload?.data ?? payload ?? [];
  return raw;
}