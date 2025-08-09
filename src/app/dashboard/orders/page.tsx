
'use client';
import { orders as initialOrders } from '@/lib/data';
import type { Order } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Truck, CheckCircle, ChevronDown, ChevronRight, CreditCard, XCircle } from 'lucide-react';
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useRouter } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const ORDERS_STORAGE_KEY = 'divine-glow-orders';

export default function OrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const { user, loading: authLoading } = useAuth();
  const [openOrderId, setOpenOrderId] = React.useState<string | null>(null);
  const router = useRouter();

  React.useEffect(() => {
      try {
        const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
        if (storedOrders) {
            setOrders(JSON.parse(storedOrders));
        } else {
            setOrders(initialOrders);
            localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(initialOrders));
        }
      } catch (error) {
          console.error('Failed to parse orders from localStorage', error);
          setOrders(initialOrders);
      }
  }, [])

  const updateOrders = (updatedOrders: Order[]) => {
      setOrders(updatedOrders);
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
  }


  const handleUpdateStatus = (orderId: string, status: Order['status']) => {
    const updatedOrders = orders.map(order =>
        order.id === orderId ? { ...order, status } : order
    )
    updateOrders(updatedOrders);
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
  const canProcessPayment = user?.role === 'admin' || user?.role === 'cajero';
  const canCancelOrder = user?.role === 'admin' || user?.role === 'seller';

  if (authLoading) {
      return <div>Cargando...</div>
  }

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
            {orders.map((order) => (
              <Collapsible asChild key={order.id} open={openOrderId === order.id} onOpenChange={() => toggleOrderDetails(order.id)} tagName="tbody">
                  <>
                    <TableRow className="cursor-pointer border-b-0">
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
                            {canProcessPayment && order.status === 'Pendiente' && (
                                <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/dashboard/checkout/${order.id}`);
                                }}
                                >
                                <CreditCard className="mr-2 h-4 w-4" />
                                Procesar Pago
                                </Button>
                            )}
                            {canMarkAsShipped && order.status === 'Pagado' && (
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
                             {canMarkAsShipped && order.status === 'Enviado' && (
                                <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateStatus(order.id, 'Entregado');
                                }}
                                >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Marcar como Entregado
                                </Button>
                            )}
                            {canCancelOrder && order.status === 'Pendiente' && (
                                 <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Cancelar Pedido
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción no se puede deshacer. El pedido será marcado como cancelado.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>No</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleUpdateStatus(order.id, 'Cancelado')}>
                                               Sí, cancelar
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
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
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
