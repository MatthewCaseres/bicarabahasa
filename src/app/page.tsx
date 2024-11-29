import { CollectionCreator } from "~/app/_components/CollectionCreator";
import { api, HydrateClient } from "~/trpc/server";

export default async function Home() {
  void api.collection.getAll.prefetch();
  return (
    <HydrateClient>
      <main className="">
        <div className="mx-auto max-w-6xl p-10">
          <div className="lg:flex lg:items-center lg:gap-12">
              <div className="py-12 text-center lg:text-left">
                <h1 className="mb-4 text-2xl sm:text-[2.5rem] leading-tight font-semibold font-sans">
                  <div>Belajar bahasa inggris</div>
                  <div>dengan ungkapan</div>
                </h1>
                <p className="text font-light text-gray-600 max-w-md mx-auto lg:mx-0">
                  Temukan keindahan bahasa Inggris, bahasa internasional yang membuka peluang baru. Dari percakapan sehari-hari hingga ekspresi budaya.
                </p>
              </div>
            <div className="mb-12 flex justify-center lg:mb-0 lg:flex-1">
              <iframe
                className="rounded-md shadow-lg"
                width="448"
                height="252"
                src="https://www.youtube.com/embed/oHg5SJYRHA0"
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
        <CollectionCreator />
      </main>
    </HydrateClient>
  );
}
