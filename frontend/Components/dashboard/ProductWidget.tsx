import { Package } from 'lucide-react';

export function ProductsWidget({ products }: { products: any[] }) {
  return (
    <div className="w-full h-full flex flex-col rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm overflow-hidden select-none">
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-700/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-indigo-100">
            <Package size={18} className="text-indigo-600" />
          </div>
          <h3 className="font-semibold">Recent Products</h3>
        </div>
      </div>
      
      <div className="overflow-y-auto p-2 h-full custom-scrollbar" onPointerDown={(e) => e.stopPropagation()}>
        {products?.map((product: any) => (
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
  );
}