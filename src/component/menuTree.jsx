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
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom"; // <-- import useParams

function Titles({ items = [], depth = 0, activeId }) {
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
              primaryTypographyProps={{
                variant: "body2",
                color: t.id === activeId ? "rgba(237, 129, 119, 1)" : undefined,
                fontWeight: t.id === activeId ? 500 : undefined,
                noWrap: true, // Add this line
                sx: { maxWidth: 190 }, // Optional: set max width for ellipsis
              }}
              primary={t.title}
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
      .then(setTree)
      .catch((error) => {
        console.error(error);
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
