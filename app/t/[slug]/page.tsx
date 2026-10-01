import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicStoreMenuAction } from "@/lib/public-menu/actions";
import { PublicStoreShell } from "@/components/templates/PublicStoreShell";
import { PublicStoreMenu } from "@/components/organisms/PublicStoreMenu";

interface PublicMenuPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PublicMenuPageProps): Promise<Metadata> {
  const { slug } = await params;
  const res = await getPublicStoreMenuAction(slug);

  if (!res.success || !res.data) {
    return {
      title: "Menu Toko - PayBuy",
      description: "Pesan menu makanan & minuman langsung dari ponsel Anda tanpa antre.",
    };
  }

  return {
    title: `${res.data.name} - Menu & Pesan Mandiri`,
    description: `Daftar menu dan pemesanan mandiri resmi ${res.data.name}. Pesan langsung tanpa aplikasi.`,
  };
}

export default async function PublicMenuPage({ params }: PublicMenuPageProps) {
  const { slug } = await params;
  const res = await getPublicStoreMenuAction(slug);

  if (!res.success || !res.data) {
    notFound();
  }

  const {
    name,
    isOpen,
    acceptCash,
    acceptQris,
    qrisMerchantName,
    categories,
  } = res.data;

  return (
    <PublicStoreShell
      storeName={name}
      storeSlug={slug}
      isOpen={isOpen}
      acceptCash={acceptCash}
      acceptQris={acceptQris}
      qrisMerchantName={qrisMerchantName}
    >
      <PublicStoreMenu
        slug={slug}
        storeName={name}
        isOpen={isOpen}
        acceptCash={acceptCash}
        acceptQris={acceptQris}
        categories={categories}
      />
    </PublicStoreShell>
  );
}
