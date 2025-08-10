
'use client';
import { cashiers as initialCashiers } from '@/lib/data';
import type { Cashier } from '@/lib/types';
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

const CASHIERS_STORAGE_KEY = 'divine-glow-cashiers';

export default function CashiersPage() {
  const [cashiers, setCashiers] = React.useState<Cashier[]>([]);
  const [selectedCashier, setSelectedCashier] = React.useState<Cashier | null>(null);

  const [isAddCashierDialogOpen, setIsAddCashierDialogOpen] = React.useState(false);
  const [isEditCashierDialogOpen, setIsEditCashierDialogOpen] = React.useState(false);

  const [newCashier, setNewCashier] = React.useState({
    name: '',
    password: '',
  });

  React.useEffect(() => {
    try {
      const storedCashiers = localStorage.getItem(CASHIERS_STORAGE_KEY);
      if (storedCashiers) {
        setCashiers(JSON.parse(storedCashiers));
      } else {
        setCashiers(initialCashiers);
        localStorage.setItem(CASHIERS_STORAGE_KEY, JSON.stringify(initialCashiers));
      }
    } catch (error) {
      console.error('Failed to parse cashiers from localStorage', error);
      setCashiers(initialCashiers);
    }
  }, []);

  const updateCashiers = (updatedCashiers: Cashier[]) => {
    setCashiers(updatedCashiers);
    localStorage.setItem(CASHIERS_STORAGE_KEY, JSON.stringify(updatedCashiers));
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewCashier(prev => ({ ...prev, [id]: value }));
  };
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedCashier) {
      const { id, value } = e.target;
      setSelectedCashier({ ...selectedCashier, [id]: value });
    }
  };


  const handleAddCashier = () => {
    if (newCashier.name && newCashier.password) {
      const cashierToAdd: Cashier = {
        id: `cashier-${Date.now()}`,
        name: newCashier.name,
        password: newCashier.password,
      };
      updateCashiers([cashierToAdd, ...cashiers]);
      setNewCashier({ name: '', password: '' });
      setIsAddCashierDialogOpen(false);
    } else {
      alert('Por favor, completa nombre y contraseña.');
    }
  };
  
  const handleEditCashier = () => {
    if (selectedCashier) {
      const updatedCashiers = cashiers.map(s => s.id === selectedCashier.id ? selectedCashier : s);
      updateCashiers(updatedCashiers);
      setIsEditCashierDialogOpen(false);
      setSelectedCashier(null);
    }
  };
  
  const handleDeleteCashier = (cashierId: string) => {
    const updatedCashiers = cashiers.filter(s => s.id !== cashierId);
    updateCashiers(updatedCashiers);
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Gestión de Cajeros</h1>
          <p className="text-muted-foreground">Crea y administra los accesos de los cajeros.</p>
        </div>
        <Dialog open={isAddCashierDialogOpen} onOpenChange={setIsAddCashierDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Añadir Cajero
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Cajero</DialogTitle>
              <DialogDescription>
                Completa los detalles para agregar un nuevo cajero.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nombre
                </Label>
                <Input id="name" value={newCashier.name} onChange={handleInputChange} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Contraseña
                </Label>
                <Input id="password" type="password" value={newCashier.password} onChange={handleInputChange} className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button onClick={handleAddCashier}>Guardar Cajero</Button>
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
              {cashiers.map((cashier) => (
                <TableRow key={cashier.id}>
                  <TableCell>
                    <div className="font-medium">{cashier.name}</div>
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
                            <DropdownMenuItem onSelect={() => { setSelectedCashier(cashier); setIsEditCashierDialogOpen(true); }}>
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
                              Esta acción no se puede deshacer. Esto eliminará permanentemente al cajero de tus registros.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive hover:bg-destructive/90"
                              onClick={() => handleDeleteCashier(cashier.id)}
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
      
      {/* Edit Cashier Dialog */}
      <Dialog open={isEditCashierDialogOpen} onOpenChange={setIsEditCashierDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Cajero</DialogTitle>
            <DialogDescription>
              Actualiza los detalles del cajero. Haz clic en guardar cuando termines.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input id="name" value={selectedCashier?.name || ''} onChange={handleEditInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Contraseña
              </Label>
              <Input id="password" type="password" value={selectedCashier?.password || ''} onChange={handleEditInputChange} className="col-span-3" placeholder="Nueva contraseña"/>
            </div>
          </div>
          <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={() => setSelectedCashier(null)}>Cancelar</Button>
              </DialogClose>
            <Button onClick={handleEditCashier}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
