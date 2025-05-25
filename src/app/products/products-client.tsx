
"use client";

import * as React from "react";
import type { Product, Category } from "@/types"; // Added Category import
import { DataTable } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/shared/page-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Added Select imports

// Mock Data for Categories (should be fetched or managed globally in a real app)
const mockCategories: Category[] = [
  { id: "cat_1", code: "SUBS", name: "Подписки", description: "Основные подписки на товары.", active: true, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png", "data-ai-hint": "subscriptions services" },
  { id: "cat_2", code: "ADDONS", name: "Дополнения", description: "Дополнительные услуги и функции.", active: true, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png", "data-ai-hint": "addons features" },
  { id: "cat_3", code: "LEGACY", name: "Архивные товары", description: "Старые, неподдерживаемые товары.", active: false, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png", "data-ai-hint": "archive old" },
];

// Mock Data for Products
const mockProducts: Product[] = [
  { id: "prod_1", code: "SUB001", name: "Базовая подписка", description: "Ежемесячный доступ к базовым функциям.", price: 999.00, category_id: "cat_1", active: true, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png" , "data-ai-hint": "subscription" },
  { id: "prod_2", code: "SUB002", name: "Премиум подписка", description: "Ежемесячный доступ ко всем функциям.", price: 1999.00, category_id: "cat_1", active: true, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png", "data-ai-hint": "subscription" },
  { id: "prod_3", code: "ADDON001", name: "Дополнительное хранилище", description: "10GB дополнительного хранилища.", price: 500.00, category_id: "cat_2", active: false, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png", "data-ai-hint": "storage" },
];

export function ProductsClient() {
  const [products, setProducts] = React.useState<Product[]>(mockProducts);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | undefined>(undefined);
  const { toast } = useToast();

  const activeCategories = React.useMemo(() => mockCategories.filter(category => category.active), []);

  const columns = React.useMemo(() => [
    { accessorKey: "name", header: "Название", cell: (row: Product) => (
      <div className="flex items-center gap-2">
        {row.image && <img src={row.image} alt={row.name} data-ai-hint={row["data-ai-hint"] || "product item"} className="h-10 w-10 rounded-md object-cover" />}
        <span>{row.name}</span>
      </div>
    )},
    { accessorKey: "code", header: "Код" },
    { accessorKey: "price", header: "Цена", cell: (row: Product) => `${row.price.toFixed(2)} ₽` },
    {
      accessorKey: "category_id",
      header: "Категория",
      cell: (row: Product) => {
        const category = mockCategories.find(cat => cat.id === row.category_id);
        return category ? category.name : row.category_id;
      }
    },
    { accessorKey: "active", header: "Активен", cell: (row: Product) => (
      <Badge variant={row.active ? "default" : "secondary"} className={row.active ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
        {row.active ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
        {row.active ? "Да" : "Нет"}
      </Badge>
    )},
    { accessorKey: "created_at", header: "Создан", cell: (row: Product) => new Date(row.created_at).toLocaleDateString() },
  ], []);

  const handleAddNew = () => {
    setEditingProduct(null);
    setSelectedCategoryId(activeCategories.length > 0 ? activeCategories[0].id : undefined); // Default to first active or undefined
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setSelectedCategoryId(product.category_id);
    setIsModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    setProducts(prev => prev.filter(p => p.id !== product.id));
    toast({ title: "Товар удален", description: `Товар "${product.name}" был удален.` });
  };
  
  const handleSaveProduct = (formData: FormData) => {
    const imageUrl = formData.get('image_url') as string;

    if (!selectedCategoryId) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите категорию.",
        variant: "destructive",
      });
      return;
    }
    
    const newProductData: Product = {
      id: editingProduct?.id || `prod_${Date.now()}`,
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      category_id: selectedCategoryId,
      active: formData.get('active') === 'on',
      created_at: editingProduct?.created_at || new Date().toISOString(),
      image: imageUrl || editingProduct?.image || "https://placehold.co/100x100.png",
      "data-ai-hint": formData.get('data-ai-hint') as string || "product item"
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? newProductData : p));
      toast({ title: "Товар обновлен", description: `Товар "${newProductData.name}" обновлен.` });
    } else {
      setProducts(prev => [newProductData, ...prev]);
      toast({ title: "Товар добавлен", description: `Товар "${newProductData.name}" добавлен.` });
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };


  return (
    <>
      <PageHeader title="Товары" description="Управление товарами вашего магазина.">
        <Button onClick={handleAddNew}>Добавить товар</Button>
      </PageHeader>
      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        onEdit={handleEdit}
        onDelete={handleDelete} 
        addNewButtonText="Добавить товар"
        entityName="Товар"
      />
      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
        setIsModalOpen(isOpen);
        if (!isOpen) {
          setEditingProduct(null);
          setSelectedCategoryId(undefined);
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <form action={handleSaveProduct}>
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Редактировать товар" : "Добавить новый товар"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Измените данные этого товара." : "Введите данные для нового товара."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Название</Label>
                <Input id="name" name="name" defaultValue={editingProduct?.name} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">Код</Label>
                <Input id="code" name="code" defaultValue={editingProduct?.code} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Описание</Label>
                <Textarea id="description" name="description" defaultValue={editingProduct?.description} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Цена (₽)</Label>
                <Input id="price" name="price" type="number" step="0.01" defaultValue={editingProduct?.price} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category_id_select" className="text-right">Категория</Label>
                <Select
                  value={selectedCategoryId}
                  onValueChange={setSelectedCategoryId}
                  // The `required` prop on Select itself might not enforce native form validation for FormData.
                  // We handle the check in handleSaveProduct.
                >
                  <SelectTrigger id="category_id_select" className="col-span-3">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCategories.length > 0 ? (
                      activeCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-categories" disabled>Нет активных категорий</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image_url" className="text-right">URL изображения</Label>
                <Input id="image_url" name="image_url" defaultValue={editingProduct?.image} className="col-span-3" placeholder="https://placehold.co/100x100.png" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="data-ai-hint" className="text-right">Подсказка для ИИ</Label>
                <Input id="data-ai-hint" name="data-ai-hint" defaultValue={editingProduct?.["data-ai-hint"]} className="col-span-3" placeholder="Ключевые слова (макс 2)" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">Активен</Label>
                <div className="col-span-3">
                   <input type="checkbox" id="active" name="active" defaultChecked={editingProduct?.active === undefined ? true : editingProduct.active} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => {
                 setIsModalOpen(false);
                 setEditingProduct(null);
                 setSelectedCategoryId(undefined);
              }}>Отмена</Button>
              <Button type="submit">Сохранить товар</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
