import { api, HydrateClient } from "~/trpc/server";
import { DeckEditor } from "./DeckEditor";
import { LanguageCardList } from "./CardList";

export default async function DeckPage({ params }: { params: { id: string } }) {
  void await api.card.getByDeckId({ deckId: params.id });

  return (
    <div className="container mx-auto p-4">
      <HydrateClient>
        <DeckEditor deckId={params.id} />
        <LanguageCardList deckId={params.id} />
      </HydrateClient>
    </div>
  );
}
