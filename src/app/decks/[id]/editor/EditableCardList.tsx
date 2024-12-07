"use client";

import { Separator } from "~/components/ui/separator"
import { api } from "~/trpc/react";
import React from 'react'
import { Button } from '~/components/ui/button'
import { TextAreaResize } from '~/components/ui/textarea-resize';

interface EditableLanguageCardProps {
  indonesian: string;
  english: string;
  onUpdate?: (newValues: { indonesian: string; english: string }) => void;
  onDelete?: () => void;
}

export function EditableLanguageCard({ indonesian, english, onUpdate, onDelete }: EditableLanguageCardProps) {

  return (
    <div className="p-2 my-1 border rounded-lg shadow-sm relative">
      <TextAreaResize
        aria-label="Indonesian text"
        className="w-full text-sm font-medium bg-transparent outline-none focus:ring-1 focus:ring-gray-300 rounded px-1"
        value={indonesian}
        onChange={(e) => onUpdate?.({ indonesian: e.target.value, english })}
      />
      <Separator className="my-2" />
      <TextAreaResize
        aria-label="English text"
        className="w-full text-sm font-medium bg-transparent outline-none focus:ring-1 focus:ring-gray-300 rounded px-1"
        value={english}
        onChange={(e) => onUpdate?.({ indonesian, english: e.target.value })}
      />
      <button
        onClick={onDelete}
        aria-label="Delete card"
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
      >
        ×
      </button>
    </div>
  )
}

export function EditableLanguageCardList({ data, deckId }: { data: EditableLanguageCardProps[], deckId: string }) {
  const utils = api.useUtils();
  const [cards, setCards] = React.useState(data);
  const createManyCards = api.card.createMany.useMutation({
    onSuccess: async () => {
      await utils.deck.getById.invalidate({ id: deckId });
    },
  });

  // Add this handler
  const handleBulkUpload = () => {
    createManyCards.mutate({ cards, deckId });
    setCards([]);
  };

  const handleUpdate = (index: number, newValues: { indonesian: string; english: string }) => {
    const newCards = [...cards];
    newCards[index] = newValues;
    setCards(newCards);
  };

  const handleDelete = (index: number) => {
    const newCards = cards.filter((_, i) => i !== index);
    setCards(newCards);
  };
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button
          onClick={handleBulkUpload}
          variant="outline"
          className="text-sm"
        >
          Save All Cards
        </Button>
      </div>
      {cards && <div className="grid grid-cols-1 xl:grid-cols-3 sm:grid-cols-2 gap-4">
        {cards.map((card, index) => (
          <EditableLanguageCard
            key={index}
            indonesian={card.indonesian}
            english={card.english}
            onUpdate={(newValues) => handleUpdate(index, newValues)}
            onDelete={() => handleDelete(index)}
          />
        ))}
      </div>}
    </div>
  );
}
