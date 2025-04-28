import ChipBuilder from "@/components/Exercise.tsx";
import React, { useState } from "react";

interface IExercise {
  id: number;
  l1: string;
  l2: string;
}

const exercises: IExercise[] = [
  { id: 2, l1: "Do you know this?", l2: "sina sona ala sona e ni?" },
  { id: 3, l1: "The animal knows the bug.", l2: "soweli li sona e pipi." },
  { id: 4, l1: "The bug eats plants.", l2: "pipi li moku e kasi." },
  { id: 5, l1: "The bird sees plants.", l2: "waso li lukin e kasi." },
];

const Exercise: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [assembledSentence, setAssembledSentence] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const currentExercise = exercises[currentIndex];
  const l2Words = currentExercise.l2.split(" ").map((w) => w.trim());
  // console.log(l2Words);

  const handleCheck = () => {
    const userAnswer = assembledSentence.join(" ").trim();
    const correctAnswer = currentExercise.l2.trim();
    if (userAnswer === correctAnswer) {
      setStatusMessage("✅ Correct! Well done!");
    } else {
      setStatusMessage(`❌ Not quite. Correct answer: "${correctAnswer}"`);
    }
    setChecked(true);
  };

  const handleContinue = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAssembledSentence([]);
      setStatusMessage(null);
      setChecked(false);
    } else {
      setStatusMessage("🎉 All exercises completed!");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Translate: {currentExercise.l1}</h2>
      <ChipBuilder
        availableWords={l2Words}
        assembledSentence={assembledSentence}
        onAssembledSentenceChange={setAssembledSentence}
      />
      {statusMessage && <p style={{ marginTop: "20px" }}>{statusMessage}</p>}
      <button
        onClick={checked ? handleContinue : handleCheck}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        {checked ? "Continue" : "Check"}
      </button>
    </div>
  );
};

export default Exercise;
