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
import { fetchAllCategories } from "../models/categoryModel.js";
export async function getAllCategories(req, res, next) {
  try {
    const rows = await fetchAllCategories();
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

import { createCategory } from "../models/categoryModel.js";

export async function postCategory(req, res, next) {
  try {
    const { name, parent_id } = req.body;
    if (!name) return res.status(400).json({ error: "Category name is required" });
    const category = await createCategory({ name, parent_id });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}