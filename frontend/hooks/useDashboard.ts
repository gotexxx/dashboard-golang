"use client";

import { useState, useEffect, useCallback } from 'react';
import { Category, DashboardData, Product, Sale } from '@/types/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export function useDashboardData() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [dashRes, salesRes, prodsRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard`),
        fetch(`${API_BASE_URL}/sales`),
        fetch(`${API_BASE_URL}/products`),
        fetch(`${API_BASE_URL}/categories`)
      ]);

      if (!dashRes.ok || !salesRes.ok || !prodsRes.ok || !categoriesRes.ok) {
        throw new Error("One or more initial data requests failed");
      }

      const dashData = await dashRes.json();
      const salesData = await salesRes.json();
      const prodsData = await prodsRes.json();
      const categoriesData = await categoriesRes.json();

      console.log(dashData.data[0])
        setDashboard(dashData.data[0]);

      const extractData = (response: any) => 
        Array.isArray(response) ? response : (Array.isArray(response?.data) ? response.data : []);

      setSales(extractData(salesData));
      setProducts(extractData(prodsData));

      const initialCategories: Category[] = extractData(categoriesData);

      if (initialCategories.length > 0) {
        const richCategories = await Promise.all(
          initialCategories.map(async (cat) => {
            try {
              const res = await fetch(`${API_BASE_URL}/productByCategory/${cat.ID}`);
              if (!res.ok) return { ...cat, products: [] };
              
              const categoryProducts = await res.json();
              return { ...cat, products: extractData(categoryProducts) };
            } catch {
              return { ...cat, products: [] };
            }
          })
        );
        setCategories(richCategories);
      } else {
        setCategories(initialCategories);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  console.log(dashboard)
  return { 
    dashboard, 
    sales, 
    products, 
    categories, 
    loading, 
    error, 
    refetch: fetchData 
  };
}