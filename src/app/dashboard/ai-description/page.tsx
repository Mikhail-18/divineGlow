'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateProductDescription } from '@/ai/flows/generate-product-description';
import { Sparkles, Copy, Check } from 'lucide-react';

const formSchema = z.object({
  productName: z.string().min(3, 'El nombre del producto debe tener al menos 3 caracteres.'),
  productType: z.string().min(3, 'El tipo de producto es requerido.'),
  keyIngredients: z.string().min(3, 'Ingresa al menos un ingrediente clave.'),
  skinType: z.string().min(3, 'El tipo de piel es requerido.'),
  benefits: z.string().min(3, 'Describe al menos un beneficio.'),
});

type FormValues = z.infer<typeof formSchema>;

export default function AiDescriptionPage() {
  const [generatedDescription, setGeneratedDescription] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      productName: '',
      productType: '',
      keyIngredients: '',
      skinType: '',
      benefits: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setIsGenerating(true);
    setGeneratedDescription('');
    try {
      const result = await generateProductDescription(values);
      setGeneratedDescription(result.description);
      toast({
        title: '¡Descripción generada!',
        description: 'La descripción de tu producto está lista.',
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Error al generar',
        description: 'Hubo un problema al contactar a la IA. Inténtalo de nuevo.',
      });
    } finally {
      setIsGenerating(false);
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedDescription);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Generador de Descripciones con IA</CardTitle>
          <CardDescription>
            Completa los atributos del producto y deja que la IA cree una descripción atractiva para ti.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="productName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Producto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Sérum Renovador Nocturno" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="productType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Producto</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Crema, sérum, limpiador" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="keyIngredients"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ingredientes Clave</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Ácido hialurónico, Vitamina C, Retinol" {...field} />
                    </FormControl>
                    <FormDescription>Separados por comas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="skinType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Piel</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Grasa, seca, mixta, sensible" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="benefits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beneficios</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Hidrata, ilumina, anti-edad" {...field} />
                    </FormControl>
                    <FormDescription>Separados por comas.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generar Descripción
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="flex flex-col gap-6">
        <Card className="flex-grow flex flex-col">
          <CardHeader>
            <CardTitle>Descripción Generada</CardTitle>
            <CardDescription>Aquí aparecerá el resultado de la IA.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <Textarea
              readOnly
              value={generatedDescription}
              placeholder="La magia está por suceder..."
              className="h-full min-h-[300px] resize-none text-base"
            />
          </CardContent>
          {generatedDescription && (
            <CardFooter>
              <Button onClick={handleCopy} variant="outline" className="w-full">
                {isCopied ? (
                  <>
                    <Check className="mr-2 h-4 w-4" /> Copiado
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-4 w-4" /> Copiar al Portapapeles
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
