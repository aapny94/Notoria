// src/controllers/categoryController.js
import { fetchCategoriesAndDocs } from "../models/categoryModel.js";
import { buildCategoryTree } from "../utils/treeBuilder.js";

export async function getCategoryMenu(req, res, next) {
  try {
    const rows = await fetchCategoriesAndDocs();
    const tree = buildCategoryTree(rows);
    res.json(tree);
  } catch (err) {
    next(err);
  }
}