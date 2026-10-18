import { useState, useEffect } from "react";
import { CashierOrder, getCashierOrdersAction } from "@/lib/cashier/actions";

/**
 * Hook: useOrderPolling
 * Melakukan polling pesanan kasir setiap 5 detik (FR-KS-01).
 * Mengembalikan state orders dan fungsi refresh manual.
 */
export function useOrderPolling(initialOrders: CashierOrder[]) {
  const [orders, setOrders] = useState<CashierOrder[]>(initialOrders);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  useEffect(() => {
    async function refreshOrders() {
      const res = await getCashierOrdersAction();
      if (res.success && res.data) {
        setOrders(res.data);
        setLastUpdated(new Date());
      }
    }

    const interval = setInterval(refreshOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    const res = await getCashierOrdersAction();
    if (res.success && res.data) {
      setOrders(res.data);
      setLastUpdated(new Date());
    }
    setIsRefreshing(false);
  };

  return { orders, setOrders, isRefreshing, lastUpdated, handleManualRefresh };
}
