import { useEffect, useState } from 'react';
import {
  Check,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import type { Product, StoreSettings } from '../types';
import { formatRupiah, normalizeWhatsAppNumber } from '../utils/catalog';
import { ProductImage } from './ProductImage';

interface ProductAdminViewProps {
  products: Product[];
  settings: StoreSettings;
  categories: string[];
  onAddNew: () => void;
  onEdit: (product: Product) => void;
  onView: (product: Product) => void;
  onDelete: (product: Product) => Promise<void>;
  onSaveSettings: (whatsappNumber: string) => Promise<void>;
}

export function ProductAdminView({
  products,
  settings,
  categories,
  onAddNew,
  onEdit,
  onView,
  onDelete,
  onSaveSettings,
}: ProductAdminViewProps) {
  const [adminQuery, setAdminQuery] = useState('');
  const [waInput, setWaInput] = useState(settings.whatsappNumber);
  const [waSaved, setWaSaved] = useState(false);
  const [waError, setWaError] = useState<string | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setWaInput(settings.whatsappNumber);
  }, [settings.whatsappNumber]);

  const filtered = products.filter((p) => {
    const q = adminQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    );
  });

  const totalUnits = products.reduce((sum, item) => sum + item.stock, 0);
  const activeCategories = Math.max(0, categories.length - 1);

  const handleSaveWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeWhatsAppNumber(waInput);
    if (normalized.length < 9 || normalized.length > 15) {
      setWaError('Masukkan nomor WhatsApp valid (contoh: 081234567890).');
      return;
    }
    setWaError(null);
    await onSaveSettings(waInput.trim());
    setWaSaved(true);
    setTimeout(() => setWaSaved(false), 2500);
  };

  const confirmDelete = async () => {
    if (!deletingTarget) return;
    setIsDeleting(true);
    try {
      await onDelete(deletingTarget);
      setDeletingTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E5E2DC]">
        <div>
          <p className="text-xs font-medium text-[#6B6963]">
            Manajemen Katalog (CRUD)
          </p>
          <h1 className="mt-1 font-display text-3xl font-medium text-[#18181B]">
            Kelola Produk Toko
          </h1>
        </div>

        <button
          type="button"
          onClick={onAddNew}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#1B4332] hover:bg-[#143326] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
          Tambah Produk
        </button>
      </div>

      {/* Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white border border-[#E5E2DC] rounded-xl">
          <span className="text-xs text-[#6B6963]">Total Produk</span>
          <p className="mt-1 text-2xl font-semibold text-[#18181B] tabular-nums">
            {products.length}
          </p>
        </div>
        <div className="p-4 bg-white border border-[#E5E2DC] rounded-xl">
          <span className="text-xs text-[#6B6963]">Total Unit Stok</span>
          <p className="mt-1 text-2xl font-semibold text-[#18181B] tabular-nums">
            {totalUnits}
          </p>
        </div>
        <div className="p-4 bg-white border border-[#E5E2DC] rounded-xl">
          <span className="text-xs text-[#6B6963]">Kategori Aktif</span>
          <p className="mt-1 text-2xl font-semibold text-[#18181B] tabular-nums">
            {activeCategories}
          </p>
        </div>
        <div className="p-4 bg-white border border-[#E5E2DC] rounded-xl">
          <span className="text-xs text-[#6B6963]">WhatsApp Tujuan</span>
          <p className="mt-1 text-base font-semibold text-[#1B4332] tabular-nums truncate">
            +{normalizeWhatsAppNumber(settings.whatsappNumber)}
          </p>
        </div>
      </div>

      {/* Store WhatsApp Settings Bar */}
      <form
        onSubmit={handleSaveWhatsApp}
        className="p-5 bg-white border border-[#E5E2DC] rounded-xl flex flex-col md:flex-row md:items-end justify-between gap-4"
      >
        <div className="flex-1 max-w-md">
          <label
            htmlFor="store-wa-input"
            className="block text-xs font-medium text-[#18181B] mb-1"
          >
            Nomor WhatsApp Utama Toko (tujuan tombol pemesanan)
          </label>
          <input
            id="store-wa-input"
            type="text"
            value={waInput}
            onChange={(e) => setWaInput(e.target.value)}
            placeholder="081234567890"
            className="w-full px-3.5 py-2 text-sm bg-[#FAF9F6] border border-[#DCD8D0] rounded-lg tabular-nums focus:outline-none focus:border-[#1B4332]"
          />
          {waError && (
            <p className="mt-1 text-xs text-[#9F1239]">{waError}</p>
          )}
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[#18181B] bg-[#F2EFE9] hover:bg-[#E5E2DC] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {waSaved ? (
            <>
              <Check className="w-4 h-4 text-[#1B4332]" aria-hidden="true" />
              Nomor Tersimpan
            </>
          ) : (
            'Simpan Nomor WhatsApp'
          )}
        </button>
      </form>

      {/* Admin Search & Product Table */}
      <div className="bg-white border border-[#E5E2DC] rounded-xl overflow-hidden">
        <div className="p-4 border-b border-[#E5E2DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-[#18181B]">
            Daftar Produk ({filtered.length})
          </h2>

          <div className="relative w-full sm:w-72">
            <label htmlFor="admin-search" className="sr-only">
              Cari produk di tabel manajemen
            </label>
            <Search
              className="w-4 h-4 text-[#6B6963] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="admin-search"
              type="search"
              value={adminQuery}
              onChange={(e) => setAdminQuery(e.target.value)}
              placeholder="Cari nama, SKU, atau kategori..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-[#FAF9F6] border border-[#DCD8D0] rounded-lg focus:outline-none focus:border-[#1B4332]"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 px-6 text-center text-sm text-[#52524E]">
            Belum ada produk yang cocok dengan pencarian Anda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E5E2DC] bg-[#FAF9F6] text-xs font-medium text-[#6B6963]">
                  <th className="py-3 px-4">Produk</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4 text-right">Harga</th>
                  <th className="py-3 px-4 text-right">Stok</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EDE6] text-sm">
                {filtered.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-[#FAF9F6]/70 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3.5 min-w-[220px]">
                        <div className="w-16 shrink-0 rounded-lg overflow-hidden border border-[#E5E2DC]">
                          <ProductImage
                            src={product.imageUrl}
                            alt={product.name}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-[#18181B] truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-[#6B6963] tabular-nums">
                            {product.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#52524E] whitespace-nowrap">
                      {product.category}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-[#18181B] tabular-nums whitespace-nowrap">
                      {formatRupiah(product.price)}
                    </td>
                    <td className="py-3.5 px-4 text-right tabular-nums whitespace-nowrap">
                      <span
                        className={
                          product.stock <= 0
                            ? 'text-[#9F1239] font-medium'
                            : 'text-[#18181B]'
                        }
                      >
                        {product.stock} unit
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onView(product)}
                          aria-label={`Lihat detail ${product.name}`}
                          className="p-2 text-[#52524E] hover:text-[#18181B] hover:bg-[#F2EFE9] rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(product)}
                          aria-label={`Edit ${product.name}`}
                          className="p-2 text-[#52524E] hover:text-[#1B4332] hover:bg-[#F2EFE9] rounded-lg transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingTarget(product)}
                          aria-label={`Hapus ${product.name}`}
                          className="p-2 text-[#52524E] hover:text-[#9F1239] hover:bg-[#FFF1F2] rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="bg-white border border-[#E5E2DC] rounded-xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <h2
              id="delete-modal-title"
              className="font-display text-xl font-medium text-[#18181B]"
            >
              Hapus Produk?
            </h2>
            <p className="text-sm text-[#52524E] leading-relaxed">
              Produk <strong className="text-[#18181B]">{deletingTarget.name}</strong>{' '}
              akan dihapus permanen dari katalog toko. Tindakan ini tidak dapat
              dibatalkan.
            </p>
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-[#52524E] bg-[#F2EFE9] hover:bg-[#E5E2DC] rounded-lg cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-[#9F1239] hover:bg-[#881337] disabled:opacity-50 rounded-lg cursor-pointer"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Produk'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
