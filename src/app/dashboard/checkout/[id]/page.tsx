
'use client';
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { orders as initialOrders } from '@/lib/data';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Landmark, CreditCard, Smartphone, Send, ArrowLeft, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ORDERS_STORAGE_KEY = 'divine-glow-orders';

const ReceiptDialog = ({ isOpen, onClose, order }: { isOpen: boolean, onClose: () => void, order: Order | null }) => {
    if (!order) return null;

    const handlePrint = () => {
        window.print();
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Recibo del Pedido #{order.id.split('-')[1]}</DialogTitle>
                    <DialogDescription>
                        Gracias por su compra. El pedido ha sido procesado exitosamente.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                     <Card className="bg-muted/50 shadow-none">
                        <CardContent className="p-4 space-y-2">
                             {order.items.map(item => (
                                <div key={item.productId} className="flex justify-between items-center text-sm">
                                    <span>{item.productName} x{item.quantity}</span>
                                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </CardContent>
                     </Card>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                        <p>Total:</p>
                        <p>${order.total.toFixed(2)}</p>
                    </div>
                     <p className="text-xs text-center text-muted-foreground">Pagado. ¡Vuelva pronto!</p>
                </div>
                <DialogFooter className="sm:justify-between gap-2">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cerrar
                    </Button>
                    <Button type="button" onClick={handlePrint}>
                        <Printer className="mr-2 h-4 w-4" />
                        Imprimir
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


export default function CheckoutPage() {
    const router = useRouter();
    const params = useParams();
    const { toast } = useToast();
    const orderId = params.id as string;
  
    const [order, setOrder] = useState<Order | null>(null);
    const [splitOption, setSplitOption] = useState('none');
    const [numberOfPeople, setNumberOfPeople] = useState(2);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);

    useEffect(() => {
        try {
            const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
            if (storedOrders) {
                const parsedOrders: Order[] = JSON.parse(storedOrders);
                const foundOrder = parsedOrders.find(o => o.id === orderId);
                if (foundOrder) {
                    setOrder(foundOrder);
                } else {
                    toast({ title: 'Error', description: 'Pedido no encontrado.', variant: 'destructive' });
                    router.push('/dashboard/orders');
                }
            }
        } catch (error) {
            console.error('Failed to load order from localStorage', error);
            router.push('/dashboard/orders');
        }
    }, [orderId, router, toast]);

    const handlePayment = () => {
        try {
            const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
            if (storedOrders) {
                let parsedOrders: Order[] = JSON.parse(storedOrders);
                parsedOrders = parsedOrders.map(o => 
                    o.id === orderId ? { ...o, status: 'Pagado' } : o
                );
                localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(parsedOrders));
                setIsReceiptOpen(true);
            }
        } catch (error) {
             toast({ title: 'Error', description: 'No se pudo procesar el pago.', variant: 'destructive' });
        }
    };

    const handleCloseReceipt = () => {
        setIsReceiptOpen(false);
        router.push('/dashboard/orders');
    }
    
    if (!order) {
        return <div>Cargando...</div>;
    }

    const total = order.total;
    const totalPerPerson = splitOption === 'equal' && numberOfPeople > 0 ? total / numberOfPeople : total;


    return (
        <div className="flex flex-col gap-4">
             <style>{`
                @media print {
                    body > *:not(.print-receipt) {
                        display: none;
                    }
                    .print-receipt {
                        display: block;
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                    }
                }
            `}</style>

            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4"/>
                </Button>
                <h1 className="text-2xl font-bold">Cobrar Pedido #{order.id.split('-')[1]}</h1>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Order Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Cuenta de {order.customerName}</CardTitle>
                        <p className="text-muted-foreground">Resumen del pedido</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {order.items.map(item => (
                            <div key={item.productId} className="flex justify-between">
                                <div>
                                    <p className="font-medium">{item.productName} x{item.quantity}</p>
                                    {/* <p className="text-sm text-muted-foreground">Nota: Alguna nota</p> */}
                                </div>
                                <p>${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between font-bold text-lg">
                            <p>Total:</p>
                            <p>${order.total.toFixed(2)}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment Processing */}
                <Card>
                    <CardHeader>
                        <CardTitle>Procesar Pago</CardTitle>
                         <p className="text-muted-foreground">Dividir cuenta y seleccionar método de pago</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <Label className="font-semibold">Dividir Cuenta</Label>
                             <RadioGroup value={splitOption} onValueChange={setSplitOption} className="mt-2">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="none" id="none" />
                                    <Label htmlFor="none">No dividir</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="equal" id="equal" />
                                    <Label htmlFor="equal">Dividir en partes iguales</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {splitOption === 'equal' && (
                             <div>
                                <Label htmlFor="split-count">Número de personas</Label>
                                <select 
                                    id="split-count" 
                                    value={numberOfPeople} 
                                    onChange={(e) => setNumberOfPeople(Number(e.target.value))}
                                    className="w-full mt-1 p-2 border rounded-md"
                                >
                                    {[2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                            </div>
                        )}

                        <div className="text-center bg-muted p-4 rounded-lg">
                            <p className="text-sm text-muted-foreground">Total a pagar {splitOption === 'equal' ? '(por persona)' : ''}</p>
                            <p className="text-4xl font-bold text-primary">${totalPerPerson.toFixed(2)}</p>
                        </div>

                        <div>
                            <Label className="font-semibold">Método de Pago</Label>
                             <div className="grid grid-cols-2 gap-4 mt-2">
                                <Button variant={selectedPaymentMethod === 'cash' ? 'default' : 'outline'} onClick={() => setSelectedPaymentMethod('cash')} className="h-20 flex-col gap-2">
                                    <Landmark/> Efectivo
                                </Button>
                                <Button variant={selectedPaymentMethod === 'card' ? 'default' : 'outline'} onClick={() => setSelectedPaymentMethod('card')} className="h-20 flex-col gap-2">
                                    <CreditCard/> Tarjeta
                                </Button>
                                 <Button variant={selectedPaymentMethod === 'yape' ? 'default' : 'outline'} onClick={() => setSelectedPaymentMethod('yape')} className="h-20 flex-col gap-2">
                                    <Smartphone/> Yape
                                </Button>
                                <Button variant={selectedPaymentMethod === 'plin' ? 'default' : 'outline'} onClick={() => setSelectedPaymentMethod('plin')} className="h-20 flex-col gap-2">
                                    <Smartphone/> Plin
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                         <Button className="w-full" size="lg" onClick={handlePayment}>
                            <Send className="mr-2 h-4 w-4"/> Pagar
                        </Button>
                    </CardFooter>
                </Card>
            </div>
             <div className="print-receipt">
                <ReceiptDialog isOpen={isReceiptOpen} onClose={handleCloseReceipt} order={order} />
            </div>
        </div>
    )
}
