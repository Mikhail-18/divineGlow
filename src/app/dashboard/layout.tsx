
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  LogOut,
  PlusSquare,
  FileBox,
  KeyRound,
  DollarSign
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Logo } from '@/components/logo';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [loading, isAuthenticated, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'seller', 'warehouse', 'cajero'] },
    { href: '/dashboard/pos', label: 'Punto de Venta', icon: PlusSquare, roles: ['admin', 'seller'] },
    { href: '/dashboard/products', label: 'Productos', icon: Package, roles: ['admin', 'seller', 'warehouse'] },
    { href: '/dashboard/customers', label: 'Clientes', icon: Users, roles: ['admin', 'seller'] },
    { href: '/dashboard/orders', label: 'Pedidos', icon: ShoppingCart, roles: ['admin', 'seller', 'warehouse', 'cajero'] },
    { href: '/dashboard/cash-closing', label: 'Cierre de Caja', icon: FileBox, roles: ['admin', 'cajero'] },
    { href: '/dashboard/sellers', label: 'Vendedores', icon: KeyRound, roles: ['admin'] },
    { href: '/dashboard/cashiers', label: 'Cajeros', icon: DollarSign, roles: ['admin'] },
  ];

  if (loading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <Logo className="h-16 w-16 animate-pulse text-primary" />
           <p className="text-muted-foreground">Cargando tu espacio de trabajo...</p>
        </div>
      </div>
    );
  }
  
  // Hide layout for checkout page
  if (pathname.includes('/dashboard/checkout/')) {
    return <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>;
  }


  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold">Divine Glow</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.filter(item => item.roles.includes(user!.role)).map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={`https://placehold.co/100x100.png`} />
              <AvatarFallback>{user?.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate font-medium">{user?.name}</span>
              <span className="text-xs capitalize text-muted-foreground">{user?.role}</span>
            </div>
            <Button variant="ghost" size="icon" className="ml-auto" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 md:hidden">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">Divine Glow</h1>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
