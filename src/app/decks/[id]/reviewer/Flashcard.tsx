"use client";
import type { Card } from "@prisma/client";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { FlashcardProvider, useFlashcard } from "./FlashcardContext";
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  MicrophoneIcon,
  MicrophoneCrossIcon,
} from "~/components/icons";
import "regenerator-runtime/runtime";
import React from "react";

async function startCard(audioUrl: string) {
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
  const [incorrectCount, setIncorrectCount] = React.useState<number>(0);

  const handleCorrectNoFail = (isQueueCard: boolean) => {
    if (isQueueCard) {
      dispatch({ type: "PASS_PASSED_QUEUE_CARD" });
    } else {
      dispatch({ type: "PASS_PASSED_CARD" });
    }
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

  const handleIncorrectAnswer = (isQueueCard: boolean) => {
    setIncorrectCount((prev) => prev + 1);
  };

  return {
    handleCorrectNoFail,
    handleIncorrectAnswer,
    handleCorrectWithFail,
    correctCount,
    incorrectCount,
  };
}

function FlashCardContent() {
  const { transcript, resetTranscript, listening } = useSpeechRecognition();
  const { state, dispatch } = useFlashcard();
  const [hasFailed, setHasFailed] = React.useState(false);
  const isFinished = state.cards.length === 0 && state.cardQueue.length === 0;
  const maxQueueLength = 2;
  const isQueueCard =
    (state.cards.length === 0 && state.cardQueue.length > 0) ||
    state.cardQueue.length >= maxQueueLength;
  const currentCard = isQueueCard ? state.cardQueue[0]! : state.cards[0];
  const {
    handleCorrectNoFail,
    handleIncorrectAnswer,
    handleCorrectWithFail,
    correctCount,
    incorrectCount,
  } = useCardActions();
  const [showIndonesian, setShowIndonesian] = React.useState(false);
  const [lastTranscript, setLastTranscript] = React.useState("");

  // Play the audio of the current card any time the state changes, then begin listening
  React.useEffect(() => {
    if (currentCard) {
      startCard(currentCard.englishAudioUrl);
    }
  }, [currentCard, correctCount]);

  // on unmount, stop listening
  React.useEffect(() => {
    return () => {
      SpeechRecognition.abortListening();
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
      handleIncorrectAnswer(isQueueCard);
      setHasFailed(true);
      startCard(currentCard.indonesianAudioUrl);
    }
  }, [transcript, currentCard, dispatch, resetTranscript, listening]);

  if (!currentCard)
    return (
      <div>YAY</div>
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
                playIndonesian();
              }}
              className={`text-xl hover:text-blue-600 ${showIndonesian ? "" : "blur"}`}
            >
              {currentCard.indonesian}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowIndonesian(!showIndonesian);
              }}
              className="rounded-full p-1 transition-colors hover:bg-gray-100"
              aria-label="Hide Indonesian text"
            >
              {showIndonesian ? (
                <EyeSlashIcon size={20} />
              ) : (
                <EyeIcon size={20} />
              )}
            </button>
          </>
      </div>
      <div className="flex select-none items-center gap-2">
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
