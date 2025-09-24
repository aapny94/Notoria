// src/pages/docEditPage.jsx
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { deleteDoc } from "../api/apiDocumentContent"; // Add this import

import { getDocById, updateDoc } from "../api/apiDocumentContent";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import CodeBlock from "@tiptap/extension-code-block";
import Blockquote from "@tiptap/extension-blockquote";
import Code from "@tiptap/extension-code";
import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import { getCategories } from "../api/apiCategory"; // You need to implement this API call
import { defaultMarkdownSerializer } from "prosemirror-markdown";
import { MarkdownSerializer } from "prosemirror-markdown";
import { useNavigate } from "react-router-dom";

import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";
// Create and register languages
const lowlight = createLowlight();
lowlight.register("javascript", javascript);
lowlight.register("js", javascript);
lowlight.register("typescript", typescript);
lowlight.register("ts", typescript);
lowlight.register("json", json);
lowlight.register("bash", bash);
lowlight.register("sh", bash);

// Add this utility function:
function flattenCategories(tree) {
  const result = [];
  function walk(nodes) {
    nodes.forEach((node) => {
      result.push({ id: node.id, name: node.name });
      if (node.children && node.children.length) walk(node.children);
    });
  }
  walk(tree);
  return result;
}

function normalizeDoc(node) {
  if (!node) return {};
  const title = node.title ?? "";
  const summary = node.Summary ?? ""; // Capital S
  const tags = Array.isArray(node.Tags) ? node.Tags : []; // Capital T
  let markdown = typeof node.content === "string" ? node.content : "";
  return {
    id: node.id ?? null,
    title,
    summary,
    tags,
    category: node.category?.name ?? null,
    category_id: node.category?.id ?? null,
    content: {
      markdown,
    },
  };
}

export default function DocEditPage() {
  const { id } = useParams();
  const [initialState, setInitialState] = useState(null);
  const [doc, setDoc] = useState(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [contentJson, setContentJson] = useState({
    type: "doc",
    content: [{ type: "paragraph", content: [] }],
  });
  const [editorChanged, setEditorChanged] = useState(false);

  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const editorApiRef = useRef(null);
  const [editorInstance, setEditorInstance] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const navigate = useNavigate();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Blockquote,
      Code,
      CodeBlock, // <-- use this

      // Remove: Underline, Highlight, CodeBlockLowlight, etc.
    ],
    content: doc?.content,
    editable: true,
  });

  // In your component:
  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data); // <-- use flat array directly
    });
  }, []);

  const editorRef = useRef();
  useEffect(() => {
    if (!editorRef.current) return;
    const instance = editorRef.current.getInstance();
    const handler = () => setEditorChanged((v) => !v);
    instance.on("change", handler);

    // Cleanup on unmount
    return () => {
      instance.off("change", handler);
    };
  }, [editorRef.current]);
  useEffect(() => {
    if (doc && doc.category_id) {
      setSelectedCategory(doc.category_id);
    }
  }, [doc]);
  // fetch current document
  useEffect(() => {
    if (!id) {
      setDoc(null);
      setTitle("");
      setSummary("");
      setContentJson(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    getDocById(id)
      .then((rawDoc) => {

        const doc = normalizeDoc(rawDoc);
        setDoc(doc);
        setTitle(doc.title);
        setSummary(doc.summary);
        setTags(doc.tags);
        setContentJson(doc.content.markdown || doc.content.json || null);
      })

      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [id]);
  useEffect(() => {
    if (doc && !initialState) {
      setInitialState({
        title: doc?.title || "",
        summary: doc?.summary || "",
        tags: Array.isArray(doc?.tags) ? doc.tags : [],
        contentJson: doc?.content?.markdown || "",
      });
      setTitle(doc?.title || "");
      setSummary(doc?.summary || "");
      setTags(Array.isArray(doc?.tags) ? doc.tags : []);
      setContentJson(doc?.content?.markdown || "");
    }

  }, [doc, editorRef.current, initialState]);
  // save changes
  const handleSave = async () => {
    if (!id) return;
    try {
      // Get markdown from Toast UI Editor
      const markdown = editorRef.current.getInstance().getMarkdown();

      const payload = {
        title,
        Summary: summary,
        Tags: Array.isArray(tags) ? tags : [],
        content: markdown, // Save markdown to Strapi
        category: selectedCategory,
      };

      const resp = await updateDoc(id, payload);
      // ...rest of your code...
      alert("Saved!");
    } catch (e) {
      alert("Save failed: " + (e?.message || e));
    }
  };

  const addTag = () => {
    const t = (newTag || "").trim();
    if (!t) return;
    if (!tags.includes(t)) setTags((prev) => [...prev, t]);
    setNewTag("");
  };

  const removeTag = (t) => {
    setTags((prev) => prev.filter((x) => x !== t));
  };

  function isChanged() {
    if (!initialState) return false;
    const currentMarkdown =
      editorRef.current?.getInstance()?.getMarkdown() || "";
    const initialMarkdown = initialState.contentJson || "";
    return (
      title !== initialState.title ||
      summary !== initialState.summary ||
      JSON.stringify(tags) !== JSON.stringify(initialState.tags) ||
      currentMarkdown !== initialMarkdown
    );
  }

  if (!id)
    return (
      <div style={{ padding: 16, opacity: 0.7 }}>
        Open an item from the menu to edit.
      </div>
    );
  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (!doc) return null;

  const updatedAt = new Date(doc.updated ?? Date.now());

  const toolbarItems = [
    ["heading", "bold", "italic", "strike", "code", "codeblock", "link"],
    ["ul", "ol", "table"],
    // Remove any group or button you don't want
  ];

  const handleDelete = async () => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this document?"))
      return;
    try {
      await deleteDoc(id);
      alert("Document deleted!");
      // Optionally, redirect or update UI here
      navigate("/"); // Redirect to home
    } catch (e) {
      alert("Delete failed: " + (e?.message || e));
    }
  };

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
          style={{ display: "flex", gap: 8, padding: " 1rem 2rem 1rem 2rem" }}
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
          initialValue={contentJson || ""}
          previewStyle="vertical"
          className="toastui-editor-contents"
          height="calc(100vh - 180px)"
          initialEditType="markdown" // WYSIWYG only
          useCommandShortcut={true}
          hideModeSwitch={true} // Hide the WYSIWYG/Markdown toggle
          toolbarItems={toolbarItems}
          onChange={() => setEditorChanged((v) => !v)}
        />
        {/* Actions */}
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
            disabled={!initialState || !isChanged()}
            style={{
              padding: "9px 12px",
              marginTop: "1rem",
              background: initialState && isChanged() ? "#ef4132" : "#222",
              color: initialState && isChanged() ? "#fff" : "#aaa",
              border: initialState && isChanged() ? "none" : "1px solid #444",
              cursor: initialState && isChanged() ? "pointer" : "not-allowed",
              opacity: initialState && isChanged() ? 1 : 0.7,
              borderRadius: 3,
              transition: "all 0.2s",
            }}
          >
            Update
          </button>
        </div>
        <div style={{ marginTop: 8 }}>
          <button
            onClick={handleDelete}
            style={{
              padding: "9px 12px",
              background: "#ef4132",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              opacity: 1,
              borderRadius: 3,
              transition: "all 0.2s",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
