import { Package, Layers, DollarSign, Activity } from 'lucide-react';

interface StatProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}

function StatCard({ label, value, icon }: StatProps) {
  return (
    <div className="p-4 rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}

export function SummaryStats({ products, categories, sales }: { products: any[], categories: any[], sales: any[] }) {
  const totalSales = sales.reduce((acc, sale) => acc + (sale.Revenue || 0), 0).toLocaleString();
  const avgPrice = products.length > 0 
    ? (products.reduce((acc, p) => acc + (p.Price || 0), 0) / products.length).toFixed(2) 
    : '0.00';

  return (
    <div className="mt-8 flex flex-wrap mx-3 gap-4">
      <StatCard 
        label="Total Products" 
        value={products.length} 
        icon={<Package size={20} className="text-indigo-600 dark:text-indigo-400" />} 
      />
      <StatCard 
        label="Categories" 
        value={categories.length} 
        icon={<Layers size={20} className="text-emerald-600 dark:text-emerald-400" />} 
      />
      <StatCard 
        label="Total Sales" 
        value={`$${totalSales}`} 
        icon={<DollarSign size={20} className="text-purple-600 dark:text-purple-400" />} 
      />
      <StatCard 
        label="Avg. Price" 
        value={`$${avgPrice}`} 
        icon={<Activity size={20} className="text-amber-600 dark:text-amber-400" />} 
      />
    </div>
  );
}