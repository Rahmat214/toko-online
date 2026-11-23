import { useCallback, useEffect, useMemo, useState } from 'react';
import { CatalogSection } from './components/CatalogSection';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { ProductAdminView } from './components/ProductAdminView';
import { ProductDetailView } from './components/ProductDetailView';
import { ProductFormModal } from './components/ProductFormModal';
import { DEFAULT_STORE_SETTINGS } from './data/seedProducts';
import type {
  CatalogFilters,
  Product,
  ProductFormInput,
  StoreSettings,
} from './types';
import {
  extractCategories,
  filterAndSortProducts,
  normalizeWhatsAppNumber,
} from './utils/catalog';

const DEFAULT_FILTERS: CatalogFilters = {
  query: '',
  category: 'Semua',
  onlyInStock: false,
  priceRange: 'all',
  sortBy: 'newest',
};

type ActiveView = 'store' | 'detail' | 'admin';

function readRouteFromUrl(): { view: ActiveView; productId: string | null } {
  const params = new URLSearchParams(window.location.search);
  const page = params.get('halaman');
  const productId = params.get('produk');
  if (page === 'kelola') {
    return { view: 'admin', productId: null };
  }
  if (productId) {
    return { view: 'detail', productId };
  }
  return { view: 'store', productId: null };
}

function writeRouteToUrl(view: ActiveView, productId?: string | null) {
  const url = new URL(window.location.href);
  url.searchParams.delete('halaman');
  url.searchParams.delete('produk');
  if (view === 'admin') {
    url.searchParams.set('halaman', 'kelola');
  } else if (view === 'detail' && productId) {
    url.searchParams.set('produk', productId);
  }
  window.history.pushState({}, '', url.toString());
}

