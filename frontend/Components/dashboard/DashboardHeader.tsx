import { RefreshCw, Grid } from 'lucide-react';

interface HeaderProps {
  title?: string;
  description?: string;
  showGrid: boolean;
  onToggleGrid: () => void;
  onRefresh: () => void;
}

export function DashboardHeader({ title, description, showGrid, onToggleGrid, onRefresh }: HeaderProps) {
  return (
    <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {title || "Analytics Dashboard"}
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">
          {description || "Real-time store overview"}
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <button onClick={onToggleGrid} className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50">
            <Grid size={18} className={showGrid ? 'text-indigo-600' : ''} />
        </button>
        <button onClick={onRefresh} className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50">
            <RefreshCw size={18} />
        </button>
      </div>
    </header>
  );
}