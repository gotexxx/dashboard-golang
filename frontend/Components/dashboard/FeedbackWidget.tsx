import { MessageSquare } from "lucide-react";

type Feedback = {
  ID: string;
  Message: string;
  Sentiment: "positive" | "neutral" | "negative";
};

const sentimentStyles = {
  positive: {
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    border: "border-l-emerald-500",
  },
  neutral: {
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    border: "border-l-amber-500",
  },
  negative: {
    badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
    border: "border-l-rose-500",
  },
};

export function FeedbackWidget({ feedback }: { feedback: Feedback[] }) {
  return (
    <div className="w-full h-full flex flex-col rounded-2xl bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-700/50 shadow-sm overflow-hidden select-none">
      {/* Header */}
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
        <h3 className="font-semibold flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
          <MessageSquare size={18} className="text-indigo-600 dark:text-indigo-400" />
          User Feedback
        </h3>
      </div>

      {/* Content */}
      <div
        className="overflow-y-auto p-4 h-full custom-scrollbar space-y-4"
        onPointerDown={(e) => e.stopPropagation()}
      >
        {feedback?.map((fb) => {
          const styles = sentimentStyles[fb.Sentiment];
          return (
            <div
              key={fb.ID}
              className={`group relative p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-700/50 bg-white/70 dark:bg-zinc-800/40 
              border-l-4 ${styles.border}
              transition-all duration-200 hover:-translate-y-[1px] hover:shadow-md`}
            >
              <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                “{fb.Message}”
              </p>

              <div className="flex justify-between items-center mt-4">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md capitalize ${styles.badge}`}
                >
                  {fb.Sentiment}
                </span>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-md capitalize `}
                >
                  am {new Date(fb.CreatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
