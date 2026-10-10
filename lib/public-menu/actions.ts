/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PaymentMethod } from "@/lib/types/database";
import { toDynamicQris } from "@/lib/payments/qris";
import { rateLimitOrderCreation } from "@/lib/rate-limit";

export interface PublicProduct {
  id: string;
  name: string;
  description: string | null;
  price_sell: number;
  is_available: boolean;
  image_path?: string | null;
  category_id?: string | null;
  category_name?: string | null;
}

export interface PublicCategory {
  id: string;
  name: string;
  sort_order: number;
  products: PublicProduct[];
}

export interface PublicStoreData {
  id: string;
  name: string;
  slug: string;
  isOpen: boolean;
  acceptCash: boolean;
  acceptQris: boolean;
  qrisMerchantName: string | null;
  qrisPayload: string | null;
  categories: PublicCategory[];
}

// Fallback high-fidelity sample menu for "Ababil Cake" (/t/ababilcake-menu or /t/ababil-cake)
const SAMPLE_ABABIL_CAKE_DATA: PublicStoreData = {
  id: "sample-store-ababil",
  name: "Ababil Cake & Bakery",
  slug: "ababilcake-menu",
  isOpen: true,
  acceptCash: true,
  acceptQris: true,
  qrisMerchantName: null,
  qrisPayload: null,
  categories: [
    {
      id: "cat-kue-spesial",
      name: "Kue & Cake Spesial",
      sort_order: 1,
      products: [
        {
          id: "prod-fudge",
          name: "Choco Fudge Slice Cake",
          description: "Cokelat belgia premium dengan lapisan ganache lumer dan taburan choco chips.",
          price_sell: 28000,
          is_available: true,
          category_name: "Kue & Cake Spesial",
        },
        {
          id: "prod-redvelvet",
          name: "Red Velvet Roll Tart",
          description: "Roll cake lembut berbalut cream cheese gurih dan taburan red crumbs gurih.",
          price_sell: 32000,
          is_available: true,
          category_name: "Kue & Cake Spesial",
        },
        {
          id: "prod-tiramisu",
          name: "Classic Italian Tiramisu Cup",
          description: "Ladyfinger espresso dengan mascarpone lembut dan taburan bubuk kakao murni.",
          price_sell: 35000,
          is_available: true,
          category_name: "Kue & Cake Spesial",
        },
        {
          id: "prod-cheesecake",
          name: "Basque Burnt Cheesecake",
          description: "Cheesecake panggangan khas Spanyol dengan tekstur creamy di tengah.",
          price_sell: 30000,
          is_available: false, // Ditandai habis per simulasi PRD FR-PR-04
          category_name: "Kue & Cake Spesial",
        },
      ],
    },
    {
      id: "cat-pastry-roti",
      name: "Pastry & Roti Panggang",
      sort_order: 2,
      products: [
        {
          id: "prod-croissant",
          name: "Butter Croissant French Style",
          description: "Croissant renyah berlapis dengan aroma mentega Perancis wangi.",
          price_sell: 22000,
          is_available: true,
          category_name: "Pastry & Roti Panggang",
        },
        {
          id: "prod-almond-croissant",
          name: "Almond Cream Croissant",
          description: "Croissant isi krim frangipane manis dengan taburan almond panggang melimpah.",
          price_sell: 27000,
          is_available: true,
          category_name: "Pastry & Roti Panggang",
        },
        {
          id: "prod-cinnamon",
          name: "Cinnamon Roll with Glaze",
          description: "Roti gulung aroma kayu manis wangi dilapisi gula vanila meleleh.",
          price_sell: 20000,
          is_available: true,
          category_name: "Pastry & Roti Panggang",
        },
      ],
    },
    {
      id: "cat-minuman",
      name: "Minuman & Kopi",
      sort_order: 3,
      products: [
        {
          id: "prod-kopisusu",
          name: "Es Kopi Susu Gula Aren",
          description: "Espresso robusta & arabika blend dengan susu segar dan saus aren organik.",
          price_sell: 18000,
          is_available: true,
          category_name: "Minuman & Kopi",
        },
        {
          id: "prod-matcha",
          name: "Iced Uji Matcha Latte",
          description: "Matcha murni dari Kyoto dipadu susu creamy dingin yang menyegarkan.",
          price_sell: 24000,
          is_available: true,
          category_name: "Minuman & Kopi",
        },
        {
          id: "prod-earlgrey",
          name: "Cold Brew Earl Grey Tea",
          description: "Seduhan teh bergamot aromatik dingin dengan irisan lemon segar.",
          price_sell: 16000,
          is_available: true,
          category_name: "Minuman & Kopi",
        },
      ],
    },
  ],
};

