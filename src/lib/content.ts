import { langs } from "@/lib/i18n";
import { type CollectionEntry, getCollection } from "astro:content";
// utilities

export const by =
  <T>(key: (x: T) => any, ascending: boolean = true) =>
  (a: T, b: T) => {
    const ka = key(a);
    const kb = key(b);
    return (ascending ? 1 : -1) * (ka < kb ? -1 : ka > kb ? 1 : 0);
  };

const POSTS = "content/";

export const getLang = (post: CollectionEntry<"content">) =>
  post.filePath!.replace(POSTS, "").split("/")[0];

export const posts = await getCollection("content");
// export const langs = (() => {
//   const rawLangs = new Set(posts.map(getLang));
//   rawLangs.delete("index.md");
//   return [...rawLangs].sort();
// })();

export const postsById = new Map(posts.map((post) => [post.id, post]));

// Group posts by lang in a single pass, then build prev/next links per lang.
const postsByLang = posts.reduce<Record<string, typeof posts>>((acc, post) => {
  (acc[getLang(post)] ??= []).push(post);
  return acc;
}, {});

export const prevnexts = Object.fromEntries(
  langs.map((lang) => {
    const langPosts = (postsByLang[lang] ?? [])
      .filter((post) => post.id.split("/").length > 1) // filter away landing pages
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
