import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWhatsAppOrderMessage,
  buildWhatsAppOrderUrl,
  extractCategories,
  filterAndSortProducts,
  formatRupiah,
  normalizeWhatsAppNumber,
  validateProductInput,
} from './catalog';
import type { Product } from '../types';

const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    sku: 'KR-F01',
    name: 'Kursi Santai Jati Soren',
    category: 'Furnitur',
    price: 4_850_000,
    stock: 5,
    shortDescription: 'Kursi kayu jati solid dengan anyaman rotan alami.',
    description: 'Dibuat dengan rangka kayu jati Perhutani dan rotan alam.',
    imageUrl: '/src/assets/images/prod_kursi_jati_1795398915272.jpg',
    gallery: ['/src/assets/images/prod_kursi_jati_1795398915272.jpg'],
    variants: ['Natural Jati', 'Walnut Gelap'],
    specs: { material: 'Kayu Jati & Rotan', dimensions: '68 x 74 x 76 cm' },
    createdAt: '2026-11-20T08:00:00.000Z',
    updatedAt: '2026-11-20T08:00:00.000Z',
  },
  {
    id: 'p2',
    sku: 'KR-L01',
    name: 'Lampu Meja Kuningan Opal',
    category: 'Pencahayaan',
    price: 1_950_000,
    stock: 0,
    shortDescription: 'Lampu meja kuningan sikat dengan kap kaca susu.',
    description: 'Memberikan cahaya hangat untuk meja kerja atau nakas.',
    imageUrl: '/src/assets/images/prod_lampu_kuningan_1795398914591.jpg',
    gallery: ['/src/assets/images/prod_lampu_kuningan_1795398914591.jpg'],
    variants: ['Kuningan Matte'],
    specs: { material: 'Kuningan & Kaca Opal', dimensions: '22 x 22 x 36 cm' },
    createdAt: '2026-11-21T08:00:00.000Z',
    updatedAt: '2026-11-21T08:00:00.000Z',
  },
  {
    id: 'p3',
    sku: 'KR-K01',
    name: 'Set Teko Keramik Arang',
    category: 'Keramik & Meja',
    price: 680_000,
    stock: 12,
    shortDescription: 'Teko stoneware bakar suhu tinggi beserta 2 cangkir.',
    description: 'Glasir matte arang bertekstur alami buatan tangan.',
    imageUrl: '/src/assets/images/prod_teko_keramik_1795398914264.jpg',
    gallery: ['/src/assets/images/prod_teko_keramik_1795398914264.jpg'],
    variants: ['Arang Matte', 'Pasir Hangat'],
    specs: { material: 'Stoneware Clay', dimensions: 'Teko 650 ml' },
    createdAt: '2026-11-22T08:00:00.000Z',
    updatedAt: '2026-11-22T08:00:00.000Z',
  },
];

test('normalizeWhatsAppNumber converts local 08 and +62 numbers cleanly', () => {
  assert.equal(normalizeWhatsAppNumber('0812-3456-7890'), '6281234567890');
  assert.equal(normalizeWhatsAppNumber('+62 811 2233 4455'), '6281122334455');
  assert.equal(normalizeWhatsAppNumber('81299887766'), '6281299887766');
  assert.equal(normalizeWhatsAppNumber(''), '');
});

test('formatRupiah formats Indonesian currency without decimals', () => {
  assert.match(formatRupiah(4850000), /Rp\s?4\.850\.000/);
  assert.match(formatRupiah(0), /Rp\s?0/);
});

test('buildWhatsAppOrderUrl encodes normalized number and order details', () => {
  const url = buildWhatsAppOrderUrl({
    phone: '0812-3456-7890',
    productName: 'Kursi Santai Jati Soren',
    sku: 'KR-F01',
    price: 4_850_000,
    quantity: 2,
    variant: 'Natural Jati',
    customerName: 'Budi Santoso',
    note: 'Kirim ke Jakarta Selatan',
  });

  assert.ok(url.startsWith('https://wa.me/6281234567890?text='));
  const decoded = decodeURIComponent(url.split('?text=')[1]);
  assert.ok(decoded.includes('Kursi Santai Jati Soren (KR-F01)'));
  assert.ok(decoded.includes('Varian: Natural Jati'));
  assert.ok(decoded.includes('Jumlah: 2 unit'));
  assert.ok(decoded.includes('Nama Pemesan: Budi Santoso'));
  assert.ok(decoded.includes('Catatan: Kirim ke Jakarta Selatan'));
});

test('buildWhatsAppOrderMessage computes total correctly', () => {
  const msg = buildWhatsAppOrderMessage({
    phone: '6281234567890',
    productName: 'Set Teko Keramik Arang',
    price: 680_000,
    quantity: 3,
  });
  assert.ok(msg.includes('2.040.000'));
});

test('filterAndSortProducts supports search, category, stock, price range, and sort', () => {
  const bySearch = filterAndSortProducts(SAMPLE_PRODUCTS, {
    query: 'keramik',
    category: 'Semua',
    onlyInStock: false,
    priceRange: 'all',
    sortBy: 'newest',
  });
  assert.equal(bySearch.length, 1);
  assert.equal(bySearch[0].id, 'p3');

  const inStockOnly = filterAndSortProducts(SAMPLE_PRODUCTS, {
    query: '',
    category: 'Semua',
    onlyInStock: true,
    priceRange: 'all',
    sortBy: 'price_asc',
  });
  assert.deepEqual(
    inStockOnly.map((p) => p.id),
    ['p3', 'p1'],
  );

  const under1m = filterAndSortProducts(SAMPLE_PRODUCTS, {
    query: '',
    category: 'Semua',
    onlyInStock: false,
    priceRange: 'under_1m',
    sortBy: 'newest',
  });
  assert.deepEqual(
    under1m.map((p) => p.id),
    ['p3'],
  );
});

test('extractCategories returns Semua plus sorted unique categories', () => {
  assert.deepEqual(extractCategories(SAMPLE_PRODUCTS), [
    'Semua',
    'Furnitur',
    'Keramik & Meja',
    'Pencahayaan',
  ]);
});

test('validateProductInput rejects missing or invalid required fields', () => {
  const errors = validateProductInput({
    name: 'ab',
    category: '',
    price: 0,
    stock: -1,
    shortDescription: '',
    description: '',
    imageUrl: '',
    whatsappNumber: '123',
  });

  assert.ok(errors.name);
  assert.ok(errors.category);
  assert.ok(errors.price);
  assert.ok(errors.stock);
  assert.ok(errors.shortDescription);
  assert.ok(errors.description);
  assert.ok(errors.imageUrl);
  assert.ok(errors.whatsappNumber);

  const valid = validateProductInput({
    name: 'Meja Samping Jati',
    category: 'Furnitur',
    price: 1200000,
    stock: 4,
    shortDescription: 'Meja samping minimalis dari kayu jati.',
    description: 'Finishing oil matte yang aman dan tahan lama.',
    imageUrl: '/src/assets/images/prod_kursi_jati_1795398915272.jpg',
    whatsappNumber: '081234567890',
  });
  assert.deepEqual(valid, {});
});
