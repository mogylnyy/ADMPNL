"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface ColumnDefinition<T> {
  accessorKey: keyof T | string; // Allow dot notation for nested props e.g. user.name
  header: string;
  cell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: ColumnDefinition<T>[];
  data: T[];
  searchKey?: keyof T | string;
  onAddNew?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  addNewButtonText?: string;
  entityName?: string; // For delete confirmation
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  searchKey,
  onAddNew,
  onEdit,
  onDelete,
  onView,
  addNewButtonText = "Add New",
  entityName = "item",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [itemToDelete, setItemToDelete] = React.useState<T | null>(null);
  const { toast } = useToast();

  const filteredData = React.useMemo(() => {
    if (!searchKey || !searchTerm) return data;
    return data.filter((item) => {
      const value = String(item[searchKey as keyof T] ?? '').toLowerCase();
      return value.includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm, searchKey]);

  const handleDeleteConfirm = () => {
    if (itemToDelete) {
      // Actual delete logic would go here
      toast({
        title: `${entityName} Deleted`,
        description: `The ${entityName} "${itemToDelete.id}" has been notionally deleted.`,
      });
      setItemToDelete(null);
      // You would typically refetch or update data here
    }
  };
  
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        {searchKey && (
          <Input
            placeholder={`Search by ${String(searchKey)}...`}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="max-w-sm"
          />
        )}
        {onAddNew && (
          <Button onClick={onAddNew}>{addNewButtonText}</Button>
        )}
      </div>
      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.accessorKey)}>{column.header}</TableHead>
              ))}
              {(onEdit || onDelete || onView) && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length ? (
              filteredData.map((row) => (
                <TableRow key={row.id}>
                  {columns.map((column) => (
                    <TableCell key={String(column.accessorKey)}>
                      {column.cell ? column.cell(row) : String(getNestedValue(row, String(column.accessorKey)) ?? '')}
                    </TableCell>
                  ))}
                  {(onEdit || onDelete || onView) && (
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          {onView && <DropdownMenuItem onClick={() => onView(row)}><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>}
                          {onEdit && <DropdownMenuItem onClick={() => onEdit(row)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>}
                          {onDelete && <DropdownMenuSeparator />}
                          {onDelete && <DropdownMenuItem onClick={() => setItemToDelete(row)} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + ((onEdit || onDelete) ? 1 : 0)} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {itemToDelete && (
        <AlertDialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the {entityName}
                &nbsp;with ID "{itemToDelete.id}".
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
