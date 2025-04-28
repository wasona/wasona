import ChipBuilder from "@/components/Exercise.tsx";
import React, { useState } from "react";

interface IExercise {
  l1: string;
  l2: string;
}

const Exercise: React.FC<{
  exercises: IExercise[];
}> = ({ exercises }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [assembledSentence, setAssembledSentence] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const currentExercise = exercises[currentIndex];
  const l2Words = currentExercise.l2.split(" ").map((w) => w.trim());
  // console.log(l2Words);

  const sfx_yes = new Audio(
    "https://raw.githubusercontent.com/AcipenserSturio/toki-pona-101/main/public/audio/yes.mp3",
  );
  const sfx_no = new Audio(
    "https://raw.githubusercontent.com/AcipenserSturio/toki-pona-101/main/public/audio/no.mp3",
  );
  const sfx_done = new Audio(
    "https://raw.githubusercontent.com/AcipenserSturio/toki-pona-101/main/public/audio/done.mp3",
  );

  const handleCheck = () => {
    const userAnswer = assembledSentence.join(" ").trim();
    const correctAnswer = currentExercise.l2.trim();
    setCompleted(completed + 1);
    if (userAnswer === correctAnswer) {
      setStatusMessage("✅ Correct! Well done!");
      sfx_yes.play();
    } else {
      setStatusMessage(`❌ Not quite. Correct answer: "${correctAnswer}"`);
      sfx_no.play();
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
      sfx_done.play();
    }
  };

  return (
    <div className="exercise">
      <div className="exercise-progress-container">
        <div
          className="exercise-progress"
          style={{ width: `${(completed / exercises.length) * 100}%` }}
        ></div>
      </div>
      <h2>Translate the sentence</h2>
      <h3>{currentExercise.l1}</h3>
      <ChipBuilder
        availableWords={l2Words}
        assembledSentence={assembledSentence}
        onAssembledSentenceChange={setAssembledSentence}
      />
      {statusMessage && <p style={{ marginTop: "20px" }}>{statusMessage}</p>}
      <button
        onClick={checked ? handleContinue : handleCheck}
        className="exercise-button"
      >
        {checked ? "Continue" : "Check"}
      </button>
    </div>
  );
};

export default Exercise;
