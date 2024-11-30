import { DeckCreator } from "~/app/_components/DeckCreator";
import { api, HydrateClient } from "~/trpc/server";

export default async function CollectionPage({ params }: { params: { id: string } }) {
  void api.deck.getByCollectionId.prefetch({ collectionId: params.id });
  void api.collection.getById.prefetch({ id: params.id });

  return (
    <div>
      <HydrateClient>
        <DeckCreator collectionId={params.id} />
      </HydrateClient>
    </div>
  );
}
