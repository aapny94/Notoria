// src/controllers/documentController.js
import { getDocumentPreviewById } from "../models/documentModel.js";

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