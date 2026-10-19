import React, { useMemo } from "react";
import { Search } from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import { ProfitLossReportData } from "@/lib/finance/actions";

interface ProductSalesTabProps {
  productSales: ProfitLossReportData["productSales"];
  productSearchQuery: string;
  onProductSearchQueryChange: (q: string) => void;
}

export function ProductSalesTab({
  productSales,
  productSearchQuery,
  onProductSearchQueryChange,
}: ProductSalesTabProps) {
  // Filtered products list
  const filteredProducts = useMemo(() => {
    return productSales.filter((prod) =>
      prod.productName.toLowerCase().includes(productSearchQuery.toLowerCase())
    );
  }, [productSales, productSearchQuery]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/70 p-4 rounded-2xl border border-[var(--line)]">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama menu..."
            value={productSearchQuery}
            onChange={(e) => onProductSearchQueryChange(e.target.value)}
            className="h-9 pl-9 pr-3 rounded-[8px] border-2 border-[var(--control)] bg-white text-xs text-zinc-900 focus:outline-none focus:border-[var(--leaf)] w-64"
          />
        </div>

        <div className="text-xs text-zinc-500 font-medium">
          Total {productSales.length} menu terjual pada periode ini
        </div>
      </div>

      <div className="bg-white border border-[var(--line)] rounded-2xl overflow-hidden shadow-xs">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-xs text-zinc-400">
            Belum ada data penjualan produk pada periode yang dipilih.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[var(--surface-2)] text-[var(--forest)] font-semibold border-b border-[var(--line)]">
                  <th className="py-3 px-4">Nama Menu</th>
                  <th className="py-3 px-3 text-center">Porsi Terjual</th>
                  <th className="py-3 px-4 text-right">Total Penjualan</th>
                  <th className="py-3 px-4 text-right">Total Modal (HPP)</th>
                  <th className="py-3 px-4 text-right">Laba Kotor</th>
                  <th className="py-3 px-4 text-right">Margin (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredProducts.map((p) => (
                  <tr
                    key={p.productName}
                    className="hover:bg-zinc-50 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-zinc-900">
                      {p.productName}
                    </td>
                    <td className="py-3 px-3 text-center font-mono tabular-nums font-bold text-[var(--leaf)]">
                      {p.qtySold}×
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-zinc-900 font-mono tabular-nums">
                      {formatRupiah(p.totalRevenue)}
                    </td>
                    <td className="py-3 px-4 text-right text-zinc-500 font-mono tabular-nums">
                      {formatRupiah(p.totalCost)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-[var(--forest)] font-mono tabular-nums">
                      {formatRupiah(p.grossProfit)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-[6px] text-[10px] font-bold border",
                          p.profitMargin >= 30
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                            : "bg-amber-50 text-amber-800 border-amber-300"
                        )}
                      >
                        {p.profitMargin.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-zinc-50/80 font-bold border-t-2 border-[var(--line)]">
                  <td className="py-3 px-4 text-zinc-900">Total Penjualan:</td>
                  <td className="py-3 px-3 text-center text-zinc-900 font-mono">
                    {filteredProducts.reduce((sum, p) => sum + p.qtySold, 0)}×
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-900 font-mono tabular-nums">
                    {formatRupiah(
                      filteredProducts.reduce(
                        (sum, p) => sum + p.totalRevenue,
                        0
                      )
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-zinc-500 font-mono tabular-nums">
                    {formatRupiah(
                      filteredProducts.reduce((sum, p) => sum + p.totalCost, 0)
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-[var(--forest)] font-mono tabular-nums">
                    {formatRupiah(
                      filteredProducts.reduce(
                        (sum, p) => sum + p.grossProfit,
                        0
                      )
                    )}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
