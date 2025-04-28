import React, { useEffect, useState } from "react";

interface ChipBuilderProps {
  availableWords: string[];
  assembledSentence: string[];
  onAssembledSentenceChange: (words: string[]) => void;
}

const ChipBuilder: React.FC<ChipBuilderProps> = ({
  availableWords,
  assembledSentence,
  onAssembledSentenceChange,
}) => {
  const [unusedWords, setUnusedWords] = useState<string[]>([]);

  useEffect(() => {
    setUnusedWords(shuffleArray(availableWords));
  }, [JSON.stringify(availableWords)]);

  function shuffleArray(array: string[]) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const handleChipClick = (word: string) => {
    if (assembledSentence.includes(word)) {
      // Remove from assembled
      onAssembledSentenceChange(assembledSentence.filter((w) => w !== word));
      setUnusedWords([...unusedWords, word]);
    } else {
      // Add to assembled
      onAssembledSentenceChange([...assembledSentence, word]);
      setUnusedWords(unusedWords.filter((w) => w !== word));
    }
  };

  const onDragStart = (
    e: React.DragEvent<HTMLSpanElement>,
    word: string,
    source: "unused" | "assembled",
  ) => {
    e.dataTransfer.setData("word", word);
    e.dataTransfer.setData("source", source);
  };

  const onDropUnused = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const word = e.dataTransfer.getData("word");
    const source = e.dataTransfer.getData("source");
    if (source === "assembled") {
      onAssembledSentenceChange(assembledSentence.filter((w) => w !== word));
      setUnusedWords([...unusedWords, word]);
    }
  };

  const onDropAssembled = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const word = e.dataTransfer.getData("word");
    const source = e.dataTransfer.getData("source");
    if (source === "unused") {
      setUnusedWords(unusedWords.filter((w) => w !== word));
      onAssembledSentenceChange([...assembledSentence, word]);
    } else {
      console.log("dropped assembled on not unused");
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
        {assembledSentence.map((word, index) => (
          <span
            key={index}
            draggable
            onDragStart={(e) => onDragStart(e, word, "assembled")}
            onClick={() => handleChipClick(word)}
            style={chipStyle}
          >
            {word}
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
        {unusedWords.map((word, index) => (
          <span
            key={index}
            draggable
            onDragStart={(e) => onDragStart(e, word, "unused")}
            onClick={() => handleChipClick(word)}
            style={chipStyle}
          >
            {word}
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
