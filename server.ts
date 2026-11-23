import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  DEFAULT_STORE_SETTINGS,
  SEED_PRODUCTS,
} from './src/data/seedProducts.ts';
import type { Product, StoreSettings } from './src/types.ts';
import { parseCommaList, validateProductInput } from './src/utils/catalog.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'store.json');

interface StoreData {
  settings: StoreSettings;
  products: Product[];
}

function ensureStoreFile(): StoreData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const initial: StoreData = {
      settings: DEFAULT_STORE_SETTINGS,
      products: SEED_PRODUCTS,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as StoreData;
    return {
      settings: {
        ...DEFAULT_STORE_SETTINGS,
        ...(parsed.settings ?? {}),
      },
      products: Array.isArray(parsed.products) ? parsed.products : SEED_PRODUCTS,
    };
  } catch {
    const fallback: StoreData = {
      settings: DEFAULT_STORE_SETTINGS,
      products: SEED_PRODUCTS,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
}

function writeStoreFile(data: StoreData): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function slugifyId(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 36);
  const suffix = Math.random().toString(36).slice(2, 6);
  return `${base || 'produk'}-${suffix}`;
}

function generateSku(category: string, count: number): string {
  const prefix =
    category
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 2)
      .toUpperCase() || 'PR';
  return `KR-${prefix}${String(count + 1).padStart(2, '0')}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/store', (_req, res) => {
    const store = ensureStoreFile();
    res.json(store);
  });

  app.get('/api/products', (_req, res) => {
    const store = ensureStoreFile();
    res.json({ products: store.products, settings: store.settings });
  });

  app.get('/api/products/:id', (req, res) => {
    const store = ensureStoreFile();
    const product = store.products.find((p) => p.id === req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Produk tidak ditemukan.' });
      return;
    }
    res.json({ product, settings: store.settings });
  });

  app.post('/api/products', (req, res) => {
    const body = req.body ?? {};
    const errors = validateProductInput({
      name: String(body.name ?? ''),
      category: String(body.category ?? ''),
      price: body.price ?? '',
      stock: body.stock ?? '',
      shortDescription: String(body.shortDescription ?? ''),
      description: String(body.description ?? ''),
      imageUrl: String(body.imageUrl ?? ''),
      whatsappNumber: body.whatsappNumber ? String(body.whatsappNumber) : '',
    });

    if (Object.keys(errors).length > 0) {
      res.status(400).json({ error: 'Data produk tidak valid.', errors });
      return;
    }

    const store = ensureStoreFile();
    const now = new Date().toISOString();
    const imageUrl = String(body.imageUrl).trim();
    const extraGallery = Array.isArray(body.gallery)
      ? body.gallery.map((g: unknown) => String(g).trim()).filter(Boolean)
      : parseCommaList(body.galleryText);
    const gallery = Array.from(new Set([imageUrl, ...extraGallery]));
    const variants = Array.isArray(body.variants)
      ? body.variants.map((v: unknown) => String(v).trim()).filter(Boolean)
      : parseCommaList(body.variantsText);

    const newProduct: Product = {
      id: slugifyId(String(body.name)),
      sku: String(body.sku ?? '').trim() || generateSku(String(body.category), store.products.length),
      name: String(body.name).trim(),
      category: String(body.category).trim(),
      price: Math.round(Number(body.price)),
      stock: Math.round(Number(body.stock)),
      shortDescription: String(body.shortDescription).trim(),
      description: String(body.description).trim(),
      imageUrl,
      gallery,
      variants,
      specs: {
        material: String(body.material ?? body.specs?.material ?? '-').trim() || '-',
        dimensions: String(body.dimensions ?? body.specs?.dimensions ?? '-').trim() || '-',
        weight: String(body.weight ?? body.specs?.weight ?? '').trim() || undefined,
        care: String(body.care ?? body.specs?.care ?? '').trim() || undefined,
      },
      whatsappNumber: String(body.whatsappNumber ?? '').trim() || undefined,
      featured: Boolean(body.featured),
      createdAt: now,
      updatedAt: now,
    };

    store.products = [newProduct, ...store.products];
    writeStoreFile(store);
    res.status(201).json({ product: newProduct });
  });

  app.put('/api/products/:id', (req, res) => {
    const store = ensureStoreFile();
    const index = store.products.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Produk tidak ditemukan.' });
      return;
    }

    const body = req.body ?? {};
    const errors = validateProductInput({
      name: String(body.name ?? ''),
      category: String(body.category ?? ''),
      price: body.price ?? '',
      stock: body.stock ?? '',
      shortDescription: String(body.shortDescription ?? ''),
      description: String(body.description ?? ''),
      imageUrl: String(body.imageUrl ?? ''),
      whatsappNumber: body.whatsappNumber ? String(body.whatsappNumber) : '',
    });

    if (Object.keys(errors).length > 0) {
      res.status(400).json({ error: 'Data produk tidak valid.', errors });
      return;
    }

    const existing = store.products[index];
    const imageUrl = String(body.imageUrl).trim();
    const extraGallery = Array.isArray(body.gallery)
      ? body.gallery.map((g: unknown) => String(g).trim()).filter(Boolean)
      : parseCommaList(body.galleryText);
    const gallery = Array.from(new Set([imageUrl, ...extraGallery]));
    const variants = Array.isArray(body.variants)
      ? body.variants.map((v: unknown) => String(v).trim()).filter(Boolean)
      : parseCommaList(body.variantsText);

    const updated: Product = {
      ...existing,
      sku: String(body.sku ?? existing.sku).trim() || existing.sku,
      name: String(body.name).trim(),
      category: String(body.category).trim(),
      price: Math.round(Number(body.price)),
      stock: Math.round(Number(body.stock)),
      shortDescription: String(body.shortDescription).trim(),
      description: String(body.description).trim(),
      imageUrl,
      gallery,
      variants,
      specs: {
        material: String(body.material ?? body.specs?.material ?? '-').trim() || '-',
        dimensions: String(body.dimensions ?? body.specs?.dimensions ?? '-').trim() || '-',
        weight: String(body.weight ?? body.specs?.weight ?? '').trim() || undefined,
        care: String(body.care ?? body.specs?.care ?? '').trim() || undefined,
      },
      whatsappNumber: String(body.whatsappNumber ?? '').trim() || undefined,
      featured: body.featured !== undefined ? Boolean(body.featured) : existing.featured,
      updatedAt: new Date().toISOString(),
    };

    store.products[index] = updated;
    writeStoreFile(store);
    res.json({ product: updated });
  });

  app.delete('/api/products/:id', (req, res) => {
    const store = ensureStoreFile();
    const index = store.products.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      res.status(404).json({ error: 'Produk tidak ditemukan.' });
      return;
    }

    const [removed] = store.products.splice(index, 1);
    writeStoreFile(store);
    res.json({ deleted: removed });
  });

  app.put('/api/settings', (req, res) => {
    const store = ensureStoreFile();
    const body = req.body ?? {};
    const whatsappNumber = String(body.whatsappNumber ?? '').trim();
    if (!whatsappNumber) {
      res.status(400).json({ error: 'Nomor WhatsApp toko wajib diisi.' });
      return;
    }
    store.settings = {
      storeName: String(body.storeName ?? store.settings.storeName).trim() || store.settings.storeName,
      whatsappNumber,
      storeLocation: String(body.storeLocation ?? store.settings.storeLocation).trim() || store.settings.storeLocation,
    };
    writeStoreFile(store);
    res.json({ settings: store.settings });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Karya Ruang server running on http://localhost:${PORT}`);
  });
}

startServer();
