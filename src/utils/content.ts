import { type CollectionEntry, getCollection } from "astro:content";

// utilities

export const by =
  <T>(key: (x: T) => any, ascending: boolean = true) =>
  (a: T, b: T) =>
    (ascending ? 1 : -1) * (key(a) > key(b) ? 1 : -1);

const POSTS = "src/content/lessons/";

export const getLang = (post: CollectionEntry<"blog">) =>
  post.filePath!.replace(POSTS, "").split("/")[0];

export const posts = await getCollection("blog");
export const langs = new Set(posts.map(getLang));

export const prevnexts = Object.fromEntries(
  [...langs].map((lang) => {
    const langPosts = posts
      .filter((post) => getLang(post) === lang)
      .sort(by((post) => post.data.order));
    console.log(langPosts.map((post) => post.id));
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
