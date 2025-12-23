"use client";

import { useEffect, useRef, useState } from 'react';
import { createSwapy, Swapy } from 'swapy';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight, DollarSign, Activity, MessageSquare, Settings, Grid, RefreshCw, ChevronDown, Package, Layers } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboard';

export default function Dashboard() {
  const { dashboard, sales, products, categories, loading, error, refetch } = useDashboardData();
  const swapyRef = useRef<HTMLDivElement>(null);
  const swapyInstanceRef = useRef<Swapy | null>(null);
  const [showGrid, setShowGrid] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Initialize Swapy
  useEffect(() => {
    // 1. Exit if DOM not ready or data loading
    if (!swapyRef.current || loading) return;

    let rafId: number;

    const initSwapy = () => {
      // 2. Destroy existing instance to prevent duplicates/memory leaks
      if (swapyInstanceRef.current) {
        swapyInstanceRef.current.destroy();
        swapyInstanceRef.current = null;
      }

      try {
        const savedLayout = localStorage.getItem('dashboard_layout');
        
        // 3. Create new instance
        const swapy = createSwapy(swapyRef.current!, {
          animation: 'spring', // 'spring' feels smoother than 'dynamic'
          grid: showGrid ? { gap: 16, columns: 4 } : undefined,
          draggable: {
            enabled: true,
            // Do NOT update React state (setState) here. It triggers re-renders that break dragging.
          },
          swapTrigger: 'pointerup',
        });

        // 4. Save instance to Ref
        swapyInstanceRef.current = swapy;

        // 5. Restore layout if exists
        if (savedLayout) {
          try {
            // Swapy's restore expects the object map directly
            swapy.restore(JSON.parse(savedLayout));
          } catch (e) { console.warn("Layout restore failed", e); }
        }


      } catch (error) {
        console.error('Swapy Init Error:', error);
      }
    };

    // Use requestAnimationFrame to ensure DOM is fully painted before Swapy calculates positions
    rafId = requestAnimationFrame(initSwapy);

    // Cleanup function
    return () => {
      cancelAnimationFrame(rafId);
      if (swapyInstanceRef.current) {
        swapyInstanceRef.current.destroy();
        swapyInstanceRef.current = null;
      }
    };
  }, [loading, showGrid]); // Dependency array MUST be static

  // Handle Window Resize
  useEffect(() => {
     const handleResize = () => {
        if (swapyInstanceRef.current) {
            requestAnimationFrame(() => {
                swapyInstanceRef.current?.refresh();
            });
        }
     };
     window.addEventListener('resize', handleResize);
     return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) newExpanded.delete(categoryId);
    else newExpanded.add(categoryId);
    setExpandedCategories(newExpanded);
    
    // Refresh Swapy after animation frame to account for height change
    requestAnimationFrame(() => {
      setTimeout(() => swapyInstanceRef.current?.refresh(), 300);
    });
  };

  const toggleAllCategories = () => {
    if (expandedCategories.size === categories.length) setExpandedCategories(new Set());
    else setExpandedCategories(new Set(categories.map(cat => cat.ID?.toString() || '')));
    
    requestAnimationFrame(() => {
      setTimeout(() => swapyInstanceRef.current?.refresh(), 300);
    });
  };

  const handleRefresh = async () => {
    await refetch();
    // Swapy will automatically re-init because 'loading' changes, triggering the main useEffect
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-white dark:from-black dark:to-zinc-900 p-4 md:p-6 lg:p-8 font-sans text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {dashboard?.Name || "Analytics Dashboard"}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {dashboard?.Description || "Real-time store overview"}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
            <button onClick={() => setShowGrid(!showGrid)} className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50">
                <Grid size={18} className={showGrid ? 'text-indigo-600' : ''} />
            </button>
            <button onClick={handleRefresh} className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50">
                <RefreshCw size={18} />
            </button>
        </div>
      </header>

      {/* SWAPY CONTAINER */}
      <div 
        ref={swapyRef} 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 auto-rows-[minmax(180px,auto)] relative"
      >
        {/* 1. SALES CHART */}
        <div className="lg:col-span-2 lg:row-span-2" data-swapy-slot="slot-sales">
          <div 
            className="w-full h-full p-5 md:p-6 flex flex-col cursor-move rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm overflow-hidden select-none"
            data-swapy-item="item-sales"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <Activity size={18} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                Sales Overview
              </h3>
            </div>
            {/* stopPropagation prevents chart interaction from triggering drag */}
            <div className="flex-1 min-h-0" onPointerDown={(e) => e.stopPropagation()}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sales} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-zinc-200 dark:text-zinc-700" />
                  <XAxis dataKey="Date" tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, {month:'short', day:'numeric'})} className="text-zinc-500 text-xs" tickLine={false} axisLine={false} />
                  <YAxis className="text-zinc-500 text-xs" tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip contentStyle={{backgroundColor: '#18181b', borderColor: '#27272a'}} />
                  <Area type="monotone" dataKey="Revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 2. METRICS */}
        {dashboard?.Metrics?.map((metric, i) => (
          <div key={metric.ID} data-swapy-slot={`slot-metric-${i}`}>
             <motion.div 
               className="w-full h-full p-5 flex flex-col justify-between cursor-move rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm overflow-hidden select-none"
               data-swapy-item={`item-metric-${i}`}
               initial={{ opacity: 0 }} animate={{ opacity: 1 }}
             >
               <div className="flex justify-between items-start">
                 <span className="text-zinc-600 dark:text-zinc-300 font-medium text-sm">{metric.Name}</span>
                 <span className={`p-2 rounded-lg ${metric.Change >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                   {metric.Change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                 </span>
               </div>
               <div>
                 <div className="text-3xl font-bold tracking-tight">
                   {metric.Unit === "$" ? "$" : ""}{metric.Value?.toLocaleString() || '0'}
                 </div>
                 <div className={`text-xs font-medium mt-2 ${metric.Change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                   {metric.Change >= 0 ? '+' : ''}{metric.Change}% from last period
                 </div>
               </div>
             </motion.div>
          </div>
        ))}

        {/* 3. CATEGORIES */}
        <div className="lg:col-span-2 lg:row-span-2" data-swapy-slot="slot-categories">
          <div 
            className="w-full h-full flex flex-col cursor-move rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm overflow-hidden select-none"
            data-swapy-item="item-categories"
          >
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-700/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <Layers size={18} className="text-emerald-600" />
                </div>
                <h3 className="font-semibold">Categories</h3>
              </div>
              <button
                onPointerDown={(e) => e.stopPropagation()} 
                onClick={toggleAllCategories}
                className="text-xs font-medium px-3 py-1.5 bg-emerald-100 text-emerald-600 rounded-lg cursor-pointer hover:bg-emerald-200 transition-colors"
              >
                {expandedCategories.size === categories.length ? 'Collapse All' : 'Expand All'}
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 h-full custom-scrollbar space-y-3" onPointerDown={(e) => e.stopPropagation()}>
               {categories.map((category) => {
                 const isExpanded = expandedCategories.has(category.ID?.toString() || '');
                 return (
                   <motion.div key={category.ID} className="border border-zinc-200 dark:border-zinc-700/50 rounded-xl bg-white/50 dark:bg-zinc-800/30">
                     <button
                       onClick={() => toggleCategory(category.ID?.toString() || '')}
                       className="w-full p-4 flex justify-between items-center hover:bg-zinc-50/50 transition-colors cursor-pointer"
                     >
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center font-bold text-emerald-600">
                           {category.Name?.substring(0, 2).toUpperCase()}
                         </div>
                         <h4 className="font-semibold">{category.Name}</h4>
                       </div>
                       <ChevronDown size={18} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                     </button>
                     <AnimatePresence>
                       {isExpanded && (
                         <motion.div
                           initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                           className="border-t border-zinc-100"
                         >
                           <div className="p-4 space-y-2">
                             {category.products?.map((product) => (
                               <div key={product.ID} className="flex justify-between p-2 rounded bg-zinc-50 dark:bg-zinc-800/30">
                                 <span className="text-sm">{product.Name}</span>
                                 <span className="text-sm font-semibold">${product.Price}</span>
                               </div>
                             ))}
                           </div>
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </motion.div>
                 );
               })}
            </div>
          </div>
        </div>

        {/* 4. PRODUCTS */}
        <div className="lg:col-span-2 lg:row-span-2" data-swapy-slot="slot-products">
          <div 
            className="w-full h-full flex flex-col cursor-move rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm overflow-hidden select-none"
            data-swapy-item="item-products"
          >
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-700/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-indigo-100">
                  <Package size={18} className="text-indigo-600" />
                </div>
                <h3 className="font-semibold">Recent Products</h3>
              </div>
            </div>
            
            <div className="overflow-y-auto p-2 h-full custom-scrollbar" onPointerDown={(e) => e.stopPropagation()}>
              {products?.map((product) => (
                <div key={product.ID} className="flex justify-between items-center p-3 hover:bg-zinc-50/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center font-bold text-indigo-600">
                      {product.Name?.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.Name}</p>
                      <p className="text-xs text-zinc-500">ID: #{product.ID}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${product.Price?.toFixed(2)}</div>
                    <div className="text-xs text-zinc-500">{product.Stock} stock</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. FEEDBACK */}
        <div className="lg:col-span-2 lg:row-span-2" data-swapy-slot="slot-feedback">
          <div 
            className="w-full h-full flex flex-col cursor-move rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm overflow-hidden select-none"
            data-swapy-item="item-feedback"
          >
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-700/50">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare size={18} className="text-indigo-600" /> 
                User Feedback
              </h3>
            </div>
            
            <div className="overflow-y-auto p-3 h-full custom-scrollbar space-y-3" onPointerDown={(e) => e.stopPropagation()}>
              {dashboard?.Feedback?.map((fb) => (
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
        </div>

      </div>

      {/* Stats Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Static widgets here */}
        <div className="p-4 rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
            <Package size={20} className="text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50">
          <div className="flex items-center justify-between">
             <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Categories</p>
              <p className="text-2xl font-bold">{categories.length}</p>
             </div>
             <Layers size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Sales</p>
              <p className="text-2xl font-bold">${sales.reduce((acc, sale) => acc + (sale.Revenue || 0), 0).toLocaleString()}</p>
            </div>
            <DollarSign size={20} className="text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50">
          <div className="flex items-center justify-between">
             <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Avg. Price</p>
              <p className="text-2xl font-bold">${products.length > 0 ? (products.reduce((acc, p) => acc + (p.Price || 0), 0) / products.length).toFixed(2) : '0.00'}</p>
             </div>
             <Activity size={20} className="text-amber-600 dark:text-amber-400" />
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <p>Drag any widget to rearrange the dashboard</p>
      </div>
    </div>
  );
}