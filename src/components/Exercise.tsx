import React, { useState } from "react";

// Types for a Chip
interface Chip {
  id: string;
  word: string;
}

// Helper to shuffle words
const shuffleArray = (array: any[]) => {
  return [...array].sort(() => Math.random() - 0.5);
};

const SentenceBuilder: React.FC = () => {
  const l1Sentence = "Does the trans raccoon steal mushrooms?";
  const l2Words = [
    "kijetesantakalu",
    "tonsi",
    "li",
    "lanpan",
    "ala",
    "lanpan",
    "e",
    "soko",
    "?",
  ];

  const initialAvailable = shuffleArray(
    l2Words.map((word, index) => ({ id: `${index}-${word}`, word })),
  );

  const [availableChips, setAvailableChips] =
    useState<Chip[]>(initialAvailable);
  const [sentenceChips, setSentenceChips] = useState<Chip[]>([]);

  // Handlers for click
  const handleClickAvailable = (chip: Chip) => {
    setAvailableChips((prev) => prev.filter((c) => c.id !== chip.id));
    setSentenceChips((prev) => [...prev, chip]);
  };

  const handleClickSentence = (chip: Chip) => {
    setSentenceChips((prev) => prev.filter((c) => c.id !== chip.id));
    setAvailableChips((prev) => [...prev, chip]);
  };

  // Handlers for drag
  const handleDragStart = (
    e: React.DragEvent<HTMLSpanElement>,
    chip: Chip,
    from: "available" | "sentence",
  ) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ chip, from }));
  };

  const handleDropAvailable = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    if (data.from === "sentence") {
      handleClickSentence(data.chip);
    }
  };

  const handleDropSentence = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData("text/plain"));
    if (data.from === "available") {
      handleClickAvailable(data.chip);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div style={{ fontFamily: "sans-serif", padding: 20 }}>
      <h2>Translate the following:</h2>
      <p>
        <strong>{l1Sentence}</strong>
      </p>

      <div
        style={{
          minHeight: 50,
          border: "1px solid gray",
          padding: 10,
          marginBottom: 20,
        }}
        onDrop={handleDropSentence}
        onDragOver={handleDragOver}
      >
        {sentenceChips.map((chip) => (
          <span
            key={chip.id}
            draggable
            onDragStart={(e) => handleDragStart(e, chip, "sentence")}
            onClick={() => handleClickSentence(chip)}
            style={{
              display: "inline-block",
              margin: "5px",
              padding: "5px 10px",
              border: "1px solid #aaa",
              borderRadius: "10px",
              backgroundColor: "#eef",
            }}
          >
            {chip.word}
          </span>
        ))}
      </div>

      <div
        style={{ minHeight: 50, border: "1px dashed gray", padding: 10 }}
        onDrop={handleDropAvailable}
        onDragOver={handleDragOver}
      >
        {availableChips.map((chip) => (
          <span
            key={chip.id}
            draggable
            onDragStart={(e) => handleDragStart(e, chip, "available")}
            onClick={() => handleClickAvailable(chip)}
            style={{
              display: "inline-block",
              margin: "5px",
              padding: "5px 10px",
              border: "1px solid #ccc",
              borderRadius: "10px",
              backgroundColor: "#f9f9f9",
            }}
          >
            {chip.word}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SentenceBuilder;
