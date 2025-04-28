import React, { useEffect, useState } from "react";

interface ChipBuilderProps {
  availableWords: string[];
  assembledSentence: string[];
  onAssembledSentenceChange: (words: string[]) => void;
}

// Types for a Chip
interface DroppedChip {
  id: string;
  from: "unused" | "assembled";
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

function chip(dropped: DroppedChip): number {
  return parseInt(dropped.id);
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
    e.dataTransfer.setData("text/plain", JSON.stringify({ id: idx, from }));
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDropAt = (e: React.DragEvent<HTMLSpanElement>, at: number) => {
    e.preventDefault();
    const dropped: DroppedChip = JSON.parse(
      e.dataTransfer.getData("text/plain"),
    );
    insertAssembled(chip(dropped), at);
  };

  const onDropAssembled = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped: DroppedChip = JSON.parse(
      e.dataTransfer.getData("text/plain"),
    );
    if (dropped.from === "unused") {
      addAssembled(chip(dropped));
    }
  };

  const onDropUnused = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const dropped: DroppedChip = JSON.parse(
      e.dataTransfer.getData("text/plain"),
    );
    if (dropped.from === "assembled") {
      addUnused(chip(dropped));
    }
  };

  return (
    <div>
      <div
        onDrop={onDropAssembled}
        onDragOver={onDragOver}
        style={{
          minHeight: "50px",
          border: "1px dashed #ccc",
          padding: "10px",
          marginBottom: "20px",
          borderRadius: "8px",
        }}
      >
        {assembled.map((idx, i) => (
          <span
            key={`assembled-${i}-${idx}`}
            draggable
            onDragStart={(e) => onDragStart(e, idx, "assembled")}
            onDrop={(e) => onDropAt(e, i)}
            onClick={() => addUnused(idx)}
            style={chipStyle}
          >
            {words[idx]}
          </span>
        ))}
      </div>
      <div
        onDrop={onDropUnused}
        onDragOver={onDragOver}
        style={{
          minHeight: "50px",
          border: "1px dashed #ccc",
          padding: "10px",
          borderRadius: "8px",
        }}
      >
        {unused.map((idx, i) => (
          <span
            key={`unused-${i}-${idx}`}
            draggable
            onDragStart={(e) => onDragStart(e, idx, "unused")}
            onClick={() => addAssembled(idx)}
            style={chipStyle}
          >
            {words[idx]}
          </span>
        ))}
      </div>
    </div>
  );
};

const chipStyle: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "#f0f0f0",
  padding: "8px 12px",
  borderRadius: "16px",
  margin: "4px",
  cursor: "pointer",
  userSelect: "none",
};

export default ChipBuilder;
