'use client';
import { orders as initialOrders } from '@/lib/data';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Truck } from 'lucide-react';
import React from 'react';
import { useAuth } from '@/hooks/use-auth';

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>(initialOrders);
  const { user } = useAuth();

  const handleMarkAsShipped = (orderId: string) => {
    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.id === orderId ? { ...order, status: 'Enviado' } : order
      )
    );
  };
  
  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'Pendiente': return 'default';
      case 'Enviado': return 'secondary';
      case 'Entregado': return 'outline';
      case 'Cancelado': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Seguimiento de Pedidos</h1>
        <p className="text-muted-foreground">Administra los pedidos nuevos y existentes.</p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                {user?.role === 'warehouse' && <TableHead><span className="sr-only">Acciones</span></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">#{order.id.split('-')[1]}</TableCell>
                  <TableCell>
                     <div className="flex items-center gap-3">
                        <Avatar className="hidden h-9 w-9 sm:flex">
                           <AvatarImage src={order.customerAvatar} alt={order.customerName} data-ai-hint="person"/>
                           <AvatarFallback>{order.customerName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{order.customerName}</span>
                     </div>
                  </TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                  {user?.role === 'warehouse' && (
                    <TableCell className="text-right">
                      {order.status === 'Pendiente' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsShipped(order.id)}
                        >
                          <Truck className="mr-2 h-4 w-4" />
                          Marcar como Enviado
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
