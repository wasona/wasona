// This is done as a separate public file,
// so that I can put it as a loaded <script> in head.
// there may be better ways? this one works.

const theme = (() => {
  const localStorageTheme = localStorage?.getItem("theme") ?? "";
  if (["dark", "light"].includes(localStorageTheme)) {
    return localStorageTheme;
  }
  // if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  // return "dark";
  // }
  return "light";
})();

if (theme === "light") {
  document.documentElement.classList.remove("dark");
} else {
  document.documentElement.classList.add("dark");
}

window.localStorage.setItem("theme", theme);

const handleThemeToggleClick = () => {
  const element = document.documentElement;
  element.classList.toggle("dark");

  const isDark = element.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
};

const shouldHideAnswers = (() => {
  const localStorageTheme = localStorage?.getItem("hide-answers") ?? "";
  if (["yes", "no"].includes(localStorageTheme)) {
    return localStorageTheme;
  }
  return "no";
})();

if (shouldHideAnswers === "no") {
  document.documentElement.classList.remove("hide-answers");
} else {
  document.documentElement.classList.add("hide-answers");
}

window.localStorage.setItem("hide-answers", shouldHideAnswers);

const handleHideAnswersToggleClick = () => {
  const element = document.documentElement;
  element.classList.toggle("hide-answers");

  const shouldHideAnswers = element.classList.contains("hide-answers") ? "yes" : "no";
  localStorage.setItem("hide-answers", shouldHideAnswers);
};
