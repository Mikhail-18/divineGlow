
import type { Product, Customer, Order, Seller } from './types';

export const products: Product[] = [
  {
    id: 'prod-001',
    name: 'Sérum Renovador Nocturno',
    description: 'Un sérum potente que trabaja mientras duermes para revelar una piel más joven y radiante.',
    price: 75.0,
    stock: 25,
    lowStockThreshold: 10,
    image: 'https://placehold.co/400x400.png',
  },
  {
    id: 'prod-002',
    name: 'Crema Hidratante de Día',
    description: 'Hidratación profunda y protección contra los agresores ambientales durante todo el día.',
    price: 50.0,
    stock: 8,
    lowStockThreshold: 10,
    image: 'https://placehold.co/400x400.png',
  },
  {
    id: 'prod-003',
    name: 'Limpiador Facial Suave',
    description: 'Elimina impurezas sin resecar la piel, dejándola fresca y suave.',
    price: 30.0,
    stock: 50,
    lowStockThreshold: 15,
    image: 'https://placehold.co/400x400.png',
  },
  {
    id: 'prod-004',
    name: 'Mascarilla de Arcilla Purificante',
    description: 'Desintoxica y minimiza los poros para una tez clara y sin brillos.',
    price: 45.0,
    stock: 12,
    lowStockThreshold: 10,
    image: 'https://placehold.co/400x400.png',
  },
  {
    id: 'prod-005',
    name: 'Contorno de Ojos Iluminador',
    description: 'Reduce ojeras y líneas de expresión para una mirada más despierta y juvenil.',
    price: 60.0,
    stock: 5,
    lowStockThreshold: 5,
    image: 'https://placehold.co/400x400.png',
  },
];

export const customers: Customer[] = [
  {
    id: 'cust-001',
    name: 'Ana Pérez',
    email: 'ana.perez@example.com',
    phone: '+34 600 123 456',
    avatarUrl: 'https://placehold.co/100x100.png',
    lastOrderDate: '2024-05-15',
    totalSpent: 125.0,
  },
  {
    id: 'cust-002',
    name: 'Carlos García',
    email: 'carlos.garcia@example.com',
    phone: '+34 601 234 567',
    avatarUrl: 'https://placehold.co/100x100.png',
    lastOrderDate: '2024-05-20',
    totalSpent: 75.0,
  },
  {
    id: 'cust-003',
    name: 'Lucía Martínez',
    email: 'lucia.martinez@example.com',
    phone: '+34 602 345 678',
    avatarUrl: 'https://placehold.co/100x100.png',
    lastOrderDate: '2024-04-30',
    totalSpent: 210.0,
  },
  {
    id: 'cust-004',
    name: 'Javier Rodríguez',
    email: 'javier.r@example.com',
    phone: '+34 603 456 789',
    avatarUrl: 'https://placehold.co/100x100.png',
    lastOrderDate: '2024-05-22',
    totalSpent: 45.0,
  },
    {
    id: 'cust-005',
    name: 'Cliente Mostrador',
    email: 'mostrador@example.com',
    phone: '000000000',
    avatarUrl: 'https://placehold.co/100x100.png',
    lastOrderDate: '',
    totalSpent: 0,
  },
];

export const orders: Order[] = [
  {
    id: 'ord-001',
    customerName: 'Ana Pérez',
    customerAvatar: 'https://placehold.co/100x100.png',
    date: '2024-05-15',
    status: 'Entregado',
    items: [
      { productId: 'prod-001', productName: 'Sérum Renovador Nocturno', quantity: 1, price: 75.0 },
      { productId: 'prod-003', productName: 'Limpiador Facial Suave', quantity: 1, price: 30.0 },
    ],
    total: 105.0,
  },
  {
    id: 'ord-002',
    customerName: 'Carlos García',
    customerAvatar: 'https://placehold.co/100x100.png',
    date: '2024-05-20',
    status: 'Enviado',
    items: [
      { productId: 'prod-001', productName: 'Sérum Renovador Nocturno', quantity: 1, price: 75.0 },
    ],
    total: 75.0,
  },
  {
    id: 'ord-003',
    customerName: 'Javier Rodríguez',
    customerAvatar: 'https://placehold.co/100x100.png',
    date: '2024-05-22',
    status: 'Pendiente',
    items: [
      { productId: 'prod-004', productName: 'Mascarilla de Arcilla Purificante', quantity: 1, price: 45.0 },
    ],
    total: 45.0,
  },
  {
    id: 'ord-004',
    customerName: 'Lucía Martínez',
    customerAvatar: 'https://placehold.co/100x100.png',
    date: '2024-05-23',
    status: 'Pendiente',
    items: [
      { productId: 'prod-002', productName: 'Crema Hidratante de Día', quantity: 1, price: 50.0 },
      { productId: 'prod-005', productName: 'Contorno de Ojos Iluminador', quantity: 1, price: 60.0 },
    ],
    total: 110.0,
  },
  {
    id: 'ord-005',
    customerName: 'Ana Pérez',
    customerAvatar: 'https://placehold.co/100x100.png',
    date: '2024-05-25',
    status: 'Cancelado',
    items: [
      { productId: 'prod-003', productName: 'Limpiador Facial Suave', quantity: 2, price: 30.0 },
    ],
    total: 60.0,
  }
];

export const sellers: Seller[] = [
    { id: 'seller-1', name: 'Vendedor 1', password: 'password123' },
    { id: 'seller-2', name: 'Vendedor 2', password: 'password456' }
];
