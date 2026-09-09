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
      className={`flex flex-col items-center gap-2 rounded-xl border px-3 pb-3 pt-3 transition-all ${
        isExpanded
          ? "border-amber-400 bg-amber-400/10 shadow-glow"
          : "border-ink-700 bg-ink-900/60 hover:border-amber-400/50 hover:bg-ink-850"
      }`}
    >
      <img
        src={`${import.meta.env.BASE_URL}images/lideres/${leader.name.toLowerCase().replace(/ /g, "_")}.png`}
        alt={leader.name}
        className="h-20 w-20 object-contain sm:h-24 sm:w-24"
      />
      <span
        className={`text-sm font-semibold sm:text-base ${
          isExpanded ? "text-amber-300" : "text-mist-300"
        }`}
      >
        {leader.name}
      </span>
    </button>
  );
};
