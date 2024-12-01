import { DeckCreator } from "~/app/_components/DeckCreator";
import { getServerAuthSession } from "~/server/auth";
import { roles } from "~/lib/utils";
import { api, HydrateClient } from "~/trpc/server";

export default async function CollectionPage({ params }: { params: { id: string } }) {
  const session = await getServerAuthSession();
  const isAdmin = session?.user?.role === roles.ADMIN;
  
  if (session) {
    void api.deck.getByCollectionId.prefetch({ collectionId: params.id });
    void api.collection.getById.prefetch({ id: params.id });
  }

  return (
    <div>
      <HydrateClient>
        <DeckCreator collectionId={params.id} isAdmin={isAdmin} />
      </HydrateClient>
    </div>
  );
}
