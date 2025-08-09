
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole, Seller, User } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KeyRound, User as UserIcon, Warehouse, LogIn, DollarSign } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { sellers as initialSellers } from '@/lib/data';

const SELLERS_STORAGE_KEY = 'divine-glow-sellers';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = React.useState<UserRole | null>(null);
  const [selectedSellerId, setSelectedSellerId] = React.useState<string>('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [sellers, setSellers] = React.useState<Seller[]>([]);

  React.useEffect(() => {
    try {
      const storedSellers = localStorage.getItem(SELLERS_STORAGE_KEY);
      if (storedSellers) {
        setSellers(JSON.parse(storedSellers));
      } else {
        setSellers(initialSellers);
      }
    } catch (error) {
      console.error('Failed to parse sellers from localStorage', error);
      setSellers(initialSellers);
    }
  }, []);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setPassword('');
    setSelectedSellerId('');
  };

  const handleLogin = () => {
    if (!selectedRole) {
      toast({ title: 'Error', description: 'Por favor, selecciona un rol.', variant: 'destructive' });
      return;
    }
    
    let userToLogin: User;
    
    if (selectedRole === 'seller') {
      if (!selectedSellerId) {
        toast({ title: 'Error', description: 'Por favor, selecciona un vendedor.', variant: 'destructive' });
        return;
      }
      // For sellers, we pass the ID in the 'name' field, the auth context will resolve the actual name.
      userToLogin = { name: selectedSellerId, role: selectedRole };
    } else {
        let userName = 'Usuario';
        if (selectedRole === 'admin') userName = 'Admin';
        if (selectedRole === 'warehouse') userName = 'Almacenero';
        if (selectedRole === 'cajero') userName = 'Cajero';
        userToLogin = { name: userName, role: selectedRole };
    }

    if (!password) {
      toast({ title: 'Error', description: 'Por favor, introduce la contraseña.', variant: 'destructive' });
      return;
    }

    setLoading(true);

    const isAuthenticated = login(userToLogin, password);

    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      toast({ title: 'Error de autenticación', description: 'La contraseña es incorrecta.', variant: 'destructive' });
      setLoading(false);
    }
  };

  const roleIcons: Record<UserRole, React.ElementType> = {
    admin: KeyRound,
    seller: UserIcon,
    warehouse: Warehouse,
    cajero: DollarSign
  };
  
  const roleNames: Record<UserRole, string> = {
      admin: 'Administrador',
      seller: 'Vendedor',
      warehouse: 'Almacenero',
      cajero: 'Cajero'
  }
  
  const renderLoginScreen = () => {
      const roleName = roleNames[selectedRole!];
      const Icon = roleIcons[selectedRole!];

      return (
        <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-md bg-muted/50">
                {React.createElement(Icon, { className: "h-8 w-8 text-primary" })}
                <div>
                    <p className="text-sm text-muted-foreground">Iniciando sesión como</p>
                    <h3 className="font-semibold text-lg">{roleName}</h3>
                </div>
            </div>

            {selectedRole === 'seller' && (
              <div className="space-y-2">
                <Label htmlFor="seller-select">Vendedor</Label>
                <Select value={selectedSellerId} onValueChange={setSelectedSellerId}>
                  <SelectTrigger id="seller-select">
                    <SelectValue placeholder="Selecciona un vendedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {sellers.map(seller => (
                      <SelectItem key={seller.id} value={seller.id}>{seller.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    placeholder="Introduce tu contraseña" 
                    autoFocus
                />
            </div>
            <Button onClick={handleLogin} disabled={loading} className="w-full" size="lg">
                <LogIn className="mr-2 h-5 w-5" />
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
            <Button variant="link" onClick={() => setSelectedRole(null)} className="w-full">
                Volver a seleccionar rol
            </Button>
        </div>
      )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Logo className="h-20 w-20 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Divine Glow</CardTitle>
            <CardDescription className="text-muted-foreground">
              Tu plataforma interna para el éxito.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedRole ? (
               <div className="space-y-4">
                <p className="text-center text-sm text-muted-foreground">
                  Por favor, selecciona tu rol para continuar.
                </p>
                <Separator />
                <div className="grid grid-cols-1 gap-4">
                   <Button onClick={() => handleRoleSelect('admin')} size="lg" className="w-full" variant="outline">
                    <KeyRound className="mr-2 h-5 w-5" /> Entrar como Administrador
                  </Button>
                   <Button onClick={() => handleRoleSelect('seller')} size="lg" className="w-full" variant="outline">
                    <UserIcon className="mr-2 h-5 w-5" /> Entrar como Vendedor
                  </Button>
                   <Button onClick={() => handleRoleSelect('cajero')} size="lg" className="w-full" variant="outline">
                    <DollarSign className="mr-2 h-5 w-5" /> Entrar como Cajero
                  </Button>
                  <Button onClick={() => handleRoleSelect('warehouse')} size="lg" className="w-full" variant="outline">
                    <Warehouse className="mr-2 h-5 w-5" /> Entrar como Almacenero
                  </Button>
                </div>
              </div>
            ) : renderLoginScreen()}
          </CardContent>
        </Card>
      </div>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Divine Glow. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}
