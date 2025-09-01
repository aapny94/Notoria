import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getDocumentByIdOrSlug } from "../api/apiDocumentContent";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css"; // code block theme

function DocPreviewPage({ idOrSlug: propId }) {
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

  if (!idOrSlug) return <div style={{ padding: 16, opacity: 0.7 }}>Select a document from the menu.</div>;
  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (error) return <div style={{ padding: 16 }}>{error}</div>;
  if (!doc) return null;

  const markdown = (doc?.content?.markdown || "").replace(/\r\n/g, "\n");

  return (
    <div style={{ padding: 16, maxWidth: 860 }}>
      <h2 style={{ marginTop: 0 }}>{doc.title}</h2>
      <div style={{ opacity: 0.7, marginBottom: 12 }}>
        {doc.status} • {new Date(doc.updated).toLocaleString()}
      </div>
      {doc.summary && <p style={{ marginTop: 0 }}>{doc.summary}</p>}

      {/* Markdown renderer with code highlighting */}
      <div style={{ lineHeight: 1.6 }}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default DocPreviewPage;
