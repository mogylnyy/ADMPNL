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
  { id: "cat_1", code: "SUBS", name: "Subscriptions", description: "Main product subscriptions.", active: true, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png?text=Subs" },
  { id: "cat_2", code: "ADDONS", name: "Add-ons", description: "Additional services and features.", active: true, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png?text=Addons" },
  { id: "cat_3", code: "LEGACY", name: "Legacy Products", description: "Older, unsupported products.", active: false, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png?text=Legacy" },
];

export function CategoriesClient() {
  const [categories, setCategories] = React.useState<Category[]>(mockCategories);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const { toast } = useToast();
  
  const columns = React.useMemo(() => [
    { accessorKey: "name", header: "Name", cell: (row: Category) => (
      <div className="flex items-center gap-2">
        {row.image && <img src={row.image} alt={row.name} data-ai-hint="category item" className="h-10 w-10 rounded-md object-cover" />}
        <span>{row.name}</span>
      </div>
    )},
    { accessorKey: "code", header: "Code" },
    { accessorKey: "description", header: "Description" },
    { accessorKey: "active", header: "Active", cell: (row: Category) => (
      <Badge variant={row.active ? "default" : "secondary"} className={row.active ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
        {row.active ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
        {row.active ? "Yes" : "No"}
      </Badge>
    )},
    { accessorKey: "created_at", header: "Created At", cell: (row: Category) => new Date(row.created_at).toLocaleDateString() },
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
    toast({ title: "Category Deleted", description: `Category "${category.name}" has been deleted.` });
  };
  
  const handleSaveCategory = (formData: FormData) => {
    const newCategoryData = {
      id: editingCategory?.id || `cat_${Date.now()}`,
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      active: formData.get('active') === 'on',
      created_at: editingCategory?.created_at || new Date().toISOString(),
      image: editingCategory?.image || "https://placehold.co/100x100.png?text=New"
    };

    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === editingCategory.id ? newCategoryData : c));
      toast({ title: "Category Updated", description: `Category "${newCategoryData.name}" updated.` });
    } else {
      setCategories(prev => [newCategoryData, ...prev]);
      toast({ title: "Category Added", description: `Category "${newCategoryData.name}" added.` });
    }
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <>
      <PageHeader title="Categories" description="Manage product categories.">
        <Button onClick={handleAddNew}>Add New Category</Button>
      </PageHeader>
      <DataTable
        columns={columns}
        data={categories}
        searchKey="name"
        onEdit={handleEdit}
        onDelete={handleDelete}
        addNewButtonText="Add New Category"
        entityName="Category"
      />
       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form action={handleSaveCategory}>
            <DialogHeader>
              <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
              <DialogDescription>
                {editingCategory ? "Modify the details of this category." : "Enter the details for the new category."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" defaultValue={editingCategory?.name} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">Code</Label>
                <Input id="code" name="code" defaultValue={editingCategory?.code} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" name="description" defaultValue={editingCategory?.description} className="col-span-3" />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">Active</Label>
                 <div className="col-span-3">
                    <input type="checkbox" id="active" name="active" defaultChecked={editingCategory?.active === undefined ? true : editingCategory.active} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                 </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Category</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
