"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { createSwapy, Swapy } from "swapy";
import { useDashboardData } from "@/hooks/useDashboard";

import { SalesChart } from "./dashboard/SalesChart";
import { MetricCard } from "./dashboard/MetricCard";
import { CategoriesWidget } from "./dashboard/CategoriesWidget";
import { SummaryStats } from "./dashboard/SummaryStats";
import { FeedbackWidget } from "./dashboard/FeedbackWidget";
import { ProductsWidget } from "./dashboard/ProductWidget";
import { DashboardHeader } from "./dashboard/DashboardHeader";
const DashboardCard = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`
      w-full h-full rounded-xl
      bg-white dark:bg-zinc-900
      border border-zinc-200 dark:border-zinc-800
      shadow-sm
      overflow-hidden
      ${className}
    `}
  >
    <div className="h-full overflow-y-auto max-h-[700px]">
      {children}
    </div>
  </div>
);

export default function Dashboard() {
  const {
    dashboard,
    sales,
    products,
    categories,
    loading,
    error,
    refetch,
  } = useDashboardData();

  const swapyRef = useRef<HTMLDivElement>(null);
  const swapyInstanceRef = useRef<Swapy | null>(null);
  const [showGrid, setShowGrid] = useState(false);

  /* -------------------------------------------------------
      SWAPY INIT
  ------------------------------------------------------- */
  useEffect(() => {
    if (!swapyRef.current || loading) return;

    if (swapyInstanceRef.current) {
      swapyInstanceRef.current.destroy();
    }

    const swapy = createSwapy(swapyRef.current, {
      animation: "spring",
      grid: { gap: 16 }, 
      draggable: { enabled: true },
      swapTrigger: "pointerup",
    });

    swapy.onSwap((e) => {
      localStorage.setItem(
        "dashboard_layout",
        JSON.stringify(e.newSlotItemMap.asArray)
      );
    });

    const saved = localStorage.getItem("dashboard_layout");
    if (saved) {
      try {
        swapy.restore(JSON.parse(saved));
      } catch {}
    }

    swapyInstanceRef.current = swapy;

    return () => {
      swapy.destroy();
      swapyInstanceRef.current = null;
    };
  }, [loading]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-6 lg:p-10">
      <DashboardHeader
        title={dashboard?.Name}
        description={dashboard?.Description}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onRefresh={refetch}
      />

      <div
        ref={swapyRef}
        className={`
          grid grid-cols-1
          lg:grid-cols-12
          gap-4
          relative
          ${showGrid ? "outline outline-dashed outline-blue-400 bg-blue-400 " : ""}
        `}
      >
        <div
          className="lg:col-span-9 min-h-[450px]"
          data-swapy-slot="slot-sales"
        >
          <div className="h-full" data-swapy-item="item-sales">
            <DashboardCard>
              <SalesChart data={sales} />
            </DashboardCard>
          </div>
        </div>
 <div
          className="lg:col-span-3 min-h-[250px]"
          data-swapy-slot="slot-stats"
        >
      <div className="h-full" data-swapy-item="item-stats">
          <DashboardCard>
        <SummaryStats
          products={products}
          categories={categories}
          sales={sales}
        />
        </DashboardCard>
      </div>
      </div>

        <div
          className="lg:col-span-8 min-h-[340px]"
          data-swapy-slot="slot-categories"
        >
          <div className="h-full" data-swapy-item="item-categories">
            <DashboardCard>
              <CategoriesWidget categories={categories} />
            </DashboardCard>
          </div>
        </div>

        <div
          className="lg:col-span-4 min-h-[340px]"
          data-swapy-slot="slot-products"
        >
          <div className="h-full" data-swapy-item="item-products">
            <DashboardCard>
              <ProductsWidget products={products} />
            </DashboardCard>
          </div>
        </div>
          
        <div 
          className="lg:col-span-5 min-h-[450px]" 
          data-swapy-slot="slot-metrics"
        >
              
          <div className="h-full flex flex-col gap-4" data-swapy-item="item-metrics-group">
                <DashboardCard>

            {dashboard?.Metrics?.map((metric: any, i: number) => (
              <div key={i} className="flex-1 min-h-[100px]">
                  <MetricCard metric={metric} />
              </div>
            ))}
                </DashboardCard>

          </div>
        </div>
        <div
          className="lg:col-span-7 min-h-[250px]"
          data-swapy-slot="slot-feedback"
        >
          <div className="h-full" data-swapy-item="item-feedback">
            <DashboardCard>
              <FeedbackWidget feedback={dashboard?.Feedback} />
            </DashboardCard>
          </div>
        </div>


      </div>


    </div>
  );
}