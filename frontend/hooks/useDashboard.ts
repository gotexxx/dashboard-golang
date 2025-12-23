"use client";

import { Category, DashboardData, Product, Sale } from '@/types/types';
import { useState, useEffect } from 'react';

export function useDashboardData() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to fix malformed JSON responses
  const tryParseJSON = (text: string): any => {
    try {
      return JSON.parse(text);
    } catch (e) {
      console.warn('Failed to parse JSON, trying to fix malformed response...');
      
      // Try to extract valid JSON from the response
      // This handles cases where the backend returns concatenated JSON
      const jsonStart = text.indexOf('[');
      const jsonEnd = text.lastIndexOf(']') + 1;
      
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const possibleJson = text.substring(jsonStart, jsonEnd);
        try {
          return JSON.parse(possibleJson);
        } catch (innerError) {
          console.error('Could not fix malformed JSON:', innerError);
        }
      }
      
      // Try parsing as error response
      const errorStart = text.indexOf('{');
      const errorEnd = text.lastIndexOf('}') + 1;
      
      if (errorStart >= 0 && errorEnd > errorStart) {
        const possibleError = text.substring(errorStart, errorEnd);
        try {
          return JSON.parse(possibleError);
        } catch (innerError) {
          console.error('Could not parse error JSON:', innerError);
        }
      }
      
      return null;
    }
  };

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const baseUrl = "http://localhost:8080/api";
        
        console.log("Starting API calls...");
        
        const [dashRes, salesRes, prodsRes, categoriesRes] = await Promise.all([
          fetch(`${baseUrl}/dashboard`),
          fetch(`${baseUrl}/sales`),
          fetch(`${baseUrl}/products`),
          fetch(`${baseUrl}/categories`)
        ]);

        // Check all responses
        if (!dashRes.ok) throw new Error(`Dashboard fetch failed: ${dashRes.status}`);
        if (!salesRes.ok) throw new Error(`Sales fetch failed: ${salesRes.status}`);
        if (!prodsRes.ok) throw new Error(`Products fetch failed: ${prodsRes.status}`);
        if (!categoriesRes.ok) throw new Error(`Categories fetch failed: ${categoriesRes.status}`);

        // Parse responses
        const dashData = await dashRes.json();
        const salesData = await salesRes.json();
        const prodsData = await prodsRes.json();
        const categoriesData = await categoriesRes.json();

        console.log("API Responses received");

        // Set dashboard data
        if (Array.isArray(dashData) && dashData.length > 0) {
          setDashboard(dashData[0]);
        } else if (dashData) {
          setDashboard(dashData);
        }

        // Set sales data
        if (salesData && Array.isArray(salesData.data)) {
          setSales(salesData.data);
        } else if (Array.isArray(salesData)) {
          setSales(salesData);
        }

        // Set products data
        if (prodsData && Array.isArray(prodsData.data)) {
          setProducts(prodsData.data);
        } else if (Array.isArray(prodsData)) {
          setProducts(prodsData);
        }

        // Get initial categories
        let initialCategories: Category[] = [];
        if (categoriesData && Array.isArray(categoriesData.data)) {
          initialCategories = categoriesData.data;
          setCategories(initialCategories);
        } else if (Array.isArray(categoriesData)) {
          initialCategories = categoriesData;
          setCategories(categoriesData);
        }

        console.log(`Found ${initialCategories.length} categories`);

        // Fetch products for each category with error handling for malformed responses
        if (initialCategories.length > 0) {
          const detailPromises = initialCategories.map(async (cat: Category) => {
            try {
              console.log(`Fetching products for category ${cat.ID} - ${cat.Name}`);
              
              const res = await fetch(`${baseUrl}/productByCategory/${cat.ID}`);
              
              if (!res.ok) {
                console.warn(`Category ${cat.ID} fetch failed with status: ${res.status}`);
                return { ...cat, products: [] };
              }
              
              // Get response as text first to handle malformed JSON
              const responseText = await res.text();
              
              // Try to parse the response, handling malformed JSON
              const categoryProducts = tryParseJSON(responseText);
              
              if (!categoryProducts) {
                console.warn(`Could not parse response for category ${cat.ID}`);
                return { ...cat, products: [] };
              }
              
              console.log(`Category ${cat.ID} parsed successfully`);
              
              // Extract products from response
              const productsArray = 
                categoryProducts && Array.isArray(categoryProducts.data) 
                  ? categoryProducts.data 
                  : Array.isArray(categoryProducts) 
                    ? categoryProducts 
                    : [];
              
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
          console.log("Category details processing complete");
          
          // Update categories with products
          setCategories(richCategories);
        }

      } catch (error) {
        console.error("API Error:", error);
        setError(error instanceof Error ? error.message : 'An error occurred');
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { dashboard, sales, products, categories, loading, error };
}