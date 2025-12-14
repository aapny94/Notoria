import React, { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css"; // code block theme
import { useNavigate } from "react-router-dom";
import Chip from "@mui/material/Chip";
import DeleteIcon from "@mui/icons-material/Delete";
import remarkMark from "remark-mark";
import rehypeRaw from "rehype-raw";
import { getArticleById } from "../api/apiArticle";
import "highlight.js/styles/github-dark.css";
import WelcomePage from "./welcomePage";
// Normalize a Strapi Article payload into the internal "doc" shape

function formatDateTime(isoString) {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
function normalizeDoc(node) {
  if (!node) return {};
  return {
    id: node.id ?? null,
    slug: node.slug ?? null,
    title: node.title ?? node.Title ?? "",
    summary: node.summary ?? node.Summary ?? "",
    tags: Array.isArray(node.Tags)
      ? node.Tags
      : Array.isArray(node.tags)
      ? node.tags
      : [],
    status: node.publishedAt ? "Published" : "Draft",
    updated: node.updatedAt ?? node.updated ?? null,
    category: node.category?.name ?? null,
    content: {
      markdown:
        typeof node.content === "string"
          ? node.content
          : Array.isArray(node.blocks)
          ? node.blocks
              .map((b) =>
                b?.__component === "shared.rich-text" &&
                typeof b.body === "string"
                  ? b.body
                  : null
              )
              .filter(Boolean)
              .join("\n\n")
          : "",
    },
  };
}
function extractHeadings(markdown) {
  if (!markdown) return [];
  // Match lines starting with one or more # (markdown headings)
  return markdown
    .split("\n")
    .filter((line) => /^#{1,6}\s/.test(line))
    .map((line) => {
      const match = line.match(/^(#{1,6})\s+(.*)/);
      return match ? { level: match[1].length, text: match[2] } : null;
    })
    .filter(Boolean);
}

function DocPreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate(); // <-- Add this line

  const [doc, setDoc] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const headings = extractHeadings(doc?.content?.markdown);

  useEffect(() => {
    if (!id) {
      setDoc(null);
      setError("");
      setLoading(false);
      return;
    }
    setLoading(true);
    getArticleById(id)
      .then((d) => {
        const normalized = normalizeDoc(d);
        setDoc(normalized);
        setError("");
      })
      .catch((err) => {
        setError("Error fetching document");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!doc) return <WelcomePage />;
  if (!doc || !doc.content || !doc.content.markdown) {
    return <div>No content available.</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <div style={{ height: "calc(100vh - 73px)", overflowY: "auto", flex: 1 }}>
        <div
          className="bgSpecial"
          style={{
            padding: "1.5em 1.5em 1em 1.5em",
            border: "1px solid #393939ff",
            borderRadius: "1em",
            margin: "1.5em 1.5em -1.5em 1.5em",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.39)",
            display: "flex",
            flexDirection: "row",
          }}
        >
          <div>
            <p className="preview-title">{doc.category} </p>
            <h2
              style={{
                fontSize: "1.5rem",
                margin: "0",
                marginTop: ".75em",
                marginBottom: ".5em",
              }}
            >
              {doc.title}
            </h2>
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "#e0e0e0ff",
                padding: ".25em 1.25em",
                background: "#3d3d3dff",
                borderRadius: "2em",
                width: "fit-content",
                marginBottom: "1.5em",
              }}
            >
              {doc.status} | {formatDateTime(doc.updated)}
            </span>
          </div>
        </div>

        <div
          className="markdown-preview"
          style={{
            padding: "2em 3em",
          }}
        >
          <ReactMarkdown
            children={doc.content.markdown}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[
              [rehypeHighlight, { detect: true, ignoreMissing: true }],
            ]}
          />
        </div>
      </div>
      <div style={{ padding: "0 2em 0 .5em", width: "330px" }}>
        <div
          className="onThisPageContainer"
          style={{
            float: "right",
            padding: "1em",
            borderRadius: "8px",
          }}
        >
          <p className="preview-title">On this page</p>

          <div style={{ overflow: "auto", maxHeight: 270 }}>
            {headings.map((h, i) => (
              <h4 style={{ marginLeft: 0, marginBottom: ".30rem", lineHeight: "1.15rem", lineBreak: "2rem", fontWeight: "500" }} key={i}>{h.text}</h4>
            ))}
          </div>
        </div>
        <div className="summaryContainer">
          <p className="preview-title">Title</p>

          <h4>{doc.title}</h4>
        </div>
        <div className="summaryContainer">
          <p className="preview-title">Summary</p>

          <p>{doc.summary}</p>
        </div>

        <div
          style={{
            padding: "1em 1em 0 1em",
            display: "flex",
            flexWrap: "wrap",
            flexDirection: "row",
            gap: "0.2em",
          }}
        >
          {doc.tags && Array.isArray(doc.tags) && doc.tags.length > 0
            ? doc.tags.map((tag, idx) => (
                <Chip key={idx} label={tag} sx={{ width: "fit-content" }} />
              ))
            : null}
        </div>

        <button
          style={{
            margin: "2rem 1rem 1rem 1rem",

            padding: "9px 12px",
            background: "#ef4132",
            color: "#fff",
            border: "none",
            borderRadius: 3,
            cursor: "pointer",
            fontWeight: "bold",
          }}
          onClick={() => navigate(`/edit/${id}`)}
        >
          Edit
        </button>
      </div>
    </div>
  );
}

export default DocPreviewPage;
