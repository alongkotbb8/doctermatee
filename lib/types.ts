export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  fda_no: string | null;
  stock: number;
  status: "active" | "draft";
  images: string[];
  is_featured: boolean;
  is_new: boolean;
  created_at: string;
  categories?: Category | null;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  cover: string | null;
  published_at: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_no: string;
  status: "pending" | "paid" | "shipped" | "cancelled";
  payment_status: "unpaid" | "paid" | "failed";
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  coupon_code: string | null;
  shipping_address: ShippingAddress;
  tracking_no: string | null;
  carrier: string | null;
  created_at: string;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  name: string;
  price: number;
  qty: number;
}

export interface ShippingAddress {
  full_name: string;
  phone: string;
  address: string;
  district: string;
  province: string;
  postal_code: string;
}