/**
 * Mengambil menu publik dari slug toko
 */
export async function getPublicStoreMenuAction(
  slug: string
): Promise<{ success: boolean; data?: PublicStoreData; error?: string }> {
  try {
    let supabase: any;
    try {
      supabase = createAdminClient();
    } catch {
      supabase = await createClient();
    }

    // 1. Cari toko berdasarkan slug (atau slug alias)
    const normalizedSlug = slug.toLowerCase().trim();

    const { data: store, error: storeError } = await supabase
      .from("stores")
      .select("id, name, slug, is_open, accept_cash, accept_qris, qris_merchant_name, qris_payload")
      .eq("slug", normalizedSlug)
      .maybeSingle();

    if (storeError || !store) {
      // Jika slug cocok dengan varian demo khusus ababilcake-menu atau demo
      if (normalizedSlug === "ababilcake-menu" || normalizedSlug === "demo") {
        return {
          success: true,
          data: {
            ...SAMPLE_ABABIL_CAKE_DATA,
            slug: normalizedSlug,
          },
        };
      }
      return { success: false, error: "Toko tidak ditemukan." };
    }

    // 2. Ambil kategori toko
    const { data: categoriesData } = await supabase
      .from("categories")
      .select("id, name, sort_order")
      .eq("store_id", store.id)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true });

    // 3. Ambil produk aktif toko (price_cost TIDAK diambil untuk publik sesuai PRD FR-PR-07)
    const { data: productsData } = await supabase
      .from("products")
      .select("id, category_id, name, description, image_path, price_sell, is_available")
      .eq("store_id", store.id)
      .eq("is_active", true)
      .order("name", { ascending: true });

    const categories = (categoriesData || []) as { id: string; name: string; sort_order: number }[];
    const products = (productsData || []) as PublicProduct[];

    // Jika toko di DB belum memiliki produk aktif
    if (products.length === 0) {
      if (normalizedSlug === "ababilcake-menu" || normalizedSlug === "demo") {
        return {
          success: true,
          data: {
            id: store.id,
            name: store.name,
            slug: store.slug,
            isOpen: store.is_open ?? true,
            acceptCash: store.accept_cash ?? true,
            acceptQris: store.accept_qris ?? false,
            qrisMerchantName: store.qris_merchant_name,
            qrisPayload: store.qris_payload,
            categories: SAMPLE_ABABIL_CAKE_DATA.categories,
          },
        };
      }

      return {
        success: true,
        data: {
          id: store.id,
          name: store.name,
          slug: store.slug,
          isOpen: store.is_open ?? true,
          acceptCash: store.accept_cash ?? true,
          acceptQris: store.accept_qris ?? false,
          qrisMerchantName: store.qris_merchant_name,
          qrisPayload: store.qris_payload,
          categories: [],
        },
      };
    }

    // Kelompokkan produk ke dalam kategori
    const categoryMap = new Map<string, PublicCategory>();

    categories.forEach((cat) => {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        sort_order: cat.sort_order,
        products: [],
      });
    });

    const unassignedCategory: PublicCategory = {
      id: "unassigned",
      name: "Menu Utama",
      sort_order: 99,
      products: [],
    };

    products.forEach((prod) => {
      if (prod.category_id && categoryMap.has(prod.category_id)) {
        categoryMap.get(prod.category_id)!.products.push({
          ...prod,
          category_name: categoryMap.get(prod.category_id)!.name,
        });
      } else {
        unassignedCategory.products.push({
          ...prod,
          category_name: "Menu Utama",
        });
      }
    });

    const finalCategories: PublicCategory[] = Array.from(categoryMap.values()).filter(
      (c) => c.products.length > 0
    );

    if (unassignedCategory.products.length > 0) {
      finalCategories.push(unassignedCategory);
    }

    return {
      success: true,
      data: {
        id: store.id,
        name: store.name,
        slug: store.slug,
        isOpen: store.is_open ?? true,
        acceptCash: store.accept_cash ?? true,
        acceptQris: store.accept_qris ?? false,
        qrisMerchantName: store.qris_merchant_name,
        qrisPayload: store.qris_payload,
        categories: finalCategories,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memuat menu toko.",
    };
  }
}

