export interface Exercise {
  l1: string;
  l2: string;
  alsoAccept?: string[];
  junkChips?: string[];
}

export const tokeniseSentence = (sentence: string) =>
  sentence.replaceAll(/[\.\,\?\:\!]$/g, "").split(" ");
// .map((w) => w.trim());

export const verifyChips = (exercise: Exercise, chips: string[]) =>
  (exercise.alsoAccept ? [exercise.l2, ...exercise.alsoAccept] : [exercise.l2])
    .map((sentence) => tokeniseSentence(sentence).join(" "))
    .includes(chips.join(" "));
