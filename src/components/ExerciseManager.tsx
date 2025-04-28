import ChipBuilder from "@/components/Exercise.tsx";
import React, { useState } from "react";

interface IExercise {
  l1: string;
  l2: string;
}

const Exercise: React.FC<{
  exercises: IExercise[];
}> = ({ exercises }) => {
  const [exerciseQueue, setExerciseQueue] = useState<IExercise[]>(exercises);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [assembledSentence, setAssembledSentence] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const currentExercise = exerciseQueue[currentIndex];
  const l2Words = currentExercise.l2.split(" ").map((w) => w.trim());
  // console.log(l2Words);

  const sfx_yes = new Audio(
    "https://raw.githubusercontent.com/wasona/wasona/main/public/audio/yes.mp3",
  );
  const sfx_no = new Audio(
    "https://raw.githubusercontent.com/wasona/wasona/main/public/audio/no.mp3",
  );
  const sfx_done = new Audio(
    "https://raw.githubusercontent.com/wasona/wasona/main/public/audio/done.mp3",
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
      setExerciseQueue((prev) => [...prev, prev[currentIndex]]);
      sfx_no.play();
    }
    setChecked(true);
  };

  const handleContinue = () => {
    if (currentIndex < exerciseQueue.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAssembledSentence([]);
      setStatusMessage(null);
      setChecked(false);
    } else {
      setAllDone(true);
      sfx_done.play();
    }
  };

  return (
    <div className="exercise">
      <div className="exercise-progress-container">
        <div
          className="exercise-progress"
          style={{ width: `${(completed / exerciseQueue.length) * 100}%` }}
        ></div>
      </div>
      {allDone ? (
        <h2>🎉 All exercises completed!</h2>
      ) : (
        <>
          <h2>Translate the sentence</h2>
          <h3>{currentExercise.l1}</h3>
          <ChipBuilder
            availableWords={l2Words}
            assembledSentence={assembledSentence}
            onAssembledSentenceChange={setAssembledSentence}
          />
          {statusMessage && (
            <p style={{ marginTop: "20px" }}>{statusMessage}</p>
          )}
          <button
            onClick={checked ? handleContinue : handleCheck}
            className="exercise-button"
          >
            {checked ? "Continue" : "Check"}
          </button>
        </>
      )}
    </div>
  );
};

export default Exercise;
