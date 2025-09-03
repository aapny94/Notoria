import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getDocumentByIdOrSlug } from "../api/apiDocumentContent";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css"; // code block theme
import { Box, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import remarkMark from "remark-mark";
import rehypeRaw from "rehype-raw";

function slugify(text) {
  return (
    String(text)
      .toLowerCase()
      .trim()
      // dash is escaped to avoid being interpreted as a range
      .replace(/[`~!@#$%^&*()+=\[\]{}|;:'",.<>/?-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
  );
}

function DocPreviewPage({ idOrSlug: propId }) {
  const navigate = useNavigate(); // ✅ get navigate hook

  const params = useParams();
  const idOrSlug = propId ?? params.idOrSlug ?? null;

  const [doc, setDoc] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!idOrSlug) {
      setDoc(null);
      setError("");
      setLoading(false);
      return;
    }

    setLoading(true);
    getDocumentByIdOrSlug(idOrSlug)
      .then((data) => {
        setDoc(data);
        setError("");
      })
      .catch((err) => {
        setError("Error fetching document");
        console.error("Error fetching document:", err);
      })
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  const markdown = (doc?.content?.markdown || "").replace(/\r\n/g, "\n");
  const highlightedMarkdown = markdown.replace(
    /==([^=]+)==/g,
    "<mark>$1</mark>"
  );
  // Extract headings for TOC (H1–H4; extend if you like)
  const toc = useMemo(() => {
    const lines = markdown.split("\n");
    const items = [];
    for (const ln of lines) {
      const m = ln.match(/^(#{1,4})\s+(.+?)\s*$/); // up to ####; adjust if needed
      if (!m) continue;
      const level = m[1].length;
      const text = m[2].replace(/#+\s*$/, ""); // trim trailing #'s
      const id = slugify(text);
      items.push({ level, text, id });
    }
    // De-dup ids if repeated headings
    const seen = new Map();
    return items.map(({ level, text, id }) => {
      const count = seen.get(id) || 0;
      seen.set(id, count + 1);
      return { level, text, id: count ? `${id}-${count}` : id };
    });
  }, [markdown]);

  if (!idOrSlug)
    return (
      <div style={{ padding: 16, opacity: 0.7 }}>
        Select a document from the menu.
      </div>
    );
  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (error) return <div style={{ padding: 16 }}>{error}</div>;
  if (!doc) return null;

  // Inject the same ids when rendering headings so anchors work
  const components = {
    h1({ node, children, ...props }) {
      const text = String(children?.[0] ?? "");
      const id = slugify(text);
      return (
        <h1 id={id} {...props}>
          {children}
        </h1>
      );
    },
    h2({ node, children, ...props }) {
      const text = String(children?.[0] ?? "");
      const id = slugify(text);
      return (
        <h2 id={id} {...props}>
          {children}
        </h2>
      );
    },
    h3({ node, children, ...props }) {
      const text = String(children?.[0] ?? "");
      const id = slugify(text);
      return (
        <h3 id={id} {...props}>
          {children}
        </h3>
      );
    },
    h4({ node, children, ...props }) {
      const text = String(children?.[0] ?? "");
      const id = slugify(text);
      return (
        <h4 id={id} {...props}>
          {children}
        </h4>
      );
    },
  };

  return (
    <div
      className="docPreview"
      style={{
        padding: 16,
        width: "100%",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <div style={{ flex: 1, maxWidth: "80%", paddingRight: "1.5rem" }}>
        <Box
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <IconButton
            variant="outlined"
            style={{ width: "fit-content", padding: 10, marginBottom: -6 }}
            onClick={() => navigate(`/edit/${doc.slug || doc.id}`)} // ✅ navigate on click
          >
            <EditIcon style={{ fontSize: "1.5rem" }} />
          </IconButton>
          <IconButton
            variant="outlined"
            style={{ width: "fit-content", padding: 10, marginBottom: -6 }}
          >
            <DeleteIcon style={{ fontSize: "1.5rem" }} />
          </IconButton>
        </Box>
        {Array.isArray(doc.tags) && doc.tags.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 5,
              flexWrap: "wrap",
              textAlign: "right",
              contentAlign: "flex-end",
              flexDirection: "row",
              margin: "auto",
              width: "100%",
              margin: "-2px 0 16px 0",
            }}
          >
            {doc.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: 12,
                  padding: "2px 10px",
                  borderRadius: 999,
                  border: "1px solid #3a3a3a",
                  background: "#1f1f1f",
                  color: "#ddd",
                  width: "fit-content",
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        <h2 style={{ marginTop: 0 }}>{doc.title}</h2>
        {doc.summary && <p style={{ marginTop: 0 }}>{doc.summary}</p>}

        <div
          style={{
            marginBottom: 12,
            background: "rgba(113, 113, 113, 1)",
            width: "fit-content",
            padding: "2px 16px",
            borderRadius: 50,
            fontSize: 14,
            background: "#ef4132",
            color: "rgba(255, 255, 255, 1)",
          }}
        >
          {doc.status} | {new Date(doc.updated).toLocaleString()}
        </div>

        {/* Markdown renderer with code highlighting */}
        <div
          style={{
            lineHeight: 1.6,
            borderTop: ".01px solid #313131ff",
            paddingTop: 1,
            marginTop: 18,
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={{
              mark: ({ children }) => (
                <mark
                  style={{
                    background: "#ffe066",
                    color: "#222",
                    borderRadius: "4px",
                    padding: "0 4px",
                  }}
                >
                  {children}
                </mark>
              ),
              // ...other custom components...
            }}
          >
            {highlightedMarkdown}
          </ReactMarkdown>
        </div>
      </div>

      {/* sticky TOC */}
      <aside
        style={{
          position: "sticky",
          top: 16,
          paddingLeft: 16,
          width: "20%",
          maxHeight: "90vh",
          overflowY: "auto",
          flexShrink: 0,
        }}
      >
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
          On this page
        </div>
        <nav>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {toc.map(({ level, text, id }) => (
              <li
                key={id}
                style={{ marginBottom: 6, paddingLeft: (level - 1) * 12 }}
              >
                <a
                  href={`#${id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    opacity: 0.9,
                  }}
                >
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </div>
  );
}

export default DocPreviewPage;
