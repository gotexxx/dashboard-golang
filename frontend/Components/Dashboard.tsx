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
  const [isDragging, setIsDragging] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Initialize Swapy
  useEffect(() => {
    if (!swapyRef.current || loading) return;

    const savedLayout = localStorage.getItem('dashboard_layout');
    
    try {
      swapyInstanceRef.current = createSwapy(swapyRef.current, {
        animation: 'dynamic',
        grid: showGrid ? { gap: 16, columns: 4 } : undefined,
        draggable: {
          enabled: true,
          handle: '.drag-handle',
          onDragStart: () => setIsDragging(true),
          onDragEnd: () => setIsDragging(false)
        },
        resizable: true,
        swapTrigger: 'pointerup',
        localStorage: {
          key: 'dashboard_layout',
          autoSave: true
        }
      });

      if (savedLayout) {
        try {
          const layout = JSON.parse(savedLayout);
          swapyInstanceRef.current.restore(layout);
        } catch (e) {
          console.warn('Failed to load saved layout:', e);
        }
      }

      swapyInstanceRef.current.onSwap(() => {
        const layout = swapyInstanceRef.current?.save();
        if (layout) {
          localStorage.setItem('dashboard_layout', JSON.stringify(layout));
        }
      });

      const handleResize = () => {
        swapyInstanceRef.current?.refresh();
      };
      
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        swapyInstanceRef.current?.destroy();
        swapyInstanceRef.current = null;
      };
    } catch (error) {
      console.error('Failed to initialize Swapy:', error);
    }
  }, [loading, showGrid]);

  useEffect(() => {
    if (!loading && swapyInstanceRef.current) {
      setTimeout(() => {
        swapyInstanceRef.current?.refresh();
      }, 100);
    }
  }, [loading]);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleAllCategories = () => {
    if (expandedCategories.size === categories.length) {
      setExpandedCategories(new Set());
    } else {
      const allIds = categories.map(cat => cat.ID.toString());
      setExpandedCategories(new Set(allIds));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-white dark:from-black dark:to-zinc-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-50 to-white dark:from-black dark:to-zinc-900">
        <div className="text-center max-w-md p-6 bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm rounded-xl border border-red-200 dark:border-red-800/30">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">Error Loading Data</h3>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-800/40 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
          <button
            onClick={() => setShowGrid(!showGrid)}
            className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            title="Toggle grid"
          >
            <Grid size={18} className={showGrid ? 'text-indigo-600 dark:text-indigo-400' : ''} />
          </button>
          
          <button
            onClick={refetch}
            className="p-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
            title="Refresh data"
          >
            <RefreshCw size={18} />
          </button>
          
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-medium">Live</span>
          </div>
        </div>
      </header>

      {isDragging && (
        <div className="fixed inset-0 bg-black/5 dark:bg-white/5 z-40 pointer-events-none"></div>
      )}

      {/* SWAPY GRID CONTAINER */}
      <div 
        ref={swapyRef} 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 auto-rows-[minmax(180px,auto)] relative"
      >
        {/* 1. SALES CHART */}
        <div className="lg:col-span-2 lg:row-span-2 rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm shadow-zinc-200/20 dark:shadow-black/20 overflow-hidden hover:shadow-md transition-all duration-200">
          <div className="w-full h-full p-5 md:p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <Activity size={18} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                Sales Overview
              </h3>
              <button className="drag-handle p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-move">
                <Settings size={16} className="text-zinc-400" />
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sales} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    vertical={false} 
                    stroke="currentColor" 
                    className="text-zinc-200 dark:text-zinc-700" 
                  />
                  <XAxis 
                    dataKey="Date" 
                    tickFormatter={(t) => new Date(t).toLocaleDateString(undefined, {month:'short', day:'numeric'})} 
                    className="text-zinc-500 dark:text-zinc-400 text-xs"
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    className="text-zinc-500 dark:text-zinc-400 text-xs"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => `$${val}`}
                  />
                  <Tooltip 
                    content={({ payload, label }) => {
                      if (!payload || payload.length === 0) return null;
                      return (
                        <div className="bg-zinc-900 dark:bg-zinc-800 p-3 rounded-lg border border-zinc-800 dark:border-zinc-700 shadow-lg">
                          <p className="text-zinc-300 text-sm font-medium mb-1">
                            {new Date(label).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-indigo-300 font-bold">
                            ${payload[0].value?.toLocaleString()}
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Revenue" 
                    stroke="#6366f1" 
                    strokeWidth={2}
                    fill="url(#colorRevenue)" 
                    activeDot={{ r: 6, fill: '#6366f1' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 2. METRICS */}
        <AnimatePresence>
          {dashboard?.Metrics?.map((metric, i) => (
            <motion.div
              key={metric.ID}
              className="rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm shadow-zinc-200/20 dark:shadow-black/20 overflow-hidden hover:shadow-md transition-all duration-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-full h-full p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                  <span className="text-zinc-600 dark:text-zinc-300 font-medium text-sm">
                    {metric.Name}
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="drag-handle p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-move">
                      <Settings size={14} className="text-zinc-400" />
                    </button>
                    <span className={`p-2 rounded-lg ${metric.Change >= 0 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}>
                      {metric.Change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold tracking-tight">
                    {metric.Unit === "$" ? "$" : ""}{metric.Value.toLocaleString()}
                    {metric.Unit !== "$" && <span className="text-sm text-zinc-500 ml-1">{metric.Unit}</span>}
                  </div>
                  <div className={`text-xs font-medium mt-2 ${metric.Change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {metric.Change >= 0 ? '+' : ''}{metric.Change}% from last period
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* 3. CATEGORIES WITH PRODUCTS */}
        <div className="lg:col-span-2 lg:row-span-2 rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm shadow-zinc-200/20 dark:shadow-black/20 overflow-hidden hover:shadow-md transition-all duration-200">
          <div className="w-full h-full flex flex-col">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-700/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30">
                  <Layers size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold">Categories & Products</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {categories.reduce((acc, cat) => acc + (cat.products?.length || 0), 0)} total products
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleAllCategories}
                  className="text-xs font-medium px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-800/40 transition-colors"
                >
                  {expandedCategories.size === categories.length ? 'Collapse All' : 'Expand All'}
                </button>
                <button className="drag-handle p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-move">
                  <Settings size={16} className="text-zinc-400" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto p-4 h-full custom-scrollbar space-y-3">
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-zinc-400" />
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400">No categories found</p>
                </div>
              ) : (
                <AnimatePresence>
                  {categories.map((category) => {
                    const isExpanded = expandedCategories.has(category.ID.toString());
                    const productCount = category.products?.length || 0;
                    
                    return (
                      <motion.div
                        key={category.ID}
                        className="border border-zinc-200 dark:border-zinc-700/50 rounded-xl overflow-hidden bg-white/50 dark:bg-zinc-800/30 backdrop-blur-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        <button
                          onClick={() => toggleCategory(category.ID.toString())}
                          className="w-full p-4 flex justify-between items-center hover:bg-zinc-50/50 dark:hover:bg-zinc-700/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                {category.Name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                            <div className="text-left">
                              <h4 className="font-semibold">{category.Name}</h4>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {productCount} {productCount === 1 ? 'product' : 'products'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                              {productCount}
                            </span>
                            <ChevronDown
                              size={18}
                              className={`transform transition-transform duration-200 ${
                                isExpanded ? 'rotate-180' : ''
                              }`}
                            />
                          </div>
                        </button>
                        
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-zinc-100 dark:border-zinc-700/50"
                          >
                            <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                              {productCount === 0 ? (
                                <div className="text-center py-4">
                                  <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                                    No products in this category
                                  </p>
                                </div>
                              ) : (
                                category.products?.map((product) => (
                                  <motion.div
                                    key={product.ID}
                                    className="flex justify-between items-center p-3 rounded-lg bg-zinc-50/50 dark:bg-zinc-800/30 hover:bg-zinc-100/50 dark:hover:bg-zinc-700/30 transition-colors group"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-md bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                                        <Package size={12} className="text-indigo-600 dark:text-indigo-400" />
                                      </div>
                                      <div>
                                        <p className="font-medium text-sm">{product.Name}</p>
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                          ID: #{product.ID}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="font-semibold text-sm">${product.Price.toFixed(2)}</div>
                                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                        {product.Stock || 0} in stock
                                      </div>
                                    </div>
                                  </motion.div>
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>

        {/* 4. PRODUCT LIST */}
        <div className="lg:col-span-2 lg:row-span-2 rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm shadow-zinc-200/20 dark:shadow-black/20 overflow-hidden hover:shadow-md transition-all duration-200">
          <div className="w-full h-full flex flex-col">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-700/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <Package size={18} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="font-semibold">Recent Products</h3>
                <span className="text-xs font-medium px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full">
                  {products.length} items
                </span>
              </div>
              <button className="drag-handle p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-move">
                <Settings size={16} className="text-zinc-400" />
              </button>
            </div>
            <div className="overflow-y-auto p-2 h-full custom-scrollbar">
              {products?.map((product, index) => (
                <motion.div
                  key={product.ID}
                  className="flex justify-between items-center p-3 hover:bg-zinc-50/50 dark:hover:bg-zinc-700/30 rounded-xl transition-colors group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {product.Name.substring(0,2).toUpperCase()}
                      </div>
                      {product.Status === 'New' && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-zinc-800"></div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.Name}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">ID: #{product.ID}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${product.Price.toFixed(2)}</div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {product.Stock} in stock
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* 5. FEEDBACK */}
        <div className="lg:col-span-2 lg:row-span-2 rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50 shadow-sm shadow-zinc-200/20 dark:shadow-black/20 overflow-hidden hover:shadow-md transition-all duration-200">
          <div className="w-full h-full flex flex-col">
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-700/50 flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2">
                <MessageSquare size={18} className="text-indigo-600 dark:text-indigo-400" /> 
                User Feedback
              </h3>
              <button className="drag-handle p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-move">
                <Settings size={16} className="text-zinc-400" />
              </button>
            </div>
            <div className="overflow-y-auto p-3 h-full custom-scrollbar space-y-3">
              <AnimatePresence>
                {dashboard?.Feedback?.map((fb, index) => (
                  <motion.div
                    key={fb.ID}
                    className={`p-4 rounded-xl text-sm border backdrop-blur-sm ${
                      fb.Sentiment.toLowerCase() === 'positive' 
                        ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800/30' 
                        : fb.Sentiment.toLowerCase() === 'negative'
                        ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30'
                        : 'bg-zinc-50/50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-700/50'
                    }`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <p className="text-zinc-700 dark:text-zinc-300">"{fb.Message}"</p>
                    <div className="flex justify-between items-center mt-3">
                      <span className={`text-xs font-medium px-2 py-1 rounded-md uppercase tracking-wider ${
                        fb.Sentiment.toLowerCase() === 'positive' 
                          ? 'text-green-700 bg-green-100 dark:bg-green-900/50 dark:text-green-300' 
                          : fb.Sentiment.toLowerCase() === 'negative'
                          ? 'text-red-700 bg-red-100 dark:bg-red-900/50 dark:text-red-300'
                          : 'text-zinc-700 bg-zinc-100 dark:bg-zinc-700 dark:text-zinc-300'
                      }`}>
                        {fb.Sentiment}
                      </span>
                      <span className="text-xs text-zinc-500">
                        {new Date(fb.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Products</p>
              <p className="text-2xl font-bold">{products.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
              <Package size={20} className="text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Categories</p>
              <p className="text-2xl font-bold">{categories.length}</p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Layers size={20} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Sales</p>
              <p className="text-2xl font-bold">
                ${sales.reduce((acc, sale) => acc + (sale.Revenue || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <DollarSign size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-white/80 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-700/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Avg. Price</p>
              <p className="text-2xl font-bold">
                ${products.length > 0 ? (products.reduce((acc, p) => acc + p.Price, 0) / products.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Activity size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
        <p>Drag the <Settings size={12} className="inline mx-0.5" /> icon to rearrange dashboard widgets</p>
      </div>
    </div>
  );
}