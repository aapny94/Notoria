import { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Blockquote from "@tiptap/extension-blockquote";
import Code from "@tiptap/extension-code";
import { createLowlight } from "lowlight";
const lowlight = createLowlight();
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";

lowlight.register("javascript", javascript);
lowlight.register("js", javascript);
lowlight.register("typescript", typescript);
lowlight.register("ts", typescript);
lowlight.register("json", json);
lowlight.register("bash", bash);
lowlight.register("sh", bash);
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import "highlight.js/styles/github-dark.css";
import { marked } from "marked";

/** Normalize incoming content to TipTap-acceptable value (JSON or HTML) */
function normalizeInitial(initialContent) {
  if (
    initialContent &&
    typeof initialContent === "object" &&
    initialContent.type === "doc"
  ) {
    return initialContent; // TipTap JSON
  }
  // wrapper { markdown, json: { body, format } }
  if (
    initialContent &&
    typeof initialContent === "object" &&
    (typeof initialContent.markdown === "string" ||
      (initialContent.json && typeof initialContent.json.body === "string"))
  ) {
    const md =
      typeof initialContent.markdown === "string"
        ? initialContent.markdown
        : initialContent.json.body;
    return marked.parse(md);
  }
  // { body, format: 'markdown' }
  if (
    initialContent &&
    typeof initialContent === "object" &&
    typeof initialContent.body === "string" &&
    (initialContent.format === "markdown" || !initialContent.format)
  ) {
    return marked.parse(initialContent.body);
  }
  if (typeof initialContent === "string") return marked.parse(initialContent);
  return "<p></p>";
}

export default function DocEditor({ initialContent, onChange, onReady }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Underline,
      Highlight,

      Blockquote,
      Code,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: normalizeInitial(initialContent),
    onCreate: ({ editor }) => {
      onChange?.(editor.getJSON());
      onReady?.(editor); // <-- Pass editor instance up!
    },
    onUpdate: ({ editor }) => onChange?.(editor.getJSON()),
  });
  // Keep editor in sync if parent replaces initialContent
  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(normalizeInitial(initialContent), false);
  }, [initialContent, editor]);

  useEffect(() => {
    if (editor && onReady) {
      onReady(editor);
    }
  }, [editor, onReady]);

  if (!editor) return null;

  const Btn = ({ on, active, label, title }) => (
    <button
      onClick={on}
      title={title || label}
      style={{
        padding: "4px 8px",
        borderRadius: 6,
        border: "1px solid #3a3a3a",
        background: active ? "#333" : "#1a1a1a",
        color: "#eee",
        cursor: "pointer",
      }}
      type="button"
    >
      {label}
    </button>
  );

  return (
    <div
      style={{
        borderRadius: 8,
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 6,
          padding: 8,
          borderBottom: "1px solid #333",
          position: "sticky",
          justifyContent: "center", // <-- add this line

          top: 0,
          flexDirection: "row",
          background: "#0f0f0f",
          zIndex: 2,
        }}
      >
        {/* Headings */}
        <Btn
          label="H1"
          on={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
        />
        <Btn
          label="H2"
          on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        />
        <Btn
          label="H3"
          on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
        />

        {/* Inline */}
        <Btn
          label="B"
          title="Bold (⌘/Ctrl+B)"
          on={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        />
        <Btn
          label="I"
          title="Italic (⌘/Ctrl+I)"
          on={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        />
        <Btn
          label="U"
          title="Underline"
          on={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
        />
        <Btn
          label="`"
          title="Code"
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive("code")}
        />
        <Btn
          label="HL"
          title="Highlight"
          on={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive("highlight")}
        />

        {/* Blocks */}
        <Btn
          label="• List"
          on={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        />
        <Btn
          label="1. List"
          on={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
        />
        <Btn
          label="Quote"
          on={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
        />
        <Btn
          label="Code Block"
          on={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
        />
        <Btn
          label="🔗"
          title="Add Link"
          on={() => {
            const url = prompt("Enter URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
          active={editor.isActive("link")}
        />
        <Btn
          label="❌"
          title="Remove Link"
          on={() => editor.chain().focus().unsetLink().run()}
          active={editor.isActive("link")}
        />
        {/* Align */}
        <Btn
          label="⟸"
          on={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
        />
        <Btn
          label="≡"
          on={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
        />
        <Btn
          label="⟹"
          on={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
        />

        {/* Undo/redo */}
        <Btn label="↶" on={() => editor.chain().focus().undo().run()} />
        <Btn label="↷" on={() => editor.chain().focus().redo().run()} />
      </div>

      {/* Editor area */}
      <div style={{}}>
        <EditorContent
          style={{ background: "none", border: "none" }}
          className="editor-content"
          editor={editor}
        />
      </div>
    </div>
  );
}
