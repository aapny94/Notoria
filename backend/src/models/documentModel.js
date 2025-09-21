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
  d.category_id,           -- add this line
  d.created_at AS created,
  d.updated_at AS updated,
  d.content       AS content_json,
  d.content_md    AS content_md
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
    category_id: row.category_id, // add this line
    created: row.created,
    updated: row.updated,
    content: {
      markdown: markdown,
      json: row.content_json,
    },
  };
}

export async function updateDocumentByIdOrSlug(idOrSlug, payload) {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      idOrSlug
    );

  // dynamic SET builder
  const sets = [];
  const vals = [idOrSlug];
  if (Object.prototype.hasOwnProperty.call(payload, "category_id")) {
    sets.push(`category_id = $${vals.length + 1}`);
    vals.push(payload.category_id);
  }

  if (Object.prototype.hasOwnProperty.call(payload, "title")) {
    sets.push(`title = $${vals.length + 1}`);
    vals.push(payload.title);
  }
  if (Object.prototype.hasOwnProperty.call(payload, "summary")) {
    sets.push(`summary = $${vals.length + 1}`);
    vals.push(payload.summary);
  }
  if (Object.prototype.hasOwnProperty.call(payload, "tags")) {
    sets.push(`tags = $${vals.length + 1}`);
    vals.push(Array.isArray(payload.tags) ? payload.tags : []);
  }
  if (Object.prototype.hasOwnProperty.call(payload, "content")) {
    sets.push(`content = $${vals.length + 1}::jsonb`);
    // Ensure JSON string for parameterized cast
    vals.push(JSON.stringify(payload.content));
  }
  if (Object.prototype.hasOwnProperty.call(payload, "content_md")) {
    sets.push(`content_md = $${vals.length + 1}`);
    vals.push(payload.content_md);
  }

  // Always bump updated_at
  sets.push(`updated_at = now()`);

  // If nothing but updated_at changed, just return current row
  if (sets.length === 1) {
    const { rows } = await pool.query(
      `SELECT id, title, slug, content, content_md, summary, tags, status, created_at, updated_at
       FROM documents
       WHERE ${isUuid ? "id = $1::uuid" : "slug = $1"}
       LIMIT 1`,
      [idOrSlug]
    );
    return rows[0] || null;
  }

  const sql = `
    UPDATE documents
    SET ${sets.join(", ")}
    WHERE ${isUuid ? "id = $1::uuid" : "slug = $1"}
    RETURNING id, title, slug, content, content_md, summary, tags, status, created_at, updated_at;
  `;

  const { rows } = await pool.query(sql, vals);
  return rows[0] || null;
}

export async function snapshotDocumentVersion(documentId) {
  const { rows: verRows } = await pool.query(
    `SELECT COALESCE(MAX(version), 0) + 1 AS next FROM document_versions WHERE document_id = $1`,
    [documentId]
  );
  const next = verRows[0]?.next || 1;

  await pool.query(
    `INSERT INTO document_versions (id, document_id, version, content, created_at, content_md)
     SELECT gen_random_uuid(), d.id, $2, d.content, now(), d.content_md
     FROM documents d
     WHERE d.id = $1`,
    [documentId, next]
  );
}
