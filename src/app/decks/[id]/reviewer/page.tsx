import {FlashCard} from '../../../_components/CardReviewer/Flashcard';
import { api, HydrateClient } from "~/trpc/server";


export default async function StudyPage({ params }: { params: { id: string } }) {
  const deck = await api.deck.getById({ id: params.id });
  const cards = deck.cards;
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <HydrateClient>
        <FlashCard cards={cards} key={`${params.id}-${Date.now()}`} />
      </HydrateClient>
    </main>
  );
}
