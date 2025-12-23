// types.ts
export interface Metric {
  ID: number;
  Name: string;
  Value: number;
  Unit: string;
}

export interface Feedback {
  ID: number;
  Message: string;
  Sentiment: string; // "Positive", "Neutral", "Negative"
  CreatedAt: string;
}

export interface Sale {
  ID: number;
  Revenue: number;
  Quantity: number;
  Date: string;
}

export interface Product {
  ID: number;
  Name: string;
  Price: number;
  Category: Category;
}
export interface Category {
  ID: number;
  Name: string;
  products?: Product[]; 
}
export interface DashboardData {
  metrics: Metric[];
  sales: Sale[];
  feedback: Feedback[];
  products: Product[];
}