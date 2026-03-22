import { useState, useEffect } from "react";

import { productApi } from "@/hooks/api";
import type { Product } from "@/types/product";
import HeroSection from "@/components/client/home/HomeHero";
import FeaturedSection from "@/components/client/home/HomeFeatured";
import AboutSection from "@/components/client/home/HomeAbout";
import AllProductsSection from "@/components/client/home/ProductList";
import PromoBanners from "@/components/client/home/HomePromoBanner";

// ─── PAGE ─────────────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 12; // 2 hàng × 6 cột

const HomePage = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);

  // Fetch featured (isFeatured: true)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingFeatured(true);
    productApi
      .getAll({
        search: "",
        category: "",
        isActive: true,
        isFeatured: true,
        sortField: "createdAt",
        sortOrder: "desc",
        page: 1,
        pageSize: 12,
      })
      .then((res) => setFeatured(res.data))
      .catch(console.error)
      .finally(() => setLoadingFeatured(false));
  }, []);

  // Fetch all products — 2 hàng × 6 cột = 12 sp/trang
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingAll(true);
    productApi
      .getAll({
        search: "",
        category: "",
        isActive: true,
        isFeatured: "",
        sortField: "createdAt",
        sortOrder: "desc",
        page,
        pageSize: ITEMS_PER_PAGE,
      })
      .then((res) => {
        setAllProducts(res.data);
        setTotalPages(res.totalPages);
      })
      .catch(console.error)
      .finally(() => setLoadingAll(false));
  }, [page]);

  const handlePageChange = (p: number) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      {!loadingFeatured && featured.length > 0 && (
        <FeaturedSection products={featured} />
      )}

      <PromoBanners />

      {!loadingAll && (
        <AllProductsSection
          products={allProducts}
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}

      <div className="mx-auto max-w-7xl px-4">
        <div className="h-px bg-border" />
      </div>

      <AboutSection />
    </div>
  );
};

export default HomePage;
