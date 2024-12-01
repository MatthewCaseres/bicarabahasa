import {FlashCard} from './Flashcard';
import { api, HydrateClient } from "~/trpc/server";


export default async function StudyPage({ params }: { params: { id: string } }) {
  const cards = await api.card.getByDeckId({ deckId: params.id });
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <HydrateClient>
        <FlashCard cards={cards} key={`${params.id}-${Date.now()}`} />
      </HydrateClient>
    </main>
  );
}
