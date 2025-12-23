"use client";

import { useEffect, useRef, useState, ReactNode } from 'react';
import { createSwapy, Swapy } from 'swapy';
import { useDashboardData } from '@/hooks/useDashboard';
import { SalesChart } from './dashboard/SalesChart';
import { MetricCard } from './dashboard/MetricCard';
import { CategoriesWidget } from './dashboard/CategoriesWidget';
import { SummaryStats } from './dashboard/SummaryStats';
import { FeedbackWidget } from './dashboard/FeedbackWidget';
import { ProductsWidget } from './dashboard/ProductWidget';
import { DashboardHeader } from './dashboard/DashboardHeader';

// 1. Reusable Card Wrapper to handle the Scroll and "Anti-Jump" logic
const DashboardCard = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return (
    <div 
      className={`
        w-full h-full bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm
        flex flex-col relative overflow-hidden transition-all duration-200
        ${className}
      `}
    >
      {/* This internal div handles the scrolling. 
         - max-h-[700px]: Triggers scroll after this height.
         - overflow-y-auto: Shows scrollbar only when needed.
         - h-full: Ensures it fills the card if content is small.
      */}
      <div className="flex-1 w-full overflow-y-auto max-h-[700px] scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-700">
        {children}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { dashboard, sales, products, categories, loading, error, refetch } = useDashboardData();
  
  // Swapy Logic
  const swapyRef = useRef<HTMLDivElement>(null);
  const swapyInstanceRef = useRef<Swapy | null>(null);
  const [showGrid, setShowGrid] = useState(false);

  useEffect(() => {
    // Wait for data before init to prevent layout shift
    if (!swapyRef.current || loading) return;

    let swapy: Swapy | null = null;

    const initSwapy = () => {
      // Cleanup previous instance if exists
      if (swapyInstanceRef.current) {
        swapyInstanceRef.current.destroy();
      }

      try {
        const savedLayout = localStorage.getItem('dashboard_layout');
        
        swapy = createSwapy(swapyRef.current!, {
          animation: 'spring',
          // We let CSS Grid handle the layout gaps, but Swapy needs to know about them for calculations
          grid: { gap: 60 }, 
          draggable: { enabled: true },
          swapTrigger: 'pointerup', // Smoother dropping
        });

        swapyInstanceRef.current = swapy;

        swapy.onSwap((event) => {
           localStorage.setItem('dashboard_layout', JSON.stringify(event.newSlotItemMap.asArray));
        });

        if (savedLayout) {
          try {
            swapy.restore(JSON.parse(savedLayout));
          } catch (e) { console.warn("Layout restore failed", e); }
        }

      } catch (error) { console.error('Swapy Init Error:', error); }
    };

    // Small timeout ensures DOM is fully painted
    const timeoutId = setTimeout(initSwapy, 100);

    return () => {
      clearTimeout(timeoutId);
      if (swapy) swapy.destroy();
      swapyInstanceRef.current = null;
    };
  }, [loading]); // Removed showGrid dependency to prevent full re-init on toggle

  // Simplified resize handler
  useEffect(() => {
     const handleResize = () => {
        swapyInstanceRef.current?.refresh();
     };
     window.addEventListener('resize', handleResize);
     return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-zinc-500">Loading Dashboard...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4 md:p-6 lg:p-8 font-sans text-zinc-900 dark:text-zinc-100">
      
      <DashboardHeader 
        title={dashboard?.Name}
        description={dashboard?.Description}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onRefresh={() => refetch()}
      />

      {/* SWAPY CONTAINER 
         - grid-cols-1 (Mobile) -> grid-cols-2 (Tablet) -> grid-cols-4 (Large Desktop)
         - grid-flow-dense: Helps pack smaller items into gaps
         - auto-rows-fr: Tries to make rows equal height if content allows, helps stability
      */}
      <div 
        ref={swapyRef} 
        className={`
          grid grid-cols-1 md:grid-cols-4 xl:grid-cols-4 
          gap-5 auto-rows-auto w-full relative pb-20
          ${showGrid ? 'outline outline-2 outline-dashed outline-blue-200 dark:outline-blue-800' : ''}
        `}
      >
        {/* 1. SALES CHART (Large: 2x2) */}
        <div className="md:col-span-2 md:row-span-2 min-h-[350px]" data-swapy-slot="slot-sales">
          {/* data-swapy-item needs strict height to prevent jumping */}
          <div className="w-full h-full" data-swapy-item="item-sales">
             <DashboardCard>
                <SalesChart data={sales} />
             </DashboardCard>
          </div>
        </div>

        {/* 2. METRICS (Small: 1x1) */}
        {dashboard?.Metrics?.map((metric: any, i: number) => (
          <div key={metric.ID} className="col-span-1 row-span-1 min-h-[300px] max-h-[500px]" data-swapy-slot={`slot-metric-${i}`}>
              <div className="w-full h-full" data-swapy-item={`item-metric-${i}`}>
                <DashboardCard>
                  <MetricCard metric={metric} />
                </DashboardCard>
              </div>
          </div>
        ))}

        {/* 3. CATEGORIES (Medium: 2x2 or 1x2 depending on content, let's allow it to be tall) */}
        <div className="md:col-span-2 md:row-span-2  min-h-[300px] max-h-[500px]" data-swapy-slot="slot-categories">
          <div className="w-full h-full" data-swapy-item="item-categories">
            <DashboardCard>
              {/* Removed onResize prop as the CardWrapper handles scrolling now */}
              <CategoriesWidget categories={categories} />
            </DashboardCard>
          </div>
        </div>

        {/* 4. PRODUCTS (Tall: 2x2) */}
        <div className="md:col-span-2 md:row-span-2  min-h-[300px] max-h-[500px]" data-swapy-slot="slot-products">
          <div className="w-full h-full" data-swapy-item="item-products">
            <DashboardCard>
              <ProductsWidget products={products} />
            </DashboardCard>
          </div>
        </div>

        {/* 5. FEEDBACK (Wide: 2x2) */}
        <div className="md:col-span-2 md:row-span-2  min-h-[350px] max-h-[500px]" data-swapy-slot="slot-feedback">
          <div className="w-full h-full" data-swapy-item="item-feedback">
            <DashboardCard>
              <FeedbackWidget feedback={dashboard?.Feedback} />
            </DashboardCard>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <SummaryStats 
            products={products}
            categories={categories}
            sales={sales}
        />
      </div>
    </div>
  );
}