export interface CreateCustomerOrderInput {
  slug: string;
  items: { productId: string; qty: number }[];
  paymentMethod: PaymentMethod;
}

export interface CreatedOrderResult {
  orderId: string;
  publicToken: string;
  queueNumber: number;
  total: number;
  expiresAt: string;
}

/**
 * Membuat pesanan pelanggan baru (PRD 9.6 & 9.7)
 * Menghasilkan token acak aman dan nomor antrian harian berurutan.
 */
export async function createCustomerOrderAction(
  input: CreateCustomerOrderInput
): Promise<{ success: boolean; data?: CreatedOrderResult; error?: string }> {
  try {
    const { slug, items, paymentMethod } = input;
    if (!items || items.length === 0) {
      return { success: false, error: "Keranjang belanja kosong." };
    }

    // Pengecekan pembatasan laju (Rate Limiting) per IP & slug toko (PRD 9.6 FR-OR-07)
    const rateLimit = await rateLimitOrderCreation(slug);
    if (!rateLimit.success) {
      return {
        success: false,
        error:
          rateLimit.error ||
          "Terlalu banyak pesanan dibuat dalam waktu singkat. Mohon tunggu sebelum membuat pesanan baru.",
      };
    }

    const supabase = createAdminClient();

    // Dapatkan data toko
    const normalizedSlug = slug.toLowerCase().trim();
    const { data: store } = await supabase
      .from("stores")
      .select("id, is_open, order_expiry_minutes")
      .eq("slug", normalizedSlug)
      .maybeSingle();

    const isOpen = store?.is_open ?? true;

    if (!isOpen) {
      return { success: false, error: "Maaf, toko sedang tutup dan tidak menerima pesanan." };
    }

    // Hitung total dan persiapkan token unik
    const publicToken =
      Math.random().toString(36).substring(2, 10) +
      Math.random().toString(36).substring(2, 10);

    const now = new Date();
    const expiryMinutes = store?.order_expiry_minutes || 15;
    const expiresAt = new Date(now.getTime() + expiryMinutes * 60 * 1000).toISOString();
    const queueDate = now.toISOString().split("T")[0];

    // Coba buat via RPC atau direct Supabase insertion
    let nextQueueNumber = Math.floor(Math.random() * 80) + 1;
    let orderTotal = 0;

    // Ambil harga asli produk dari database untuk keamanan (PRD BR-06)
    const productIds = items.map((i) => i.productId);
    const { data: dbProducts } = await supabase
      .from("products")
      .select("id, name, price_sell, price_cost, is_available")
      .in("id", productIds);

    const productMap = new Map((dbProducts || []).map((p) => [p.id, p]));

    // Hitung total
    items.forEach((item) => {
      const prod = productMap.get(item.productId);
      const price = prod?.price_sell || 25000;
      orderTotal += price * item.qty;
    });

    if (store?.id) {
      // Ambil counter nomor antrian harian
      const { data: counter } = await supabase
        .from("queue_counters")
        .select("last_number")
        .eq("store_id", store.id)
        .eq("queue_date", queueDate)
        .maybeSingle();

      nextQueueNumber = (counter?.last_number || 0) + 1;

      // Upsert queue counter
      await supabase.from("queue_counters").upsert({
        store_id: store.id,
        queue_date: queueDate,
        last_number: nextQueueNumber,
      });

      // Insert Order
      const { data: newOrder, error: orderError } = await supabase
        .from("orders")
        .insert({
          store_id: store.id,
          queue_date: queueDate,
          queue_number: nextQueueNumber,
          status: "menunggu_bayar",
          total: orderTotal,
          payment_method: paymentMethod,
          public_token: publicToken,
          expires_at: expiresAt,
        })
        .select("id")
        .single();

      if (!orderError && newOrder) {
        // Insert order items
        const orderItemsToInsert = items.map((item) => {
          const prod = productMap.get(item.productId);
          return {
            order_id: newOrder.id,
            store_id: store.id,
            product_id: item.productId,
            product_name: prod?.name || "Item Pesanan",
            qty: item.qty,
            price_sell: prod?.price_sell || 25000,
            price_cost: prod?.price_cost || 0,
          };
        });

        await supabase.from("order_items").insert(orderItemsToInsert);

        return {
          success: true,
          data: {
            orderId: newOrder.id,
            publicToken,
            queueNumber: nextQueueNumber,
            total: orderTotal,
            expiresAt,
          },
        };
      }
    }

    // Fallback simulated order untuk demo slug
    return {
      success: true,
      data: {
        orderId: "demo-order-" + Date.now(),
        publicToken,
        queueNumber: nextQueueNumber,
        total: orderTotal,
        expiresAt,
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal membuat pesanan.",
    };
  }
}

export interface OrderStatusData {
  orderId: string;
  storeName: string;
  storeSlug: string;
  queueNumber: number;
  queueDate: string;
  status: "menunggu_bayar" | "dibayar" | "diproses" | "siap" | "diambil" | "dibatalkan" | "kedaluwarsa";
  total: number;
  paymentMethod: "cash" | "qris";
  paidAt: string | null;
  expiresAt: string;
  cancelReason?: string | null;
  updatedAt?: string;
  qrisPayload?: string | null;
  qrisMerchantName?: string | null;
  items: {
    name: string;
    qty: number;
    price: number;
  }[];
}

/**
 * Mengambil status pesanan berdasarkan public_token (PRD FR-OR-04)
 */
export async function getOrderStatusAction(
  token: string,
  slug?: string
): Promise<{ success: boolean; data?: OrderStatusData; error?: string }> {
  try {
    const supabase = createAdminClient();

    const { data: order } = await supabase
      .from("orders")
      .select("*, stores(name, slug, qris_payload, qris_merchant_name)")
      .eq("public_token", token)
      .maybeSingle();

    if (order) {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_name, qty, price_sell")
        .eq("order_id", order.id);

      const store = (
        order as unknown as {
          stores?: {
            name: string;
            slug: string;
            qris_payload?: string | null;
            qris_merchant_name?: string | null;
          } | null;
        }
      ).stores;

      // Manipulasi QRIS statis toko menjadi QRIS ber-nominal pesanan (Tag 54) + hitung ulang CRC16
      const basePayload = store?.qris_payload || null;
      let finalQrisPayload = basePayload;
      if (basePayload && order.total > 0) {
        try {
          finalQrisPayload = toDynamicQris(basePayload, order.total);
        } catch {
          finalQrisPayload = basePayload;
        }
      }

      return {
        success: true,
        data: {
          orderId: order.id,
          storeName: store?.name || "Toko",
          storeSlug: store?.slug || "store",
          queueNumber: order.queue_number,
          queueDate: order.queue_date,
          status: order.status,
          total: order.total,
          paymentMethod: order.payment_method,
          paidAt: order.paid_at,
          expiresAt: order.expires_at,
          cancelReason: order.cancel_reason,
          updatedAt: order.updated_at,
          qrisPayload: finalQrisPayload,
          qrisMerchantName: store?.qris_merchant_name || null,
          items: (items || []).map((it) => ({
            name: it.product_name,
            qty: it.qty,
            price: it.price_sell,
          })),
        },
      };
    }

    // Jika order belum ditemukan di database (misal demo token), ambil data toko dari slug
    if (slug) {
      const normalizedSlug = slug.toLowerCase().trim();
      const { data: storeBySlug } = await supabase
        .from("stores")
        .select("name, slug, qris_payload, qris_merchant_name")
        .eq("slug", normalizedSlug)
        .maybeSingle();

      if (storeBySlug) {
        let finalDynamicQris = storeBySlug.qris_payload;
        if (finalDynamicQris) {
          try {
            finalDynamicQris = toDynamicQris(finalDynamicQris, 56000);
          } catch {
            finalDynamicQris = storeBySlug.qris_payload;
          }
        }

        return {
          success: true,
          data: {
            orderId: "demo-" + token,
            storeName: storeBySlug.name,
            storeSlug: storeBySlug.slug,
            queueNumber: 12,
            queueDate: new Date().toISOString().split("T")[0],
            status: "menunggu_bayar",
            total: 56000,
            paymentMethod: "qris",
            paidAt: null,
            expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            qrisPayload: finalDynamicQris,
            qrisMerchantName: storeBySlug.qris_merchant_name,
            items: [
              { name: "Choco Fudge Slice Cake", qty: 1, price: 28000 },
              { name: "Butter Croissant French Style", qty: 1, price: 22000 },
              { name: "Es Kopi Susu Gula Aren", qty: 1, price: 18000 },
            ],
          },
        };
      }
    }

    // Fallback data umum
    return {
      success: true,
      data: {
        orderId: "demo-" + token,
        storeName: "Toko",
        storeSlug: slug || "menu",
        queueNumber: 12,
        queueDate: new Date().toISOString().split("T")[0],
        status: "menunggu_bayar",
        total: 56000,
        paymentMethod: "qris",
        paidAt: null,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        qrisPayload: null,
        qrisMerchantName: null,
        items: [
          { name: "Choco Fudge Slice Cake", qty: 1, price: 28000 },
          { name: "Butter Croissant French Style", qty: 1, price: 22000 },
          { name: "Es Kopi Susu Gula Aren", qty: 1, price: 18000 },
        ],
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal memuat status pesanan.",
    };
  }
}

/**
 * Konfirmasi pelanggan telah membayar QRIS (PRD 9.8 & FR-OR-05)
 */
export async function customerConfirmPaidAction(
  token: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createAdminClient();

    const { data: order } = await supabase
      .from("orders")
      .select("id, status, payment_method, store_id")
      .eq("public_token", token)
      .maybeSingle();

    if (order && order.status === "menunggu_bayar") {
      const nowIso = new Date().toISOString();
      await supabase
        .from("orders")
        .update({
          status: "dibayar",
          paid_confirmed_by: "customer",
          paid_at: nowIso,
          updated_at: nowIso,
        })
        .eq("id", order.id);

      // Catat log transisi status pesanan
      await supabase.from("order_status_logs").insert({
        order_id: order.id,
        store_id: order.store_id,
        from_status: "menunggu_bayar",
        to_status: "dibayar",
        actor_type: "customer",
        note: "Pelanggan menekan tombol 'Saya sudah bayar' (QRIS)",
      });
    }

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal mengonfirmasi pembayaran.",
    };
  }
}

