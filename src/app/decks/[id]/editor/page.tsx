import { api, HydrateClient } from "~/trpc/server";
import { DeckEditor } from "./DeckEditor";
import { LanguageCardList } from "./CardList";
import { getServerAuthSession } from "~/server/auth";
import { roles } from "~/lib/utils";

export default async function DeckPage({ params }: { params: { id: string } }) {
  const session = await getServerAuthSession();
  const isAdmin = session?.user?.role === roles.ADMIN;

  if (session) {
    void api.card.getByDeckId({ deckId: params.id });
  }

  return (
    <div className="container mx-auto p-4">
      <HydrateClient>
        {isAdmin && <DeckEditor deckId={params.id} />}
        <LanguageCardList deckId={params.id} isAdmin={isAdmin} />
      </HydrateClient>
    </div>
  );
}
