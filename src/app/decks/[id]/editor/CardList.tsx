"use client";

import { Separator } from "~/components/ui/separator"
import { api } from "~/trpc/react";
import React from 'react'

interface LanguageCardProps {
  indonesian: string;
  english: string;
}

function LanguageCard({ indonesian, english }: LanguageCardProps) {
  return (
    <div className="p-2 my-1 border rounded-lg shadow-sm">
      <p className="text-sm font-medium px-1">{indonesian}</p>
      <Separator className="my-2" />
      <p className="text-sm font-medium px-1">{english}</p>
    </div>
  )
}

export function LanguageCardList({ deckId }: { deckId: string }) {
  const [cards] = api.card.getByDeckId.useSuspenseQuery({deckId})

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 sm:grid-cols-2 gap-4">
      {cards.map((card) => (
        <LanguageCard
          key={card.id}
          indonesian={card.indonesian}
          english={card.english}
        />
      ))}
    </div>
  );
}
