import React, { useEffect, useState } from "react";

interface ChipBuilderProps {
  availableWords: string[];
  assembledSentence: string[];
  onAssembledSentenceChange: (words: string[]) => void;
}

function shuffleArray(array: number[]) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function withIndex(arr: number[], idx: number): number[] {
  return [...arr, idx];
}

function withoutIndex(arr: number[], idx: number): number[] {
  const copy = [...arr];
  const index = copy.indexOf(idx);
  if (index > -1) copy.splice(index, 1);
  return copy;
}

const ChipBuilder: React.FC<ChipBuilderProps> = ({
  availableWords,
  assembledSentence,
  onAssembledSentenceChange,
}) => {
  const [unused, setUnused] = useState<number[]>([]);
  const [assembled, setAssembled] = useState<number[]>([]);

  useEffect(() => {
    const indices = availableWords.map((_, idx) => idx);
    setUnused(shuffleArray(indices));
    setAssembled([]);
  }, [JSON.stringify(availableWords)]);

  useEffect(() => {
    const sentence = assembled.map((idx) => availableWords[idx]);
    onAssembledSentenceChange(sentence);
  }, [assembled]);

  const handleChipClick = (idx: number, from: "unused" | "assembled") => {
    if (from === "unused") {
      setUnused(withoutIndex(unused, idx));
      setAssembled(withIndex(assembled, idx));
    } else {
      setAssembled(withoutIndex(assembled, idx));
      setUnused(withIndex(unused, idx));
    }
  };

  const onDragStart = (
    e: React.DragEvent<HTMLSpanElement>,
    idx: number,
    source: "unused" | "assembled",
  ) => {
    e.dataTransfer.setData("index", idx.toString());
    e.dataTransfer.setData("source", source);
  };

  const onDropUnused = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const idx = parseInt(e.dataTransfer.getData("index"), 10);
    const source = e.dataTransfer.getData("source");
    if (source === "assembled") {
      setAssembled(withoutIndex(assembled, idx));
      setUnused(withIndex(unused, idx));
    }
  };

  const onDropAssembled = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const idx = parseInt(e.dataTransfer.getData("index"), 10);
    const source = e.dataTransfer.getData("source");
    if (source === "unused") {
      setUnused(withoutIndex(unused, idx));
      setAssembled(withIndex(assembled, idx));
    }
  };

  const allowDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div>
      <div
        onDrop={onDropAssembled}
        onDragOver={allowDrop}
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
            onClick={() => handleChipClick(idx, "assembled")}
            style={chipStyle}
          >
            {availableWords[idx]}
          </span>
        ))}
      </div>
      <div
        onDrop={onDropUnused}
        onDragOver={allowDrop}
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
            onClick={() => handleChipClick(idx, "unused")}
            style={chipStyle}
          >
            {availableWords[idx]}
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
