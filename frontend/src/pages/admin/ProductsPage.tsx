import { useCallback, useState } from "react";

import { CreateProductModal } from "@/components/admin/products/modals/CreateProductModal";
import { DeleteProductDialog } from "@/components/admin/products/modals/DeleteProductDialog";
import { EditProductModal } from "@/components/admin/products/modals/EditProductModal";
import { ViewProductModal } from "@/components/admin/products/modals/ViewProductModal";
import type { formValuesToPayload } from "@/components/admin/products/ProductForm";
import { ProductPagination } from "@/components/admin/products/ProductPagination";
import { ProductStatsRow } from "@/components/admin/products/ProductStatsRow";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { ProductToolbar } from "@/components/admin/products/ProductToolbar";
import { CategorySection } from "@/components/admin/products/CategorySection";
import { useCategories } from "@/hooks/useCategories";
import { useProductMutation } from "@/hooks/useProductMutation";
import { useProducts } from "@/hooks/useProducts";
import { useProductStats } from "@/hooks/useProductStats";
import type { Product } from "@/types/product";

type Tab = "products" | "categories";

type ModalState =
  | { type: "none" }
  | { type: "create" }
  | { type: "edit"; product: Product }
  | { type: "view"; product: Product }
  | { type: "delete"; product: Product };

export default function ProductsPage() {
  const [tab, setTab] = useState<Tab>("products");
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const {
    data,
    isLoading,
    error,
    filters,
    setSearch,
    setCategory,
    setIsActive,
    setPage,
    setPageSize,
    refresh,
  } = useProducts();

  const {
    stats,
    isLoading: statsLoading,
    refresh: refreshStats,
  } = useProductStats();

  const { categories } = useCategories();

  const {
    createProduct,
    updateProduct,
    deleteProduct,
    state: mutState,
  } = useProductMutation(
    useCallback(() => {
      refresh();
      refreshStats();
      setModal({ type: "none" });
    }, [refresh, refreshStats]),
  );

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      checked ? next.add(id) : next.delete(id);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(
      checked ? new Set(data?.data.map((p) => p._id) ?? []) : new Set(),
    );
  };

  const handleCreate = (payload: ReturnType<typeof formValuesToPayload>) =>
    void createProduct(payload);

  const handleUpdate = (
    id: string,
    payload: ReturnType<typeof formValuesToPayload>,
  ) => void updateProduct({ id, ...payload });

  const handleDelete = (id: string) => void deleteProduct(id);

  return (
    <div className="min-h-screen px-6 py-8">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Quản Lý Sản Phẩm
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Quản lý sản phẩm và danh mục trong hệ thống
        </p>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 rounded-lg border border-border bg-muted/40 p-1 w-fit">
        {(["products", "categories"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "products" ? "Sản phẩm" : "Danh mục"}
          </button>
        ))}
      </div>

      {/* ── Tab: Products ── */}
      {tab === "products" && (
        <>
          <div className="mb-6">
            <ProductStatsRow stats={stats} isLoading={statsLoading} />
          </div>

          <div className="mb-4">
            <ProductToolbar
              filters={filters}
              categories={categories}
              onSearchChange={setSearch}
              onCategoryChange={setCategory}
              onIsActiveChange={setIsActive}
              onAdd={() => setModal({ type: "create" })}
            />
          </div>

          <ProductTable
            products={data?.data ?? []}
            isLoading={isLoading}
            error={error}
            selectedIds={selectedIds}
            onSelectOne={handleSelectOne}
            onSelectAll={handleSelectAll}
            onView={(p) => setModal({ type: "view", product: p })}
            onEdit={(p) => setModal({ type: "edit", product: p })}
            onDelete={(p) => setModal({ type: "delete", product: p })}
          />

          {data && data.total > 0 && (
            <ProductPagination
              page={data.page}
              pageSize={data.pageSize}
              total={data.total}
              totalPages={data.totalPages}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          )}
        </>
      )}

      {/* ── Tab: Categories ── */}
      {tab === "categories" && (
        <div className="max-w-xl">
          <CategorySection />
        </div>
      )}

      {/* Modals — mount ở ngoài tab để không bị unmount khi đổi tab */}
      <CreateProductModal
        open={modal.type === "create"}
        onOpenChange={(open) => !open && setModal({ type: "none" })}
        categories={categories}
        isSubmitting={mutState.isLoading}
        onSubmit={handleCreate}
      />
      <EditProductModal
        open={modal.type === "edit"}
        onOpenChange={(open) => !open && setModal({ type: "none" })}
        product={modal.type === "edit" ? modal.product : null}
        categories={categories}
        isSubmitting={mutState.isLoading}
        onSubmit={handleUpdate}
      />
      <ViewProductModal
        open={modal.type === "view"}
        onOpenChange={(open) => !open && setModal({ type: "none" })}
        product={modal.type === "view" ? modal.product : null}
        onEdit={(p) => setModal({ type: "edit", product: p })}
      />
      <DeleteProductDialog
        open={modal.type === "delete"}
        onOpenChange={(open) => !open && setModal({ type: "none" })}
        product={modal.type === "delete" ? modal.product : null}
        isDeleting={mutState.isLoading}
        onConfirm={handleDelete}
      />
    </div>
  );
}
