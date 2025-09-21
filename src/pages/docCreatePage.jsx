import { useState, useEffect, useRef } from "react";
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";
import { getCategories } from "../api/apiCategory";
import { createDoc } from "../api/apiDocumentContent"; // You need to implement this API call
import { useNavigate } from "react-router-dom";

import * as jwt_decode from "jwt-decode";
const decode = jwt_decode.default || jwt_decode;

function getCurrentUserId() {
  const token = localStorage.getItem("app_token"); // or your token key
  if (!token) return null;
  try {
    const decoded = decode(token);
    // Strapi usually puts user id in decoded.id or decoded.user.id
    return decoded.id || decoded.user?.id || null;
  } catch {
    return null;
  }
}

export default function DocCreatePage() {
  const [title, setTitle] = useState("");
  const currentUserId = getCurrentUserId();
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const editorRef = useRef();
  const [editorChanged, setEditorChanged] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    getCategories().then((data) => setCategories(data));
  }, []);

  const toolbarItems = [
    ["heading", "bold", "italic", "strike", "code", "codeblock", "link"],
    ["ul", "ol", "table"],
  ];

  const addTag = () => {
    const t = (newTag || "").trim();
    if (!t) return;
    if (!tags.includes(t)) setTags((prev) => [...prev, t]);
    setNewTag("");
  };

  const removeTag = (t) => {
    setTags((prev) => prev.filter((x) => x !== t));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const markdown = editorRef.current.getInstance().getMarkdown();
      const payload = {
        title,
        Summary: summary,
        Tags: Array.isArray(tags) ? tags : [],
        content: markdown,
        category: selectedCategory,
      };
      await createDoc(payload);
      alert("Document created!");
      navigate("/"); // Redirect to home
    } catch (e) {
      alert("Create failed: " + (e?.message || e));
    } finally {
      setLoading(false);
    }
  };

  function isChanged() {
    return (
      title.trim() ||
      summary.trim() ||
      tags.length > 0 ||
      (editorRef.current?.getInstance()?.getMarkdown() || "").trim()
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "row", flex: 1 }}>
      <div
        style={{
          overflow: "auto",
          paddingBottom: "1rem",
          overflowY: "auto",
          marginRight: "1rem",
          flex: "4",
          background: "#0f0f0f9a",
        }}
      >
        {/* Title */}
        <div
          style={{ display: "flex", gap: 8, padding: "1rem 2rem 1rem 2rem" }}
        >
          <label
            style={{
              display: "block",
              fontSize: 12,
              opacity: 0.7,
              marginBottom: 4,
            }}
          >
            Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            style={{
              flex: 1,
              fontSize: 22,
              fontWeight: 600,
              padding: "0px 10px 15px 0px",
              border: "none",
              background: "none",
              color: "#ffffffff",
              outline: "none",
            }}
          />
        </div>

        {/* Body editor */}
        <Editor
          ref={editorRef}
          initialValue=""
          previewStyle="vertical"
          className="toastui-editor-contents"
          height="calc(100vh - 180px)"
          initialEditType="markdown"
          useCommandShortcut={true}
          hideModeSwitch={true}
          toolbarItems={toolbarItems}
          onChange={() => setEditorChanged((v) => !v)}
        />
      </div>
      <div style={{ flex: 1, marginRight: "2rem", padding: "2rem" }}>
        {/* Summary */}
        <div style={{ margin: "8px 0 12px" }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              opacity: 0.7,
              marginBottom: 4,
            }}
          >
            Summary
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              borderRadius: 6,
              border: "None",
              background: "none",
              color: "#eee",
              fontSize: 11,
              padding: 4,
            }}
          />
        </div>
        {/* Category */}
        <div style={{ margin: "8px 0 12px" }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              opacity: 0.7,
              marginBottom: 4,
            }}
          >
            Category
          </label>
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              width: "100%",
              borderRadius: 6,
              border: "1px solid #444",
              background: "#111",
              color: "#eee",
              fontSize: 13,
              padding: 6,
            }}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        {/* Tags */}
        <div style={{ margin: "8px 0 12px" }}>
          <label
            style={{
              display: "block",
              fontSize: 12,
              opacity: 0.7,
              marginBottom: 4,
            }}
          >
            Tags
          </label>
          <div
            style={{
              display: "flex",
              gap: 4,
              flexDirection: "row",
              flexWrap: "wrap",
              marginBottom: 8,
            }}
          >
            {tags.map((t) => (
              <span
                key={t}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  width: "fit-content",
                  padding: "4px 8px",
                  borderRadius: 999,
                  border: "1px solid #444",
                  background: "#151515",
                  color: "#ddd",
                  fontSize: 12,
                }}
              >
                {t}
                <button
                  type="button"
                  onClick={() => removeTag(t)}
                  style={{
                    background: "transparent",
                    color: "#aaa",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    lineHeight: 1,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        <div style={{ gap: 4 }}>
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="New tags"
            style={{
              flex: 1,
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #444",
              background: "#111",
              color: "#eee",
            }}
          />
        </div>
        <div style={{ marginTop: 12 }}>
          <button
            onClick={handleSave}
            disabled={loading || !isChanged()}
            style={{
              padding: "9px 12px",
              marginTop: "1rem",
              background: isChanged() ? "#ef4132" : "#222",
              color: isChanged() ? "#fff" : "#aaa",
              border: isChanged() ? "none" : "1px solid #444",
              cursor: isChanged() ? "pointer" : "not-allowed",
              opacity: isChanged() ? 1 : 0.7,
              borderRadius: 3,
              transition: "all 0.2s",
            }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
