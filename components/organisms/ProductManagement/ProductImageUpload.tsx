"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, Image as ImageIcon, Trash2, RefreshCw, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  compressImageToBase64,
  estimateBase64SizeBytes,
  formatBytes,
} from "@/lib/utils/image-compression";

interface ProductImageUploadProps {
  imagePath: string | null | undefined;
  onChange: (base64Image: string | null) => void;
  disabled?: boolean;
}

export function ProductImageUpload({
  imagePath,
  onChange,
  disabled = false,
}: ProductImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: string;
    compressedSize: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErrorMsg("File harus berupa gambar (JPG, PNG, WEBP, dll).");
      return;
    }

    try {
      setIsCompressing(true);
      setErrorMsg(null);

      // Kompresi di bawah 5 MB dan konversi ke Base64
      const result = await compressImageToBase64(file, {
        maxSizeMB: 5,
        maxWidth: 1200,
        maxHeight: 1200,
        initialQuality: 0.82,
      });

      onChange(result.base64);
      setCompressionStats({
        originalSize: result.originalSizeFormatted,
        compressedSize: result.sizeFormatted,
      });
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan saat memproses gambar."
      );
    } finally {
      setIsCompressing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset file input agar bisa upload file yang sama jika diinginkan
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || isCompressing) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isCompressing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setCompressionStats(null);
    setErrorMsg(null);
  };

  // Ukuran base64 saat ini bila ada
  const currentSizeBytes = imagePath ? estimateBase64SizeBytes(imagePath) : 0;
  const currentSizeFormatted = currentSizeBytes > 0 ? formatBytes(currentSizeBytes) : null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-800 flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4 text-[var(--forest)]" />
          <span>Gambar Produk</span>
        </label>
        <span className="text-[11px] text-zinc-400 font-medium">
          Maks. 5 MB (Otomatis Kompres & Base64)
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isCompressing}
      />

      {/* Tampilan Gambar Jika Sudah Ada */}
      {imagePath ? (
        <div className="relative rounded-2xl border-2 border-[var(--forest)]/20 bg-zinc-50 p-2 overflow-hidden shadow-2xs">
          <div className="relative aspect-16/9 sm:aspect-2/1 w-full rounded-xl overflow-hidden bg-zinc-900/5 flex items-center justify-center">
            <Image
              src={imagePath}
              alt="Preview produk"
              fill
              unoptimized={imagePath.startsWith("data:")}
              className="object-contain"
            />

            {/* Overlay Loading saat mengompres gambar baru */}
            {isCompressing && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-7 h-7 text-[var(--leaf)] animate-spin" />
                <span className="text-xs font-semibold text-zinc-800">
                  Mengompresi gambar di bawah 5 MB...
                </span>
              </div>
            )}
          </div>

          {/* Bar Tombol & Informasi Ukuran */}
          <div className="mt-2.5 px-1 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-zinc-600">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-medium text-emerald-700">Tersimpan Base64:</span>
              <span className="font-mono text-zinc-700 font-semibold">
                {currentSizeFormatted || "< 5 MB"}
              </span>
              {compressionStats && (
                <span className="text-[11px] text-zinc-400">
                  (dari {compressionStats.originalSize})
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isCompressing}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Ganti</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled || isCompressing}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone Upload */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && !isCompressing && fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2.5",
            isDragging
              ? "border-[var(--leaf)] bg-[var(--leaf)]/10 scale-[1.01]"
              : "border-zinc-300 hover:border-[var(--leaf)] hover:bg-zinc-50/80 bg-zinc-50/40",
            (disabled || isCompressing) && "opacity-60 cursor-not-allowed pointer-events-none"
          )}
        >
          {isCompressing ? (
            <div className="flex flex-col items-center justify-center gap-2 py-2">
              <Loader2 className="w-8 h-8 text-[var(--leaf)] animate-spin" />
              <div className="text-xs font-semibold text-zinc-800">
                Mengompresi gambar & mengonversi ke Base64...
              </div>
              <div className="text-[11px] text-zinc-500">
                Memastikan ukuran data di bawah 5 MB
              </div>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-white border border-zinc-200/80 shadow-xs flex items-center justify-center text-[var(--leaf)]">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-800">
                  <span className="text-[var(--leaf)] underline underline-offset-2">Klik untuk upload</span>{" "}
                  atau seret gambar ke sini
                </p>
                <p className="text-[11px] text-zinc-500">
                  PNG, JPG, atau WEBP. Gambar otomatis dikompresi di bawah 5 MB.
                </p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-medium text-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span>Format Base64 hemat storage Supabase</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
