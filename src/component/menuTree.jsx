import { useEffect, useState } from "react";
import { listMenu } from "../api/apiMenuTree.js";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Collapse,
  Tooltip,
  Chip,
  Stack,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom"; // <-- import useParams
import { getArticles } from "../api/apiArticles.js";

// --- helpers to normalize (flat -> tree) and create preview data ---
function buildCategoryTree(categories = []) {
  // categories can be either already nested ({children:[]}) or flat with parent relation
  const looksNested = categories.some(
    (c) => Array.isArray(c.children) && c.children.length > 0
  );
  if (looksNested) return categories;

  // assume flat shape: { id, name, parent?: { id }, titles?: [...] }
  const byId = new Map();
  categories.forEach((c) =>
    byId.set(c.id, { ...c, children: c.children ?? [] })
  );

  const roots = [];
  byId.forEach((c) => {
    const parentId = c.parent?.id ?? c.parent ?? null;
    if (parentId && byId.has(parentId)) {
      const parent = byId.get(parentId);
      parent.children = parent.children || [];
      parent.children.push(c);
    } else {
      roots.push(c);
    }
  });
  return roots;
}

function makeCategoryPreview(node) {
  const titleCount = Array.isArray(node.titles)
    ? node.titles.length
    : node.titlesCount ?? 0;
  const childCount = Array.isArray(node.children)
    ? node.children.length
    : node.childrenCount ?? 0;
  console.log(
    "flat map sample",
    flat.map((f) => ({ id: f.id, name: f.name, parentId: f.parent?.id }))
  );
  return {
    titleCount,
    childCount,
    description: node.description || "",
  };
}

function Titles({ items = [], depth = 0, activeId }) {
  console.log("Titles items:", items);

  const navigate = useNavigate();
  if (!items?.length) return null;
  return (
    <Box
      sx={{
        ml: depth === 0 ? 0 : 3,
        pl: 1.5,
        borderLeft: 1,
        borderColor: "divider",
      }}
    >
      {items.map((t) => (
        <ListItem key={t.id} disablePadding sx={{ pl: depth * 2 }}>
          <ListItemButton dense onClick={() => navigate(`/${t.id}`)}>
            <ListItemText
              primary={t.title}
              primaryTypographyProps={{
                variant: "body2",
                color: t.id === activeId ? "rgba(237, 129, 119, 1)" : undefined,
                fontWeight: t.id === activeId ? 500 : undefined,
                noWrap: true,
                sx: { maxWidth: 190 },
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </Box>
  );
}

function Node({ node, depth = 0, activeId }) {
  const [open, setOpen] = useState(true);
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;
  const hasTitles = Array.isArray(node.titles) && node.titles.length > 0;
  const isExpandable = hasChildren || hasTitles;

  const handleToggle = () => {
    if (isExpandable) setOpen((v) => !v);
  };

  return (
    <Box sx={{ ml: depth === 0 ? 0 : 1.5, mt: depth === 0 ? 2 : 0 }}>
      <ListItem disablePadding sx={{ pl: depth * 2 }}>
        <ListItemButton dense onClick={handleToggle}>
          <ListItemText
            primaryTypographyProps={{
              variant: depth === 0 ? "subtitle1" : "body1",
              fontWeight: depth === 0 ? 600 : 500,
              marginTop: depth === 0 ? 0 : 0,
            }}
            primary={node.name}
          />
          {isExpandable ? open ? <ExpandLess /> : <ExpandMore /> : null}
        </ListItemButton>
      </ListItem>

      <Collapse in={open} timeout="auto" unmountOnExit>
        {/* children categories */}
        {hasChildren && (
          <Box sx={{ pl: 0, ml: 0.5, borderLeft: 1, borderColor: "divider" }}>
            {node.children.map((child) => (
              <Node
                key={child.id}
                node={child}
                depth={depth + 0.05}
                activeId={activeId}
              />
            ))}
          </Box>
        )}
        {/* titles (documents) */}
        <Titles items={node.titles} depth={depth + 0.05} activeId={activeId} />
      </Collapse>
    </Box>
  );
}

export default function MenuTree() {
  const [tree, setTree] = useState([]);
  const { idOrSlug } = useParams(); // <-- get active id from URL

  useEffect(() => {
    listMenu()
      .then((payload) => {
        const raw = Array.isArray(payload) ? payload : payload?.data ?? [];

        const flat = raw.map((cat) => {
          const attrs = cat.attributes || cat;
          const parentData = attrs.parent?.data || attrs.parent || null;
          const childrenData = attrs.children?.data || attrs.children || [];
          const titlesData = attrs.titles?.data || attrs.titles || [];
          return {
            id: cat.id ?? attrs.id,
            name: attrs.name,
            parent: parentData ? { id: parentData.id } : null,
            children: Array.isArray(childrenData)
              ? childrenData.map((c) => ({
                  id: c.id ?? c?.attributes?.id,
                  name: c.attributes?.name || c.name,
                }))
              : [],
            titles: Array.isArray(titlesData)
              ? titlesData.map((t) => ({
                  id: t.id ?? t?.attributes?.id,
                  title: t.attributes?.title || t.title,
                }))
              : [],
            description: attrs.description || "",
          };
        });

        // 👇 put debug log right here
        console.log(
          "flat map sample",
          flat.map((f) => ({ id: f.id, name: f.name, parentId: f.parent?.id }))
        );

        const treeData = buildCategoryTree(flat);
        setTree(treeData);
      })
      .catch((error) => {
        console.error("menuTree/listMenu error:", error);
      });
  }, []);

  useEffect(() => {
    Promise.all([listMenu(), getArticles()]).then(([categories, docs]) => {
      // Map categories
      const flat = categories.map((cat) => ({
        ...cat,
        titles: [],
      }));

      // Attach articles to categories
      docs.forEach((doc) => {
        const catId = doc.category?.id;
        if (!catId) return;
        const cat = flat.find((c) => c.id === catId);
        if (cat) {
          cat.titles.push({
            id: doc.id,
            title: doc.title,
          });
        }
      });

      // 👇 Debug: log all article IDs and titles in the menu
      flat.forEach((cat) => {
        cat.titles.forEach((t) => {
          console.log(
            "Menu article ID:",
            t.id,
            "Title:",
            t.title,
            "Category:",
            cat.name
          );
        });
      });

      // Build tree and set state
      const treeData = buildCategoryTree(flat);
      setTree(treeData);
    });
  }, []);
  return (
    <Box sx={{ textAlign: "left", pr: 1 }}>
      <Typography
        variant="subtitle2"
        sx={{ px: 2, mt: 2, mb: -1, pb: 1, opacity: 0.7, ml: -2 }}
      >
        Categories
      </Typography>
      <List dense disablePadding>
        {tree.map((node) => (
          <Node key={node.id} node={node} activeId={idOrSlug} />
        ))}
      </List>
    </Box>
  );
}
