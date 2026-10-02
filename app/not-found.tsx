"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  ArrowLeft,
  Search,
  FileQuestion,
  Store,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[var(--bg)] flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      {/* Container Nota Karcis 404 */}
      <div className="w-full max-w-md bg-white border-2 border-[var(--forest)] rounded-2xl shadow-[6px_6px_0px_var(--forest)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Ticket Side Notches */}
        <div className="absolute -left-3.5 top-[230px] w-7 h-7 bg-[var(--bg)] rounded-full border-r-2 border-[var(--forest)]" />
        <div className="absolute -right-3.5 top-[230px] w-7 h-7 bg-[var(--bg)] rounded-full border-l-2 border-[var(--forest)]" />

        {/* Top Header Karcis */}
        <div className="p-6 pb-4 border-b-2 border-dashed border-zinc-300 text-center relative">
          {/* Cap / Stamp "TIDAK DITEMUKAN" */}
          <div className="absolute top-4 right-4 rotate-[-8deg] border-2 border-[var(--danger)] text-[var(--danger)] px-2.5 py-0.5 rounded font-heading font-extrabold text-[10px] tracking-widest uppercase opacity-90 shadow-2xs">
            NOT FOUND
          </div>

          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-[var(--surface-2)] border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] mb-3">
            <FileQuestion className="w-6 h-6 text-[var(--forest)]" />
          </div>

          <h2 className="font-heading font-extrabold text-lg text-zinc-950 uppercase tracking-wider">
            PayBuy Nota Layanan
          </h2>
          <p className="text-xs text-zinc-500 font-mono">
            ID: ERR-404-NOT-FOUND • SISTEM KASIR UMKM
          </p>
        </div>

        {/* Nomor Antrian 404 Jumbo */}
        <div className="p-6 text-center bg-[var(--surface-2)]/50 border-b-2 border-dashed border-zinc-300 space-y-1">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">
            Nomor Antrian
          </span>
          <span className="font-heading font-extrabold text-6xl sm:text-7xl text-[var(--forest)] tracking-tight block">
            #404
          </span>
          <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-[var(--danger)] border border-red-300 text-xs font-bold font-mono">
            Halaman Tidak Ditemukan
          </span>
        </div>

        {/* Rincian Nota Struk */}
        <div className="p-6 space-y-4">
          <div className="space-y-2 font-mono text-xs text-zinc-700">
            <div className="flex justify-between items-baseline">
              <span>Halaman Dicari:</span>
              <span className="text-zinc-500">0 Porsi</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span>Status Meja:</span>
              <span className="text-[var(--danger)] font-bold">Kosong / Pindah</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span>Sinyal Kasir:</span>
              <span className="text-zinc-500">Terputus</span>
            </div>
            <div className="border-t border-dashed border-zinc-300 pt-2 flex justify-between items-baseline font-bold text-zinc-950">
              <span>TOTAL ERROR:</span>
              <span>404 (NIHIL)</span>
            </div>
          </div>

          {/* Deskripsi & Panduan */}
          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-center space-y-1">
            <h3 className="font-heading font-bold text-sm text-zinc-900">
              Waduh, Halaman Ini Tidak Ada!
            </h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Mungkin alamat URL salah ketik, menu toko telah diperbarui, atau halaman sudah dipindahkan oleh sistem.
            </p>
          </div>

          {/* Navigasi Aksi */}
          <div className="space-y-2 pt-1">
            <Link href="/" className="block">
              <Button
                variant="primary"
                size="md"
                className="w-full gap-2 text-xs sm:text-sm font-bold shadow-[3px_3px_0px_var(--forest)] bg-[var(--leaf)] hover:bg-[#156336] text-white"
              >
                <Home className="w-4 h-4" />
                <span>Kembali ke Beranda Utama</span>
              </Button>
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <Link href="/dashboard" className="block">
                <Button
                  variant="secondary"
                  size="md"
                  className="w-full gap-1.5 text-xs font-bold border-zinc-300 shadow-[2px_2px_0px_var(--forest)]"
                >
                  <LayoutDashboard className="w-4 h-4 text-[var(--forest)]" />
                  <span>Dashboard</span>
                </Button>
              </Link>

              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-[8px] bg-white hover:bg-[var(--surface-2)] text-[var(--forest)] border-2 border-[var(--forest)] shadow-[2px_2px_0px_var(--forest)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none text-xs font-bold cursor-pointer transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Nota */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 text-center font-mono text-[10px] text-zinc-400">
          PayBuy • Sistem Kasir & Pemesanan Mandiri UMKM
        </div>
      </div>
    </main>
  );
}
