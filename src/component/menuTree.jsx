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
import SearchIcon from "@mui/icons-material/Search";

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

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

function Titles({ items = [], depth = 0, activeId }) {
  const navigate = useNavigate();
  if (!items?.length) return null;
  return (
    <Box
      sx={{
        ml: depth === 0 ? 0 : 1,
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
              sx={
                {
                  // Remove border/fontWeight/color from here
                }
              }
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
  const { idOrSlug } = useParams(); // <-- get active id from URL
  const filteredTree = filterTree(tree, search);
  const { id } = useParams();
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
            title: capitalize(doc.title), // <-- Capitalize the doc title only

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
            tags: attrs.tags || [], // <-- add this line
          };
        });

        // 👇 put debug log right here

        const treeData = buildCategoryTree(flat);
        setTree(treeData);
      })
      .catch((error) => {});
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
          const titleObj = {
            id: doc.id,
            title: capitalize(doc.title), // <-- Capitalize the doc title only
            tags: Array.isArray(doc.Tags) ? doc.Tags : [], // <-- Use doc.Tags here!
          };
          cat.titles.push(titleObj);

          // Debug log
        }
      });

      // Build tree and set state
      const treeData = buildCategoryTree(flat);
      setTree(treeData);
    });
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

      <List dense disablePadding style={{ padding: 5, paddingTop: 0, paddingBottom: 30, marginTop: 0, overflowY: 'auto', maxHeight: 'calc(100vh - 150px)' }}>
        {filteredTree.map((node) => (
          <Node key={node.id} node={node} activeId={id} />
        ))}
      </List>
    </Box>
  );
}
