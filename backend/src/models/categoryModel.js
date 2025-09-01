// src/models/categoryModel.js
import pool from "../config/db.js";

/** Fetch all categories + docs in flat form */
export async function fetchCategoriesAndDocs() {
  const sql = `
    SELECT
      c.id        AS category_id,
      c.name      AS category_name,
      c.parent_id,
      d.id        AS doc_id,
      d.title     AS doc_title
    FROM categories c
    LEFT JOIN documents d ON d.category_id = c.id
    ORDER BY c.parent_id NULLS FIRST, c.name, d.title;
  `;
  const { rows } = await pool.query(sql);
  return rows;
}