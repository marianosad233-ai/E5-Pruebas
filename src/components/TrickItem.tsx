import { ChevronRight } from "lucide-react";
import { useState } from "react";

interface TrickItemProps {
  trick: {
    detail: string;
    variant: TrickItemProps["trick"][];
  };
  level?: number;
  isLast?: boolean;
}

export function TrickItem({ trick, level = 0, isLast = true }: TrickItemProps) {
  const hasVariants = trick.variant && trick.variant.length > 0;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      {level > 0 && (
        <>
          <span className="absolute -left-4 top-4 h-px w-4 bg-ink-600" aria-hidden />
          {!isLast && (
            <span className="absolute -left-4 top-4 bottom-0 w-px bg-ink-600" aria-hidden />
          )}
        </>
      )}

      <div
        role={hasVariants ? "button" : undefined}
        tabIndex={hasVariants ? 0 : undefined}
        onClick={hasVariants ? () => setIsExpanded((v) => !v) : undefined}
        onKeyDown={
          hasVariants
            ? (e) => (e.key === "Enter" || e.key === " ") && setIsExpanded((v) => !v)
            : undefined
        }
        className={`mb-2 flex items-start gap-2 rounded-lg border px-3 py-2.5 transition-colors ${
          hasVariants
            ? "cursor-pointer border-ink-700 bg-ink-850 hover:border-violet-500/50"
            : "border-ink-800 bg-ink-900"
        }`}
      >
        {hasVariants ? (
          <ChevronRight
            className={`mt-0.5 h-4 w-4 flex-shrink-0 text-violet-400 transition-transform ${
              isExpanded ? "rotate-90" : ""
            }`}
          />
        ) : (
          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
        )}
        <span className="text-sm leading-relaxed text-mist-100">{trick.detail}</span>
      </div>

      {hasVariants && isExpanded && (
        <div className="relative ml-4 pl-4 slide-in-from-top">
          {trick.variant.map((variant, index) => (
            <TrickItem
              key={index}
              trick={variant}
              level={level + 1}
              isLast={index === trick.variant.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
