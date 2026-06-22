"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

const BTN = (props: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) => (
  <button
    type="button"
    onClick={props.onClick}
    title={props.title}
    style={{
      background: props.active ? "rgba(250,203,4,0.15)" : "transparent",
      border: "1px solid " + (props.active ? "#facb04" : "#2a2a2a"),
      color: props.active ? "#facb04" : "#888",
      borderRadius: "4px",
      padding: "4px 8px",
      cursor: "pointer",
      fontSize: "0.75rem",
      fontWeight: 600,
      lineHeight: 1,
      minWidth: "28px",
    }}
  >
    {props.children}
  </button>
);

export default function RichTextEditor({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Schrijf hier..." }),
    ],
    content: defaultValue || "",
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && defaultValue !== undefined) {
      editor.commands.setContent(defaultValue || "");
    }
  }, [defaultValue]);

  const html = editor?.getHTML() ?? "";

  return (
    <div>
      <input type="hidden" name={name} value={html} />
      {editor && (
        <div style={{ border: "1px solid #222", borderRadius: "6px", overflow: "hidden", background: "#141414" }}>
          {/* Toolbar */}
          <div style={{
            display: "flex", gap: "4px", padding: "8px 10px",
            borderBottom: "1px solid #1e1e1e", background: "#111", flexWrap: "wrap",
          }}>
            <BTN onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Vet">B</BTN>
            <BTN onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Cursief"><em>I</em></BTN>
            <BTN onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="Kop 2">H2</BTN>
            <BTN onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="Kop 3">H3</BTN>
            <BTN onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Lijst">• —</BTN>
            <BTN onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Genummerd">1.</BTN>
            <BTN onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Citaat">"</BTN>
            <BTN onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Scheidingslijn">—</BTN>
            <BTN onClick={() => {
              const url = window.prompt("URL:");
              if (url) editor.chain().focus().setLink({ href: url }).run();
            }} active={editor.isActive("link")} title="Link">🔗</BTN>
            <BTN onClick={() => editor.chain().focus().unsetLink().run()} title="Link verwijderen">✕</BTN>
          </div>
          {/* Editor */}
          <EditorContent
            editor={editor}
            style={{ minHeight: "220px", padding: "1rem 1.25rem", color: "#f0ede8", fontSize: "0.88rem", lineHeight: "1.7", fontFamily: "DM Sans, sans-serif" }}
          />
        </div>
      )}
      <style>{`
        .tiptap:focus { outline: none; }
        .tiptap p { margin: 0 0 0.75em; }
        .tiptap h2 { font-family: 'Cinzel', serif; font-size: 1.1rem; color: #f0ede8; margin: 1em 0 0.5em; }
        .tiptap h3 { font-family: 'Cinzel', serif; font-size: 0.95rem; color: #d8d2c8; margin: 0.8em 0 0.4em; }
        .tiptap ul, .tiptap ol { padding-left: 1.4em; margin: 0.5em 0; }
        .tiptap li { margin-bottom: 0.25em; }
        .tiptap blockquote { border-left: 3px solid #facb04; padding-left: 1em; color: #888; font-style: italic; margin: 0.75em 0; }
        .tiptap a { color: #facb04; text-decoration: underline; }
        .tiptap hr { border: none; border-top: 1px solid #2a2a2a; margin: 1em 0; }
        .tiptap p.is-editor-empty:first-child::before { color: #444; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
      `}</style>
    </div>
  );
}
