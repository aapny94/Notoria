// src/controllers/documentController.js
import { getDocumentPreviewById } from "../models/documentModel.js";
import {
  updateDocumentByIdOrSlug,
  snapshotDocumentVersion,
} from "../models/documentModel.js";

export async function getDocumentPreview(req, res, next) {
  try {
    const { idOrSlug } = req.params;
    const doc = await getDocumentPreviewById(idOrSlug);
    if (!doc) return res.status(404).json({ error: "Document not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
}

function textFrom(nodes = []) {
  return nodes
    .map((n) => {
      let txt = typeof n.text === "string" ? n.text : "";
      if (n.marks) {
        for (const mark of n.marks) {
          if (mark.type === "bold") txt = `**${txt}**`;
          if (mark.type === "italic") txt = `*${txt}*`;
          if (mark.type === "underline") txt = `<u>${txt}</u>`;
          if (mark.type === "link" && mark.attrs?.href)
            txt = `[${txt}](${mark.attrs.href})`;
          if (mark.type === "code") txt = `\`${txt}\``;
          if (mark.type === "highlight") txt = `==${txt}==`;
        }
      }
      return txt;
    })
    .join("");
}

function jsonToMarkdown(doc) {
  try {
    if (!doc || doc.type !== "doc") return "";
    const out = [];
    for (const node of doc.content || []) {
      if (node.type === "heading") {
        const level = Math.min(Math.max(node.attrs?.level || 1, 1), 6);
        const txt = textFrom(node.content);
        out.push("#".repeat(level) + " " + txt);
        out.push("");
      } else if (node.type === "paragraph") {
        const txt = textFrom(node.content);
        out.push(txt);
        out.push("");
      } else if (node.type === "bulletList") {
        for (const li of node.content || []) {
          const para = li.content?.find((c) => c.type === "paragraph");
          const txt = textFrom(para?.content || []);
          out.push(`- ${txt}`);
        }
        out.push("");
      } else if (node.type === "orderedList") {
        let i = 1;
        for (const li of node.content || []) {
          const para = li.content?.find((c) => c.type === "paragraph");
          const txt = textFrom(para?.content || []);
          out.push(`${i}. ${txt}`);
          i += 1;
        }
        out.push("");
      } else if (node.type === "blockquote") {
        for (const para of node.content || []) {
          const txt = textFrom(para.content || []);
          out.push("> " + txt);
        }
        out.push("");
      } else if (node.type === "codeBlock") {
        // Default to 'js' if language is missing
        const lang = node.attrs?.language || "js";
        const code = node.content?.map((c) => c.text).join("") || "";
        out.push("```" + lang);
        for (const line of code.split("\n")) {
          out.push(line);
        }
        out.push("```");
        out.push("");
      }
    }
    return out
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  } catch {
    return "";
  }
}

/**
 * Keep content_md as canonical (markdown-first), while also syncing JSON.
 * Accepts:
 *  A) { content_md: "# ..." }
 *  B) { content: { type: 'doc', ... } }
 *  C) { content: { json: { type: 'doc', ... }, markdown?: string } }
 */
export async function updateDocument(req, res, next) {
  try {
    const { idOrSlug } = req.params;
    const body = req.body || {};

    let normalizedJson = undefined; // TipTap doc
    let normalizedMd = undefined; // markdown

    // If explicit markdown is provided, use it as source of truth
    if (typeof body.content_md === "string" && body.content_md.trim().length) {
      normalizedMd = body.content_md;
    }

    // Normalize JSON content if provided in any supported shape
    if (body.content) {
      if (body.content.type === "doc") {
        normalizedJson = body.content;
      } else if (body.content.json && body.content.json.type === "doc") {
        normalizedJson = body.content.json;
        if (!normalizedMd && typeof body.content.markdown === "string") {
          normalizedMd = body.content.markdown; // prefer explicit markdown if present
        }
      } else if (typeof body.content === "object") {
        normalizedJson = body.content; // fallback: pass object through
      }
    }

    // If we have JSON but no markdown, derive a minimal markdown
    if (!normalizedMd && normalizedJson) {
      normalizedMd = jsonToMarkdown(normalizedJson);
    }

    // Build final payload for the model
    const payloadForModel = {
      ...body,
      ...(normalizedMd ? { content_md: normalizedMd } : {}),
      ...(normalizedJson ? { content: normalizedJson } : {}),
    };

    const updated = await updateDocumentByIdOrSlug(idOrSlug, payloadForModel);
    if (!updated) return res.status(404).json({ error: "Document not found" });

    // Snapshot only when JSON changed
    if (normalizedJson) {
      await snapshotDocumentVersion(updated.id);
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
}
