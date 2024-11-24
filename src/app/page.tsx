import { CollectionCreator } from "~/app/_components/CollectionCreator";
import { api, HydrateClient } from "~/trpc/server";


export default async function Home() {
  void api.collection.getAll.prefetch();
  return (
    <HydrateClient>
      <main className="">
        <CollectionCreator />
      </main>
    </HydrateClient>
  );
}
