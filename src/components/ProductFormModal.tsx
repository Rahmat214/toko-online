import { useEffect, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { PRESET_PRODUCT_IMAGES } from '../data/seedProducts';
import type { Product, ProductFormInput } from '../types';
import { validateProductInput } from '../utils/catalog';
import { ProductImage } from './ProductImage';

interface ProductFormModalProps {
  isOpen: boolean;
  editingProduct: Product | null;
  existingCategories: string[];
  isSubmitting: boolean;
  serverError: string | null;
  onClose: () => void;
  onSubmit: (payload: ProductFormInput) => Promise<void>;
}

const EMPTY_FORM: ProductFormInput = {
  name: '',
  category: 'Furnitur',
  price: '',
  stock: '5',
  shortDescription: '',
  description: '',
  imageUrl: PRESET_PRODUCT_IMAGES[0].url,
  galleryText: '',
  variantsText: '',
  material: '',
  dimensions: '',
  weight: '',
  care: '',
  whatsappNumber: '',
};

async function resizeImageToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak didukung.'));
      img.onload = () => {
        const maxSide = 1200;
        let { width, height } = img;
        if (width > maxSide || height > maxSide) {
          if (width >= height) {
            height = Math.round((height * maxSide) / width);
            width = maxSide;
          } else {
            width = Math.round((width * maxSide) / height);
            height = maxSide;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function ProductFormModal({
  isOpen,
  editingProduct,
  existingCategories,
  isSubmitting,
  serverError,
  onClose,
  onSubmit,
}: ProductFormModalProps) {
  const [form, setForm] = useState<ProductFormInput>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (editingProduct) {
      const extraGallery = (editingProduct.gallery ?? []).filter(
        (g) => g !== editingProduct.imageUrl,
      );
      setForm({
        name: editingProduct.name,
        category: editingProduct.category,
        price: String(editingProduct.price),
        stock: String(editingProduct.stock),
        shortDescription: editingProduct.shortDescription,
        description: editingProduct.description,
        imageUrl: editingProduct.imageUrl,
        galleryText: extraGallery.join(', '),
        variantsText: (editingProduct.variants ?? []).join(', '),
        material: editingProduct.specs?.material ?? '',
        dimensions: editingProduct.specs?.dimensions ?? '',
        weight: editingProduct.specs?.weight ?? '',
        care: editingProduct.specs?.care ?? '',
        whatsappNumber: editingProduct.whatsappNumber ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setUploadError(null);
  }, [isOpen, editingProduct]);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      const dataUrl = await resizeImageToDataUrl(file);
      setForm((prev) => ({ ...prev, imageUrl: dataUrl }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next.imageUrl;
        return next;
      });
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : 'Gagal memproses foto.',
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateProductInput(form);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }
    setErrors({});
    await onSubmit(form);
  };

  const categorySuggestions = Array.from(
    new Set([
      'Furnitur',
      'Pencahayaan',
      'Keramik & Meja',
      'Tekstil & Kulit',
      ...existingCategories.filter((c) => c !== 'Semua'),
    ]),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div className="bg-[#FAF9F6] border border-[#E5E2DC] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-xl">
        <div className="px-6 py-4 bg-white border-b border-[#E5E2DC] flex items-center justify-between gap-4">
          <h2
            id="product-modal-title"
            className="font-display text-xl font-medium text-[#18181B]"
          >
            {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup form produk"
            className="p-2 text-[#6B6963] hover:text-[#18181B] rounded-lg hover:bg-[#F2EFE9] cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5 overflow-y-auto">
          {serverError && (
            <div
              role="alert"
              className="p-3 text-xs font-medium text-[#9F1239] bg-[#FFF1F2] border border-[#FECDD3] rounded-lg"
            >
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="prod-name"
                className="block text-xs font-medium text-[#18181B] mb-1"
              >
                Nama Produk *
              </label>
              <input
                id="prod-name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Contoh: Kursi Kerja Jati Minimalis"
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#DCD8D0] rounded-lg focus:outline-none focus:border-[#1B4332]"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-[#9F1239]">{errors.name}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="prod-category"
                className="block text-xs font-medium text-[#18181B] mb-1"
              >
                Kategori *
              </label>
              <input
                id="prod-category"
                type="text"
                list="category-options"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="Pilih atau ketik kategori baru"
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#DCD8D0] rounded-lg focus:outline-none focus:border-[#1B4332]"
              />
              <datalist id="category-options">
                {categorySuggestions.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              {errors.category && (
                <p className="mt-1 text-xs text-[#9F1239]">{errors.category}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="prod-price"
                className="block text-xs font-medium text-[#18181B] mb-1"
              >
                Harga (Rp) *
              </label>
              <input
                id="prod-price"
                type="number"
                min={1}
                step={1}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="1500000"
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#DCD8D0] rounded-lg tabular-nums focus:outline-none focus:border-[#1B4332]"
              />
              {errors.price && (
                <p className="mt-1 text-xs text-[#9F1239]">{errors.price}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="prod-stock"
                className="block text-xs font-medium text-[#18181B] mb-1"
              >
                Stok (unit) *
              </label>
              <input
                id="prod-stock"
                type="number"
                min={0}
                step={1}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#DCD8D0] rounded-lg tabular-nums focus:outline-none focus:border-[#1B4332]"
              />
              {errors.stock && (
                <p className="mt-1 text-xs text-[#9F1239]">{errors.stock}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="prod-wa"
                className="block text-xs font-medium text-[#18181B] mb-1"
              >
                Nomor WA Khusus (opsional)
              </label>
              <input
                id="prod-wa"
                type="text"
                value={form.whatsappNumber ?? ''}
                onChange={(e) =>
                  setForm({ ...form, whatsappNumber: e.target.value })
                }
                placeholder="Default nomor toko"
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#DCD8D0] rounded-lg tabular-nums focus:outline-none focus:border-[#1B4332]"
              />
              {errors.whatsappNumber && (
                <p className="mt-1 text-xs text-[#9F1239]">
                  {errors.whatsappNumber}
                </p>
              )}
            </div>
          </div>

          {/* Photo Section */}
          <div className="p-4 bg-white border border-[#E5E2DC] rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="prod-image-url"
                className="text-xs font-medium text-[#18181B]"
              >
                Foto Produk (URL atau Upload Gambar) *
              </label>
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1B4332] bg-[#F2EFE9] hover:bg-[#E5E2DC] rounded-lg cursor-pointer">
                <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                Upload File Foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
              <div className="sm:col-span-4 rounded-lg overflow-hidden border border-[#E5E2DC]">
                <ProductImage
                  src={form.imageUrl}
                  alt={form.name || 'Pratinjau foto produk'}
                />
              </div>

              <div className="sm:col-span-8 space-y-2.5">
                <input
                  id="prod-image-url"
                  type="text"
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="/src/assets/images/... atau https://..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#DCD8D0] rounded-lg focus:outline-none focus:border-[#1B4332]"
                />
                {uploadError && (
                  <p className="text-xs text-[#9F1239]">{uploadError}</p>
                )}
                {errors.imageUrl && (
                  <p className="text-xs text-[#9F1239]">{errors.imageUrl}</p>
                )}

                <div>
                  <span className="block text-[11px] text-[#6B6963] mb-1.5">
                    Atau pilih foto studio bawaan:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_PRODUCT_IMAGES.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setForm({ ...form, imageUrl: preset.url })}
                        className={`px-2.5 py-1 text-[11px] rounded border cursor-pointer transition-colors ${
                          form.imageUrl === preset.url
                            ? 'bg-[#1B4332] text-white border-[#1B4332]'
                            : 'bg-[#FAF9F6] text-[#52524E] border-[#DCD8D0] hover:border-[#18181B]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="prod-short-desc"
              className="block text-xs font-medium text-[#18181B] mb-1"
            >
              Ringkasan Singkat (ditampilkan di kartu katalog) *
            </label>
            <input
              id="prod-short-desc"
              type="text"
              value={form.shortDescription}
              onChange={(e) =>
                setForm({ ...form, shortDescription: e.target.value })
              }
              placeholder="Deskripsi singkat 1 kalimat mengenai produk"
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#DCD8D0] rounded-lg focus:outline-none focus:border-[#1B4332]"
            />
            {errors.shortDescription && (
              <p className="mt-1 text-xs text-[#9F1239]">
                {errors.shortDescription}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="prod-desc"
              className="block text-xs font-medium text-[#18181B] mb-1"
            >
              Deskripsi Lengkap Produk *
            </label>
            <textarea
              id="prod-desc"
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Jelaskan detail pengerjaan, keunggulan material, dan fungsi produk..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-[#DCD8D0] rounded-lg focus:outline-none focus:border-[#1B4332]"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-[#9F1239]">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="prod-variants"
                className="block text-xs font-medium text-[#18181B] mb-1"
              >
                Varian (pisahkan dengan koma)
              </label>
              <input
                id="prod-variants"
                type="text"
                value={form.variantsText ?? ''}
                onChange={(e) =>
                  setForm({ ...form, variantsText: e.target.value })
                }
                placeholder="Natural Jati, Walnut Gelap"
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#DCD8D0] rounded-lg focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            <div>
              <label
                htmlFor="prod-material"
                className="block text-xs font-medium text-[#18181B] mb-1"
              >
                Material
              </label>
              <input
                id="prod-material"
                type="text"
                value={form.material ?? ''}
                onChange={(e) => setForm({ ...form, material: e.target.value })}
                placeholder="Kayu Jati Solid & Rotan"
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#DCD8D0] rounded-lg focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            <div>
              <label
                htmlFor="prod-dimensions"
                className="block text-xs font-medium text-[#18181B] mb-1"
              >
                Dimensi
              </label>
              <input
                id="prod-dimensions"
                type="text"
                value={form.dimensions ?? ''}
                onChange={(e) =>
                  setForm({ ...form, dimensions: e.target.value })
                }
                placeholder="68 × 74 × 76 cm"
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#DCD8D0] rounded-lg focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            <div>
              <label
                htmlFor="prod-care"
                className="block text-xs font-medium text-[#18181B] mb-1"
              >
                Catatan Perawatan (opsional)
              </label>
              <input
                id="prod-care"
                type="text"
                value={form.care ?? ''}
                onChange={(e) => setForm({ ...form, care: e.target.value })}
                placeholder="Lap dengan kain kering lembut"
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#DCD8D0] rounded-lg focus:outline-none focus:border-[#1B4332]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[#E5E2DC] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-[#52524E] hover:text-[#18181B] bg-[#EFECE6] hover:bg-[#E5E2DC] rounded-lg transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#1B4332] hover:bg-[#143326] disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            >
              {isSubmitting
                ? 'Menyimpan...'
                : editingProduct
                  ? 'Simpan Perubahan'
                  : 'Tambahkan Produk'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
