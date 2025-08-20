import ChipExercise from "@/components/ChipExercise.tsx";
import { KALAMA } from "@/consts";
import { verifyChips, type Exercise } from "@/utils/exercise";
import React, { useState } from "react";

const Practice: React.FC<{
  exercises: Exercise[];
  locale: Record<string, string>;
}> = ({ exercises, locale }) => {
  const _ = (text: string) => locale[text];
  const [exerciseQueue, setExerciseQueue] = useState<Exercise[]>(exercises);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [assembledSentence, setAssembledSentence] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const [allDone, setAllDone] = useState(false);

  const currentExercise = exerciseQueue[currentIndex];

  // Audio doesn't exist server-side, this is a wrapper to avoid that
  const [sfx_yes] = useState(
    typeof Audio !== "undefined" && new Audio(`${KALAMA}/sfx/yes.mp3`),
  );
  const [sfx_no] = useState(
    typeof Audio !== "undefined" && new Audio(`${KALAMA}/sfx/no.mp3`),
  );
  const [sfx_done] = useState(
    typeof Audio !== "undefined" && new Audio(`${KALAMA}/sfx/done.mp3`),
  );

  const handleCheck = () => {
    setCompleted(completed + 1);
    if (verifyChips(currentExercise, assembledSentence)) {
      setStatusMessage(_("correct"));
      sfx_yes.play();
    } else {
      setStatusMessage(`${_("incorrect")} "${currentExercise.l2}"`);
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
        <h2>{_("done")}</h2>
      ) : (
        <>
          <h2>{_("translate")}</h2>
          <h3>{currentExercise.l1}</h3>
          <ChipExercise
            exercise={currentExercise}
            onAssembledSentenceChange={setAssembledSentence}
            locked={checked}
          />
          <div className="exercise-footer">
            <button
              onClick={checked ? handleContinue : handleCheck}
              className="exercise-button chip"
            >
              {checked ? _("continue") : _("check")}
            </button>
            {statusMessage && <p>{statusMessage}</p>}
          </div>
        </>
      )}
    </div>
  );
};

export default Practice;
