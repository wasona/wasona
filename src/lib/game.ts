import { KALAMA } from "@/lib/audio";

// Fisher–Yates shuffle, returns a new array.
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Build the audio URL for a word/name chip.
export function audioLink(word: string): string {
  word = word.replaceAll(/[\.,\?\!\:]/g, "");
  const dir = word === word.toLowerCase() ? "words" : "names";
  return `${KALAMA}/jan-lakuse/${dir}/${word}.mp3`;
}

// Play the hidden <audio> element for a given word, if present.
export function play(word: string): void {
  const audio = document.getElementById(`audio-${word}`);
  if (audio instanceof HTMLAudioElement) audio.play();
}
