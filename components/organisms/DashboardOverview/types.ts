import { ExpenseItem, SaveExpenseInput } from "@/lib/finance/actions";
import { DashboardProductProfit } from "@/app/dashboard/page";

export interface DashboardOverviewProps {
  storeName?: string;
  storeSlug: string;
  isOpen: boolean;
  role?: string;
  // Today stats
  todaySales?: number;
  todayCogs?: number;
  todayGrossProfit?: number;
  todayExpenses?: number;
  todayNetProfit?: number;
  todayOrdersCount?: number;
  activeOrdersCount?: number;
  // Month stats
  monthSales?: number;
  monthCogs?: number;
  monthGrossProfit?: number;
  monthExpenses?: number;
  monthNetProfit?: number;
  monthOrdersCount?: number;
  // Recent items
  recentExpenses?: ExpenseItem[];
  topProducts?: DashboardProductProfit[];
}

export type PeriodView = "today" | "month";

export interface DashboardHeaderProps {
  storeName: string;
  storeSlug: string;
  currentDateFormatted: string;
}

export interface DashboardStatCardsProps {
  todaySales: number;
  todayOrdersCount: number;
  todayNetProfit: number;
  todayGrossProfit: number;
  activeOrdersCount: number;
  isOpen: boolean;
  isOwner: boolean;
}

export interface ProfitLossSectionProps {
  periodView: PeriodView;
  setPeriodView: (period: PeriodView) => void;
  currentMonthFormatted: string;
  currentDateFormatted: string;
  activeSales: number;
  activeCogs: number;
  activeGrossProfit: number;
  activeExpenses: number;
  activeNetProfit: number;
  activeOrders: number;
  grossMargin: number;
  netMargin: number;
  recentExpenses: ExpenseItem[];
  topProducts: DashboardProductProfit[];
  onOpenQuickExpense: () => void;
}

export interface QuickExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseForm: SaveExpenseInput;
  setExpenseForm: React.Dispatch<React.SetStateAction<SaveExpenseInput>>;
  expenseError: string | null;
  isPending: boolean;
  onSubmit: (e: React.FormEvent) => void;
}
