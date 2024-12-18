import { CollectionCreator } from "~/app/_components/CollectionCreator";
import { getServerAuthSession } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import Link from "next/link";
import { roles } from "~/lib/utils";
import { Button } from "~/components/ui/button";

export default async function Home() {
  const session = await getServerAuthSession();
  const isAdmin = session?.user?.role === roles.ADMIN;
  let reviewCardSize = 0;
  if (session) {
    reviewCardSize = (await api.card.getUserReviewCards()).length;
  }
  
  if (session) {
    void api.collection.getAll.prefetch();
  }

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
          <div className="flex flex-col items-center justify-center gap-4">
            <p className="text-center text-2xl">
              {session && <span>Logged in as {session.user?.name}</span>}
            </p>
            <Link
              href={session ? "/api/auth/signout" : "/api/auth/signin"}
              className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
            >
              {session ? "Sign out" : "Sign in"}
            </Link>
          </div>
        {session && reviewCardSize > 0 && (
          <Link href="/review">
            <Button className="mt-4" variant="default" size="lg">
              Review {reviewCardSize} Cards
            </Button>
          </Link>
        )}
        </div>
        {session && <CollectionCreator isAdmin={isAdmin}/>}
      </main>
    </HydrateClient>
  );
}
