import { CategoryData, ProductData, SaveProductInput } from "@/lib/menu/actions";

export interface ProductManagementProps {
  initialCategories: CategoryData[];
  initialProducts: ProductData[];
  storeSlug: string;
  storeName: string;
}

export type StatusFilterType = "all" | "available" | "unavailable" | "hidden" | "best_seller";

export interface ProductStatCardsProps {
  totalProducts: number;
  totalAvailable: number;
  totalUnavailable: number;
  totalHidden: number;
  totalBestSeller?: number;
}

export interface ProductFilterBarProps {
  categories: CategoryData[];
  products: ProductData[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: StatusFilterType;
  onStatusFilterChange: (status: StatusFilterType) => void;
}

export interface ProductTableProps {
  products: ProductData[];
  onToggleAvailability: (product: ProductData) => void;
  onToggleActive: (product: ProductData) => void;
  onToggleBestSeller: (product: ProductData) => void;
  onEditProduct: (product: ProductData) => void;
  onDeleteProduct: (product: ProductData) => void;
}

export interface DeleteProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductData | null;
  isPending: boolean;
  onConfirm: () => void;
}

export interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: ProductData | null;
  categories: CategoryData[];
  productForm: SaveProductInput;
  setProductForm: React.Dispatch<React.SetStateAction<SaveProductInput>>;
  formError: string | null;
  isPending: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryData[];
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  editingCategory: { id: string; name: string } | null;
  setEditingCategory: (cat: { id: string; name: string } | null) => void;
  isPending: boolean;
  onAddCategory: (e: React.FormEvent) => void;
  onUpdateCategory: (id: string, name: string) => void;
  onDeleteCategory: (id: string, name: string) => void;
}
