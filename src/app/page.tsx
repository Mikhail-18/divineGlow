'use client';

import { useRouter } from 'next/navigation';
import type { UserRole } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { KeyRound, Building, User, Warehouse } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (role: UserRole) => {
    let userName = 'Usuario';
    if (role === 'admin') userName = 'Admin';
    if (role === 'seller') userName = 'Vendedor';
    if (role === 'warehouse') userName = 'Almacenero';
    
    login({ name: userName, role });
    router.push('/dashboard');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <Logo className="h-20 w-20 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Divine Hub</CardTitle>
            <CardDescription className="text-muted-foreground">
              Tu plataforma interna para el éxito.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Por favor, selecciona tu rol para continuar.
              </p>
              <Separator />
              <div className="grid grid-cols-1 gap-4">
                 <Button
                  onClick={() => handleLogin('admin')}
                  size="lg"
                  className="w-full"
                  variant="outline"
                >
                  <KeyRound className="mr-2 h-5 w-5" />
                  Entrar como Administrador
                </Button>
                 <Button
                  onClick={() => handleLogin('seller')}
                  size="lg"
                  className="w-full"
                  variant="outline"
                >
                  <User className="mr-2 h-5 w-5" />
                  Entrar como Vendedor
                </Button>
                 <Button
                  onClick={() => handleLogin('warehouse')}
                  size="lg"
                  className="w-full"
                  variant="outline"
                >
                  <Warehouse className="mr-2 h-5 w-5" />
                  Entrar como Almacenero
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
       <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Divine Glow. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}
