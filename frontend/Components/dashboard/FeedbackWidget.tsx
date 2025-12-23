import { MessageSquare } from 'lucide-react';

export function FeedbackWidget({ feedback }: { feedback: any[] }) {
  return (
    <div className="w-full h-full flex flex-col rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm overflow-hidden select-none">
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-700/50">
        <h3 className="font-semibold flex items-center gap-2">
          <MessageSquare size={18} className="text-indigo-600" /> 
          User Feedback
        </h3>
      </div>
      
      <div className="overflow-y-auto p-3 h-full custom-scrollbar space-y-3" onPointerDown={(e) => e.stopPropagation()}>
        {feedback?.map((fb: any) => (
          <div key={fb.ID} className="p-4 rounded-xl text-sm border bg-zinc-50/50 dark:bg-zinc-800/30">
            <p className="text-zinc-700 dark:text-zinc-300">"{fb.Message}"</p>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs font-medium px-2 py-1 rounded-md bg-zinc-200 dark:bg-zinc-700">
                {fb.Sentiment}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}