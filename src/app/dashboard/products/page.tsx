'use client';
import { products as initialProducts } from '@/lib/data';
import type { Product } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import React from 'react';
import { useAuth } from '@/hooks/use-auth';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ProductsPage() {
  const [products, setProducts] = React.useState<Product[]>(initialProducts);
  const { user } = useAuth();
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = React.useState(false);
  const [newProduct, setNewProduct] = React.useState({
    name: '',
    description: '',
    price: '',
    stock: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewProduct(prev => ({ ...prev, [id]: value }));
  };

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.price && newProduct.stock) {
      const productToAdd: Product = {
        id: `prod-${Date.now()}`,
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock, 10),
        lowStockThreshold: 10, // Default value
        image: 'https://placehold.co/400x400.png', // Default placeholder
      };
      setProducts(prev => [productToAdd, ...prev]);
      setNewProduct({ name: '', description: '', price: '', stock: '' });
      setIsAddProductDialogOpen(false);
    } else {
      // Basic validation feedback
      alert('Por favor, completa todos los campos requeridos.');
    }
  };


  const getStockVariant = (stock: number, threshold: number): 'destructive' | 'secondary' | 'default' => {
    if (stock === 0) return 'destructive';
    if (stock <= threshold) return 'secondary';
    return 'default';
  };

  const getStockText = (stock: number, threshold: number): string => {
    if (stock === 0) return 'Agotado';
    if (stock <= threshold) return 'Stock bajo';
    return 'En stock';
  };
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catálogo de Productos</h1>
          <p className="text-muted-foreground">Gestiona el inventario de productos de Divine Glow.</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'seller') && (
          <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Añadir Nuevo Producto</DialogTitle>
                <DialogDescription>
                  Completa los detalles para agregar un nuevo producto al catálogo.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nombre
                  </Label>
                  <Input id="name" value={newProduct.name} onChange={handleInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Descripción
                  </Label>
                  <Textarea id="description" value={newProduct.description} onChange={handleInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Precio
                  </Label>
                  <Input id="price" type="number" value={newProduct.price} onChange={handleInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">
                    Stock
                  </Label>
                  <Input id="stock" type="number" value={newProduct.stock} onChange={handleInputChange} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={handleAddProduct}>Guardar Producto</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="hidden w-[100px] sm:table-cell">
                  Imagen
                </TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="hidden md:table-cell">Precio</TableHead>
                <TableHead>Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="hidden sm:table-cell">
                    <Image
                      alt={product.name}
                      className="aspect-square rounded-md object-cover"
                      height="64"
                      src={product.image}
                      width="64"
                      data-ai-hint="beauty product"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant={getStockVariant(product.stock, product.lowStockThreshold)}>
                      {getStockText(product.stock, product.lowStockThreshold)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    ${product.price.toFixed(2)}
                  </TableCell>
                  <TableCell>{product.stock} unidades</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
