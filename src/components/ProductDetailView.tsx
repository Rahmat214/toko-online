import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  MessageCircle,
  Minus,
  Pencil,
  Plus,
} from 'lucide-react';
import type { Product, StoreSettings } from '../types';
import {
  buildWhatsAppOrderMessage,
  buildWhatsAppOrderUrl,
  formatRupiah,
} from '../utils/catalog';
import { ProductImage } from './ProductImage';

interface ProductDetailViewProps {
  product: Product;
  settings: StoreSettings;
  relatedProducts: Product[];
  onBack: () => void;
  onSelectProduct: (product: Product) => void;
  onEditProduct: (product: Product) => void;
}

export function ProductDetailView({
  product,
  settings,
  relatedProducts,
  onBack,
  onSelectProduct,
  onEditProduct,
}: ProductDetailViewProps) {
  const gallery =
    product.gallery && product.gallery.length > 0
      ? product.gallery
      : [product.imageUrl];

  const [activeImage, setActiveImage] = useState(gallery[0] ?? product.imageUrl);
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants[0] ?? '',
  );
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const nextGallery =
      product.gallery && product.gallery.length > 0
        ? product.gallery
        : [product.imageUrl];
    setActiveImage(nextGallery[0] ?? product.imageUrl);
    setSelectedVariant(product.variants[0] ?? '');
    setQuantity(1);
    setCopied(false);
  }, [product]);

  const maxQty = Math.max(1, product.stock);
  const isOutOfStock = product.stock <= 0;
  const targetPhone = product.whatsappNumber?.trim() || settings.whatsappNumber;

  const waUrl = buildWhatsAppOrderUrl({
    phone: targetPhone,
    productName: product.name,
    sku: product.sku,
    price: product.price,
    quantity,
    variant: selectedVariant || undefined,
    customerName,
    note: orderNote,
  });

  const waMessagePreview = buildWhatsAppOrderMessage({
    phone: targetPhone,
    productName: product.name,
    sku: product.sku,
    price: product.price,
    quantity,
    variant: selectedVariant || undefined,
    customerName,
    note: orderNote,
  });

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(waMessagePreview);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Breadcrumb & Quick Edit */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#E5E2DC]">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#52524E] hover:text-[#18181B] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Kembali ke Katalog
        </button>

        <button
          type="button"
          onClick={() => onEditProduct(product)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#52524E] hover:text-[#18181B] bg-[#F2EFE9] hover:bg-[#E5E2DC] rounded-lg transition-colors cursor-pointer"
        >
          <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
          Edit Produk Ini
        </button>
      </div>

      {/* Main Detail Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        {/* Left: Sticky Photo Gallery */}
        <div className="lg:col-span-7 lg:sticky lg:top-24 space-y-4">
          <div className="rounded-xl overflow-hidden border border-[#E5E2DC] bg-white">
            <ProductImage
              src={activeImage}
              alt={product.name}
              aspectClassName="aspect-[4/3]"
            />
          </div>

          {gallery.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {gallery.map((imgUrl, idx) => {
                const isSelected = imgUrl === activeImage;
                return (
                  <button
                    key={`${imgUrl}-${idx}`}
                    type="button"
                    onClick={() => setActiveImage(imgUrl)}
                    aria-label={`Lihat foto ${idx + 1} dari ${product.name}`}
                    className={`w-24 shrink-0 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#1B4332] ring-2 ring-[#1B4332]/20'
                        : 'border-[#E5E2DC] opacity-75 hover:opacity-100'
                    }`}
                  >
                    <ProductImage
                      src={imgUrl}
                      alt={`${product.name} foto ${idx + 1}`}
                      aspectClassName="aspect-[4/3]"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Contiguous Purchase & Description Module */}
        <div className="lg:col-span-5 space-y-6">
          {/* Header Metadata & Title */}
          <div className="pb-6 border-b border-[#E5E2DC]">
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#6B6963]">
              <span>{product.category}</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{product.sku}</span>
              <span aria-hidden="true">·</span>
              <span
                className={
                  isOutOfStock
                    ? 'text-[#9F1239] font-medium'
                    : 'text-[#1B4332] font-medium'
                }
              >
                {isOutOfStock
                  ? 'Stok Habis (Pre-Order via WhatsApp)'
                  : `Tersedia ${product.stock} unit`}
              </span>
            </div>

            <h1
              className="mt-2 font-display text-3xl sm:text-4xl font-medium tracking-tight text-[#18181B]"
              style={{ textWrap: 'balance' }}
            >
              {product.name}
            </h1>

            <p className="mt-3 text-2xl font-semibold text-[#18181B] tabular-nums">
              {formatRupiah(product.price)}
            </p>

            <p className="mt-3 text-sm text-[#52524E] leading-relaxed">
              {product.shortDescription}
            </p>
          </div>

          {/* Variant Selector */}
          {product.variants.length > 0 && (
            <div className="space-y-2.5">
              <span className="block text-xs font-medium text-[#52524E]">
                Pilihan Varian / Finishing
              </span>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => {
                  const active = selectedVariant === variant;
                  return (
                    <button
                      key={variant}
                      type="button"
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg border transition-colors cursor-pointer ${
                        active
                          ? 'bg-[#1B4332] text-white border-[#1B4332]'
                          : 'bg-white text-[#18181B] border-[#DCD8D0] hover:border-[#18181B]'
                      }`}
                    >
                      {variant}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity & Subtotal */}
          <div className="flex items-center justify-between gap-4 py-4 px-4 bg-white border border-[#E5E2DC] rounded-xl">
            <div>
              <span className="block text-xs text-[#6B6963]">Jumlah Pesanan</span>
              <span className="text-sm font-semibold text-[#18181B] tabular-nums">
                Total: {formatRupiah(product.price * quantity)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Kurangi jumlah"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#DCD8D0] text-[#18181B] hover:bg-[#F2EFE9] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <Minus className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
              <span
                data-testid="order-quantity"
                className="w-8 text-center text-sm font-semibold tabular-nums text-[#18181B]"
              >
                {quantity}
              </span>
              <button
                type="button"
                aria-label="Tambah jumlah"
                onClick={() =>
                  setQuantity((q) => (isOutOfStock ? q + 1 : Math.min(maxQty, q + 1)))
                }
                disabled={!isOutOfStock && quantity >= maxQty}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#DCD8D0] text-[#18181B] hover:bg-[#F2EFE9] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
              >
                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Optional Customer Details for WhatsApp Message */}
          <div className="space-y-3">
            <div>
              <label
                htmlFor="wa-customer-name"
                className="block text-xs font-medium text-[#52524E] mb-1"
              >
                Nama Pemesan (opsional)
              </label>
              <input
                id="wa-customer-name"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Contoh: Andi Pratama"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#DCD8D0] rounded-lg text-[#18181B] placeholder:text-[#8A8780] focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            <div>
              <label
                htmlFor="wa-order-note"
                className="block text-xs font-medium text-[#52524E] mb-1"
              >
                Catatan Tambahan / Alamat (opsional)
              </label>
              <textarea
                id="wa-order-note"
                rows={2}
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="Contoh: Kirim ke Kemang, Jakarta Selatan"
                className="w-full px-3.5 py-2 text-sm bg-white border border-[#DCD8D0] rounded-lg text-[#18181B] placeholder:text-[#8A8780] focus:outline-none focus:border-[#1B4332]"
              />
            </div>
          </div>

          {/* Direct WhatsApp CTA */}
          <div className="space-y-2.5 pt-1">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="whatsapp-order-link"
              className="w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white bg-[#1B4332] hover:bg-[#143326] rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4332]"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              {isOutOfStock
                ? 'Tanya Pre-Order via WhatsApp'
                : 'Pesan Langsung via WhatsApp'}
            </a>

            <button
              type="button"
              onClick={handleCopyMessage}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium text-[#52524E] bg-[#F2EFE9] hover:bg-[#E5E2DC] rounded-lg transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#1B4332]" aria-hidden="true" />
                  Format Pesan WhatsApp Tersalin
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                  Salin Format Pesan WhatsApp
                </>
              )}
            </button>
          </div>

          {/* Full Description */}
          <div className="pt-6 border-t border-[#E5E2DC] space-y-3">
            <h2 className="text-base font-semibold text-[#18181B]">
              Deskripsi Produk
            </h2>
            <div className="text-sm text-[#52524E] leading-relaxed whitespace-pre-line">
              {product.description}
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="pt-6 border-t border-[#E5E2DC] space-y-3">
            <h2 className="text-base font-semibold text-[#18181B]">
              Spesifikasi & Perawatan
            </h2>
            <dl className="divide-y divide-[#F0EDE6] text-sm">
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-[#6B6963]">Material</dt>
                <dd className="text-right text-[#18181B] font-medium">
                  {product.specs.material || '-'}
                </dd>
              </div>
              <div className="py-2.5 flex justify-between gap-4">
                <dt className="text-[#6B6963]">Dimensi</dt>
                <dd className="text-right text-[#18181B] tabular-nums">
                  {product.specs.dimensions || '-'}
                </dd>
              </div>
              {product.specs.weight && (
                <div className="py-2.5 flex justify-between gap-4">
                  <dt className="text-[#6B6963]">Berat</dt>
                  <dd className="text-right text-[#18181B] tabular-nums">
                    {product.specs.weight}
                  </dd>
                </div>
              )}
              {product.specs.care && (
                <div className="py-2.5 flex flex-col gap-1">
                  <dt className="text-[#6B6963]">Perawatan</dt>
                  <dd className="text-[#18181B] leading-relaxed">
                    {product.specs.care}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-[#E5E2DC]">
          <h2 className="font-display text-2xl font-medium text-[#18181B]">
            Produk Terkait Lainnya
          </h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedProducts.slice(0, 3).map((item) => (
              <article
                key={item.id}
                className="group bg-white border border-[#E5E2DC] rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => onSelectProduct(item)}
                  className="w-full text-left cursor-pointer"
                >
                  <ProductImage
                    src={item.imageUrl}
                    alt={item.name}
                    className="border-b border-[#E5E2DC]"
                  />
                  <div className="p-4">
                    <p className="text-xs text-[#6B6963]">{item.category}</p>
                    <h3 className="mt-1 text-sm font-semibold text-[#18181B] group-hover:text-[#1B4332]">
                      {item.name}
                    </h3>
                    <p className="mt-2 text-sm font-semibold text-[#18181B] tabular-nums">
                      {formatRupiah(item.price)}
                    </p>
                  </div>
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
