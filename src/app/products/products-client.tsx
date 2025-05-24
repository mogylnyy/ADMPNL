"use client";

import * as React from "react";
import type { Product } from "@/types";
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
import { Textarea } from "@/components/ui/textarea"; // Assuming you have this from shadcn

// Mock Data
const mockProducts: Product[] = [
  { id: "prod_1", code: "SUB001", name: "Basic Subscription", description: "Monthly access to basic features.", price: 9.99, category_id: "cat_1", active: true, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png?text=Basic" },
  { id: "prod_2", code: "SUB002", name: "Premium Subscription", description: "Monthly access to all features.", price: 19.99, category_id: "cat_1", active: true, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png?text=Premium" },
  { id: "prod_3", code: "ADDON001", name: "Extra Storage", description: "10GB additional storage.", price: 5.00, category_id: "cat_2", active: false, created_at: new Date().toISOString(), image: "https://placehold.co/100x100.png?text=Storage" },
];

export function ProductsClient() {
  const [products, setProducts] = React.useState<Product[]>(mockProducts);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
  const { toast } = useToast();

  const columns = React.useMemo(() => [
    { accessorKey: "name", header: "Name", cell: (row: Product) => (
      <div className="flex items-center gap-2">
        {row.image && <img src={row.image} alt={row.name} data-ai-hint="product item" className="h-10 w-10 rounded-md object-cover" />}
        <span>{row.name}</span>
      </div>
    )},
    { accessorKey: "code", header: "Code" },
    { accessorKey: "price", header: "Price", cell: (row: Product) => `$${row.price.toFixed(2)}` },
    { accessorKey: "category_id", header: "Category ID" }, // In a real app, this would be category name
    { accessorKey: "active", header: "Active", cell: (row: Product) => (
      <Badge variant={row.active ? "default" : "secondary"} className={row.active ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
        {row.active ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
        {row.active ? "Yes" : "No"}
      </Badge>
    )},
    { accessorKey: "created_at", header: "Created At", cell: (row: Product) => new Date(row.created_at).toLocaleDateString() },
  ], []);

  const handleAddNew = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (product: Product) => {
    // Placeholder: In a real app, call API to delete
    setProducts(prev => prev.filter(p => p.id !== product.id));
    toast({ title: "Product Deleted", description: `Product "${product.name}" has been deleted.` });
  };
  
  const handleSaveProduct = (formData: FormData) => {
    const newProductData = {
      id: editingProduct?.id || `prod_${Date.now()}`,
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      category_id: formData.get('category_id') as string,
      active: formData.get('active') === 'on',
      created_at: editingProduct?.created_at || new Date().toISOString(),
      image: editingProduct?.image || "https://placehold.co/100x100.png?text=New"
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? newProductData : p));
      toast({ title: "Product Updated", description: `Product "${newProductData.name}" updated.` });
    } else {
      setProducts(prev => [newProductData, ...prev]);
      toast({ title: "Product Added", description: `Product "${newProductData.name}" added.` });
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };


  return (
    <>
      <PageHeader title="Products" description="Manage your store's products.">
        <Button onClick={handleAddNew}>Add New Product</Button>
      </PageHeader>
      <DataTable
        columns={columns}
        data={products}
        searchKey="name"
        onEdit={handleEdit}
        onDelete={handleDelete} // This will be handled by the generic DataTable's confirmation
        addNewButtonText="Add New Product"
        entityName="Product"
      />
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form action={handleSaveProduct}>
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              <DialogDescription>
                {editingProduct ? "Modify the details of this product." : "Enter the details for the new product."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" name="name" defaultValue={editingProduct?.name} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">Code</Label>
                <Input id="code" name="code" defaultValue={editingProduct?.code} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Description</Label>
                <Textarea id="description" name="description" defaultValue={editingProduct?.description} className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Price</Label>
                <Input id="price" name="price" type="number" step="0.01" defaultValue={editingProduct?.price} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category_id" className="text-right">Category ID</Label>
                <Input id="category_id" name="category_id" defaultValue={editingProduct?.category_id} className="col-span-3" required />
              </div>
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">Active</Label>
                <div className="col-span-3">
                   <input type="checkbox" id="active" name="active" defaultChecked={editingProduct?.active === undefined ? true : editingProduct.active} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
