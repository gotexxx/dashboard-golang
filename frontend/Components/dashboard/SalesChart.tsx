import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

export function SalesChart({ data }: { data: any[] }) {
  return (
    <div className="w-full h-full p-5 md:p-6 flex flex-col rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm overflow-hidden select-none">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
            <Activity size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          Sales Overview
        </h3>
      </div>
      {/* stopPropagation is crucial for Swapy charts */}
      <div className="flex-1 min-h-0" onPointerDown={(e) => e.stopPropagation()}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-200 dark:text-zinc-700" />
            <XAxis dataKey="Date" tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, {month:'short', day:'numeric'})} className="text-zinc-500 text-xs" tickLine={false} axisLine={false} />
            <YAxis className="text-zinc-500 text-xs" tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
            <Tooltip contentStyle={{backgroundColor: '#FFF', borderColor: '#F1F1F1'}} />
            <Area type="monotone" dataKey="Revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevenue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}