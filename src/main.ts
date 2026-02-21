import "./style.css";
import { marked } from "marked";

const posts = import.meta.glob("./blogPosts/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>; // Promise here allows us to only load file when we need

function getContentEl(): HTMLElement {
  const el = document.getElementById("content");
  if (!el) {
    throw new Error(
      'Missing element: #content. Add <article id="content"></article> to index.html',
    );
  }
  return el;
}

function getSortedPaths(): string[] {
  // wanna sort by date eventually, also wanna sort into categories based on what you end up doing
  return Object.keys(posts).sort();
}

function slugFromPath(path: string): string {
  // "./blogPosts/2026-02-20-my-post.md" -> "2026-02-20-my-post"
  return path.split("/").pop()!.replace(/\.md$/, "");
}

// for when the user clicks on a post path, need to figure out what path it actually is
function pathFromSlug(slug: string): string | undefined {
  return getSortedPaths().find((p) => slugFromPath(p) === slug);
}

async function renderMarkdown(path: string) {
  const contentEl = getContentEl();

  const mdText = await posts[path]();
  const html = await marked.parse(mdText);

  contentEl.innerHTML = `
    <div class="mb-6">
      <a href="#/archive" class="text-gray-300 hover:text-white">← Back to Posts</a>
    </div>
    ${html}
  `;
}

async function renderHome() {
  const paths = getSortedPaths();
  const contentEl = getContentEl();

  if (paths.length === 0) {
    contentEl.innerHTML = "<p>No posts found.</p>";
    return;
  }

  await renderMarkdown(paths[0]!); // so just renders the first post in blogPosts
}

function renderBlogPostsArchive() {
  const contentEl = getContentEl();
  const paths = getSortedPaths();

  const items = paths
    .map((p) => {
      const slug = slugFromPath(p);
      // Name files like "2026-02-20-title.md"???
      const title = slug.replace(/-/g, " ");
      return `
        <li class="py-2">
          <a href="#/post/${encodeURIComponent(slug)}" class="text-gray-300 hover:text-white">
            ${title}
          </a>
        </li>
      `;
    })
    .join("");

  contentEl.innerHTML = `
    <h1 class="text-2xl font-semibold mb-4">Posts</h1>
    <ul class="divide-y divide-white/10">
      ${items || "<li>No posts found.</li>"}
    </ul>
  `;
}

async function router() {
  const hash = window.location.hash || "#/";
  // formats:
  //   #/          -> home
  //   #/archive   -> list
  //   #/post/slug -> render post

  // switch here or nah?
  const [, route, param] = hash.split("/");
  if (!route || route === "") {
    await renderHome();
    return;
  }

  if (route === "archive") {
    renderBlogPostsArchive();
    return;
  }

  if (route === "post" && param) {
    const slug = decodeURIComponent(param);
    const path = pathFromSlug(slug);
    if (!path) {
      getContentEl().innerHTML = `<p>Post not found: ${slug}</p>`;
      return;
    }
    await renderMarkdown(path);
    return;
  }

  // just in case
  await renderHome();
}

// Run router initially + on hash changes 
// (hashchange is built in: https://developer.mozilla.org/en-US/docs/Web/API/Window/hashchange_event)
window.addEventListener("hashchange", () => {
  router().catch(console.error);
});

router().catch(console.error);
