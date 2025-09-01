// src/models/documentModel.js
import pool from "../config/db.js";

/**
 * Returns a single document with preview fields.
 * - If your `content` is jsonb like {format, body}, this extracts body as markdown.
 * - Keeps both `content_json` and plain `content_md` for flexibility.
 */
export async function getDocumentPreviewById(idOrSlug) {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      idOrSlug
    );

  const sql = `
    SELECT
      d.id,
      d.title,
      d.summary,
      d.slug,
      d.tags,
      d.status,
      d.created_at AS created,
      d.updated_at AS updated,
      d.content       AS content_json,     -- json/jsonb column (NOT NULL in your schema)
      d.content_md    AS content_md        -- text column (markdown, nullable)
    FROM documents d
    WHERE ${isUuid ? "d.id = $1::uuid" : "d.slug = $1"}
    LIMIT 1;
  `;

  const { rows } = await pool.query(sql, [idOrSlug]);
  if (rows.length === 0) return null;

  const row = rows[0];

  // Normalize content for the client:
  // - Prefer markdown from content_md
  // - If empty, try to extract from content_json.body (if present)
  let markdown = row.content_md ?? null;
  try {
    if (!markdown && row.content_json && typeof row.content_json === "object") {
      const body = row.content_json.body ?? null;
      if (typeof body === "string") markdown = body;
    }
  } catch {
    // ignore JSON parsing errors
  }

  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    slug: row.slug,
    tags: row.tags || [],
    status: row.status,
    created: row.created,
    updated: row.updated,
    content: {
      markdown: markdown,       // convenient for your viewer/editor
      json: row.content_json,   // full json if you need it
    },
  };
}