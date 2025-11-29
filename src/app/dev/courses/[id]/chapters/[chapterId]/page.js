// src/app/dev/courses/[id]/chapters/[chapterId]/page.js
import ChapterEditorScreen from "@/screen/dev/courses/chapter/ChapterEditorScreen";

export default function ChapterEditorPage({ params }) {
  return <ChapterEditorScreen params={params} />;
}
