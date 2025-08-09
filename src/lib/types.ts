
export type UserRole = 'admin' | 'seller' | 'warehouse' | 'cajero';

export type User = {
  name: string;
  role: UserRole;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  lowStockThreshold: number;
  image: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl: string;
  lastOrderDate: string;
  totalSpent: number;
};

export type OrderStatus = 'Pendiente' | 'Pagado' | 'Enviado' | 'Entregado' | 'Cancelado';
export type PaymentMethod = 'Efectivo' | 'Tarjeta' | 'Yape' | 'Plin';

export type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  customerName: string;
  customerAvatar: string;
  date: string;
  status: OrderStatus;
  items: OrderItem[];
  total: number;
  paymentMethod?: PaymentMethod;
};

export type Seller = {
  id: string;
  name: string;
  password?: string;
};
