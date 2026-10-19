import {
  CashierCatalog,
  CashierProductItem,
  CreatedWalkinOrderResult,
} from "@/lib/cashier/actions";

export interface CartItem {
  product: CashierProductItem;
  qty: number;
}

export interface SuccessOrderState {
  result: CreatedWalkinOrderResult;
  items: CartItem[];
  paidMethod: "cash" | "qris";
  cashReceived: number;
  changeAmount: number;
  createdAt: string;
}

export interface CashierPosStationProps {
  initialCatalog: CashierCatalog;
  storeName: string;
  storeSlug: string;
  storeQris?: {
    acceptQris: boolean;
    qrisMerchantName: string | null;
    qrisPayload: string | null;
  };
}
