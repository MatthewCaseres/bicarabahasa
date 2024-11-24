import { DeckCreator } from "./DeckCreator";
import { api, HydrateClient } from "~/trpc/server";

export default async function CollectionPage({ params }: { params: { id: string } }) {
  void api.deck.getByCollectionId.prefetch({ collectionId: params.id });

  return (
    <div>
      <HydrateClient>
        <DeckCreator collectionId={params.id} />
      </HydrateClient>
    </div>
  );
}
