import "./style.css";
import { marked } from "marked";

// strongly type the loaders so TS knows they return string
const posts = import.meta.glob("./blogPosts/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

async function loadFirstPost() {
  const contentEl = document.getElementById("content");
  if (!contentEl) return;

  const paths = Object.keys(posts);
  if (paths.length === 0) {
    contentEl.innerHTML = "<p>No posts found.</p>";
    return;
  }

  const firstPath = paths[0]!;
  const mdText = await posts[firstPath]();

  // marked.parse can be sync OR async depending on config, so await it
  const html = await marked.parse(mdText);

  contentEl.innerHTML = html;
}

loadFirstPost();