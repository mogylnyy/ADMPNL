
"use client";

import * as React from "react";
import type { Category } from "@/types";
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

// Mock Data
const mockCategories: Category[] = [
  { id: "cat_1", code: "SUBS", name: "Подписки", description: "Основные подписки на товары.", active: true, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png", "data-ai-hint": "subscriptions services" },
  { id: "cat_2", code: "ADDONS", name: "Дополнения", description: "Дополнительные услуги и функции.", active: true, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png", "data-ai-hint": "addons features" },
  { id: "cat_3", code: "LEGACY", name: "Архивные товары", description: "Старые, неподдерживаемые товары.", active: false, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png", "data-ai-hint": "archive old" },
];

export function CategoriesClient() {
  const [categories, setCategories] = React.useState<Category[]>(mockCategories);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const { toast } = useToast();
  
  const columns = React.useMemo(() => [
    { accessorKey: "name", header: "Название", cell: (row: Category) => (
      <div className="flex items-center gap-2">
        {row.image && <img src={row.image} alt={row.name} data-ai-hint={row["data-ai-hint"] || "category item"} className="h-10 w-10 rounded-md object-cover" />}
        <span>{row.name}</span>
      </div>
    )},
    { accessorKey: "code", header: "Код" },
    { accessorKey: "description", header: "Описание" },
    { accessorKey: "active", header: "Активна", cell: (row: Category) => (
      <Badge variant={row.active ? "default" : "secondary"} className={row.active ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
        {row.active ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
        {row.active ? "Да" : "Нет"}
      </Badge>
    )},
    { accessorKey: "created_at", header: "Создана", cell: (row: Category) => new Date(row.created_at).toLocaleDateString() },
  ], []);

  const handleAddNew = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setCategories(prev => prev.filter(c => c.id !== category.id));
    toast({ title: "Категория удалена", description: `Категория "${category.name}" была удалена.` });
  };
  
  const handleSaveCategory = (formData: FormData) => {
    const imageUrl = formData.get('image_url') as string;
    const newCategoryData: Category = {
      id: editingCategory?.id || `cat_${Date.now()}`,
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      active: formData.get('active') === 'on',
      created_at: editingCategory?.created_at || new Date().toISOString(),
      image: imageUrl || editingCategory?.image || "https://placehold.co/100x100.png",
      "data-ai-hint": formData.get('data-ai-hint') as string || "category item"
    };

    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? newCategoryData : c));
      toast({ title: "Категория обновлена", description: `Категория "${newCategoryData.name}" обновлена.` });
    } else {
      setCategories(prev => [newCategoryData, ...prev]);
      toast({ title: "Категория добавлена", description: `Категория "${newCategoryData.name}" добавлена.` });
    }
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <>
      <PageHeader title="Категории" description="Управление категориями товаров.">
        <Button onClick={handleAddNew}>Добавить категорию</Button>
      </PageHeader>
      <DataTable
        columns={columns}
        data={categories}
        searchKey="name"
        onEdit={handleEdit}
        onDelete={handleDelete}
        addNewButtonText="Добавить категорию"
        entityName="Категория"
      />
       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form action={handleSaveCategory}>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Редактировать категорию" : "Добавить новую категорию"}</DialogTitle>
              <DialogDescription>
                {editingCategory ? "Измените данные этой категории." : "Введите данные для новой категории."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Название</Label>
                <Input id="name" name="name" defaultValue={editingCategory?.name} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">Код</Label>
                <Input id="code" name="code" defaultValue={editingCategory?.code} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Описание</Label>
                <Textarea id="description" name="description" defaultValue={editingCategory?.description} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image_url" className="text-right">URL изображения</Label>
                <Input id="image_url" name="image_url" defaultValue={editingCategory?.image} className="col-span-3" placeholder="https://placehold.co/100x100.png"/>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="data-ai-hint" className="text-right">Подсказка для ИИ</Label>
                <Input id="data-ai-hint" name="data-ai-hint" defaultValue={editingCategory?.["data-ai-hint"]} className="col-span-3" placeholder="Ключевые слова (макс 2)" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">Активна</Label>
                 <div className="col-span-3">
                    <input type="checkbox" id="active" name="active" defaultChecked={editingCategory?.active === undefined ? true : editingCategory.active} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                 </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Отмена</Button>
              <Button type="submit">Сохранить категорию</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

    