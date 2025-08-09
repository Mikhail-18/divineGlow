'use client';
import React, { useState, useEffect } from 'react';
import { products as allProducts, customers as initialCustomers, orders as initialOrders } from '@/lib/data';
import type { Product, Customer, Order, OrderItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PlusCircle, X, Search, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

type CartItem = OrderItem & { image: string };

const PRODUCTS_STORAGE_KEY = 'divine-glow-products';
const CUSTOMERS_STORAGE_KEY = 'divine-glow-customers';
const ORDERS_STORAGE_KEY = 'divine-glow-orders';

export default function POSPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = React.useState(false);
  const [newCustomer, setNewCustomer] = React.useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    try {
      // Load Products
      const storedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        setProducts(allProducts);
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(allProducts));
      }

      // Load Customers
      const storedCustomers = localStorage.getItem(CUSTOMERS_STORAGE_KEY);
      const parsedCustomers = storedCustomers ? JSON.parse(storedCustomers) : initialCustomers;
      setCustomers(parsedCustomers);
      
      const defaultCustomer = parsedCustomers.find((c: Customer) => c.name === 'Cliente Mostrador');
      if (defaultCustomer) {
        setSelectedCustomer(defaultCustomer.id);
      } else if (parsedCustomers.length > 0) {
        setSelectedCustomer(parsedCustomers[0].id)
      }

      // Load Orders
       const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
       if (storedOrders) {
         setOrders(JSON.parse(storedOrders));
       } else {
         setOrders(initialOrders);
       }

    } catch (error) {
      console.error('Failed to parse data from localStorage', error);
      setProducts(allProducts);
      setCustomers(initialCustomers);
      setOrders(initialOrders);
    }
  }, []);

  const updateProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(updatedProducts));
  };

  const updateCustomers = (updatedCustomers: Customer[]) => {
    setCustomers(updatedCustomers);
    localStorage.setItem(CUSTOMERS_STORAGE_KEY, JSON.stringify(updatedCustomers));
  };
  
  const updateOrders = (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
  }


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewCustomer(prev => ({ ...prev, [id]: value }));
  };

  const handleAddNewCustomer = () => {
    if (!newCustomer.name || !newCustomer.email) {
      toast({
        title: 'Error',
        description: 'Por favor, completa nombre y email.',
        variant: 'destructive',
      });
      return;
    }
    const newCustomerId = `cust-${Date.now()}`;
    const customerToAdd: Customer = {
      id: newCustomerId,
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      avatarUrl: `https://placehold.co/100x100.png`,
      lastOrderDate: new Date().toISOString().split('T')[0],
      totalSpent: 0,
    };
    const updatedCustomers = [customerToAdd, ...customers];
    updateCustomers(updatedCustomers);
    setSelectedCustomer(newCustomerId); // Select the new customer
    setNewCustomer({ name: '', email: '', phone: '' });
    setIsAddCustomerDialogOpen(false);
    toast({ title: "Cliente añadido", description: `${customerToAdd.name} ha sido añadido y seleccionado.` });
  };


  const handleAddToCart = (product: Product) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.productId === product.id);
      if (existingItem) {
        if (existingItem.quantity < product.stock) {
           return currentCart.map(item =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
            toast({ title: "Stock insuficiente", description: `No puedes añadir más de ${product.name}.`, variant: "destructive" });
            return currentCart;
        }
      }
      if (product.stock > 0) {
        return [...currentCart, { productId: product.id, productName: product.name, price: product.price, quantity: 1, image: product.image }];
      } else {
        toast({ title: "Sin stock", description: `${product.name} está agotado.`, variant: "destructive" });
        return currentCart;
      }
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(currentCart => currentCart.filter(item => item.productId !== productId));
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (quantity > product.stock) {
        toast({ title: "Stock insuficiente", description: `Solo quedan ${product.stock} unidades de ${product.name}.`, variant: "destructive" });
        quantity = product.stock;
    }

    if (quantity < 1) {
      handleRemoveFromCart(productId);
      return;
    }

    setCart(currentCart =>
      currentCart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const handleCreateOrder = () => {
    if (cart.length === 0) {
      toast({ title: "Error", description: "El carrito está vacío.", variant: "destructive" });
      return;
    }
    const customer = customers.find(c => c.id === selectedCustomer);
    if (!customer) {
        toast({ title: "Error", description: "Por favor, selecciona un cliente.", variant: "destructive" });
        return;
    }
    
    // Check stock for all items
    for (const item of cart) {
        const product = products.find(p => p.id === item.productId);
        if (!product || item.quantity > product.stock) {
            toast({ title: "Stock insuficiente", description: `No hay suficiente stock para ${item.productName}.`, variant: "destructive" });
            return;
        }
    }

    // Update product stock
    const updatedProducts = products.map(p => {
        const cartItem = cart.find(item => item.productId === p.id);
        if (cartItem) {
            return { ...p, stock: p.stock - cartItem.quantity };
        }
        return p;
    });
    updateProducts(updatedProducts);
    
    const newOrder: Order = {
        id: `ord-${Date.now()}`,
        customerName: customer.name,
        customerAvatar: customer.avatarUrl,
        date: new Date().toISOString().split('T')[0],
        status: 'Pendiente',
        items: cart.map(({ image, ...item }) => item), // Remove image property from cart items
        total: cartTotal
    };

    updateOrders([newOrder, ...orders]);
    
    toast({
      title: "Pedido Creado",
      description: `Pedido para ${customer.name} por un total de $${cartTotal.toFixed(2)} ha sido creado.`,
    });

    setCart([]);
    const defaultCustomer = customers.find(c => c.name === 'Cliente Mostrador');
    if (defaultCustomer) {
      setSelectedCustomer(defaultCustomer.id);
    }
  };
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
      {/* Products Column */}
      <div className="lg:col-span-2 flex flex-col h-full">
         <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Productos</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar productos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
             <ScrollArea className="h-[calc(100vh-20rem)]">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
                  {filteredProducts.map(product => (
                    <Card key={product.id} className="overflow-hidden">
                       <CardContent className="p-0 text-center">
                        <Image
                            alt={product.name}
                            className="aspect-square w-full object-cover"
                            height="150"
                            src={product.image}
                            width="150"
                            data-ai-hint="beauty product"
                        />
                        <div className="p-2">
                           <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                           <p className="text-xs text-muted-foreground">${product.price.toFixed(2)}</p>
                           <p className={`text-xs ${product.stock > 0 ? 'text-muted-foreground' : 'text-destructive'}`}>
                                Stock: {product.stock}
                           </p>
                        </div>
                       </CardContent>
                       <CardFooter className="p-2">
                        <Button size="sm" className="w-full" onClick={() => handleAddToCart(product)} disabled={product.stock === 0}>
                            <PlusCircle className="mr-2 h-4 w-4"/> {product.stock > 0 ? 'Añadir' : 'Agotado'}
                        </Button>
                       </CardFooter>
                    </Card>
                  ))}
              </div>
            </ScrollArea>
          </CardContent>
         </Card>
      </div>

      {/* Cart Column */}
      <div className="flex flex-col h-full">
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Pedido Actual</CardTitle>
             <div className="space-y-2 pt-4">
                <Label htmlFor="customer-select">Cliente</Label>
                <div className="flex gap-2">
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger id="customer-select">
                    <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                    {customers.map(customer => (
                        <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
                <Dialog open={isAddCustomerDialogOpen} onOpenChange={setIsAddCustomerDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                            <UserPlus className="h-4 w-4"/>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Añadir Nuevo Cliente</DialogTitle>
                            <DialogDescription>
                                Completa los detalles para agregar un nuevo cliente.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Nombre</Label>
                                <Input id="name" value={newCustomer.name} onChange={handleInputChange} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="email" className="text-right">Email</Label>
                                <Input id="email" type="email" value={newCustomer.email} onChange={handleInputChange} className="col-span-3" />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="phone" className="text-right">Teléfono</Label>
                                <Input id="phone" value={newCustomer.phone} onChange={handleInputChange} className="col-span-3" />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button onClick={handleAddNewCustomer}>Guardar Cliente</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[calc(100vh-28rem)]">
              {cart.length > 0 ? (
                <Table>
                   <TableBody>
                    {cart.map(item => (
                      <TableRow key={item.productId}>
                        <TableCell>
                           <Image src={item.image} alt={item.productName} width={40} height={40} className="rounded-md"/>
                        </TableCell>
                        <TableCell>
                           <p className="font-medium text-sm">{item.productName}</p>
                           <p className="text-xs text-muted-foreground">${item.price.toFixed(2)}</p>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value, 10))}
                            className="w-16 h-8 text-center"
                            min="1"
                          />
                        </TableCell>
                        <TableCell className="font-medium text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveFromCart(item.productId)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground p-4">
                  <p>El carrito está vacío</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 mt-auto p-4 border-t">
            <div className="flex justify-between w-full text-lg font-bold">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <Button className="w-full" size="lg" onClick={handleCreateOrder}>
              Crear Pedido
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
