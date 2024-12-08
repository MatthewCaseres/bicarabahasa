import {FlashCard} from '../_components/CardReviewer/Flashcard';
import { api, HydrateClient } from "~/trpc/server";


export default async function StudyPage() {
  const cards = await api.card.getUserReviewCards();
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <HydrateClient>
        <FlashCard cards={cards} />
      </HydrateClient>
    </main>
  );
}
