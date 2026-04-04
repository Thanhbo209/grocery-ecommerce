import type { ProductUnit } from "../types/product";

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(value);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const UNIT_LABEL: Record<ProductUnit, string> = {
  kg: "kg",
  gram: "gram",
  cái: "cái",
  hộp: "hộp",
  lít: "lít",
  chai: "chai",
  bó: "bó",
  túi: "túi",
  gói: "gói",
};

export const UNIT_OPTIONS: ProductUnit[] = [
  "kg",
  "gram",
  "cái",
  "hộp",
  "lít",
  "chai",
  "bó",
  "túi",
  "gói",
];
