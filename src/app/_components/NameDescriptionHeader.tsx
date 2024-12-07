export function NameDescriptionHeader({ name, description }: { name: string, description: string }) {
  return (
    <div className="bg-white py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 text-center lg:px-8">
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl md:text-5xl">
          {name}
        </h1>
        <p className="mx-auto max-w-xl text-lg leading-8 text-gray-600 sm:text-xl md:max-w-2xl md:text-2xl">
          {description}
        </p>
      </div>
    </div>
  );
}