// src/pages/docEditPage.jsx
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import DocEditor from "../component/docEditor.jsx";
import {
  getDocumentByIdOrSlug,
  updateDocument,
} from "../api/apiDocumentContent";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Blockquote from "@tiptap/extension-blockquote";
import Code from "@tiptap/extension-code";
import { createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";

// Create and register languages
const lowlight = createLowlight();
lowlight.register("javascript", javascript);
lowlight.register("js", javascript);
lowlight.register("typescript", typescript);
lowlight.register("ts", typescript);
lowlight.register("json", json);
lowlight.register("bash", bash);
lowlight.register("sh", bash);
export default function DocEditPage() {
  const { idOrSlug } = useParams();

  const [doc, setDoc] = useState(null);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [contentJson, setContentJson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState("");
  const editorApiRef = useRef(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Underline,
      Highlight,
      CodeBlockLowlight.configure({ lowlight }),
      Blockquote,
      Code,
      // ...other extensions
    ], // <-- use only the extensions you need
    content: doc?.content, // TipTap JSON from backend
    editable: false,
  });
  // fetch current document
  useEffect(() => {
    if (!idOrSlug) {
      setDoc(null);
      setTitle("");
      setSummary("");
      setContentJson(null);
      setError("");
      return;
    }

    let cancelled = false;
    setLoading(true);
    getDocumentByIdOrSlug(idOrSlug)
      .then((d) => {
        if (cancelled) return;
        setDoc(d);
        setTitle(d?.title || "");
        setSummary(d?.summary || "");
        setTags(Array.isArray(d?.tags) ? d.tags : []);
        // if JSON exists, use it; otherwise let editor convert markdown onCreate
        setContentJson(
          d?.content?.json || (d?.content?.type === "doc" ? d.content : null)
        );
        setError("");
      })
      .catch((e) => {
        if (cancelled) return;
        setError(String(e?.message || e));
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [idOrSlug]);

  // save changes
  const handleSave = async () => {
    if (!idOrSlug) return;
    try {
      // always grab the freshest JSON directly from the editor
      const latestJson =
        editorApiRef.current?.getJSON?.() ??
        contentJson ??
        doc?.content?.json ??
        (doc?.content?.type === "doc"
          ? doc.content
          : {
              type: "doc",
              content: [{ type: "paragraph", content: [] }],
            });

      console.log("Latest editor JSON →", latestJson);
      console.log("Saving content:", contentJson);

      const payload = {
        title,
        summary,
        tags,
        content: editorApiRef.current?.getJSON?.() ?? contentJson,
        //content_md:
        //  editorApiRef.current?.getMarkdown?.() ?? doc?.content_md ?? "",
      };
      // keep legacy markdown alongside JSON if your row still has it
      if (doc?.content_md && !payload.content_md) {
        payload.content_md = doc.content_md;
      }

      console.log("Saving payload →", payload);

      const resp = await updateDocument(idOrSlug, payload);
      setDoc(resp);
      setTitle(resp?.title || "");
      setSummary(resp?.summary || "");
      setTags(Array.isArray(resp?.tags) ? resp.tags : []);
      setContentJson(
        resp?.content?.json ||
          (resp?.content?.type === "doc" ? resp.content : contentJson)
      );
      alert("Saved!");
    } catch (e) {
      console.error("Save failed:", e);
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

  if (!idOrSlug)
    return (
      <div style={{ padding: 16, opacity: 0.7 }}>
        Open an item from the menu to edit.
      </div>
    );
  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (error) return <div style={{ padding: 16 }}>Error: {error}</div>;
  if (!doc) return null;

  const updatedAt = new Date(
    doc.updated_at || doc.updated || doc.updatedAt || Date.now()
  );

  return (
    <div style={{ padding: 16, maxWidth: 860, overflow: "auto" }}>
      <EditorContent editor={editor} />
      {/* Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          style={{
            flex: 1,
            fontSize: 22,
            fontWeight: 600,
            padding: "6px 10px",
            borderRadius: 6,
            border: "1px solid #444",
            background: "#111",
            color: "#eee",
            outline: "none",
          }}
        />
      </div>

      {/* Meta */}
      <div style={{ opacity: 0.7, marginBottom: 12 }}>
        {doc.status} • {updatedAt.toLocaleString()}
      </div>

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
            border: "1px solid #444",
            background: "#111",
            color: "#eee",
            padding: 10,
          }}
        />
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
          style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}
        >
          {tags.map((t) => (
            <span
              key={t}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
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
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Add a tag and press Enter"
            style={{
              flex: 1,
              padding: "6px 10px",
              borderRadius: 6,
              border: "1px solid #444",
              background: "#111",
              color: "#eee",
            }}
          />
          <button
            type="button"
            onClick={addTag}
            style={{ padding: "6px 10px" }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Body editor */}
      <DocEditor
        initialContent={
          doc?.content_md ??
          doc?.content?.markdown ??
          doc?.content?.json ??
          (doc?.content?.type === "doc" ? doc.content : doc?.content)
        }
        onChange={(json) => setContentJson(json)}
        onReady={(api) => {
          editorApiRef.current = api;
        }}
      />

      {/* Actions */}
      <div style={{ marginTop: 12 }}>
        <button onClick={handleSave} style={{ padding: "6px 12px" }}>
          Save
        </button>
      </div>
    </div>
  );
}
