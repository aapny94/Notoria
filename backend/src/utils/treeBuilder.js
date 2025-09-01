// src/utils/treeBuilder.js
export function buildCategoryTree(rows) {
  const categories = {};
  const roots = [];

  for (const row of rows) {
    // Ensure category node exists
    if (!categories[row.category_id]) {
      categories[row.category_id] = {
        id: row.category_id,
        name: row.category_name,
        parent_id: row.parent_id,
        children: [],
        titles: [],
      };
    }

    // Attach document title if exists
    if (row.doc_id) {
      categories[row.category_id].titles.push({
        id: row.doc_id,
        title: row.doc_title,
      });
    }
  }

  // Build tree relationships
  Object.values(categories).forEach((cat) => {
    if (cat.parent_id && categories[cat.parent_id]) {
      categories[cat.parent_id].children.push(cat);
    } else {
      roots.push(cat);
    }
  });

  return roots;
}