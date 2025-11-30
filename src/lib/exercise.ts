import { z } from "zod";

export const task = z
  .object({
    l1: z.string(),
    l2: z.string(),
    alsoAccept: z.string().array().optional(),
    junkChips: z.string().array().optional(),
  })
  .strict();
export type Task = z.infer<typeof task>;

export const exercise = z
  .object({
    title: z.string(),
    tasks: z.array(task),
  })
  .strict();
export type Exercise = z.infer<typeof exercise>;

export const tokeniseSentence = (sentence: string) =>
  sentence.replaceAll(/[\.\,\?\:\!]$/g, "").split(" ");
// .map((w) => w.trim());

export const verifyChips = (exercise: Task, chips: string[]) =>
  (exercise.alsoAccept ? [exercise.l2, ...exercise.alsoAccept] : [exercise.l2])
    .map((sentence) => tokeniseSentence(sentence).join(" "))
    .includes(chips.join(" "));
