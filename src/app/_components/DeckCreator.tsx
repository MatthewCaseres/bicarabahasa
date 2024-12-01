"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import Link from "next/link";
import { NameDescriptionForm } from "./NameDescriptionForm";
import { Dialog } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { PencilIcon } from "~/components/icons/pencil";
import { EyeIcon } from "~/components/icons/eye";
import { EyeSlashIcon } from "~/components/icons/eye-slash";
import type { Collection } from "@prisma/client";
import { ListBulletIcon } from "~/components/icons/list-bullet";
import { ADMIN } from "~/lib/utils";

export function DeckCreator({ collectionId }: { collectionId: string }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDeckId, setEditDeckId] = useState<string | null>(null);

  const [collection] = api.collection.getById.useSuspenseQuery({
    id: collectionId,
  });

  if (!collection) {
    return <div>Collection not found</div>;
  }

  const decks = collection.decks;
  const utils = api.useUtils();
  const createDeck = api.deck.create.useMutation({
    onSuccess: async () => {
      await utils.collection.getById.invalidate();
    },
  });
  const updateDeck = api.deck.update.useMutation({
    onSuccess: async () => {
      await utils.collection.getById.invalidate();
    },
  });
  const currentDeck = editDeckId
    ? decks.find((deck) => deck.id === editDeckId)
    : null;
  const name = currentDeck?.name ?? "";
  const description = currentDeck?.description ?? "";
  const isPublic = currentDeck?.isPublic ?? false;
  const priority = currentDeck?.priority ?? 10000;

  return (
    <>
      <CollectionHeader collection={collection} />
      <div className="mx-auto max-w-2xl p-6 lg:max-w-5xl">
        <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
          <NameDescriptionForm
            onSubmit={(values) => {
              createDeck.mutate({ ...values, collectionId });
              setCreateOpen(false);
            }}
            onCancel={() => setCreateOpen(false)}
            entityTitle="Deck"
            entityAction="Create"
            name=""
            description=""
            isPublic={false}
            priority={10000}
          />
        </Dialog>
        <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
          <NameDescriptionForm
            onSubmit={(values) => {
              if (editDeckId) {
                updateDeck.mutate({ ...values, id: editDeckId });
              } else {
                console.error("No collection id");
              }
              setEditOpen(false);
            }}
            onCancel={() => setEditOpen(false)}
            entityTitle="Collection"
            entityAction="Edit"
            name={name}
            description={description}
            isPublic={isPublic}
            priority={priority}
          />
        </Dialog>
        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {decks
            .filter((deck) => deck.isPublic || ADMIN)
            .map((deck) => (
              <div key={deck.id} className="relative flex flex-col rounded-lg border border-gray-200 bg-white shadow-md transition-shadow duration-200 hover:border-blue-400 hover:shadow-lg">
                <Link href={`/decks/${deck.id}/reviewer`} className="p-4 flex-1 pb-9">
                  <h2 className="text-lg font-semibold text-gray-800 transition-colors hover:text-blue-600 mb-2">
                    {deck.name}
                  </h2>
                  <p className="min-h-10 text-sm text-gray-500">
                    {deck.description}
                  </p>
                </Link>
                {ADMIN && (
                  <div className="absolute bottom-2 left-4 flex gap-2">
                    <button
                      type="button"
                      title="Edit"
                      className="text-gray-500 hover:text-blue-600"
                      onClick={() => {
                        setEditOpen(true);
                        setEditDeckId(deck.id);
                      }}
                    >
                      <PencilIcon size={20} />
                    </button>
                    {deck.isPublic ? (
                      <EyeIcon size={20} />
                    ) : (
                      <EyeSlashIcon size={20} />
                    )}
                  </div>
                )}
                <Link 
                  href={`/decks/${deck.id}/editor`}
                  className="absolute bottom-0 right-0"
                >
                  <div className="p-2 bg-gray-100 hover:bg-gray-300 rounded-tl-md rounded-br-md">
                    <ListBulletIcon size={20} />
                  </div>
                </Link>
              </div>
            ))}
        </div>
        {ADMIN && (
          <Button onClick={() => setCreateOpen(true)}>Create Deck</Button>
        )}
      </div>
    </>
  );
}

function CollectionHeader({ collection }: { collection: Collection }) {
  return (
    <div className="bg-white py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
          {collection.name}
        </h1>
        <p className="mx-auto max-w-xl text-lg leading-8 text-gray-600 sm:text-xl md:max-w-2xl md:text-2xl">
          {collection.description}
        </p>
      </div>
    </div>
  );
}
