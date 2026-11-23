import type {
  CatalogFilters,
  Product,
  ProductFormInput,
} from '../types';

export function formatRupiah(amount: number): string {
  const safe = Number.isFinite(amount) ? Math.max(0, Math.round(amount)) : 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(safe);
}

export function normalizeWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith('8')) {
    return `62${digits}`;
  }
  return digits;
}

export interface WhatsAppOrderParams {
  phone: string;
  productName: string;
  sku?: string;
  price: number;
  quantity: number;
  variant?: string;
  customerName?: string;
  note?: string;
}

export function buildWhatsAppOrderMessage(params: WhatsAppOrderParams): string {
  const qty = Math.max(1, Math.floor(params.quantity || 1));
  const total = params.price * qty;
  const lines = [
    'Halo Karya Ruang, saya ingin memesan produk berikut:',
    '',
    `Produk: ${params.productName}${params.sku ? ` (${params.sku})` : ''}`,
    ...(params.variant ? [`Varian: ${params.variant}`] : []),
    `Jumlah: ${qty} unit`,
    `Harga Satuan: ${formatRupiah(params.price)}`,
    `Estimasi Total: ${formatRupiah(total)}`,
  ];

  if (params.customerName && params.customerName.trim()) {
    lines.push(`Nama Pemesan: ${params.customerName.trim()}`);
  }
  if (params.note && params.note.trim()) {
    lines.push(`Catatan: ${params.note.trim()}`);
  }

  lines.push('', 'Mohon informasi ketersediaan dan rincian pengiriman. Terima kasih.');
  return lines.join('\n');
}

export function buildWhatsAppOrderUrl(params: WhatsAppOrderParams): string {
  const normalized = normalizeWhatsAppNumber(params.phone);
  const message = buildWhatsAppOrderMessage(params);
  const encoded = encodeURIComponent(message);
  if (!normalized) {
    return `https://wa.me/?text=${encoded}`;
  }
  return `https://wa.me/${normalized}?text=${encoded}`;
}

export function extractCategories(products: Product[]): string[] {
  const unique = new Set<string>();
  for (const product of products) {
    const trimmed = product.category.trim();
    if (trimmed) unique.add(trimmed);
  }
  return ['Semua', ...Array.from(unique).sort((a, b) => a.localeCompare(b, 'id'))];
}

export function filterAndSortProducts(
  products: Product[],
  filters: CatalogFilters,
): Product[] {
  const q = filters.query.trim().toLowerCase();

  const filtered = products.filter((product) => {
    if (filters.category && filters.category !== 'Semua') {
      if (product.category.toLowerCase() !== filters.category.toLowerCase()) {
        return false;
      }
    }

    if (filters.onlyInStock && product.stock <= 0) {
      return false;
    }

    if (filters.priceRange === 'under_1m' && product.price >= 1_000_000) {
      return false;
    }
    if (
      filters.priceRange === '1m_to_5m' &&
      (product.price < 1_000_000 || product.price > 5_000_000)
    ) {
      return false;
    }
    if (filters.priceRange === 'above_5m' && product.price <= 5_000_000) {
      return false;
    }

    if (q) {
      const haystack = [
        product.name,
        product.category,
        product.sku,
        product.shortDescription,
        product.description,
        product.specs?.material ?? '',
        ...(product.variants ?? []),
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(q)) {
        return false;
      }
    }

    return true;
  });

  const sorted = [...filtered];
  switch (filters.sortBy) {
    case 'price_asc':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'name_asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name, 'id'));
      break;
    case 'newest':
    default:
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
      break;
  }

  return sorted;
}

export function validateProductInput(
  input: ProductFormInput,
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.name.trim()) {
    errors.name = 'Nama produk wajib diisi.';
  } else if (input.name.trim().length < 3) {
    errors.name = 'Nama produk minimal 3 karakter.';
  }

  if (!input.category.trim()) {
    errors.category = 'Kategori wajib dipilih atau diisi.';
  }

  const parsedPrice = Number(input.price);
  if (input.price === '' || !Number.isFinite(parsedPrice) || parsedPrice <= 0) {
    errors.price = 'Harga harus berupa angka lebih dari 0.';
  }

  const parsedStock = Number(input.stock);
  if (
    input.stock === '' ||
    !Number.isFinite(parsedStock) ||
    parsedStock < 0 ||
    !Number.isInteger(parsedStock)
  ) {
    errors.stock = 'Stok harus berupa bilangan bulat 0 atau lebih.';
  }

  if (!input.shortDescription.trim()) {
    errors.shortDescription = 'Ringkasan singkat produk wajib diisi.';
  }

  if (!input.description.trim()) {
    errors.description = 'Deskripsi lengkap produk wajib diisi.';
  }

  if (!input.imageUrl.trim()) {
    errors.imageUrl = 'Foto atau URL gambar produk wajib diisi.';
  }

  if (input.whatsappNumber && input.whatsappNumber.trim()) {
    const normalized = normalizeWhatsAppNumber(input.whatsappNumber);
    if (normalized.length < 9 || normalized.length > 15) {
      errors.whatsappNumber =
        'Nomor WhatsApp tidak valid (contoh: 081234567890 atau 6281234567890).';
    }
  }

  return errors;
}

export function parseCommaList(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}
