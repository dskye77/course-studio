"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";
import Color from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Youtube from "@tiptap/extension-youtube";

import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Quote,
  Code,
  Highlighter,
  Palette,
  X,
} from "lucide-react";

export default function ChapterEditor({ initialContent = "", onChange }) {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoPreview, setVideoPreview] = useState("");

  // default colors
  const [textColor, setTextColor] = useState("#ffffff");
  const [highlightColor, setHighlightColor] = useState("#ffff0080");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TextStyle,
      Color.configure({ types: ["textStyle"] }), // make sure TextStyle is present
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph", "listItem"] }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      Image.configure({ inline: false, allowBase64: true }),
      Youtube.configure({
        modestBranding: true,
        controls: true,
        allowFullscreen: true,
        HTMLAttributes: {
          class: "rounded-lg w-full aspect-video my-8 mx-auto",
        },
      }),
    ],
    content: initialContent || "<p>Start writing your chapter...</p>",
    editorProps: {
      attributes: {
        class:
          "ProseMirror prose prose-lg dark:prose-invert max-w-none focus:outline-none min-h-full p-6 pb-32 outline-none",
      },
    },
  });

  // Helper: detect heading level (accurate when caret at start)
  const getCurrentHeadingLevel = () => {
    if (!editor) return null;
    const { from } = editor.state.selection;
    const node = editor.state.doc.resolve(from).parent;
    return node.type.name === "heading" ? node.attrs.level : null;
  };

  // Keep parent app informed
  useEffect(() => {
    if (!editor || !onChange) return;
    const handler = () =>
      onChange({
        title,
        videoUrl,
        content: editor.getHTML(),
      });
    editor.on("update", handler);
    editor.on("selectionUpdate", handler);
    handler();
    return () => {
      editor.off("update", handler);
      editor.off("selectionUpdate", handler);
    };
  }, [editor, title, videoUrl, onChange]);

  // Sync color pickers with selection
  useEffect(() => {
    if (!editor) return;
    const sync = () => {
      const color = editor.getAttributes("textStyle").color || "#ffffff";
      const hl = editor.getAttributes("highlight").color || "#ffff0080";
      setTextColor(color);
      setHighlightColor(hl);
    };
    editor.on("selectionUpdate", sync);
    sync();
    return () => editor.off("selectionUpdate", sync);
  }, [editor]);

  // YouTube helpers
  const extractYoutubeId = (url) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  };
  const convertYoutube = (url) => {
    const id = extractYoutubeId(url);
    return id ? `https://www.youtube.com/embed/${id}` : "";
  };

  const insertYoutube = () => {
    const id = extractYoutubeId(videoUrl);
    if (!id) return alert("Invalid YouTube URL");
    editor
      .chain()
      .focus()
      .setYoutubeVideo({ src: `https://www.youtube.com/watch?v=${id}` })
      .run();
    setVideoUrl("");
    setVideoPreview("");
  };

  const addImage = (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = () =>
      editor.chain().focus().setImage({ src: reader.result }).run();
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  if (!editor) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0e1217] text-white">
        Loading editor...
      </div>
    );
  }

  const headingLevel = getCurrentHeadingLevel();

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0e1217] text-white">
      {/* Title & Video */}
      <div className="sticky top-0 z-50 flex flex-wrap items-center gap-3 border-b border-white/10 bg-[#0e1217]/95 px-6 py-3 backdrop-blur">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Chapter title"
          className="w-80 bg-[#1a1f25] border-none text-white placeholder:text-gray-500"
        />
        <Input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="YouTube URL (optional)"
          className="w-72 bg-[#1a1f25] border-none text-white placeholder:text-gray-500"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setVideoPreview(convertYoutube(videoUrl) || "")}
          disabled={!videoUrl.trim()}
        >
          Preview
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={insertYoutube}
          disabled={!videoUrl.trim()}
        >
          Insert Video
        </Button>
      </div>

      {/* Toolbar */}
      <div className="sticky top-[73px] z-40 flex flex-wrap items-center gap-1 border-b border-white/10 bg-[#0e1217]/95 px-6 py-2 backdrop-blur">
        <TB
          icon={<Undo size={18} />}
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        />
        <TB
          icon={<Redo size={18} />}
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        />
        <Sep />

        {/* P / H1 / H2 / H3 */}
        <TB
          icon={<span className="font-bold text-sm">P</span>}
          active={headingLevel === null}
          onClick={() => editor.chain().focus().setParagraph().run()}
        />
        <TB
          icon={<Heading1 size={20} />}
          active={headingLevel === 1}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        />
        <TB
          icon={<Heading2 size={20} />}
          active={headingLevel === 2}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        />
        <TB
          icon={<Heading3 size={20} />}
          active={headingLevel === 3}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        />
        <Sep />

        {/* Inline formatting */}
        <TB
          icon={<Bold size={18} />}
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <TB
          icon={<Italic size={18} />}
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <TB
          icon={<span className="font-bold underline">U</span>}
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
        <Sep />

        {/* Text Color */}
        <div className="relative flex items-center rounded-md overflow-hidden border border-white/10">
          <button
            onClick={() => {
              // Toggle between selected color and white
              const active = editor.isActive("textStyle", { color: textColor });
              editor.chain().focus();
              if (active) {
                // remove current color and set white (explicit)
                editor.chain().focus().unsetColor().run();
                // set white explicitly to ensure visible default; this keeps markup consistent
                editor.chain().focus().setColor("#ffffff").run();
              } else {
                editor.chain().focus().setColor(textColor).run();
              }
            }}
            className={`p-2 transition ${
              editor.isActive("textStyle", { color: textColor })
                ? "bg-blue-500/40"
                : "hover:bg-white/10"
            }`}
          >
            <Palette size={18} />
          </button>

          <div
            className="h-8 w-10 border-l border-white/20"
            style={{ backgroundColor: textColor }}
          />

          <input
            type="color"
            value={textColor}
            onChange={(e) => {
              const color = e.target.value;
              setTextColor(color);
              editor.chain().focus().setColor(color).run();
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        {/* Highlight */}
        <div className="relative flex items-center rounded-md overflow-hidden border border-white/10 ml-1">
          <button
            onClick={() => {
              const active = editor.isActive("highlight", {
                color: highlightColor,
              });
              editor.chain().focus();
              if (active) {
                // unset highlight
                // Note: both unsetHighlight() and unsetMark('highlight') map to removing highlight;
                // using unsetHighlight() via chain if available
                try {
                  editor.chain().focus().unsetHighlight().run();
                } catch (e) {
                  // fallback: remove highlight mark manually
                  editor.chain().focus().unsetMark("highlight").run();
                }
              } else {
                editor
                  .chain()
                  .focus()
                  .setHighlight({ color: highlightColor })
                  .run();
              }
            }}
            className={`p-2 transition ${
              editor.isActive("highlight")
                ? "bg-yellow-500/40"
                : "hover:bg-white/10"
            }`}
          >
            <Highlighter size={18} />
          </button>

          <div
            className="h-8 w-10 border-l border-white/20"
            style={{ backgroundColor: highlightColor }}
          />

          <input
            type="color"
            value={highlightColor.slice(0, 7)}
            onChange={(e) => {
              const newColor = e.target.value + "80";
              setHighlightColor(newColor);
              editor.chain().focus().setHighlight({ color: newColor }).run();
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        <Sep />

        {/* Alignment */}
        <TB
          icon={<AlignLeft size={18} />}
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        />
        <TB
          icon={<AlignCenter size={18} />}
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        />
        <TB
          icon={<AlignRight size={18} />}
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        />
        <Sep />

        {/* Lists */}
        <TB
          icon={<List size={18} />}
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <TB
          icon={<ListOrdered size={18} />}
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <Sep />

        {/* Link */}
        <TB
          icon={<Link2 size={18} />}
          active={editor.isActive("link")}
          onClick={() => {
            const url = prompt(
              "Enter URL",
              editor.getAttributes("link").href || "https://"
            );
            if (url === null) return;
            url
              ? editor.chain().focus().setLink({ href: url }).run()
              : editor.chain().focus().unsetLink().run();
          }}
        />

        {/* Image */}
        <label className="cursor-pointer rounded p-2 hover:bg-white/10">
          <ImageIcon size={18} />
          <input
            type="file"
            accept="image/*"
            onChange={addImage}
            className="hidden"
          />
        </label>
        <Sep />

        {/* Quote + Code */}
        <TB
          icon={<Quote size={18} />}
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <TB
          icon={<Code size={18} />}
          active={editor.isActive("codeBlock")}
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        />
      </div>

      {/* Video Preview */}
      {videoPreview && (
        <div className="relative border-b border-white/10 bg-black p-6">
          <button
            onClick={() => setVideoPreview("")}
            className="absolute right-8 top-8 z-10 rounded-full bg-red-600 p-2 hover:bg-red-700 transition"
          >
            <X size={18} />
          </button>
          <iframe
            src={videoPreview}
            className="mx-auto h-96 w-full max-w-4xl rounded-lg"
            allowFullScreen
            title="YouTube Preview"
          />
        </div>
      )}

      {/* Editor content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="min-h-full rounded-xl border border-white/10 bg-[#11161c] p-2">
          <EditorContent editor={editor} />
        </div>
      </div>

      <style jsx global>{`
        .ProseMirror h1 {
          color: #60a5fa;
        }
        .ProseMirror h2 {
          color: #93c5fd;
        }
        .ProseMirror h3 {
          color: #bfdbfe;
        }
        .ProseMirror a {
          color: #a78bfa;
          text-decoration: underline;
        }
        .ProseMirror a:hover {
          color: #c4b5fd;
        }
      `}</style>
    </div>
  );
}

/* ----------------------------- */
/* Small UI helpers              */
/* ----------------------------- */

function TB({ icon, onClick, active = false, disabled = false }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-md p-2 transition-all ${
        active
          ? "bg-blue-500/30 text-blue-400 border border-blue-500/50 shadow-sm shadow-blue-500/20"
          : "hover:bg-white/10 text-gray-300"
      } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {icon}
    </button>
  );
}

function Sep() {
  return <div className="mx-1 h-6 w-px bg-white/20" />;
}
