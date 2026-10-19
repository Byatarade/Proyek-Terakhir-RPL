import { KitchenOrder } from "@/lib/kitchen/actions";

export interface KitchenDisplayProps {
  initialOrders: KitchenOrder[];
  storeName: string;
  storeSlug: string;
}

export type KitchenFilterType = "all" | "dibayar" | "diproses" | "siap";
export type ConnectionStatus = "connected" | "connecting" | "disconnected";

export interface KitchenHeaderProps {
  storeName: string;
  storeSlug: string;
  connectionStatus: ConnectionStatus;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isRefreshing: boolean;
  onRefresh: () => void;
}

export interface KitchenFilterStatsProps {
  activeFilter: KitchenFilterType;
  onSelectFilter: (filter: KitchenFilterType) => void;
  totalOrders: number;
  countWaiting: number;
  countCooking: number;
  countReady: number;
}

export interface KitchenOrderCardProps {
  order: KitchenOrder;
  isProcessing: boolean;
  isCalled: boolean;
  isNew: boolean;
  onStartCooking: (orderId: string) => void;
  onMarkReady: (orderId: string) => void;
  onRecallCustomer: (orderId: string) => void;
}
