"use client";
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
import React, { useRef, useEffect, useCallback } from "react";
import { api } from "~/trpc/react";
import type { CardsWithUserCards } from "~/server/api/routers/deck";
import { Button } from "~/components/ui/button";

function FlashCardContent() {
  const utils = api.useUtils();
  const updateUserCard = api.userCard.reviewCard.useMutation({
    onSuccess: async () => {
      await utils.card.getUserReviewCards.invalidate();
    },
  });
  const { state, dispatch } = useFlashcard();
  const maxQueueLength = 4;
  const isQueueCard =
    (state.cards.length === 0 && state.cardQueue.length > 0) ||
    state.cardQueue.length >= maxQueueLength;
  const currentCard = isQueueCard ? state.cardQueue[0]! : state.cards[0];
  const slowdownFactor = 0.9;
  const pauseMultiplier = 1.2;
  const finishCard = (quality?: number) => {
    if (isQueueCard) {
      dispatch({ type: "PASS_PASSED_QUEUE_CARD" });
    } else {
      dispatch({ type: "PASS_PASSED_CARD" });
    }
    if (quality) {
      updateUserCard.mutate({ cardId: currentCard!.id, quality });
    }
    stopAllAudio();
  };
  const enqueueCard = () => {
    if (isQueueCard) {
      dispatch({ type: "PASS_FAILED_QUEUE_CARD" });
    } else {
      dispatch({ type: "PASS_FAILED_CARD" });
    }
    stopAllAudio();
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const commandArray = [
    { command: "again", callback: () => startCard() },
    { command: "later", callback: () => enqueueCard() },
    { command: "easy", callback: () => finishCard(5) },
    { command: "okay", callback: () => finishCard(3) },
    { command: "hard", callback: () => finishCard(1) },
    { command: "skip", callback: () => finishCard() },
    { command: "pause", callback: () => stopAllAudio() },
  ];
  const { transcript, finalTranscript, resetTranscript, listening } =
    useSpeechRecognition({ commands: commandArray });
  const retryCommandNotFound = async () => {
    if (!popSoundRef.current) return;
    await popSoundRef.current.play();
    await SpeechRecognition.startListening({ language: "en-US" });
  };
  // useffect to accomplish the same thing as the commands with a switch
  React.useEffect(() => {
    if (
      !listening &&
      finalTranscript &&
      !commandArray.find((command) => command.command === finalTranscript)
    ) {
      void retryCommandNotFound();
    } else if (!listening && transcript && !finalTranscript) {
      // find the right command and call it
      const command = commandArray.find(
        (command) => command.command === transcript,
      );
      if (command) {
        command.callback();
      } else {
        void retryCommandNotFound();
      }
    }
  }, [finalTranscript, listening]);
  const [showIndonesian, setShowIndonesian] = React.useState(false);
  // Create persistent references to audio objects
  const indonesianAudioRef = useRef<HTMLAudioElement | null>(null);
  const englishAudioRef = useRef<HTMLAudioElement | null>(null);
  const popSoundRef = useRef<HTMLAudioElement | null>(null);
  const abortController = useRef<AbortController>();

  const startCard = useCallback(async () => {
    abortController.current = new AbortController();
    const signal = abortController.current.signal;

    const playWithDelay = async (audio: HTMLAudioElement | null, rate = 1) => {
      if (!audio) return;
      audio.playbackRate = rate;
      try {
        await new Promise((resolve, reject) => {
          audio.addEventListener("ended", resolve, { once: true });
          audio.addEventListener("error", reject, { once: true });
          audio.play().catch(reject);
        });
      } catch (error) {
        console.error("Error playing audio:", error);
      }
    };

    // Wait for Indonesian audio to load before getting duration
    const getAudioDuration = async (
      audio: HTMLAudioElement | null,
    ): Promise<number> => {
      if (!audio) throw new Error("Audio element not found");
      if (audio.duration && !isNaN(audio.duration)) return audio.duration;

      return new Promise((resolve) => {
        audio.addEventListener(
          "loadedmetadata",
          () => {
            resolve(audio.duration);
          },
          { once: true },
        );
      });
    };

    const indonesianDuration = await getAudioDuration(
      indonesianAudioRef.current,
    );
    const pauseDuration =
      (indonesianDuration / slowdownFactor) * pauseMultiplier;

    try {
      // Play English
      await playWithDelay(englishAudioRef.current);
      await new Promise((resolve) => setTimeout(resolve, pauseDuration * 1000));
      // Play Indonesian
      if (signal.aborted) {
        console.log("aborted");
        return;
      }
      await playWithDelay(indonesianAudioRef.current, slowdownFactor);
      if (signal.aborted) return;
      await new Promise((resolve) =>
        setTimeout(resolve, pauseDuration * pauseMultiplier * 1000),
      );

      // Play Indonesian again
      if (signal.aborted) return;
      await playWithDelay(indonesianAudioRef.current, slowdownFactor);
      if (signal.aborted) return;
      if (!popSoundRef.current) return;
      await popSoundRef.current.play();
      await SpeechRecognition.startListening({ language: "en-US" });
      console.log("listening");
    } catch (error) {
      console.error("Error in audio sequence:", error);
    }
  }, []);

  // Initialize audio objects once
  useEffect(() => {
    popSoundRef.current = new Audio("/pop-on.mp3");
    popSoundRef.current.volume = 0.5;

    // Cleanup function
    return () => {
      indonesianAudioRef.current?.pause();
      englishAudioRef.current?.pause();
      popSoundRef.current?.pause();
    };
  }, []);

  // Update audio sources when card changes
  useEffect(() => {
    if (currentCard) {
      indonesianAudioRef.current = new Audio(currentCard.indonesianAudioUrl);
      englishAudioRef.current = new Audio(currentCard.englishAudioUrl);
      setShowIndonesian(false);
      void startCard();
    }
  }, [currentCard, startCard]);

  // Also update the playIndonesian and playEnglish functions
  const playIndonesian = () => {
    if (!indonesianAudioRef.current) return;
    indonesianAudioRef.current.playbackRate = 0.9;
    indonesianAudioRef.current
      .play()
      .catch((error) =>
        console.error("Error playing Indonesian audio:", error),
      );
  };

  const playEnglish = () => {
    if (!englishAudioRef.current) return;
    englishAudioRef.current
      .play()
      .catch((error) => console.error("Error playing English audio:", error));
  };

  const stopAllAudio = () => {
    abortController.current?.abort();
    indonesianAudioRef.current?.pause();
    englishAudioRef.current?.pause();
    if (indonesianAudioRef.current) indonesianAudioRef.current.currentTime = 0;
    if (englishAudioRef.current) englishAudioRef.current.currentTime = 0;
  };

  // on unmount, stop listening
  React.useEffect(() => {
    return () => {
      void SpeechRecognition.abortListening();
    };
  }, []);

  if (!currentCard) return <div>no card</div>;

  return (
    <div className="w-96 rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
      <div
        className="mb-8 cursor-pointer text-center text-xl"
        onClick={playEnglish}
      >
        {currentCard.english}
      </div>
      <div className="mb-8 flex cursor-pointer items-center justify-center gap-2 text-center text-xl">
        <>
          <span
            onClick={(e) => {
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
      <div className="flex justify-between items-center gap-2">
        {listening ? (
          <div
            className="p-1"
            onClick={() => SpeechRecognition.stopListening()}
          >
            <MicrophoneIcon size={24} />
          </div>
        ) : (
          <div
            onClick={() =>
              SpeechRecognition.startListening({ language: "en-US" })
            }
          >
            <MicrophoneCrossIcon size={32} />
          </div>
        )}
        {transcript && (
          <div className="rounded-md bg-gray-100 p-2">
            {transcript}
          </div>
        )}
        <div
          onClick={() => finishCard()}
          className="rounded-full p-1 transition-colors hover:bg-green-100"
        >
          <NextCardIcon size={24} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => finishCard(5)}>
          Easy
        </Button>
        <Button variant="outline" size="sm" onClick={() => finishCard(3)}>
          Okay
        </Button>
        <Button variant="outline" size="sm" onClick={() => finishCard(1)}>
          Hard
        </Button>
        <Button variant="outline" size="sm" onClick={() => startCard()}>
          Again
        </Button>
        <Button variant="outline" size="sm" onClick={() => enqueueCard()}>
          Later
        </Button>
        <Button variant="outline" size="sm" onClick={stopAllAudio}>
          Pause
        </Button>
        <Button variant="outline" size="sm" onClick={() => finishCard()}>
          Skip
        </Button>
      </div>
    </div>
  );
}

export function FlashCard({ cards }: { cards: CardsWithUserCards }) {
  return (
    <FlashcardProvider initialCards={cards}>
      <FlashCardContent />
    </FlashcardProvider>
  );
}