export default function App() {
  const initialRoute = readRouteFromUrl();
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_STORE_SETTINGS);
  const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
  const [activeView, setActiveView] = useState<ActiveView>(initialRoute.view);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    initialRoute.productId,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formServerError, setFormServerError] = useState<string | null>(null);

  const fetchCatalog = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Gagal memuat katalog produk dari server.');
      }
      const data = (await response.json()) as {
        products: Product[];
        settings?: StoreSettings;
      };
      setProducts(data.products ?? []);
      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat memuat katalog.',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  useEffect(() => {
    const handlePopState = () => {
      const route = readRouteFromUrl();
      setActiveView(route.view);
      setSelectedProductId(route.productId);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const categories = useMemo(() => extractCategories(products), [products]);

  const visibleProducts = useMemo(
    () => filterAndSortProducts(products, filters),
    [products, filters],
  );

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId) ?? null,
    [products, selectedProductId],
  );

  const relatedProducts = useMemo(() => {
    if (!selectedProduct) return [];
    return products.filter((p) => p.id !== selectedProduct.id);
  }, [products, selectedProduct]);

  const handleNavigateStore = (category?: string) => {
    if (category) {
      setFilters((prev) => ({ ...prev, category }));
    }
    setActiveView('store');
    setSelectedProductId(null);
    writeRouteToUrl('store');
    if (category && category !== 'Semua') {
      requestAnimationFrame(() => {
        document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateAdmin = () => {
    setActiveView('admin');
    setSelectedProductId(null);
    writeRouteToUrl('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProductId(product.id);
    setActiveView('detail');
    writeRouteToUrl('detail', product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormServerError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormServerError(null);
    setIsModalOpen(true);
  };

  const handleSubmitProduct = async (payload: ProductFormInput) => {
    setIsSubmitting(true);
    setFormServerError(null);
    try {
      const endpoint = editingProduct
        ? `/api/products/${editingProduct.id}`
        : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Gagal menyimpan produk.');
      }

      if (editingProduct) {
        setProducts((prev) =>
          prev.map((item) =>
            item.id === data.product.id ? data.product : item,
          ),
        );
      } else {
        setProducts((prev) => [data.product, ...prev]);
      }

      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (err) {
      setFormServerError(
        err instanceof Error ? err.message : 'Gagal menyimpan produk.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    const response = await fetch(`/api/products/${product.id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Gagal menghapus produk.');
    }
    setProducts((prev) => prev.filter((item) => item.id !== product.id));
    if (selectedProductId === product.id) {
      handleNavigateStore('Semua');
    }
  };

  const handleSaveSettings = async (whatsappNumber: string) => {
    const response = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...settings, whatsappNumber }),
    });
    if (response.ok) {
      const data = await response.json();
      setSettings(data.settings);
    }
  };

  const scrollToCatalog = () => {
    document.getElementById('katalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#18181B]">
      <Header
        activeView={activeView}
        onNavigateStore={handleNavigateStore}
        onNavigateAdmin={handleNavigateAdmin}
      />

      {loadError && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
          <div
            role="alert"
            className="p-4 bg-[#FFF1F2] border border-[#FECDD3] rounded-xl flex items-center justify-between gap-4 text-sm text-[#9F1239]"
          >
            <span>{loadError}</span>
            <button
              type="button"
              onClick={fetchCatalog}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-[#FECDD3] rounded-lg hover:bg-[#FFF1F2] cursor-pointer"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      )}

      <div className="flex-1">
        {activeView === 'admin' ? (
          <ProductAdminView
            products={products}
            settings={settings}
            categories={categories}
            onAddNew={handleOpenAddModal}
            onEdit={handleOpenEditModal}
            onView={handleSelectProduct}
            onDelete={handleDeleteProduct}
            onSaveSettings={handleSaveSettings}
          />
        ) : activeView === 'detail' ? (
          selectedProduct ? (
            <ProductDetailView
              product={selectedProduct}
              settings={settings}
              relatedProducts={relatedProducts}
              onBack={() => handleNavigateStore()}
              onSelectProduct={handleSelectProduct}
              onEditProduct={handleOpenEditModal}
            />
          ) : isLoading ? (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center text-sm text-[#52524E]">
              Memuat detail produk...
            </div>
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
              <h1 className="font-display text-2xl text-[#18181B]">
                Produk tidak ditemukan
              </h1>
              <button
                type="button"
                onClick={() => handleNavigateStore('Semua')}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#1B4332] rounded-lg cursor-pointer"
              >
                Kembali ke Katalog
              </button>
            </div>
          )
        ) : (
          <main>
            <HeroSection
              productCount={products.length}
              onExploreCatalog={scrollToCatalog}
              onOpenAdmin={handleNavigateAdmin}
            />
            <CatalogSection
              products={visibleProducts}
              totalCount={products.length}
              categories={categories}
              filters={filters}
              isLoading={isLoading}
              onFiltersChange={setFilters}
              onSelectProduct={handleSelectProduct}
              onResetFilters={() => setFilters(DEFAULT_FILTERS)}
            />
          </main>
        )}
      </div>

      {/* Quiet Editorial Footer */}
      <footer className="border-t border-[#E5E2DC] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#6B6963]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm font-medium text-[#18181B]">
              {settings.storeName}
            </span>
            <span aria-hidden="true">·</span>
            <span>{settings.storeLocation}</span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <a
              href={`https://wa.me/${normalizeWhatsAppNumber(settings.whatsappNumber)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#1B4332] hover:underline underline-offset-4"
            >
              WhatsApp: +{normalizeWhatsAppNumber(settings.whatsappNumber)}
            </a>
            <button
              type="button"
              onClick={handleNavigateAdmin}
              className="hover:text-[#18181B] hover:underline underline-offset-4 cursor-pointer"
            >
              Kelola Katalog
            </button>
          </div>
        </div>
      </footer>

      <ProductFormModal
        isOpen={isModalOpen}
        editingProduct={editingProduct}
        existingCategories={categories}
        isSubmitting={isSubmitting}
        serverError={formServerError}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSubmitProduct}
      />
    </div>
  );
}
