import { KALAMA } from "@/consts";
import { tokeniseSentence, type Exercise } from "@/utils/exercise";
import React, { useEffect, useState } from "react";

// Helper to shuffle words
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function appended(array: number[], element: number): number[] {
  return [...array, element];
}

function inserted(array: number[], element: number, at: number): number[] {
  array.splice(at, 0, element);
  return array;
}

function without(array: number[], element: number): number[] {
  return array.filter((c) => c !== element);
}

function play(word: string) {
  let audio = document.getElementById(`audio-${word}`);
  if (!(audio instanceof HTMLAudioElement)) return;
  audio.play();
}

function audioLink(word: string) {
  word = word.replaceAll(/[\.\,\?\!\:]/g, "");
  const dir = word === word.toLowerCase() ? "words" : "names";
  return `${KALAMA}/jan-lakuse/${dir}/${word}.mp3`;
}

const ChipExercise: React.FC<{
  exercise: Exercise;
  onAssembledSentenceChange: (words: string[]) => void;
  locked: boolean;
}> = ({ exercise, onAssembledSentenceChange, locked }) => {
  const [words, setWords] = useState<string[]>([]);
  const [assembled, setAssembled] = useState<number[]>([]);

  const unused = words.map((_, i) => i).filter((i) => !assembled.includes(i));

  // Initialise unused and assembled when receiving a new exercise
  useEffect(() => {
    setWords(shuffleArray(tokeniseSentence(exercise.l2)));
    setAssembled([]);
  }, [JSON.stringify(exercise)]);

  // Output current assembled sentence when it updates
  useEffect(() => {
    onAssembledSentenceChange(assembled.map((i) => words[i]));
  }, [assembled]);

  const addUnused = (chip: number) => {
    if (locked) return;
    setAssembled(without(assembled, chip));
    play(words[chip]);
  };
  const addAssembled = (chip: number) => {
    if (locked) return;
    setAssembled(appended(without(assembled, chip), chip));
    play(words[chip]);
  };
  const insertAssembled = (chip: number, at: number) => {
    if (locked) return;
    setAssembled((prev) => inserted(without(prev, chip), chip, at));
    play(words[chip]);
  };

  const onDragStart = (
    e: React.DragEvent<HTMLSpanElement>,
    idx: number,
    from: "unused" | "assembled",
  ) => {
    e.dataTransfer.setData("id", `${idx}`);
    e.dataTransfer.setData("from", from);
    // play(words[idx]);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDropAt = (e: React.DragEvent<HTMLSpanElement>, at: number) => {
    e.preventDefault();
    const idx = e.dataTransfer.getData("id");
    insertAssembled(parseInt(idx), at);
  };

  const onDropAssembled = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const idx = e.dataTransfer.getData("id");
    const from = e.dataTransfer.getData("from");
    if (from === "unused") {
      addAssembled(parseInt(idx));
    }
  };

  const onDropUnused = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const idx = e.dataTransfer.getData("id");
    const from = e.dataTransfer.getData("from");
    if (from === "assembled") {
      addUnused(parseInt(idx));
    }
  };

  return (
    <div dir="ltr">
      <div style={{ display: "none" }}>
        {words
          .filter(
            // Unique values
            (value: any, index: any, array: any) =>
              array.indexOf(value) === index,
          )
          .map((word, i) => (
            <audio
              id={`audio-${word}`}
              key={`audio-${word}`}
              preload="auto"
              src={audioLink(word)}
            />
          ))}
      </div>
      <div
        onDrop={onDropAssembled}
        onDragOver={onDragOver}
        className="exercise-assembled"
      >
        {assembled.map((idx, i) => (
          <button
            key={`assembled-${i}-${idx}`}
            draggable
            onDragStart={(e) => onDragStart(e, idx, "assembled")}
            onDrop={(e) => onDropAt(e, i)}
            onClick={() => addUnused(idx)}
            className="chip"
          >
            {words[idx]}
          </button>
        ))}
      </div>
      <div
        onDrop={onDropUnused}
        onDragOver={onDragOver}
        className="exercise-unused"
      >
        {words.map((word, i) =>
          unused.includes(i) ? (
            <button
              key={`unused-${i}`}
              draggable
              onDragStart={(e) => onDragStart(e, i, "unused")}
              onClick={() => addAssembled(i)}
              className="chip"
            >
              {words[i]}
            </button>
          ) : (
            <button key={`unused-${i}`} className="chip hidden">
              {words[i]}
            </button>
          ),
        )}
      </div>
    </div>
  );
};

export default ChipExercise;
