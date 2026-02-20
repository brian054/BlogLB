import "./style.css";
import { marked } from "marked";

const posts = import.meta.glob("./blogPosts/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

async function loadFirstPost() {
  const contentEl = document.getElementById("content");
  if (!contentEl) {
    console.error(
      'Missing element: #content. Add <article id="content"></article> to index.html',
    );
    return;
  }

  const paths = Object.keys(posts).sort(); // stable order
  if (paths.length === 0) {
    contentEl.innerHTML = "<p>No posts found.</p>";
    return;
  }

  const firstPath = paths[0]!;
  const mdText = await posts[firstPath]();

  console.log("Loaded markdown file:", firstPath);

  const html = await marked.parse(mdText);
  contentEl.innerHTML = html;
}

loadFirstPost();
