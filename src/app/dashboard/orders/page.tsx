'use client';
import { orders as initialOrders } from '@/lib/data';
import type { Order } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Truck, CheckCircle, ChevronDown, ChevronRight } from 'lucide-react';
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>(initialOrders);
  const { user } = useAuth();
  const [openOrderId, setOpenOrderId] = React.useState<string | null>(null);

  const handleUpdateStatus = (orderId: string, status: Order['status']) => {
    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.id === orderId ? { ...order, status } : order
      )
    );
  };
  
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

  const toggleOrderDetails = (orderId: string) => {
    setOpenOrderId(prevId => (prevId === orderId ? null : orderId));
  };
  
  const canMarkAsShipped = user?.role === 'admin' || user?.role === 'warehouse';
  const canMarkAsPaid = user?.role === 'admin' || user?.role === 'seller';

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
                <TableHead className="w-[80px]"></TableHead>
                <TableHead>Pedido ID</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <Collapsible asChild key={order.id} open={openOrderId === order.id} onOpenChange={() => toggleOrderDetails(order.id)}>
                  <>
                    <TableRow className="cursor-pointer">
                      <TableCell>
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="icon">
                            {openOrderId === order.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <span className="sr-only">Toggle Details</span>
                          </Button>
                        </CollapsibleTrigger>
                      </TableCell>
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
                      <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {canMarkAsPaid && order.status === 'Pendiente' && (
                                <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(order.id, 'Pagado');
                                }}
                                >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Marcar como Pagado
                                </Button>
                            )}
                            {canMarkAsShipped && (order.status === 'Pagado' || order.status === 'Pendiente') && (
                                <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(order.id, 'Enviado');
                                }}
                                >
                                <Truck className="mr-2 h-4 w-4" />
                                Marcar como Enviado
                                </Button>
                            )}
                          </div>
                        </TableCell>
                    </TableRow>
                    <CollapsibleContent asChild>
                       <TableRow>
                          <TableCell colSpan={7} className="p-0">
                               <div className="p-4 bg-muted/50">
                                <h4 className="font-semibold mb-2">Detalles del Pedido:</h4>
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Producto</TableHead>
                                      <TableHead className="text-right">Cantidad</TableHead>
                                      <TableHead className="text-right">Precio Unitario</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {order.items.map(item => (
                                      <TableRow key={item.productId}>
                                        <TableCell>{item.productName}</TableCell>
                                        <TableCell className="text-right">{item.quantity}</TableCell>
                                        <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                               </div>
                          </TableCell>
                       </TableRow>
                    </CollapsibleContent>
                  </>
                </Collapsible>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
