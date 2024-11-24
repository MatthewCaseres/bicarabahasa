"use client";

import { useState } from 'react';
import { api } from "~/trpc/react";
import Link from 'next/link';


export function CollectionCreator() {
  const [collections] = api.collection.getAll.useSuspenseQuery()
  const utils = api.useUtils();
  const [name, setName] = useState("");
  const createCollection = api.collection.create.useMutation({
    onSuccess: async () => {
      await utils.collection.invalidate();
      setName("");
    },
  });


  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8 grid grid-cols-1 gap-4">
        {collections.map((collection) => (
          <Link 
            key={collection.id} 
            href={`/collections/${collection.id}`}
            className="block p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 hover:border-blue-400"
          >
            <h2 className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors">
              {collection.name}
            </h2>
          </Link>
        ))}
      </div>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label 
            htmlFor="collectionName" 
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Collection Name
          </label>
          <input
            id="collectionName"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-label="Enter collection name"
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            placeholder="Enter collection name..."
          />
        </div>
        <button 
          onClick={() => createCollection.mutate({ name })}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!name.trim()}
        >
          Create Collection
        </button>
      </div>
    </div>
  );
}

