"use client";

import { Separator } from "~/components/ui/separator";
import { api } from "~/trpc/react";
import { TrashIcon } from "~/components/icons/trash";
import { PencilIcon } from "~/components/icons/pencil";
import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { FlashcardForm } from "~/app/_components/FlashcardForm";
import type { Card } from "@prisma/client";
import { Dialog } from "~/components/ui/dialog";
import { NameDescriptionHeader } from "~/app/_components/NameDescriptionHeader";

type LanguageCardProps = Card & {
  setEditCardId: (id: string) => void;
  setEditOpen: (open: boolean) => void;
  onDelete: () => void;
  isAdmin: boolean;
};

function LanguageCard({
  id,
  indonesian,
  english,
  englishAudioUrl,
  indonesianAudioUrl,
  setEditCardId,
  setEditOpen,
  onDelete,
  isAdmin,
}: LanguageCardProps) {
  const playIndonesian = () => {
    const audio = new Audio(indonesianAudioUrl);
    audio.playbackRate = 0.9;
    audio
      .play()
      .catch((error) =>
        console.error("Error playing Indonesian audio:", error),
      );
  };

  const playEnglish = () => {
    const audio = new Audio(englishAudioUrl);
    audio
      .play()
      .catch((error) => console.error("Error playing English audio:", error));
  };

  return (
    <div className="my-1 flex items-center rounded-lg border p-2 shadow-sm">
      <div className="flex-1">
        <p
          onClick={playIndonesian}
          className="cursor-pointer px-1 text-sm font-medium hover:text-blue-600"
        >
          {indonesian}
        </p>
        <Separator className="my-2" />
        <p
          onClick={playEnglish}
          className="cursor-pointer px-1 text-sm font-medium hover:text-blue-600"
        >
          {english}
        </p>
      </div>
      {isAdmin && (
        <div className="flex flex-col items-center justify-center gap-2">
          <Button variant="destructive" size="icon" onClick={onDelete}>
            <TrashIcon size={10} />
          </Button>
          <Button
            variant="default"
            size="icon"
            onClick={() => {
              setEditCardId(id);
              setEditOpen(true);
            }}
          >
            <PencilIcon size={10} />
          </Button>
        </div>
      )}
    </div>
  );
}

export function LanguageCardList({
  deckId,
  isAdmin,
}: {
  deckId: string;
  isAdmin: boolean;
}) {
  const utils = api.useUtils();
  const [deck] = api.deck.getById.useSuspenseQuery({ id: deckId });
  const cards = deck.cards;
  const [editCardId, setEditCardId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const currentCard = editCardId
    ? cards.find((card) => card.id === editCardId)
    : null;
  const indonesian = currentCard?.indonesian ?? "";
  const english = currentCard?.english ?? "";
  const updateCard = api.card.update.useMutation({
    onSuccess: async () => {
      await utils.deck.getById.invalidate({ id: deckId });
    },
  });
  const deleteCard = api.card.delete.useMutation({
    onSuccess: async () => {
      await utils.deck.getById.invalidate({ id: deckId });
    },
  });

  return (
    <>
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <FlashcardForm
          onSubmit={(values) => {
            if (editCardId) {
              updateCard.mutate({ ...values, id: editCardId });
            } else {
              console.error("No card id");
            }
            setEditOpen(false);
          }}
          onCancel={() => setEditOpen(false)}
          indonesian={indonesian}
          english={english}
        />
      </Dialog>
      <div>
        <NameDescriptionHeader
          name={deck.name}
          description={deck.description ?? ""}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <LanguageCard
              key={card.id}
              {...card}
              setEditCardId={setEditCardId}
              setEditOpen={setEditOpen}
              onDelete={() => deleteCard.mutate({ id: card.id })}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      </div>
    </>
  );
}
