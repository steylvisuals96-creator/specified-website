"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

/**
 * Tekstverwerker voor blog en vacatures. Bewaart een Tiptap-document als JSON
 * in een verborgen veld; de server maakt het daarna nog eens schoon
 * (lib/richtekst.ts). Bewust een korte knoppenbalk: koppen, vet, cursief,
 * lijsten, citaat en link. Geen kleuren of lettergroottes.
 */
export default function RichTekst({
  naam,
  label,
  waarde,
  placeholder = "Begin met schrijven",
  onWijzig,
}: {
  naam: string;
  label: string;
  waarde?: unknown;
  placeholder?: string;
  onWijzig?: (doc: unknown) => void;
}) {
  const verborgen = useRef<HTMLInputElement>(null);
  const [json, setJson] = useState(() => (waarde ? JSON.stringify(waarde) : ""));
  const wijzigRef = useRef(onWijzig);
  wijzigRef.current = onWijzig;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        code: false,
        codeBlock: false,
        strike: false,
        link: { openOnClick: false, autolink: true, protocols: ["https", "mailto", "tel"], HTMLAttributes: { rel: "noopener noreferrer" } },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: (waarde as object) ?? "",
    editorProps: { attributes: { class: "richtekst", "aria-label": label, role: "textbox", "aria-multiline": "true" } },
    onUpdate: ({ editor: e }) => {
      const doc = e.getJSON();
      setJson(JSON.stringify(doc));
      wijzigRef.current?.(doc);
    },
  });

  // Het formulier hoort de wijziging (voor "Niet opgeslagen wijzigingen").
  useEffect(() => {
    verborgen.current?.dispatchEvent(new Event("change", { bubbles: true }));
  }, [json]);

  const actief = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            vet: e.isActive("bold"),
            cursief: e.isActive("italic"),
            lijst: e.isActive("bulletList"),
            genummerd: e.isActive("orderedList"),
            citaat: e.isActive("blockquote"),
            link: e.isActive("link"),
          }
        : null,
  });

  const knop = (tekst: string, aan: boolean | undefined, doe: () => void, uitleg: string) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={doe}
      aria-pressed={Boolean(aan)}
      title={uitleg}
      className={`min-h-[32px] px-2.5 text-[13px] border transition-colors rounded-[2px] ${
        aan ? "border-[var(--limoen)] text-[var(--tekst)] bg-[var(--limoen-zacht)]" : "border-transparent text-[var(--stil)] hover:text-[var(--tekst)] hover:border-[var(--glasrand)]"
      }`}
    >
      {tekst}
    </button>
  );

  const link = () => {
    if (!editor) return;
    if (editor.isActive("link")) return editor.chain().focus().unsetLink().run();
    const href = window.prompt("Adres van de link (https://...)");
    if (!href) return;
    if (!/^(https:\/\/|mailto:|tel:|\/(?!\/))/i.test(href.trim())) return window.alert("Gebruik een volledig adres dat begint met https://");
    editor.chain().focus().extendMarkRange("link").setLink({ href: href.trim() }).run();
  };

  return (
    <div>
      <p className="veld-label">{label}</p>
      <div className="border-b border-[var(--streep)] focus-within:border-[var(--limoen)] focus-within:shadow-[0_1px_0_0_var(--limoen)] transition-colors">
        <div role="toolbar" aria-label="Opmaak" className="flex flex-wrap gap-1 py-2 border-b border-[var(--lijn)] sticky top-0 md:top-0 bg-[rgba(20,20,22,.85)] backdrop-blur-md z-[2]">
          {knop("Kop", actief?.h2, () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), "Tussenkop")}
          {knop("Subkop", actief?.h3, () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), "Kleinere tussenkop")}
          {knop("Vet", actief?.vet, () => editor?.chain().focus().toggleBold().run(), "Vet (Cmd+B)")}
          {knop("Cursief", actief?.cursief, () => editor?.chain().focus().toggleItalic().run(), "Cursief (Cmd+I)")}
          {knop("Lijst", actief?.lijst, () => editor?.chain().focus().toggleBulletList().run(), "Opsomming")}
          {knop("Genummerd", actief?.genummerd, () => editor?.chain().focus().toggleOrderedList().run(), "Genummerde lijst")}
          {knop("Citaat", actief?.citaat, () => editor?.chain().focus().toggleBlockquote().run(), "Citaat")}
          {knop(actief?.link ? "Link weg" : "Link", actief?.link, link, "Link toevoegen of weghalen")}
        </div>
        <EditorContent editor={editor} />
      </div>
      <input ref={verborgen} type="hidden" name={naam} value={json} readOnly />
    </div>
  );
}
