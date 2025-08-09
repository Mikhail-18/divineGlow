
'use client'
import React, { useState, useEffect } from 'react';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, PowerOff, Bell } from 'lucide-react';

const ORDERS_STORAGE_KEY = 'divine-glow-orders';

export default function CashClosingPage() {
    const [paidOrders, setPaidOrders] = useState<Order[]>([]);

    useEffect(() => {
        try {
            const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
            if (storedOrders) {
                const allOrders: Order[] = JSON.parse(storedOrders);
                // For this report, we only care about paid orders
                const paid = allOrders.filter(order => order.status === 'Pagado');
                setPaidOrders(paid);
            }
        } catch (error) {
            console.error('Failed to load orders from localStorage', error);
        }
    }, []);
    
    const calculateTotals = () => {
        const totals = {
            total: 0,
            efectivo: 0,
            tarjeta: 0,
            yape: 0,
            plin: 0,
        };

        paidOrders.forEach(order => {
            totals.total += order.total;
            switch (order.paymentMethod) {
                case 'Efectivo':
                    totals.efectivo += order.total;
                    break;
                case 'Tarjeta':
                    totals.tarjeta += order.total;
                    break;
                case 'Yape':
                    totals.yape += order.total;
                    break;
                case 'Plin':
                    totals.plin += order.total;
                    break;
            }
        });

        return totals;
    };

    const salesTotals = calculateTotals();

    const handleExport = () => {
        // This is a placeholder for a more complex export logic
        alert('Exportando reporte...');
    };
    
    const handleCloseShift = () => {
         // This is a placeholder
        alert('Cerrando turno...');
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                 <h1 className="text-3xl font-bold tracking-tight">Cierre de Caja</h1>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar Reporte
                    </Button>
                     <Button variant="destructive" onClick={handleCloseShift}>
                        <PowerOff className="mr-2 h-4 w-4" />
                        Cerrar Turno
                    </Button>
                    <Button variant="ghost" size="icon">
                        <Bell className="h-5 w-5" />
                    </Button>
                 </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Reporte de Turno</CardTitle>
                    <CardDescription>Resumen de todas las transacciones pagadas en el turno actual.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                        <Card className="bg-primary/10 border-primary/50">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                                <CardDescription>Ingresos totales del turno</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-bold text-primary">S/{salesTotals.total.toFixed(2)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Ventas en Efectivo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">S/{salesTotals.efectivo.toFixed(2)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Ventas con Tarjeta</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">S/{salesTotals.tarjeta.toFixed(2)}</p>
                            </CardContent>
                        </Card>
                        <Card>
                             <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Ventas con Yape</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">S/{salesTotals.yape.toFixed(2)}</p>
                            </CardContent>
                        </Card>
                         <Card>
                             <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Ventas con Plin</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">S/{salesTotals.plin.toFixed(2)}</p>
                            </CardContent>
                        </Card>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Detalle de Transacciones Pagadas</CardTitle>
                     <CardDescription>Listado de todas las transacciones pagadas en el turno.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Método de Pago</TableHead>
                                <TableHead className="text-right">Monto Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paidOrders.length > 0 ? (
                                paidOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.customerName}</TableCell>
                                        <TableCell>{order.paymentMethod || 'No especificado'}</TableCell>
                                        <TableCell className="text-right">S/{order.total.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        No hay transacciones pagadas en este turno.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
