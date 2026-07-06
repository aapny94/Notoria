// src/api/apiMenuTree.js
import { getUserCategories } from "./apiCategory.js";

export async function listMenu() {
  const payload = await getUserCategories({ strict: true });
  const raw = Array.isArray(payload) ? payload : payload?.data ?? payload ?? [];
  return raw;
}
