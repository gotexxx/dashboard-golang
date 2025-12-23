import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function MetricCard({ metric }: { metric: any }) {
  const isPositive = metric.Change >= 0;

  return (
    <motion.div 
      className="w-full h-full p-5 flex flex-col justify-between rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm overflow-hidden select-none"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
    >
      <div className="flex justify-between items-start">
        <span className="text-zinc-600 dark:text-zinc-300 font-medium text-sm">{metric.Name}</span>
        <span className={`p-2 rounded-lg ${isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
          {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        </span>
      </div>
      <div>
        <div className="text-3xl font-bold tracking-tight">
          {metric.Unit === "$" ? "$" : ""}{metric.Value?.toLocaleString() || '0'}
        </div>
        <div className={`text-xs font-medium mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {isPositive ? '+' : ''}{metric.Change}% from last period
        </div>
      </div>
    </motion.div>
  );
}