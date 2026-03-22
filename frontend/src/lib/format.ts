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

export const UNIT_LABEL: Record<ProductUnit, string> = {
  kg: "kg",
  gram: "gram",
  cái: "cái",
  hộp: "hộp",
  lít: "lít",
  chai: "chai",
  bó: "bó",
};

export const UNIT_OPTIONS: ProductUnit[] = [
  "kg",
  "gram",
  "cái",
  "hộp",
  "lít",
  "chai",
  "bó",
];
