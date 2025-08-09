
'use client';
import { sellers as initialSellers } from '@/lib/data';
import type { Seller } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MoreHorizontal, PlusCircle, Pencil, Trash2 } from 'lucide-react';
import React from 'react';
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

const SELLERS_STORAGE_KEY = 'divine-glow-sellers';

export default function SellersPage() {
  const [sellers, setSellers] = React.useState<Seller[]>([]);
  const [selectedSeller, setSelectedSeller] = React.useState<Seller | null>(null);

  const [isAddSellerDialogOpen, setIsAddSellerDialogOpen] = React.useState(false);
  const [isEditSellerDialogOpen, setIsEditSellerDialogOpen] = React.useState(false);

  const [newSeller, setNewSeller] = React.useState({
    name: '',
    password: '',
  });

  React.useEffect(() => {
    try {
      const storedSellers = localStorage.getItem(SELLERS_STORAGE_KEY);
      if (storedSellers) {
        setSellers(JSON.parse(storedSellers));
      } else {
        setSellers(initialSellers);
        localStorage.setItem(SELLERS_STORAGE_KEY, JSON.stringify(initialSellers));
      }
    } catch (error) {
      console.error('Failed to parse sellers from localStorage', error);
      setSellers(initialSellers);
    }
  }, []);

  const updateSellers = (updatedSellers: Seller[]) => {
    setSellers(updatedSellers);
    localStorage.setItem(SELLERS_STORAGE_KEY, JSON.stringify(updatedSellers));
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewSeller(prev => ({ ...prev, [id]: value }));
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedSeller) {
      const { id, value } = e.target;
      setSelectedSeller({ ...selectedSeller, [id]: value });
    }
  };


  const handleAddSeller = () => {
    if (newSeller.name && newSeller.password) {
      const sellerToAdd: Seller = {
        id: `seller-${Date.now()}`,
        name: newSeller.name,
        password: newSeller.password,
      };
      updateSellers([sellerToAdd, ...sellers]);
      setNewSeller({ name: '', password: '' });
      setIsAddSellerDialogOpen(false);
    } else {
      alert('Por favor, completa nombre y contraseña.');
    }
  };
  
  const handleEditSeller = () => {
    if (selectedSeller) {
      const updatedSellers = sellers.map(s => s.id === selectedSeller.id ? selectedSeller : s);
      updateSellers(updatedSellers);
      setIsEditSellerDialogOpen(false);
      setSelectedSeller(null);
    }
  };
  
  const handleDeleteSeller = (sellerId: string) => {
    const updatedSellers = sellers.filter(s => s.id !== sellerId);
    updateSellers(updatedSellers);
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestión de Vendedores</h1>
          <p className="text-muted-foreground">Crea y administra los accesos de los vendedores.</p>
        </div>
        <Dialog open={isAddSellerDialogOpen} onOpenChange={setIsAddSellerDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Vendedor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Vendedor</DialogTitle>
              <DialogDescription>
                Completa los detalles para agregar un nuevo vendedor.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input id="name" value={newSeller.name} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Contraseña
                </Label>
                <Input id="password" type="password" value={newSeller.password} onChange={handleInputChange} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleAddSeller}>Guardar Vendedor</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead><span className="sr-only">Acciones</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sellers.map((seller) => (
                <TableRow key={seller.id}>
                  <TableCell>
                    <div className="font-medium">{seller.name}</div>
                  </TableCell>
                  <TableCell className="text-right">
                     <AlertDialog>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => { setSelectedSeller(seller); setIsEditSellerDialogOpen(true); }}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <AlertDialogTrigger asChild>
                               <DropdownMenuItem className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                          </DropdownMenuContent>
                        </DropdownMenu>
                         <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. Esto eliminará permanentemente al vendedor de tus registros.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDeleteSeller(seller.id)}
                            >
                              Sí, eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Edit Seller Dialog */}
      <Dialog open={isEditSellerDialogOpen} onOpenChange={setIsEditSellerDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Vendedor</DialogTitle>
            <DialogDescription>
              Actualiza los detalles del vendedor. Haz clic en guardar cuando termines.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input id="name" value={selectedSeller?.name || ''} onChange={handleEditInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Contraseña
              </Label>
              <Input id="password" type="password" value={selectedSeller?.password || ''} onChange={handleEditInputChange} className="col-span-3" placeholder="Nueva contraseña"/>
            </div>
          </div>
          <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={() => setSelectedSeller(null)}>Cancelar</Button>
              </DialogClose>
            <Button onClick={handleEditSeller}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
