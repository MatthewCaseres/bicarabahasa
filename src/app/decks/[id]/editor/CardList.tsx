"use client";

import { Separator } from "~/components/ui/separator"
import { api } from "~/trpc/react";
import { TrashIcon } from "~/components/icons/trash";
import { PencilIcon } from "~/components/icons/pencil";
import React, { useState } from 'react'
import { Button } from "~/components/ui/button";
import { FlashcardForm } from "~/app/_components/FlashcardForm";
import type { Card } from "@prisma/client";
import { Dialog } from "~/components/ui/dialog";

type LanguageCardProps = Card & {
  setEditCardId: (id: string) => void;
  setEditOpen: (open: boolean) => void;
  onDelete: () => void;
  isAdmin: boolean;
}

function LanguageCard({ id, indonesian, english, englishAudioUrl, indonesianAudioUrl, setEditCardId, setEditOpen, onDelete, isAdmin }: LanguageCardProps) {
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
    <div className="flex items-center p-2 my-1 border rounded-lg shadow-sm">
      <div className="flex-1">
        <p 
          onClick={playIndonesian} 
          className="text-sm font-medium px-1 cursor-pointer hover:text-blue-600"
        >
          {indonesian}
        </p>
        <Separator className="my-2" />
        <p 
          onClick={playEnglish}
          className="text-sm font-medium px-1 cursor-pointer hover:text-blue-600"
        >
          {english}
        </p>
      </div>
      {isAdmin && (
        <div className="flex flex-col justify-center items-center gap-2">
          <Button variant="destructive" size="icon" onClick={onDelete}>
            <TrashIcon size={10} />
          </Button>
          <Button variant="default" size="icon" onClick={() => {setEditCardId(id); setEditOpen(true)}}>
            <PencilIcon size={10} />
          </Button>
        </div>
      )}
    </div>
  )
}

export function LanguageCardList({ deckId, isAdmin }: { deckId: string, isAdmin: boolean }) {
  const utils = api.useUtils();
  const [cards] = api.card.getByDeckId.useSuspenseQuery({deckId})
  const [editCardId, setEditCardId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const currentCard = editCardId ? cards.find((card) => card.id === editCardId) : null;
  const indonesian = currentCard?.indonesian ?? "";
  const english = currentCard?.english ?? "";
  const updateCard = api.card.update.useMutation({
    onSuccess: async () => {
      await utils.card.getByDeckId.invalidate();
    },
  });
  const deleteCard = api.card.delete.useMutation({
    onSuccess: async () => {
      await utils.card.getByDeckId.invalidate();
    },
  });


  return (
    <>
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <FlashcardForm
          onSubmit={(values) => {
            if (editCardId) {
              updateCard.mutate({...values, id: editCardId});
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
      <div className="grid grid-cols-1 xl:grid-cols-3 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
        <LanguageCard
          key={card.id}
          {...card}
          setEditCardId={setEditCardId}
          setEditOpen={setEditOpen}
          onDelete={() => deleteCard.mutate({id: card.id})}
          isAdmin={isAdmin}
        />
      ))}
    </div>
    </>
  );
}
