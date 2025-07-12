import { type CollectionEntry, getCollection } from "astro:content";

// utilities

export const by =
  <T>(key: (x: T) => any, ascending: boolean = true) =>
  (a: T, b: T) =>
    (ascending ? 1 : -1) * (key(a) > key(b) ? 1 : -1);

const POSTS = "content/";

export const getLang = (post: CollectionEntry<"blog">) =>
  post.filePath!.replace(POSTS, "").split("/")[0];

export const posts = await getCollection("blog");
export const langs = (() => {
  const rawLangs = new Set(posts.map(getLang));
  rawLangs.delete("index.md");
  return [...rawLangs].sort();
})();
export const langNames: Record<string, string> = {
  en: "English",
  de: "Deutsch",
  ru: "русский",
  hu: "magyar",
  translate: "add language",
};

export const prevnexts = Object.fromEntries(
  langs.map((lang) => {
    const langPosts = posts
      .filter((post) => getLang(post) === lang)
      .sort(by((post) => post.filePath));
    return [
      lang,
      Object.fromEntries(
        langPosts.map((post, i) => [
          post.id,
          { prev: langPosts[i - 1], next: langPosts[i + 1] },
        ]),
      ),
    ];
  }),
);
