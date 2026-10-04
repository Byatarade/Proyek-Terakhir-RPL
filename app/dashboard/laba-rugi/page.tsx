import React from "react";
import { Metadata } from "next";
import DashboardLaporanPage, { metadata as laporanMetadata } from "../laporan/page";

export const metadata: Metadata = {
  ...laporanMetadata,
  title: "Riwayat Laba Rugi & Biaya - PayBuy",
};

export default DashboardLaporanPage;
