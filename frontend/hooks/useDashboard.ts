"use client";

import { Category, DashboardData, Product, Sale } from '@/types/types';
import { useState, useEffect, useCallback } from 'react';

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
      const baseUrl = "http://localhost:8080/api";
      
      console.log("Fetching data...");
      
      const [dashRes, salesRes, prodsRes, categoriesRes] = await Promise.all([
        fetch(`${baseUrl}/dashboard`),
        fetch(`${baseUrl}/sales`),
        fetch(`${baseUrl}/products`),
        fetch(`${baseUrl}/categories`)
      ]);

      const dashData = await dashRes.json();
      const salesData = await salesRes.json();
      const prodsData = await prodsRes.json();
      const categoriesData = await categoriesRes.json();

      // Set dashboard data
      if (Array.isArray(dashData) && dashData.length > 0) {
        setDashboard(dashData[0]);
      }

      // Set sales data
      if (salesData && Array.isArray(salesData.data)) {
        setSales(salesData.data);
      } 

      // Set products data
      if (prodsData && Array.isArray(prodsData.data)) {
        setProducts(prodsData.data);
      } 

      let initialCategories: Category[] = [];
      if (categoriesData && Array.isArray(categoriesData.data)) {
        initialCategories = categoriesData.data;
      } 
        


      // Fetch products for each category
      if (initialCategories.length > 0) {
        const detailPromises = initialCategories.map(async (cat: Category) => {
          try {
            const res = await fetch(`${baseUrl}/productByCategory/${cat.ID}`);
            
            if (!res.ok) {
              console.warn(`Category ${cat.ID} fetch failed: ${res.status}`);
              return { ...cat, products: [] };
            }
            
            const categoryProducts = await res.json();
            
            // Handle the malformed JSON from your backend
            let productsArray = [];
            if (Array.isArray(categoryProducts)) {
              productsArray = categoryProducts;
            } else if (categoryProducts && Array.isArray(categoryProducts.data)) {
              productsArray = categoryProducts.data;
            }
            
            return { 
              ...cat, 
              products: productsArray 
            };
            
          } catch (err) {
            console.error(`Failed to fetch products for category ${cat.ID}:`, err);
            return { ...cat, products: [] };
          }
        });
        
        const richCategories = await Promise.all(detailPromises);
        setCategories(richCategories);
      } else {
        setCategories(initialCategories);
      }

    } catch (error) {
      console.error("API Error:", error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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