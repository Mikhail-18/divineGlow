
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import type { UserRole } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { KeyRound, User, Warehouse, LogIn, DollarSign } from 'lucide-react';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = React.useState<UserRole | null>(null);
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setPassword('');
  };

  const handleLogin = () => {
    if (!selectedRole) {
      toast({ title: 'Error', description: 'Por favor, selecciona un rol.', variant: 'destructive' });
      return;
    }
    if (!password) {
      toast({ title: 'Error', description: 'Por favor, introduce la contraseña.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    let userName = 'Usuario';
    if (selectedRole === 'admin') userName = 'Admin';
    if (selectedRole === 'seller') userName = 'Vendedor';
    if (selectedRole === 'warehouse') userName = 'Almacenero';
    if (selectedRole === 'cajero') userName = 'Cajero';

    const isAuthenticated = login({ name: userName, role: selectedRole }, password);

    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      toast({ title: 'Error de autenticación', description: 'La contraseña es incorrecta.', variant: 'destructive' });
      setLoading(false);
    }
  };

  const roleIcons: Record<UserRole, React.ElementType> = {
    admin: KeyRound,
    seller: User,
    warehouse: Warehouse,
    cajero: DollarSign
  };
  
  const roleNames: Record<UserRole, string> = {
      admin: 'Administrador',
      seller: 'Vendedor',
      warehouse: 'Almacenero',
      cajero: 'Cajero'
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
                    <User className="mr-2 h-5 w-5" /> Entrar como Vendedor
                  </Button>
                   <Button onClick={() => handleRoleSelect('cajero')} size="lg" className="w-full" variant="outline">
                    <DollarSign className="mr-2 h-5 w-5" /> Entrar como Cajero
                  </Button>
                  <Button onClick={() => handleRoleSelect('warehouse')} size="lg" className="w-full" variant="outline">
                    <Warehouse className="mr-2 h-5 w-5" /> Entrar como Almacenero
                  </Button>
                </div>
              </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-md bg-muted/50">
                        {React.createElement(roleIcons[selectedRole], { className: "h-8 w-8 text-primary" })}
                        <div>
                            <p className="text-sm text-muted-foreground">Iniciando sesión como</p>
                            <h3 className="font-semibold text-lg">{roleNames[selectedRole]}</h3>
                        </div>
                    </div>
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
            )}
          </CardContent>
        </Card>
      </div>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Divine Glow. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}
