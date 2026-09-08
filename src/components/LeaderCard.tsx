import type { ConfigLeader } from "../interfaces/Region";

interface LeaderCardProps {
  leader: ConfigLeader;
  isExpanded: boolean;
  onClick: (leaderId: string) => void;
}

export const LeaderCard = ({ leader, isExpanded, onClick }: LeaderCardProps) => {
  return (
    <button
      type="button"
      onClick={() => onClick(leader.id)}
      className={`flex flex-shrink-0 flex-col items-center gap-1 rounded-xl border px-3 pb-2 pt-1.5 transition-all ${
        isExpanded
          ? "border-amber-400 bg-amber-400/10"
          : "border-ink-700 bg-ink-850 hover:border-ink-600"
      }`}
    >
      <img
        src={`${import.meta.env.BASE_URL}images/lideres/${leader.name.toLowerCase().replace(/ /g, "_")}.png`}
        alt={leader.name}
        className="h-14 w-14 object-contain sm:h-16 sm:w-16"
      />
      <span
        className={`text-xs font-semibold sm:text-sm ${
          isExpanded ? "text-amber-300" : "text-mist-300"
        }`}
      >
        {leader.name}
      </span>
    </button>
  );
};
