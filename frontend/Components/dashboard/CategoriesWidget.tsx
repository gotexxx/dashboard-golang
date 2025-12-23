import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ChevronDown } from 'lucide-react';

interface CategoriesProps {
  categories: any[];
  onResize?: () => void;
}

export function CategoriesWidget({ categories, onResize }: CategoriesProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) newExpanded.delete(categoryId);
    else newExpanded.add(categoryId);
    setExpandedCategories(newExpanded);
    onResize?.();
  };

  const toggleAll = () => {
    if (expandedCategories.size === categories.length) setExpandedCategories(new Set());
    else setExpandedCategories(new Set(categories.map((cat: any) => cat.ID?.toString() || '')));
    onResize?.();
  };

  return (
    <div className="w-full h-full flex flex-col rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm overflow-hidden select-none">
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-700/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
            <Layers size={18} className="text-emerald-600" />
          </div>
          <h3 className="font-semibold">Categories</h3>
        </div>
        <button
          onPointerDown={(e) => e.stopPropagation()} 
          onClick={toggleAll}
          className="text-xs font-medium px-3 py-1.5 bg-emerald-100 text-emerald-600 rounded-lg cursor-pointer hover:bg-emerald-200 transition-colors"
        >
          {expandedCategories.size === categories.length ? 'Collapse All' : 'Expand All'}
        </button>
      </div>
      
      <div className="overflow-y-auto p-4 h-full custom-scrollbar space-y-3" onPointerDown={(e) => e.stopPropagation()}>
         {categories.map((category: any) => {
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
                       {category.products?.map((product: any) => (
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
  );
}