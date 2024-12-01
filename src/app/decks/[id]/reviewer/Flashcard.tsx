"use client";
import type { Card } from "@prisma/client";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { FlashcardProvider, useFlashcard } from "./FlashcardContext";
import {
  EyeSlashIcon,
  MicrophoneIcon,
  MicrophoneCrossIcon,
  NextCardIcon,
} from "~/components/icons";
import "regenerator-runtime/runtime";
import React from "react";

import { CompletionScreen } from "./CompletionScreen";

async function startCard(audioUrl: string) {
  console.log("starting card", audioUrl);
  const audio = new Audio(audioUrl);
  try {
    await new Promise((resolve, reject) => {
      audio.addEventListener("ended", resolve);
      audio.addEventListener("error", reject);
      audio.play().catch(reject);
    });
  } catch (error) {
    console.error("Error playing audio:", error);
    return; // Exit early if audio fails
  }
  const micOnSound = new Audio("/pop-on.mp3");
  micOnSound.volume = 0.5;
  await micOnSound.play();
  await SpeechRecognition.startListening({ language: "id" });
  console.log("listening");
}

export function useCardActions() {
  const { dispatch } = useFlashcard();
  const [correctCount, setCorrectCount] = React.useState<number>(0);
  const [passedCount, setPassedCount] = React.useState<number>(0);
  const [incorrectCount, setIncorrectCount] = React.useState<number>(0);

  const removeCard = (isQueueCard: boolean) => {
    if (isQueueCard) {
      dispatch({ type: "PASS_PASSED_QUEUE_CARD" });
    } else {
      dispatch({ type: "PASS_PASSED_CARD" });
    }
  };

  const handlePassCard = (isQueueCard: boolean) => {
    setPassedCount((prev) => prev + 1);
    removeCard(isQueueCard);
  };

  const handleCorrectNoFail = (isQueueCard: boolean) => {
    removeCard(isQueueCard);
    setCorrectCount((prev) => prev + 1);
  };

  const handleCorrectWithFail = (isQueueCard: boolean) => {
    if (isQueueCard) {
      dispatch({ type: "PASS_FAILED_QUEUE_CARD" });
    } else {
      dispatch({ type: "PASS_FAILED_CARD" });
    }
    setCorrectCount((prev) => prev + 1);
  };

  const handleIncorrectAnswer = () => {
    setIncorrectCount((prev) => prev + 1);
  };

  return {
    handleCorrectNoFail,
    handleIncorrectAnswer,
    handleCorrectWithFail,
    handlePassCard,
    correctCount,
    incorrectCount,
    passedCount,
  };
}

function FlashCardContent() {
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const { state, dispatch } = useFlashcard();
  const [hasFailed, setHasFailed] = React.useState(false);
  const maxQueueLength = 2;
  const isQueueCard =
    (state.cards.length === 0 && state.cardQueue.length > 0) ||
    state.cardQueue.length >= maxQueueLength;
  const currentCard = isQueueCard ? state.cardQueue[0]! : state.cards[0];
  const {
    handleCorrectNoFail,
    handleIncorrectAnswer,
    handleCorrectWithFail,
    handlePassCard,
    correctCount,
    incorrectCount,
    passedCount,
  } = useCardActions();
  const [showIndonesian, setShowIndonesian] = React.useState(false);
  const [lastTranscript, setLastTranscript] = React.useState("");

  // Play the audio of the current card any time the state changes, then begin listening
  React.useEffect(() => {
    if (currentCard) {
      setShowIndonesian(false);
      void startCard(currentCard.englishAudioUrl);
    }
  }, [currentCard, correctCount]);

  // on unmount, stop listening
  React.useEffect(() => {
    return () => {
      void SpeechRecognition.abortListening();
      console.log("aborted");
    };
  }, []);

  React.useEffect(() => {
    if (transcript) {
      setLastTranscript(transcript);
    }
  }, [transcript, setLastTranscript]);

  React.useEffect(() => {
    if (!transcript || !currentCard || listening) return;

    const cleanText = (text: string) => {
      return text
        .toLowerCase()
        .replace(/[^a-z]/g, "") // Remove everything except letters
        .trim();
    };

    const cleanTranscript = cleanText(transcript);
    const cleanIndonesian = cleanText(currentCard.indonesian);

    if (cleanTranscript === cleanIndonesian) {
      if (hasFailed) {
        handleCorrectWithFail(isQueueCard);
      } else {
        handleCorrectNoFail(isQueueCard);
      }
      setHasFailed(false);
      resetTranscript();
      setLastTranscript("");
    } else {
      handleIncorrectAnswer();
      setHasFailed(true);
      void startCard(currentCard.indonesianAudioUrl);
    }
  }, [transcript, currentCard, dispatch, resetTranscript, listening]);
  if (!currentCard)
    return (
      <CompletionScreen correctCount={correctCount} incorrectCount={incorrectCount} passedCount={passedCount} />
    );

  const playIndonesian = () => {
    const audio = new Audio(currentCard.indonesianAudioUrl);
    audio.playbackRate = 0.9;
    audio
      .play()
      .catch((error) =>
        console.error("Error playing Indonesian audio:", error),
      );
  };

  const playEnglish = () => {
    const audio = new Audio(currentCard.englishAudioUrl);
    audio
      .play()
      .catch((error) => console.error("Error playing English audio:", error));
  };

  return (
    <div className="w-96 rounded-xl bg-white p-6 shadow-lg border border-gray-200">
      <div
        className="mb-8 cursor-pointer text-center text-xl"
        onClick={playEnglish}
      >
        {currentCard.english}
      </div>
      <div
        className="mb-8 flex cursor-pointer items-center justify-center gap-2 text-center text-xl"
      >
          <>
            <span 
              onClick = {(e) => {
                e.stopPropagation();
                if (showIndonesian) {
                  playIndonesian();
                }
                setShowIndonesian(true);
              }}
              className={`text-xl ${showIndonesian ? "hover:text-blue-600" : "blur"}`}
            >
              {currentCard.indonesian}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
                setShowIndonesian(false);
              }}
              className="rounded-full p-1 transition-colors hover:bg-gray-100"
              aria-label="Hide Indonesian text"
            >
            {showIndonesian && <EyeSlashIcon size={20} />}
          </button>
        </>
      </div>
      <div className="flex select-none items-center gap-2 justify-between">
        {listening ? (
          <div
            className="p-1"
            onClick={() => SpeechRecognition.stopListening()}
          >
            <MicrophoneIcon size={24} />
          </div>
        ) : (
          <div onClick={() => SpeechRecognition.startListening({ language: "id" })}>
            <MicrophoneCrossIcon size={32} />
          </div>
        )}
        {lastTranscript && (
          <div className="bg-gray-100 rounded-md p-2">{lastTranscript}</div>
        )}
        <div
          onClick={() => handlePassCard(isQueueCard)}
          className="rounded-full p-1 transition-colors hover:bg-green-100"
        >
          <NextCardIcon size={24} />
        </div>
      </div>
    </div>
  );
}

export function FlashCard({ cards }: { cards: Card[] }) {
  return (
    <FlashcardProvider initialCards={cards}>
      <FlashCardContent />
    </FlashcardProvider>
  );
}
