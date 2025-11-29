// src/components/custom/RichTextEditor.jsx
"use client";

import { useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Image,
  Link,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
} from "lucide-react";

export default function RichTextEditor({
  content,
  onChange,
  disabled = false,
}) {
  const editorRef = useRef(null);

  // Execute command on selected text
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  // Handle image upload
  const handleImageUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        // Create a blob URL for immediate preview
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = `<img src="${event.target.result}" alt="Uploaded image" style="max-width: 100%; height: auto; margin: 1rem 0; border-radius: 0.5rem;" />`;
          document.execCommand("insertHTML", false, img);
          handleContentChange();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Handle link insertion
  const handleInsertLink = () => {
    const url = prompt("Enter URL:");
    if (url) {
      execCommand("createLink", url);
      handleContentChange();
    }
  };

  // Handle content change
  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-gray-200 dark:border-gray-800 p-2 flex flex-wrap gap-1">
        <ToolbarButton
          icon={<Undo className="w-4 h-4" />}
          onClick={() => execCommand("undo")}
          title="Undo"
          disabled={disabled}
        />
        <ToolbarButton
          icon={<Redo className="w-4 h-4" />}
          onClick={() => execCommand("redo")}
          title="Redo"
          disabled={disabled}
        />

        <Divider />

        <ToolbarButton
          icon={<Heading1 className="w-4 h-4" />}
          onClick={() => {
            execCommand("formatBlock", "<h1>");
            handleContentChange();
          }}
          title="Heading 1"
          disabled={disabled}
        />
        <ToolbarButton
          icon={<Heading2 className="w-4 h-4" />}
          onClick={() => {
            execCommand("formatBlock", "<h2>");
            handleContentChange();
          }}
          title="Heading 2"
          disabled={disabled}
        />
        <ToolbarButton
          icon={<Heading3 className="w-4 h-4" />}
          onClick={() => {
            execCommand("formatBlock", "<h3>");
            handleContentChange();
          }}
          title="Heading 3"
          disabled={disabled}
        />

        <Divider />

        <ToolbarButton
          icon={<Bold className="w-4 h-4" />}
          onClick={() => {
            execCommand("bold");
            handleContentChange();
          }}
          title="Bold (Ctrl+B)"
          disabled={disabled}
        />
        <ToolbarButton
          icon={<Italic className="w-4 h-4" />}
          onClick={() => {
            execCommand("italic");
            handleContentChange();
          }}
          title="Italic (Ctrl+I)"
          disabled={disabled}
        />
        <ToolbarButton
          icon={<Underline className="w-4 h-4" />}
          onClick={() => {
            execCommand("underline");
            handleContentChange();
          }}
          title="Underline (Ctrl+U)"
          disabled={disabled}
        />

        <Divider />

        <ToolbarButton
          icon={<AlignLeft className="w-4 h-4" />}
          onClick={() => {
            execCommand("justifyLeft");
            handleContentChange();
          }}
          title="Align Left"
          disabled={disabled}
        />
        <ToolbarButton
          icon={<AlignCenter className="w-4 h-4" />}
          onClick={() => {
            execCommand("justifyCenter");
            handleContentChange();
          }}
          title="Align Center"
          disabled={disabled}
        />
        <ToolbarButton
          icon={<AlignRight className="w-4 h-4" />}
          onClick={() => {
            execCommand("justifyRight");
            handleContentChange();
          }}
          title="Align Right"
          disabled={disabled}
        />

        <Divider />

        <ToolbarButton
          icon={<List className="w-4 h-4" />}
          onClick={() => {
            execCommand("insertUnorderedList");
            handleContentChange();
          }}
          title="Bullet List"
          disabled={disabled}
        />
        <ToolbarButton
          icon={<ListOrdered className="w-4 h-4" />}
          onClick={() => {
            execCommand("insertOrderedList");
            handleContentChange();
          }}
          title="Numbered List"
          disabled={disabled}
        />

        <Divider />

        <ToolbarButton
          icon={<Link className="w-4 h-4" />}
          onClick={handleInsertLink}
          title="Insert Link"
          disabled={disabled}
        />
        <ToolbarButton
          icon={<Image className="w-4 h-4" />}
          onClick={handleImageUpload}
          title="Insert Image"
          disabled={disabled}
        />
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        onInput={handleContentChange}
        dangerouslySetInnerHTML={{ __html: content }}
        className="min-h-[500px] p-8 outline-none focus:ring-0 prose prose-lg dark:prose-invert max-w-none"
        style={{ caretColor: "currentColor" }}
      />
    </div>
  );
}

function ToolbarButton({ icon, onClick, title, disabled }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      type="button"
    >
      {icon}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1" />;
}
