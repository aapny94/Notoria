import { useEffect, useState } from "react";
import { listMenu } from "../api/apiMenuTree.js";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { getArticles } from "../api/apiArticles.js";
import SearchIcon from "@mui/icons-material/Search";

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// --- helpers to normalize (flat -> tree) and create preview data ---
function buildCategoryTree(categories = []) {
  const byId = new Map();
  categories.forEach((c) => byId.set(c.id, { ...c, children: [] }));

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

function normalizeCategory(rawCategory) {
  const attrs = rawCategory?.attributes || rawCategory || {};
  const parentRaw = attrs.parent?.data || attrs.parent || null;
  return {
    id: rawCategory?.id ?? attrs?.id,
    name: attrs?.name || "",
    parent: parentRaw ? { id: parentRaw.id ?? parentRaw?.attributes?.id } : null,
    titles: [],
  };
}

function normalizeDoc(rawDoc) {
  const attrs = rawDoc?.attributes || rawDoc || {};
  const categoryRaw = attrs.category?.data || attrs.category || null;
  const categoryId =
    categoryRaw?.id ??
    categoryRaw?.attributes?.id ??
    attrs?.category_id ??
    attrs?.categoryId ??
    null;

  return {
    id: rawDoc?.id ?? attrs?.id,
    title: attrs?.title || "",
    createdAt: attrs?.createdAt || null,
    tags: Array.isArray(attrs?.Tags)
      ? attrs.Tags
      : Array.isArray(attrs?.tags)
      ? attrs.tags
      : [],
    categoryId,
  };
}

function Titles({ items = [], activeId }) {
  const navigate = useNavigate();
  if (!items?.length) return null;
  return (
    <Box
      sx={{
        ml: 1,
        pl: 1.5,
        borderLeft: 1,
        borderColor: "divider",
      }}
    >
      {items.map((t) => {
        const isActive = String(t.id) === String(activeId);
        return (
          <ListItem
            key={t.id}
            disablePadding
            sx={{
              ml: isActive ? -2 : -1.6,
              pl: 2,
              borderLeftWidth: 1,
              borderColor: "divider",
              borderLeft: isActive ? "3px solid #ED8177 !important" : "none",
              fontWeight: isActive ? 700 : 400,
            }}
          >
            <ListItemButton
              dense
              onClick={() => navigate(`/${t.id}`)}
            >
              <ListItemText
                primary={capitalize(t.title)}
                primaryTypographyProps={{
                  variant: "body2",
                  noWrap: true,
                  fontSize: "0.85rem",
                  sx: { maxWidth: 190 },
                }}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
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
              fontSize: ".9rem",
            }}
            primary={capitalize(node.name)}
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
                depth={depth + 1}
                activeId={activeId}
              />
            ))}
          </Box>
        )}
        {/* titles (documents) */}
        <Titles items={node.titles} activeId={activeId} />
      </Collapse>
    </Box>
  );
}

function filterTree(tree, search) {
  if (!search) return tree;
  const lower = search.toLowerCase();

  function matchNode(node) {
    if (node.name?.toLowerCase().includes(lower)) return true;
    if (
      node.titles?.some(
        (t) =>
          t.title?.toLowerCase().includes(lower) ||
          (Array.isArray(t.tags) &&
            t.tags.some((tag) => tag.toLowerCase().includes(lower)))
      )
    )
      return true;
    if (node.children?.some(matchNode)) return true;
    return false;
  }

  function filterNode(node) {
    if (matchNode(node)) {
      return {
        ...node,
        children: node.children?.map(filterNode).filter(Boolean) || [],
        titles: node.name?.toLowerCase().includes(lower)
          ? node.titles
          : node.titles?.filter(
              (t) =>
                t.title?.toLowerCase().includes(lower) ||
                (Array.isArray(t.tags) &&
                  t.tags.some((tag) => tag.toLowerCase().includes(lower)))
            ) || [],
      };
    }
    return null;
  }

  return tree.map(filterNode).filter(Boolean);
}

export default function MenuTree() {
  const [tree, setTree] = useState([]);
  const [search, setSearch] = useState("");
  const { id } = useParams();
  const filteredTree = filterTree(tree, search);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listMenu(), getArticles()])
      .then(([categoriesPayload, docsPayload]) => {
        const categoriesRaw = Array.isArray(categoriesPayload)
          ? categoriesPayload
          : categoriesPayload?.data ?? [];
        const docsRaw = Array.isArray(docsPayload)
          ? docsPayload
          : docsPayload?.data ?? [];

        const categories = categoriesRaw
          .map(normalizeCategory)
          .filter((c) => c.id != null);

        const categoryById = new Map(
          categories.map((cat) => [String(cat.id), cat])
        );

        docsRaw.map(normalizeDoc).forEach((doc) => {
          if (!doc.categoryId || !doc.id) return;
          const category = categoryById.get(String(doc.categoryId));
          if (!category) return;
          category.titles.push({
            id: doc.id,
            title: capitalize(doc.title),
            createdAt: doc.createdAt,
            tags: doc.tags,
          });
        });

        categories.forEach((cat) => {
          cat.titles.sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return aTime - bTime; // older (previous) docs on top
          });
        });

        if (!cancelled) {
          setTree(buildCategoryTree(categories));
        }
      })
      .catch(() => {
        if (!cancelled) setTree([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box sx={{ textAlign: "left", pr: 1 }}>
      <Box
        sx={{
          mt: 3,
          mb: 1,
          display: "flex",
          alignItems: "center",
          position: "relative",
        }}
      >
        <SearchIcon
          sx={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#838383",
            fontSize: 22,
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          placeholder="Search"
          value={search}
          className="inputBox"
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "11px 11px 11px 38px", // left padding for icon
            borderRadius: "10px",
            border: ".5px solid #83838363",
            backgroundColor: "#34343471",
            fontSize: ".9rem",
          }}
        />
      </Box>

      <List
        dense
        disablePadding
        style={{
          padding: 5,
          paddingTop: 0,
          paddingBottom: 30,
          marginTop: 0,
          overflowY: "auto",
          maxHeight: "calc(100vh - 150px)",
        }}
      >
        {filteredTree.map((node) => (
          <Node key={node.id} node={node} activeId={id} />
        ))}
      </List>
    </Box>
  );
}
