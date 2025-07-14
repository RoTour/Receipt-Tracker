
// src/modules/receipt-scanning/domain/entities.ts

export type Product = {
  id: string;
  normalized_name: string;
  brand?: string;
};

export type ReceiptItem = {
  raw_text: string;
  product: Product;
  quantity: number;
  price: number;
};

export type Receipt = {
  id: string;
  store_name: string;
  store_location?: string;
  purchase_date: string;
  total?: number;
  items: ReceiptItem[];
  file_path: string;
  file_hash: string;
  content_hash: string;
};
