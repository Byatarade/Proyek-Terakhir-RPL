import {
  CashierCatalog,
  CashierProductItem,
  CreatedWalkinOrderResult,
  CashierOrder,
} from "@/lib/cashier/actions";

export interface CartItem {
  product: CashierProductItem;
  qty: number;
}

export interface CreatedOrderResultState {
  result: CreatedWalkinOrderResult;
  items: CartItem[];
}

export interface CashierPosModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: CashierCatalog;
  storeName: string;
  onOrderCreated: (
    orderResult: CreatedWalkinOrderResult,
    cartItems: CartItem[]
  ) => void;
  onPrintReceipt?: (order: CashierOrder) => void;
  onCallQueueVoice?: (queueNumber: number) => void;
}
