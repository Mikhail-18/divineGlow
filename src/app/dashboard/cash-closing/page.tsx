
'use client'
import React, { useState, useEffect } from 'react';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, PowerOff, Bell } from 'lucide-react';
import * as XLSX from 'xlsx';
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
import { useToast } from '@/hooks/use-toast';


const ORDERS_STORAGE_KEY = 'divine-glow-orders';

export default function CashClosingPage() {
    const [paidOrders, setPaidOrders] = useState<Order[]>([]);
    const { toast } = useToast();

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
        const wb = XLSX.utils.book_new();

        // Resumen sheet
        const summaryData = [
            ["Reporte de Turno", ""],
            ["", ""],
            ["Ventas Totales", `S/${salesTotals.total.toFixed(2)}`],
            ["Ventas en Efectivo", `S/${salesTotals.efectivo.toFixed(2)}`],
            ["Ventas con Tarjeta", `S/${salesTotals.tarjeta.toFixed(2)}`],
            ["Ventas con Yape", `S/${salesTotals.yape.toFixed(2)}`],
            ["Ventas con Plin", `S/${salesTotals.plin.toFixed(2)}`],
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, wsSummary, "Resumen de Ventas");

        // Detalle sheet
        const detailsData = paidOrders.map(order => ({
            "Pedido ID": `#${order.id.split('-')[1]}`,
            "Cliente": order.customerName,
            "Método de Pago": order.paymentMethod,
            "Vendedor": order.sellerName || 'N/A',
            "Total": { t: 'n', v: order.total, z: '"S/"#,##0.00' },
            "Fecha": order.date
        }));
        const wsDetails = XLSX.utils.json_to_sheet(detailsData);
        XLSX.utils.book_append_sheet(wb, wsDetails, "Detalle de Transacciones");

        // Generate and download the file
        XLSX.writeFile(wb, `Reporte_Cierre_Caja_${new Date().toISOString().split('T')[0]}.xlsx`);
    };
    
    const handleCloseShift = () => {
        try {
            const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
            if (storedOrders) {
                const allOrders: Order[] = JSON.parse(storedOrders);
                // Keep only the non-paid orders for the next shift
                const remainingOrders = allOrders.filter(order => order.status !== 'Pagado');
                localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(remainingOrders));

                // Clear the view for the current user
                setPaidOrders([]);

                toast({
                    title: 'Turno Cerrado',
                    description: 'Se han archivado los pedidos pagados. El nuevo turno está listo.',
                });
            }
        } catch (error) {
            console.error('Failed to close shift', error);
            toast({
                title: 'Error',
                description: 'No se pudo cerrar el turno.',
                variant: 'destructive',
            });
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                 <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Cierre de Caja</h1>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleExport} disabled={paidOrders.length === 0}>
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={paidOrders.length === 0}>
                                <PowerOff className="mr-2 h-4 w-4" />
                                Cerrar Turno
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro de cerrar el turno?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción eliminará todos los pedidos pagados de la vista actual y los archivará.
                                    No podrás deshacer esta acción.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleCloseShift}>Sí, cerrar turno</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <Button variant="ghost" size="icon" className="hidden sm:inline-flex">
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
                                <TableHead className="hidden sm:table-cell">Método de Pago</TableHead>
                                <TableHead className="hidden sm:table-cell">Vendedor</TableHead>
                                <TableHead className="text-right">Monto Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paidOrders.length > 0 ? (
                                paidOrders.map(order => (
                                    <TableRow key={order.id}>
                                        <TableCell className="font-medium">{order.customerName}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{order.paymentMethod || 'No especificado'}</TableCell>
                                        <TableCell className="hidden sm:table-cell">{order.sellerName || 'N/A'}</TableCell>
                                        <TableCell className="text-right">S/{order.total.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
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
