"use client";

import { useState } from 'react';
import { api } from "~/trpc/react";
import Link from "next/link";
import { PencilIcon } from "~/components/icons/pencil";

export function DeckCreator({ collectionId }: { collectionId: string }) {
  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createDeck = api.deck.create.useMutation({
    onSuccess: async () => {
      await utils.deck.getByCollectionId.invalidate({ collectionId });
      setName("");
    },
  });
  const [decks] = api.deck.getByCollectionId.useSuspenseQuery({ collectionId });

  return (
    <div>
      <ul className="space-y-2">
        {decks.map(deck => (
          <li key={deck.id} className="rounded border p-2 flex gap-4">
            <Link 
              href={`/decks/${deck.id}/reviewer`}
              className="text-blue-500 hover:text-blue-700 flex items-center gap-2"
            >
              {deck.name}
            </Link>
            <Link
              href={`/decks/${deck.id}/editor`}
              className="text-blue-500 hover:text-blue-700"
            >
              <PencilIcon />
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter deck name"
          className="rounded border p-2"
        />
        <button 
          onClick={() => createDeck.mutate({ name, collectionId })}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Create Deck
        </button>
      </div>
    </div>
  );
}
