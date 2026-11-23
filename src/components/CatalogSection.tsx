import { Search, SlidersHorizontal, X } from 'lucide-react';
import type { CatalogFilters, PriceRangeFilter, Product, SortOption } from '../types';
import { formatRupiah } from '../utils/catalog';
import { ProductImage } from './ProductImage';

interface CatalogSectionProps {
  products: Product[];
  totalCount: number;
  categories: string[];
  filters: CatalogFilters;
  isLoading: boolean;
  onFiltersChange: (next: CatalogFilters) => void;
  onSelectProduct: (product: Product) => void;
  onResetFilters: () => void;
}

export function CatalogSection({
  products,
  totalCount,
  categories,
  filters,
  isLoading,
  onFiltersChange,
  onSelectProduct,
  onResetFilters,
}: CatalogSectionProps) {
  const hasActiveFilters =
    filters.query.trim() !== '' ||
    filters.category !== 'Semua' ||
    filters.onlyInStock ||
    filters.priceRange !== 'all' ||
    filters.sortBy !== 'newest';

  return (
    <section id="katalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-[#E5E2DC]">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl font-medium tracking-tight text-[#18181B]">
            Katalog Produk
          </h2>
          <p className="mt-1.5 text-sm text-[#52524E]">
            Menampilkan <span className="tabular-nums font-medium text-[#18181B]">{products.length}</span> dari{' '}
            <span className="tabular-nums">{totalCount}</span> produk kurasi
          </p>
        </div>

        {/* Search Input */}
        <div className="w-full sm:w-88">
          <label htmlFor="catalog-search" className="sr-only">
            Cari produk berdasarkan nama, kategori, atau material
          </label>
          <div className="relative">
            <Search
              className="w-4 h-4 text-[#6B6963] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="catalog-search"
              type="search"
              value={filters.query}
              onChange={(e) =>
                onFiltersChange({ ...filters, query: e.target.value })
              }
              placeholder="Cari nama, kategori, atau material..."
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-white border border-[#DCD8D0] rounded-lg text-[#18181B] placeholder:text-[#8A8780] focus:outline-none focus:border-[#1B4332] focus:ring-1 focus:ring-[#1B4332]"
            />
            {filters.query && (
              <button
                type="button"
                onClick={() => onFiltersChange({ ...filters, query: '' })}
                aria-label="Hapus kata kunci pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#6B6963] hover:text-[#18181B] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category & Filter Controls */}
      <div className="py-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div
          role="tablist"
          aria-label="Filter kategori produk"
          className="flex flex-wrap items-center gap-1.5"
        >
          {categories.map((category) => {
            const active = filters.category === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onFiltersChange({ ...filters, category })}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#1B4332] text-white'
                    : 'bg-[#F2EFE9] text-[#52524E] hover:bg-[#E5E2DC] hover:text-[#18181B]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Price, Stock, Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-[#52524E]">
            <SlidersHorizontal className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <label htmlFor="price-filter" className="sr-only">
              Filter rentang harga
            </label>
            <select
              id="price-filter"
              value={filters.priceRange}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  priceRange: e.target.value as PriceRangeFilter,
                })
              }
              className="px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCD8D0] rounded-lg text-[#18181B] focus:outline-none focus:border-[#1B4332] cursor-pointer"
            >
              <option value="all">Semua Harga</option>
              <option value="under_1m">Di bawah Rp 1 jt</option>
              <option value="1m_to_5m">Rp 1 jt – Rp 5 jt</option>
              <option value="above_5m">Di atas Rp 5 jt</option>
            </select>
          </div>

          <label className="inline-flex items-center gap-2 px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCD8D0] rounded-lg text-[#18181B] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.onlyInStock}
              onChange={(e) =>
                onFiltersChange({ ...filters, onlyInStock: e.target.checked })
              }
              className="accent-[#1B4332] w-3.5 h-3.5 cursor-pointer"
            />
            <span className="whitespace-nowrap">Stok tersedia</span>
          </label>

          <div>
            <label htmlFor="sort-select" className="sr-only">
              Urutkan produk
            </label>
            <select
              id="sort-select"
              value={filters.sortBy}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  sortBy: e.target.value as SortOption,
                })
              }
              className="px-3 py-2 text-xs sm:text-sm bg-white border border-[#DCD8D0] rounded-lg text-[#18181B] focus:outline-none focus:border-[#1B4332] cursor-pointer"
            >
              <option value="newest">Urutkan: Terbaru</option>
              <option value="price_asc">Harga: Terendah</option>
              <option value="price_desc">Harga: Tertinggi</option>
              <option value="name_asc">Nama: A – Z</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-3 py-2 text-xs font-medium text-[#1B4332] hover:underline underline-offset-4 whitespace-nowrap cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-2">
          {[1, 2, 3].map((n) => (
            <div key={n} className="animate-pulse space-y-3">
              <div className="aspect-[4/3] bg-[#EAE6DD] rounded-xl" />
              <div className="h-3 w-24 bg-[#EAE6DD] rounded" />
              <div className="h-5 w-48 bg-[#EAE6DD] rounded" />
              <div className="h-4 w-32 bg-[#EAE6DD] rounded" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white border border-[#E5E2DC] rounded-xl mt-2">
          <p className="font-display text-xl text-[#18181B]">
            Produk tidak ditemukan
          </p>
          <p className="mt-2 text-sm text-[#52524E] max-w-md mx-auto">
            Tidak ada produk yang sesuai dengan kata kunci atau filter yang Anda pilih.
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-5 px-5 py-2.5 text-sm font-medium text-white bg-[#1B4332] hover:bg-[#143326] rounded-lg transition-colors cursor-pointer"
          >
            Tampilkan Semua Produk
          </button>
        </div>
      ) : (
        <div
          data-testid="catalog-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-2"
        >
          {products.map((product) => {
            const isOutOfStock = product.stock <= 0;
            return (
              <article
                key={product.id}
                className="group flex flex-col bg-white border border-[#E5E2DC] rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => onSelectProduct(product)}
                  aria-label={`Lihat detail ${product.name}`}
                  className="text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4332] cursor-pointer flex-1 flex flex-col"
                >
                  <ProductImage
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full border-b border-[#E5E2DC]"
                  />

                  <div className="p-5 flex-1 flex flex-col justify-between gap-4 w-full">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-[#6B6963]">
                        <span>{product.category}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            isOutOfStock
                              ? 'text-[#9F1239] font-medium'
                              : 'text-[#52524E]'
                          }
                        >
                          {isOutOfStock ? 'Stok Habis' : `Stok ${product.stock}`}
                        </span>
                      </div>

                      <h3 className="mt-1.5 text-base font-semibold text-[#18181B] group-hover:text-[#1B4332] transition-colors">
                        {product.name}
                      </h3>

                      <p className="mt-1.5 text-sm text-[#52524E] line-clamp-2 leading-relaxed">
                        {product.shortDescription}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#F0EDE6] flex items-center justify-between gap-3">
                      <span className="text-[15px] font-semibold text-[#18181B] tabular-nums">
                        {formatRupiah(product.price)}
                      </span>
                      <span className="text-xs font-medium text-[#1B4332] group-hover:underline underline-offset-4 whitespace-nowrap">
                        Lihat Detail
                      </span>
                    </div>
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
