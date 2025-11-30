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
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Quote,
  Code,
  Highlighter,
  Palette,
  X,
} from "lucide-react";

export default function ChapterEditor({ initialContent = "" }) {
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoPreview, setVideoPreview] = useState("");

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ 
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Youtube.configure({
        modestBranding: true,
        controls: true,
        allowFullscreen: true,
        HTMLAttributes: {
          class: "rounded-lg w-full aspect-video my-4",
        },
      }),
    ],

    content: initialContent || "<p>Start writing your chapter content...</p>",

    editorProps: {
      attributes: {
        class:
          "prose prose-invert dark:prose-invert max-w-none focus:outline-none text-base min-h-[400px] p-4",
      },
    },

    autofocus: "end",
    editable: true,
  });

  const addLink = () => {
    if (!editor) return;
    
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("Enter URL", previousUrl);
    
    if (url === null) return;
    
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const addImage = (e) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      editor.chain().focus().setImage({ src: reader.result }).run();
    };
    reader.onerror = () => {
      alert("Failed to read image file");
    };
    reader.readAsDataURL(file);
    
    e.target.value = "";
  };

  const addYoutubePreview = () => {
    if (!videoUrl.trim()) {
      alert("Please enter a YouTube URL");
      return;
    }
    
    const embed = convertYoutube(videoUrl);
    if (!embed) {
      alert("Invalid YouTube URL. Please use a valid YouTube video URL.");
      return;
    }
    
    setVideoPreview(embed);
  };

  const removeYoutubePreview = () => {
    setVideoPreview("");
  };

  const insertYoutubeInEditor = () => {
    if (!editor || !videoUrl.trim()) return;
    
    const videoId = extractYoutubeId(videoUrl);
    if (!videoId) {
      alert("Invalid YouTube URL");
      return;
    }
    
    editor.chain().focus().setYoutubeVideo({ src: videoUrl }).run();
    setVideoUrl("");
    setVideoPreview("");
  };

  const handleSave = () => {
    if (!editor) return;
    
    const content = editor.getHTML();
    const data = {
      title: title.trim(),
      content,
      videoUrl: videoUrl.trim(),
      savedAt: new Date().toISOString(),
    };
    
    console.log("Saving chapter:", data);
    alert("Chapter saved successfully!\n\nCheck console for saved data.");
  };

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-[#0e1217] text-white">
        <div className="text-lg">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#0e1217] text-white overflow-hidden">
      <div className="sticky top-0 z-50 bg-[#0e1217]/95 border-b border-white/10 backdrop-blur px-6 py-3 flex items-center gap-4">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Chapter title"
          className="bg-[#1a1f25] border-none text-white w-[280px] placeholder:text-gray-500"
        />

        <Input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="YouTube URL"
          className="bg-[#1a1f25] border-none text-white w-[260px] placeholder:text-gray-500"
        />

        <Button 
          variant="secondary" 
          onClick={addYoutubePreview}
          disabled={!videoUrl.trim()}
        >
          Preview
        </Button>

        <Button 
          variant="outline" 
          onClick={insertYoutubeInEditor}
          disabled={!videoUrl.trim()}
        >
          Insert Video
        </Button>

        <div className="flex-1" />

        <Button onClick={handleSave}>Save Chapter</Button>
      </div>

      <div className="sticky top-[61px] z-40 bg-[#0e1217]/95 border-b border-white/10 backdrop-blur px-6 py-2 flex items-center gap-2 flex-wrap">
        <TB
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          icon={<Undo size={18} />}
          title="Undo"
        />
        <TB
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          icon={<Redo size={18} />}
          title="Redo"
        />

        <Sep />

        <TB
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive("heading", { level: 1 })}
          icon={<Heading1 size={18} />}
          title="Heading 1"
        />
        <TB
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
          icon={<Heading2 size={18} />}
          title="Heading 2"
        />
        <TB
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive("heading", { level: 3 })}
          icon={<Heading3 size={18} />}
          title="Heading 3"
        />

        <Sep />

        <TB
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          icon={<Bold size={18} />}
          title="Bold"
        />
        <TB
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          icon={<Italic size={18} />}
          title="Italic"
        />
        <TB
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          icon={<span className="font-bold underline text-base">U</span>}
          title="Underline"
        />

        <Sep />

        <TB
          onClick={() => editor.chain().focus().setColor("#4ade80").run()}
          icon={<Palette size={18} />}
          title="Text Color (Green)"
        />
        <TB
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          active={editor.isActive("highlight")}
          icon={<Highlighter size={18} />}
          title="Highlight"
        />

        <Sep />

        <TB
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          active={editor.isActive({ textAlign: "left" })}
          icon={<AlignLeft size={18} />}
          title="Align Left"
        />
        <TB
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          active={editor.isActive({ textAlign: "center" })}
          icon={<AlignCenter size={18} />}
          title="Align Center"
        />
        <TB
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          active={editor.isActive({ textAlign: "right" })}
          icon={<AlignRight size={18} />}
          title="Align Right"
        />

        <Sep />

        <TB
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          icon={<List size={18} />}
          title="Bullet List"
        />
        <TB
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          icon={<ListOrdered size={18} />}
          title="Numbered List"
        />

        <Sep />

        <TB 
          onClick={addLink} 
          active={editor.isActive("link")}
          icon={<span className="text-sm font-bold">🔗</span>}
          title="Add Link"
        />

        <label className="cursor-pointer p-2 rounded-md hover:bg-white/10 transition" title="Upload Image">
          <span className="text-sm">🖼️</span>
          <input 
            type="file" 
            className="hidden" 
            onChange={addImage}
            accept="image/*"
          />
        </label>

        <Sep />

        <TB
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          icon={<Quote size={18} />}
          title="Blockquote"
        />
        <TB
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          icon={<Code size={18} />}
          title="Code Block"
        />
      </div>

      {videoPreview && (
        <div className="w-full bg-black border-b border-white/10 p-4 relative">
          <button
            onClick={removeYoutubePreview}
            className="absolute top-6 right-6 z-10 p-2 bg-red-500/80 hover:bg-red-500 rounded-full transition"
            title="Remove Preview"
          >
            <X size={18} />
          </button>
          <iframe
            src={videoPreview}
            className="w-full h-[360px] rounded-lg"
            allowFullScreen
            title="YouTube Preview"
          ></iframe>
        </div>
      )}

      <div className="flex-1 overflow-auto px-6 pb-10">
        <div className="mt-4 bg-[#11161c] rounded-xl border border-white/10 min-h-[80vh]">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}

function TB({ icon, onClick, active = false, disabled = false, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-md transition ${
        active 
          ? "bg-blue-500/20 text-blue-400" 
          : "hover:bg-white/10"
      } ${
        disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"
      }`}
      type="button"
    >
      {icon}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-white/15 mx-1" />;
}

function extractYoutubeId(url) {
  try {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
      /youtube\.com\/embed\/([^&\n?#]+)/,
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) return match[1];
    }
    return null;
  } catch {
    return null;
  }
}

function convertYoutube(url) {
  const id = extractYoutubeId(url);
  return id ? `https://www.youtube.com/embed/${id}` : "";
}