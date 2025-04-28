import React, { useEffect, useState } from "react";

interface ChipBuilderProps {
  availableWords: string[];
  assembledSentence: string[];
  onAssembledSentenceChange: (words: string[]) => void;
}

// Helper to shuffle words
const shuffleArray = (array: any[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};

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

const ChipBuilder: React.FC<ChipBuilderProps> = ({
  availableWords,
  assembledSentence,
  onAssembledSentenceChange,
}) => {
  const [words, setWords] = useState<string[]>([]);
  const [assembled, setAssembled] = useState<number[]>([]);

  const unused = words.map((_, i) => i).filter((i) => !assembled.includes(i));

  // Initialise unused and assembled when receiving a new sentence
  useEffect(() => {
    setWords(shuffleArray(availableWords));
    setAssembled([]);
  }, [JSON.stringify(availableWords)]);

  // Output current assembled sentence when it updates
  useEffect(() => {
    onAssembledSentenceChange(assembled.map((i) => words[i]));
  }, [assembled]);

  const addUnused = (chip: number) => {
    setAssembled(without(assembled, chip));
  };
  const addAssembled = (chip: number) => {
    setAssembled(appended(without(assembled, chip), chip));
  };
  const insertAssembled = (chip: number, at: number) => {
    setAssembled((prev) => inserted(without(prev, chip), chip, at));
  };

  const onDragStart = (
    e: React.DragEvent<HTMLSpanElement>,
    idx: number,
    from: "unused" | "assembled",
  ) => {
    e.dataTransfer.setData("id", `${idx}`);
    e.dataTransfer.setData("from", from);
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
    <div>
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

export default ChipBuilder;
