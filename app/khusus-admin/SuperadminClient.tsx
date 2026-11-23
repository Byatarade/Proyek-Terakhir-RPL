"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  DollarSign,
  Store,
  TrendingUp,
  Search,
  ExternalLink,
  Power,
  Trash2,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import {
  SuperadminDashboardMetrics,
  SuperadminStoreItem,
  toggleStoreStatusAction,
  deleteStoreAction,
  logoutSuperadminAction,
} from "@/lib/superadmin/actions";

interface SuperadminClientProps {
  initialMetrics: SuperadminDashboardMetrics;
  initialStores: SuperadminStoreItem[];
  adminEmail: string;
}

export function SuperadminClient({
  initialMetrics,
  initialStores,
  adminEmail,
}: SuperadminClientProps) {
  const [stores, setStores] = useState<SuperadminStoreItem[]>(initialStores);
  const [metrics, setMetrics] = useState<SuperadminDashboardMetrics>(initialMetrics);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [deleteModalStore, setDeleteModalStore] = useState<SuperadminStoreItem | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Filtered stores
  const filteredStores = stores.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      s.name.toLowerCase().includes(q) ||
      s.slug.toLowerCase().includes(q) ||
      s.owner_name.toLowerCase().includes(q) ||
      s.owner_email.toLowerCase().includes(q);

    const matchStatus =
      selectedStatusFilter === "all" ||
      (selectedStatusFilter === "open" && s.is_open) ||
      (selectedStatusFilter === "closed" && !s.is_open);

    return matchSearch && matchStatus;
  });

  // Handle toggle open/close status
  const handleToggleStatus = (store: SuperadminStoreItem) => {
    const newStatus = !store.is_open;
    startTransition(async () => {
      const res = await toggleStoreStatusAction(store.id, newStatus);
      if (res.success) {
        setStores((prev) =>
          prev.map((s) => (s.id === store.id ? { ...s, is_open: newStatus } : s))
        );
        setMetrics((prev) => ({
          ...prev,
          openStores: newStatus ? prev.openStores + 1 : Math.max(0, prev.openStores - 1),
          closedStores: newStatus ? Math.max(0, prev.closedStores - 1) : prev.closedStores + 1,
        }));
        showToast(
          "success",
          `Status toko "${store.name}" diubah menjadi ${newStatus ? "BUKA" : "TUTUP"}.`
        );
      } else {
        showToast("error", res.error || "Gagal memperbarui status toko.");
      }
    });
  };

  // Handle delete store
  const handleDeleteStore = () => {
    if (!deleteModalStore) return;
    const target = deleteModalStore;

    startTransition(async () => {
      const res = await deleteStoreAction(target.id);
      if (res.success) {
        setStores((prev) => prev.filter((s) => s.id !== target.id));
        setMetrics((prev) => ({
          ...prev,
          totalStores: Math.max(0, prev.totalStores - 1),
          openStores: target.is_open ? Math.max(0, prev.openStores - 1) : prev.openStores,
          closedStores: !target.is_open ? Math.max(0, prev.closedStores - 1) : prev.closedStores,
          totalOrders: Math.max(0, prev.totalOrders - target.orders_count),
          totalPlatformRevenue: Math.max(0, prev.totalPlatformRevenue - target.total_revenue),
        }));
        setDeleteModalStore(null);
        setDeleteConfirmText("");
        showToast("success", `Toko "${target.name}" berhasil dihapus permanen dari sistem.`);
      } else {
        showToast("error", res.error || "Gagal menghapus toko.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#FBFDFB] text-[var(--ink)] flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg border shadow-[3px_3px_0px_var(--forest)] text-xs sm:text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
            toastMessage.type === "success"
              ? "bg-[var(--surface-2)] border-2 border-[var(--forest)] text-[var(--forest)]"
              : "bg-red-50 border-2 border-red-700 text-red-800"
          }`}
        >
          {toastMessage.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-[var(--leaf)] shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Bar Navigation - Spacious, vertically balanced & clean */}
      <header className="w-full border-b border-[var(--line)] bg-white/95 backdrop-blur-md px-6 sm:px-10 py-5 sm:py-6 sticky top-0 z-30 shadow-xs min-h-[80px] flex items-center">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[var(--leaf)] text-white flex items-center justify-center shadow-subtle shrink-0">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2.5">
                <span className="font-heading font-bold text-2xl tracking-tight text-zinc-950 leading-none">
                  PayBuy
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--surface-2)] border border-[var(--line-strong)] text-[var(--forest)] text-[11px] font-heading font-bold uppercase tracking-wider">
                  Control Center
                </span>
              </div>
              <span className="text-[11px] font-medium tracking-wide uppercase text-[var(--muted)] mt-1">
                Pusat Pengawasan Seluruh Toko
              </span>
            </div>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3.5">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-heading font-semibold text-[var(--forest)]">
                {adminEmail}
              </span>
              <span className="text-[10px] text-[var(--leaf)] font-medium flex items-center justify-end gap-1 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Superadmin Aktif</span>
              </span>
            </div>

            <form action={logoutSuperadminAction}>
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                className="gap-1.5 text-xs h-9 px-3.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Platform Overview Metrics */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-heading font-bold text-xl sm:text-2xl text-[var(--ink)] tracking-tight flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-[var(--leaf)]" />
                Statistik Global Platform PayBuy
              </h1>
              <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">
                Pemantauan data operasional, total transaksi, dan persebaran toko.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Stores */}
            <div className="bg-white border-2 border-[var(--forest)] rounded-xl p-5 shadow-[3px_3px_0px_var(--forest)] relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--muted)]">Total Toko Terdaftar</span>
                <div className="w-9 h-9 rounded-lg bg-[var(--surface-2)] border border-[var(--line-strong)] text-[var(--forest)] flex items-center justify-center">
                  <Store className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-heading font-bold text-3xl text-[var(--ink)]">
                  {metrics.totalStores}
                </span>
                <span className="text-xs text-[var(--muted)]">toko UMKM</span>
              </div>
              <div className="mt-3 pt-3 border-t border-[var(--line)] flex items-center justify-between text-xs text-[var(--muted)]">
                <span>Standar Paket:</span>
                <span className="font-semibold text-[var(--leaf)] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--leaf)]" />
                  100% Free Tier Aktif
                </span>
              </div>
            </div>

            {/* Operasional Status */}
            <div className="bg-white border-2 border-[var(--forest)] rounded-xl p-5 shadow-[3px_3px_0px_var(--forest)] relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--muted)]">Status Operasional</span>
                <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-700 flex items-center justify-center">
                  <Power className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-heading font-bold text-3xl text-[var(--leaf)]">
                  {metrics.openStores}
                </span>
                <span className="text-xs text-[var(--muted)]">toko buka saat ini</span>
              </div>
              <div className="mt-3 pt-3 border-t border-[var(--line)] text-xs text-[var(--muted)] flex items-center justify-between">
                <span>Toko Tutup / Nonaktif:</span>
                <strong className="text-rose-600 font-semibold">{metrics.closedStores} toko</strong>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white border-2 border-[var(--forest)] rounded-xl p-5 shadow-[3px_3px_0px_var(--forest)] relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--muted)]">Total Pesanan Masuk</span>
                <div className="w-9 h-9 rounded-lg bg-[var(--surface-2)] border border-[var(--line-strong)] text-[var(--forest)] flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-heading font-bold text-3xl text-[var(--ink)]">
                  {metrics.totalOrders}
                </span>
                <span className="text-xs text-[var(--muted)]">transaksi</span>
              </div>
              <div className="mt-3 pt-3 border-t border-[var(--line)] text-xs text-[var(--muted)]">
                Pesanan mandiri &amp; kasir se-platform
              </div>
            </div>

            {/* Platform Revenue */}
            <div className="bg-white border-2 border-[var(--forest)] rounded-xl p-5 shadow-[3px_3px_0px_var(--forest)] relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--muted)]">Total Transaksi (GMV)</span>
                <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-300 text-amber-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-heading font-bold text-2xl text-[var(--forest)]">
                  Rp {metrics.totalPlatformRevenue.toLocaleString("id-ID")}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-[var(--line)] text-xs text-[var(--muted)]">
                Akumulasi perputaran omzet toko
              </div>
            </div>
          </div>
        </section>

        {/* Store Management Section */}
        <section className="bg-white border-2 border-[var(--forest)] rounded-xl shadow-[3px_3px_0px_var(--forest)] overflow-hidden">
          {/* Header & Controls */}
          <div className="p-5 border-b border-[var(--line)] bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-heading font-bold text-lg text-[var(--ink)]">
                Daftar Pengawasan Seluruh Toko
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Pantau operasional toko, status buka/tutup, transaksi pesanan, dan kelola atau hapus toko bermasalah.
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative min-w-[240px]">
                <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama, slug, owner..."
                  className="w-full pl-9 pr-3 h-10 text-xs bg-white border border-[var(--control)] rounded-lg text-[var(--ink)] placeholder:text-[var(--muted)] focus:outline-none focus:border-[var(--leaf)] focus:ring-2 focus:ring-[var(--leaf)]/20 transition"
                />
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="h-10 px-3 text-xs bg-white border border-[var(--control)] rounded-lg text-[var(--ink)] focus:outline-none focus:border-[var(--leaf)] cursor-pointer"
              >
                <option value="all">Semua Status Operasional</option>
                <option value="open">Toko Buka</option>
                <option value="closed">Toko Tutup / Nonaktif</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--surface-2)] border-b-2 border-[var(--forest)] text-[var(--forest)] font-heading font-bold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">Toko &amp; Tautan</th>
                  <th className="py-3.5 px-4">Pemilik Toko (Owner)</th>
                  <th className="py-3.5 px-4">Paket Tier</th>
                  <th className="py-3.5 px-4">Status Operasional</th>
                  <th className="py-3.5 px-4">Menu &amp; Transaksi</th>
                  <th className="py-3.5 px-4 text-right">Aksi Superadmin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {filteredStores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[var(--muted)]">
                      Tidak ada toko yang sesuai dengan kriteria pencarian atau filter.
                    </td>
                  </tr>
                ) : (
                  filteredStores.map((store) => (
                    <tr
                      key={store.id}
                      className="hover:bg-[var(--surface-2)]/30 transition-colors"
                    >
                      {/* Name & Slug */}
                      <td className="py-3.5 px-4">
                        <div className="font-heading font-bold text-[var(--ink)] text-sm">
                          {store.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[var(--muted)] mt-0.5">
                          <span className="font-mono text-[11px]">
                            /t/{store.slug}
                          </span>
                          <Link
                            href={`/t/${store.slug}`}
                            target="_blank"
                            title="Buka menu publik pelanggan"
                            className="text-[var(--leaf)] hover:text-[var(--forest)] transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                        <span className="text-[10px] text-[var(--muted)] block mt-0.5">
                          Terdaftar: {new Date(store.created_at).toLocaleDateString("id-ID")}
                        </span>
                      </td>

                      {/* Owner */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-[var(--ink)]">
                          {store.owner_name}
                        </div>
                        <div className="text-[var(--muted)] text-[11px]">
                          {store.owner_email}
                        </div>
                      </td>

                      {/* Plan / Tier (Locked to Free) */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 font-heading font-semibold text-[11px] uppercase tracking-wider">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--leaf)]" />
                          Gratis (Free)
                        </span>
                      </td>

                      {/* Open / Closed Status */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              store.is_open
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                                : "bg-rose-50 text-rose-800 border border-rose-300"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                store.is_open ? "bg-emerald-600" : "bg-rose-600"
                              }`}
                            />
                            {store.is_open ? "Buka" : "Tutup"}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(store)}
                            disabled={isPending}
                            title={store.is_open ? "Tutup toko ini" : "Buka toko ini"}
                            className="p-1 rounded-md bg-white hover:bg-[var(--surface-2)] text-[var(--forest)] border border-[var(--line)] transition cursor-pointer"
                          >
                            <Power className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Products & Orders */}
                      <td className="py-3.5 px-4">
                        <div className="text-[var(--ink)] font-medium">
                          <strong>{store.products_count}</strong> produk menu
                        </div>
                        <div className="text-[var(--muted)] text-[11px] mt-0.5">
                          {store.orders_count} pesanan (Rp{" "}
                          {store.total_revenue.toLocaleString("id-ID")})
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setDeleteModalStore(store);
                            setDeleteConfirmText("");
                          }}
                          className="text-xs gap-1.5"
                          title="Hapus toko permanen"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Toko</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* MODAL: HAPUS TOKO PERMANEN */}
      {deleteModalStore && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border-2 border-red-700 rounded-xl max-w-md w-full p-6 shadow-[5px_5px_0px_#7C2011] relative">
            <div className="flex items-center gap-3 text-red-700 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 border border-red-300 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-700" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-base text-red-950">
                  Konfirmasi Hapus Toko
                </h3>
                <p className="text-xs text-red-700 font-medium">Tindakan ini tidak dapat dibatalkan!</p>
              </div>
            </div>

            <div className="text-xs text-[var(--ink)] space-y-2 mb-4 bg-red-50/70 p-3.5 rounded-xl border border-red-200">
              <p>
                Anda akan menghapus toko <strong>&quot;{deleteModalStore.name}&quot;</strong> (slug: <code>{deleteModalStore.slug}</code>).
              </p>
              <p className="text-red-900 font-medium">
                Data yang akan dihapus permanen meliputi:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-red-800 text-[11px]">
                <li>Seluruh produk menu ({deleteModalStore.products_count} produk)</li>
                <li>Seluruh riwayat transaksi ({deleteModalStore.orders_count} pesanan)</li>
                <li>Data pengeluaran operasional dan kategori</li>
                <li>Akun staf / profil pegawai toko</li>
              </ul>
            </div>

            <div className="mb-5">
              <label className="block text-xs text-[var(--ink)] mb-1.5 font-medium">
                Ketik nama toko <span className="text-red-700 font-bold">&quot;{deleteModalStore.name}&quot;</span> untuk melanjutkan:
              </label>
              <Input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={deleteModalStore.name}
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setDeleteModalStore(null);
                  setDeleteConfirmText("");
                }}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                disabled={deleteConfirmText.trim() !== deleteModalStore.name.trim() || isPending}
                onClick={handleDeleteStore}
                className="gap-1.5"
              >
                {isPending ? (
                  <span>Menghapus...</span>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Permanen</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
