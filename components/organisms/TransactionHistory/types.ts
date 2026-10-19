import {
  TransactionRecord,
  TransactionsResponse,
} from "@/lib/transactions/actions";
import { OrderStatus } from "@/lib/types/database";

export interface TransactionHistoryProps {
  initialData: TransactionsResponse;
}

export type DatePreset = "all" | "today" | "7days" | "30days";

export const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; variant: "mint" | "forest" | "leaf" | "amber" | "neutral" | "danger" | "blue" }
> = {
  menunggu_bayar: { label: "Menunggu Bayar", variant: "amber" },
  dibayar: { label: "Sudah Dibayar", variant: "blue" },
  diproses: { label: "Sedang Dimasak", variant: "forest" },
  siap: { label: "Siap Diambil", variant: "mint" },
  diambil: { label: "Selesai (Diambil)", variant: "neutral" },
  dibatalkan: { label: "Dibatalkan", variant: "danger" },
  kedaluwarsa: { label: "Kedaluwarsa", variant: "neutral" },
};

export interface TransactionStatCardsProps {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

export interface TransactionFilterBarProps {
  datePreset: string;
  onFilterChange: (preset: string, status?: string, payment?: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearch: (e: React.FormEvent) => void;
  selectedStatus: string;
  selectedPayment: string;
}

export interface TransactionTableProps {
  transactions: TransactionRecord[];
  onSelectOrder: (order: TransactionRecord) => void;
}

export interface TransactionReceiptModalProps {
  selectedOrder: TransactionRecord | null;
  onClose: () => void;
}
