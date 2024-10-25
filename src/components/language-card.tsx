import { Separator } from "~/components/ui/separator"

interface LanguageCardProps {
  native_language: string;
  foreign_language: string;
}

export function LanguageCard({ native_language, foreign_language }: LanguageCardProps) {
  return (
    <div className="p-2 my-1 border rounded-lg shadow-sm">
      <p className="text-sm font-medium">{native_language}</p>
      <Separator className="my-2" />
      <p className="text-sm font-medium">{foreign_language}</p>
    </div>
  )
}

export function LanguageCardList({ data }: { data: LanguageCardProps[] }) {
  const midpoint = Math.ceil(data.length / 2);
  const leftColumn = data.slice(0, midpoint);
  const rightColumn = data.slice(midpoint);

  return (
    <div className="flex">
      <div className="w-1/2 pr-2">
        {leftColumn.map((item, index) => (
          <LanguageCard key={index} native_language={item.native_language} foreign_language={item.foreign_language} />
        ))}
      </div>
      <div className="w-1/2 pl-2">
        {rightColumn.map((item, index) => (
          <LanguageCard key={index + midpoint} native_language={item.native_language} foreign_language={item.foreign_language} />
        ))}
      </div>
    </div>
  );
}