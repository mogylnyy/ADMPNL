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
  accessorKey: keyof T | string; 
  header: string;
  cell?: (row: T) => React.ReactNode;
}

interface DataTableProps<T extends { id: string }> {
  columns: ColumnDefinition<T>[];
  data: T[];
  searchKey?: keyof T | string;
  onAddNew?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onView?: (item: T) => void;
  addNewButtonText?: string;
  entityName?: string; 
}

const searchKeyDisplayNames: Record<string, string> = {
  name: "названию",
  username: "имени пользователя",
  user_username: "имени пользователя",
  id: "ID",
};

export function DataTable<T extends { id: string }>({
  columns,
  data,
  searchKey,
  onAddNew,
  onEdit,
  onDelete,
  onView,
  addNewButtonText = "Добавить",
  entityName = "элемент",
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [itemToDelete, setItemToDelete] = React.useState<T | null>(null);
  // const { toast } = useToast(); // Toast for deletion is handled by parent component via onDelete prop

  const filteredData = React.useMemo(() => {
    if (!searchKey || !searchTerm) return data;
    return data.filter((item) => {
      const value = String(item[searchKey as keyof T] ?? '').toLowerCase();
      return value.includes(searchTerm.toLowerCase());
    });
  }, [data, searchTerm, searchKey]);

  const handleDeleteConfirm = () => {
    if (itemToDelete && onDelete) {
      onDelete(itemToDelete);
    }
    setItemToDelete(null);
  };
  
  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  const getSearchPlaceholder = () => {
    if (!searchKey) return "Поиск...";
    const displayName = searchKeyDisplayNames[String(searchKey)] || String(searchKey);
    return `Поиск по ${displayName}...`;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        {searchKey && (
          <Input
            placeholder={getSearchPlaceholder()}
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
              {(onEdit || onDelete || onView) && <TableHead>Действия</TableHead>}
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
                            <span className="sr-only">Открыть меню</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Действия</DropdownMenuLabel>
                          {onView && <DropdownMenuItem onClick={() => onView(row)}><Eye className="mr-2 h-4 w-4" /> Просмотреть</DropdownMenuItem>}
                          {onEdit && <DropdownMenuItem onClick={() => onEdit(row)}><Edit className="mr-2 h-4 w-4" /> Изменить</DropdownMenuItem>}
                          {onDelete && <DropdownMenuSeparator />}
                          {onDelete && <DropdownMenuItem onClick={() => setItemToDelete(row)} className="text-destructive focus:text-destructive focus:bg-destructive/10"><Trash2 className="mr-2 h-4 w-4" /> Удалить</DropdownMenuItem>}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + ((onEdit || onDelete || onView) ? 1 : 0)} className="h-24 text-center">
                  Нет данных.
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
              <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
              <AlertDialogDescription>
                Это действие необратимо. {entityName || 'Элемент'} с ID "{itemToDelete.id}" будет удален(а) окончательно.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
                Удалить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
