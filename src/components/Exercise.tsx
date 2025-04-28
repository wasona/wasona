import React, { useEffect, useState } from "react";

interface ChipBuilderProps {
  availableWords: string[];
  assembledSentence: string[];
  onAssembledSentenceChange: (words: string[]) => void;
}

// Types for a Chip
interface Chip {
  id: number;
  word: string;
}

// Types for a Chip
interface DroppedChip {
  id: string;
  word: string;
  from: "unused" | "assembled";
}

// Helper to shuffle words
const shuffleArray = (array: any[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};

function withChip(chips: Chip[], chip: Chip): Chip[] {
  return [...chips, chip]; // TODO: at: number;
}

function withoutChip(chips: Chip[], chip: Chip): Chip[] {
  return chips.filter((c) => c.id !== chip.id);
}

function chip(dropped: DroppedChip): Chip {
  return { id: parseInt(dropped.id), word: dropped.word };
}

const ChipBuilder: React.FC<ChipBuilderProps> = ({
  availableWords,
  assembledSentence,
  onAssembledSentenceChange,
}) => {
  const [unused, setUnused] = useState<Chip[]>([]);
  const [assembled, setAssembled] = useState<Chip[]>([]);

  console.log("Unused:", unused, "Assembled:", assembled);

  // Initialise unused and assembled when receiving a new sentence
  useEffect(() => {
    setUnused(shuffleArray(availableWords.map((word, id) => ({ id, word }))));
    setAssembled([]);
  }, [JSON.stringify(availableWords)]);

  // Output current assembled sentence when it updates
  useEffect(() => {
    onAssembledSentenceChange(assembled.map((chip) => availableWords[chip.id]));
  }, [assembled]);

  const removeChip = (chip: Chip) => {
    setAssembled((prev) => withoutChip(assembled, chip));
    setUnused(withoutChip(unused, chip));
  };
  const addUnused = (chip: Chip) => {
    removeChip(chip);
    setUnused(withChip(unused, chip));
  };
  const addAssembled = (chip: Chip) => {
    removeChip(chip);
    setAssembled(withChip(assembled, chip));
  };
  const insertAssembled = (chip: Chip, at: Chip) => {
    setUnused(withoutChip(unused, chip));
    setAssembled((prev) => {
      const targetIndex = prev.indexOf(at);
      const updated = withoutChip(prev, chip);
      console.log(targetIndex);
      updated.splice(targetIndex, 0, chip);
      return updated;
    });
  };

  const onDragStart = (
    e: React.DragEvent<HTMLSpanElement>,
    chip: Chip,
    from: "unused" | "assembled",
  ) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({ id: chip.id, word: chip.word, from }),
    );
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const onDropAt = (e: React.DragEvent<HTMLSpanElement>, at: Chip) => {
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
        {assembled.map((chip, i) => (
          <span
            key={`assembled-${i}-${chip.id}`}
            draggable
            onDragStart={(e) => onDragStart(e, chip, "assembled")}
            onDrop={(e) => onDropAt(e, chip)}
            onClick={() => addUnused(chip)}
            style={chipStyle}
          >
            {availableWords[chip.id]}
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
        {unused.map((chip, i) => (
          <span
            key={`unused-${i}-${chip.id}`}
            draggable
            onDragStart={(e) => onDragStart(e, chip, "unused")}
            onClick={() => addAssembled(chip)}
            style={chipStyle}
          >
            {availableWords[chip.id]}
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
