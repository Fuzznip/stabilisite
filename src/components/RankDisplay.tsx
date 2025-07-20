import Image from "next/image";
import { rank_colors } from "@/lib/utils";

export default function RankDisplay({
  rank,
}: {
  rank?: string;
}): React.ReactElement {
  const rankColor = rank_colors.find((rankColor) => rank === rankColor.name);

  return (
    <div className="flex items-center">
      <div className="relative size-6 mr-2">
        <Image
          src={`/${rankColor?.name.toLowerCase()}.png`}
          alt={`${rankColor?.name.toLowerCase()} rank`}
          className="absolute object-contain"
          sizes="100%"
          fill
        />
      </div>
      <div
        className={`capitalize text-lg ${rankColor?.textColor} dark:brightness-150 brightness-90 font-bold`}
      >
        {rankColor?.name}
      </div>
    </div>
  );
}
