"use client";

import * as React from "react";
import type { Product, Category, PostPaymentAction } from "@/types";
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
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("/api/categories");
  if (!res.ok) return [];
  return res.json();
}

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch("/api/products");
  if (!res.ok) return [];
  return res.json();
}

const postPaymentActionLabels: Record<PostPaymentAction, string> = {
  auto_fulfillment: "Автовыдача товара",
  chat_with_manager: "Чат с менеджером",
};

export function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  
  const [pageSelectedCategoryId, setPageSelectedCategoryId] = React.useState<string | null>(null);
  const [modalFormCategoryId, setModalFormCategoryId] = React.useState<string | undefined>(undefined);
  const [modalFormPostPaymentAction, setModalFormPostPaymentAction] = React.useState<PostPaymentAction | undefined>('auto_fulfillment');
  
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts()]).then(([cats, prods]) => {
      setCategories(cats);
      setProducts(prods);
      setIsLoading(false);
    });
  }, []);

  const activeCategoriesForSelect = React.useMemo(() => {
    return categories.filter(category => category.active);
  }, [categories]);

  const filteredProducts = React.useMemo(() => {
    if (!pageSelectedCategoryId) return [];
    return products.filter(product => product.category_id === pageSelectedCategoryId);
  }, [products, pageSelectedCategoryId]);

  const selectedCategoryName = React.useMemo(() => {
    if (!pageSelectedCategoryId) return "";
    return categories.find(c => c.id === pageSelectedCategoryId)?.name || "";
  }, [pageSelectedCategoryId, categories]);

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
      cell: (row: Product) => categories.find(cat => cat.id === row.category_id)?.name || row.category_id
    },
    { 
      accessorKey: "post_payment_action", 
      header: "Действие после оплаты", 
      cell: (row: Product) => row.post_payment_action ? postPaymentActionLabels[row.post_payment_action] : "Не указано"
    },
    { accessorKey: "active", header: "Активен", cell: (row: Product) => (
      <Badge variant={row.active ? "default" : "secondary"} className={row.active ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
        {row.active ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
        {row.active ? "Да" : "Нет"}
      </Badge>
    )},
    { accessorKey: "created_at", header: "Создан", cell: (row: Product) => new Date(row.created_at).toLocaleDateString() },
  ], [categories]);

  const handleAddNew = () => {
    if (!pageSelectedCategoryId) {
      toast({ title: "Ошибка", description: "Сначала выберите категорию.", variant: "destructive" });
      return;
    }
    setEditingProduct(null);
    setModalFormCategoryId(pageSelectedCategoryId);
    setModalFormPostPaymentAction('auto_fulfillment'); // Default action
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalFormCategoryId(product.category_id);
    setModalFormPostPaymentAction(product.post_payment_action || 'auto_fulfillment');
    setIsModalOpen(true);
  };

  const handleDelete = async (product: Product) => {
    await fetch("/products/api", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product.id }),
    });
    setProducts(prev => prev.filter(p => p.id !== product.id));
    toast({ title: "Товар удален", description: `Товар \"${product.name}\" был удален.` });
  };
  
  const handleSaveProduct = async (formData: FormData) => {
    const imageUrl = formData.get('image_url') as string;
    const newProductData: Omit<Product, 'id'> & { id?: number } = {
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      category_id: modalFormCategoryId!,
      active: formData.get('active') === 'on',
      created_at: editingProduct?.created_at || new Date().toISOString(),
      image: imageUrl || editingProduct?.image || `https://placehold.co/100x100.png?text=${encodeURIComponent(formData.get('name') as string || 'Товар')}`,
      "data-ai-hint": formData.get('data-ai-hint') as string || "product item",
      post_payment_action: modalFormPostPaymentAction,
    };

    if (editingProduct) {
      // Обновление
      const res = await fetch("/products/api", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newProductData, id: editingProduct.id }),
      });
      const updated = await res.json();
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
      toast({ title: "Товар обновлен", description: `Товар \"${updated.name}\" обновлен.` });
    } else {
      // Создание
      const res = await fetch("/products/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProductData),
      });
      const created = await res.json();
      setProducts(prev => [created, ...prev]);
      toast({ title: "Товар добавлен", description: `Товар \"${created.name}\" добавлен.` });
    }
    setIsModalOpen(false);
    setEditingProduct(null);
    setModalFormCategoryId(undefined);
    setModalFormPostPaymentAction('auto_fulfillment');
  };


  return (
    <>
      <PageHeader 
        title={pageSelectedCategoryId ? `Товары в категории: ${selectedCategoryName}` : "Товары"}
        description={pageSelectedCategoryId ? "Управление товарами в выбранной категории." : "Выберите категорию для просмотра и управления товарами."}
      >
        {pageSelectedCategoryId && (
          <Button onClick={handleAddNew}>Добавить товар</Button>
        )}
      </PageHeader>

      <div className="mb-6">
        <Label htmlFor="category-page-select" className="text-lg font-semibold">Выберите категорию:</Label>
        <Select
          value={pageSelectedCategoryId || ""}
          onValueChange={(value) => setPageSelectedCategoryId(value || null)}
        >
          <SelectTrigger id="category-page-select" className="mt-2">
            <SelectValue placeholder="-- Выберите категорию --" />
          </SelectTrigger>
          <SelectContent>
            {activeCategoriesForSelect.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
            {activeCategoriesForSelect.length === 0 && (
              <SelectItem value="no-active-categories" disabled>Нет активных категорий</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {pageSelectedCategoryId ? (
        <DataTable
          columns={columns}
          data={filteredProducts}
          searchKey="name"
          onEdit={handleEdit}
          onDelete={handleDelete} 
          entityName="Товар"
        />
      ) : (
        <Alert className="mt-4 border-blue-300 bg-blue-50 text-blue-700 [&>svg]:text-blue-700">
            <Info className="h-5 w-5" />
            <AlertTitle>Информация</AlertTitle>
            <AlertDescription>
                Пожалуйста, выберите категорию выше, чтобы просмотреть список товаров или добавить новый товар в эту категорию.
            </AlertDescription>
        </Alert>
      )}

      <Dialog open={isModalOpen} onOpenChange={(isOpen) => {
        setIsModalOpen(isOpen);
        if (!isOpen) {
          setEditingProduct(null);
          setModalFormCategoryId(undefined);
          setModalFormPostPaymentAction('auto_fulfillment');
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <form action={handleSaveProduct}>
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Редактировать товар" : "Добавить новый товар"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Измените данные этого товара." : `Введите данные для нового товара в категории "${categories.find(c=>c.id === modalFormCategoryId)?.name || ''}".`}
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
                <Label htmlFor="category_id_modal_select" className="text-right">Категория</Label>
                <Select
                  value={modalFormCategoryId}
                  onValueChange={setModalFormCategoryId}
                >
                  <SelectTrigger id="category_id_modal_select" className="col-span-3">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeCategoriesForSelect.length > 0 ? (
                      activeCategoriesForSelect.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-active-categories-modal" disabled>Нет активных категорий</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="post_payment_action" className="text-right">Действие после оплаты</Label>
                <Select
                  value={modalFormPostPaymentAction}
                  onValueChange={(value) => setModalFormPostPaymentAction(value as PostPaymentAction)}
                >
                  <SelectTrigger id="post_payment_action" className="col-span-3">
                    <SelectValue placeholder="Выберите действие" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto_fulfillment">{postPaymentActionLabels.auto_fulfillment}</SelectItem>
                    <SelectItem value="chat_with_manager">{postPaymentActionLabels.chat_with_manager}</SelectItem>
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
                 setModalFormCategoryId(undefined);
                 setModalFormPostPaymentAction('auto_fulfillment');
              }}>Отмена</Button>
              <Button type="submit">Сохранить товар</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

