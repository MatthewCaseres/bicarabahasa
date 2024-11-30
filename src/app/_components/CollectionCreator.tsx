"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import Link from "next/link";
import { NameDescriptionForm } from "./NameDescriptionForm";
import { Dialog } from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { PencilIcon } from "~/components/icons/pencil";
import { ChevronRightIcon } from "~/components/icons/chevron-right";
import { EyeIcon } from "~/components/icons/eye";
import { EyeSlashIcon } from "~/components/icons/eye-slash";
import { ADMIN } from "~/lib/utils";

export function CollectionCreator() {
  const [collections] = api.collection.getAll.useSuspenseQuery();
  const utils = api.useUtils();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editCollectionId, setEditCollectionId] = useState<string | null>(null);
  const createCollection = api.collection.create.useMutation({
    onSuccess: async () => {
      await utils.collection.getAll.invalidate();
    },
  });
  const updateCollection = api.collection.update.useMutation({
    onSuccess: async () => {
      await utils.collection.getAll.invalidate();
    },
  });
  const currentCollection = editCollectionId
    ? collections.find((collection) => collection.id === editCollectionId)
    : null;
  const name = currentCollection?.name ?? "";
  const description = currentCollection?.description ?? "";
  const isPublic = currentCollection?.isPublic ?? false;
  const priority = currentCollection?.priority ?? 10000;

  return (
    <div className="mx-auto max-w-2xl lg:max-w-5xl p-6">
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)}>
        <NameDescriptionForm
          onSubmit={(values) => {
            createCollection.mutate(values);
            setCreateOpen(false);
          }}
          onCancel={() => setCreateOpen(false)}
          entityTitle="Collection"
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
            if (editCollectionId) {
              updateCollection.mutate({ ...values, id: editCollectionId });
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
        {collections
          .filter((collection) => collection.isPublic || ADMIN)
          .map((collection) => (
            <Link key={collection.id} href={`/collections/${collection.id}`}>
              <div className="flex flex-col gap-2 rounded-lg p-4 border border-gray-200 bg-white shadow-md transition-shadow duration-200 hover:border-blue-400 hover:shadow-lg">
              <h2 className="text-lg font-semibold text-gray-800 transition-colors hover:text-blue-600">
                {collection.name}
              </h2>
              <p className="text-sm text-gray-500 min-h-10">{collection.description}</p>
              {ADMIN && (
                <div className="flex justify-start"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  <button
                    title="Edit"
                  className="text-gray-500 hover:text-blue-600"
                  onClick={(e) => {
                    setEditOpen(true);
                    setEditCollectionId(collection.id);
                }}
              >
                  <PencilIcon size={20} />
                  </button>
                  {collection.isPublic ? (
                    <EyeIcon size={20} />
                  ) : (
                    <EyeSlashIcon size={20} />
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
      {ADMIN && (
        <Button onClick={() => setCreateOpen(true)}>Create Collection</Button>
      )}
    </div>
  );
}
