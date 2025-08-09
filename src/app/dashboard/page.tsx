
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import type { Order, Product } from '@/lib/types';
import { products as initialProducts, orders as initialOrders } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Package, ShoppingCart, AlertTriangle, Clock } from 'lucide-react';

const PRODUCTS_STORAGE_KEY = 'divine-glow-products';
const ORDERS_STORAGE_KEY = 'divine-glow-orders';

export default function DashboardPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        setProducts(initialProducts);
      }

      const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      } else {
        setOrders(initialOrders);
      }
    } catch (error) {
      console.error('Failed to load data from localStorage', error);
      setProducts(initialProducts);
      setOrders(initialOrders);
    }
  }, []);

  const totalProducts = products.length;
  const pendingOrders = orders.filter(o => o.status === 'Pendiente').length;
  const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);
  const recentOrders = orders.slice(0, 5);
  
  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'Pendiente': return 'default';
      case 'Pagado': return 'secondary';
      case 'Enviado': return 'secondary';
      case 'Entregado': return 'outline';
      case 'Cancelado': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Bienvenido, {user?.name}!</h1>
        <p className="text-muted-foreground">Aquí tienes un resumen de la actividad de Divine Glow.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Productos únicos en el catálogo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Pedidos esperando ser procesados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas de Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockProducts.length}</div>
            <p className="text-xs text-muted-foreground">Productos con bajo inventario</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5"/> Pedidos Recientes</CardTitle>
            <CardDescription>Los últimos 5 pedidos realizados.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={order.customerAvatar} alt={order.customerName} data-ai-hint="person" />
                            <AvatarFallback>{order.customerName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="font-medium">{order.customerName}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive"/> Alertas de Stock Bajo</CardTitle>
            <CardDescription>Estos productos necesitan ser reabastecidos pronto.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {lowStockProducts.length > 0 ? (
                  lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center">
                      <Avatar className="h-9 w-9">
                          <AvatarImage src={product.image} alt={product.name} data-ai-hint="beauty product"/>
                          <AvatarFallback>{product.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{product.name}</p>
                        <p className="text-sm text-muted-foreground">Stock restante: {product.stock}</p>
                      </div>
                      <div className="ml-auto font-medium text-destructive">{product.stock} unidades</div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No hay productos con stock bajo. ¡Buen trabajo!</p>
                )}
              </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
