
"use client";

import * as React from "react";
import type { Product, Category } from "@/types";
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
  { id: "prod_4", code: "SUB003", name: "Месячная подписка (Архив)", description: "Старая месячная подписка.", price: 799.00, category_id: "cat_3", active: false, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png", "data-ai-hint": "legacy subscription" },
];

export function ProductsClient() {
  const [products, setProducts] = React.useState<Product[]>(mockProducts);
  const [categories] = React.useState<Category[]>(mockCategories); // Categories are static for now
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  
  const [pageSelectedCategoryId, setPageSelectedCategoryId] = React.useState<string | null>(null);
  const [modalFormCategoryId, setModalFormCategoryId] = React.useState<string | undefined>(undefined);
  
  const { toast } = useToast();

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
    // Категория теперь известна из контекста выбранной категории, но оставим для информации если нужно будет показывать все товары
    // {
    //   accessorKey: "category_id",
    //   header: "Категория",
    //   cell: (row: Product) => categories.find(cat => cat.id === row.category_id)?.name || row.category_id
    // },
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
    setModalFormCategoryId(pageSelectedCategoryId); // Pre-fill category from page context
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setModalFormCategoryId(product.category_id);
    setIsModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    setProducts(prev => prev.filter(p => p.id !== product.id));
    toast({ title: "Товар удален", description: `Товар "${product.name}" был удален.` });
  };
  
  const handleSaveProduct = (formData: FormData) => {
    const imageUrl = formData.get('image_url') as string;

    if (!modalFormCategoryId) { // This check should ideally not be needed if modalFormCategoryId is always set
      toast({
        title: "Ошибка",
        description: "Категория не выбрана в форме.", // Should be pre-filled
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
      category_id: modalFormCategoryId, // Use category from modal form state
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
    setModalFormCategoryId(undefined); // Reset modal category state
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
          // onAddNew и addNewButtonText убраны, так как кнопка "Добавить" находится в PageHeader
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
          setModalFormCategoryId(undefined); // Reset on close
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <form action={handleSaveProduct}>
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Редактировать товар" : "Добавить новый товар"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Измените данные этого товара." : `Введите данные для нового товара в категории "${selectedCategoryName}".`}
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
                  value={modalFormCategoryId} // Use state for modal's category select
                  onValueChange={setModalFormCategoryId}
                  // If adding new product, this will be pre-filled by pageSelectedCategoryId
                  // For simplicity, we allow changing category here. It could be disabled for new products.
                >
                  <SelectTrigger id="category_id_modal_select" className="col-span-3">
                    <SelectValue placeholder="Выберите категорию" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Show all active categories in modal, pre-select based on context */}
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
                 setModalFormCategoryId(undefined); // Reset on cancel
              }}>Отмена</Button>
              <Button type="submit">Сохранить товар</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

