import { ArrowDownRight } from 'lucide-react';

interface HeroSectionProps {
  productCount: number;
  onExploreCatalog: () => void;
  onOpenAdmin: () => void;
}

export function HeroSection({
  productCount,
  onExploreCatalog,
  onOpenAdmin,
}: HeroSectionProps) {
  return (
    <section className="border-b border-[#E5E2DC] bg-[#FAF9F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-between py-2">
            <div className="space-y-5">
              <p className="text-xs font-medium tracking-wide text-[#6B6963]">
                Kurasi Studio · Jakarta & Yogyakarta
              </p>
              <h1
                className="font-display text-4xl sm:text-5xl font-medium tracking-tight text-[#18181B] leading-[1.12]"
                style={{ textWrap: 'balance' }}
              >
                Objek pilihan untuk ruang yang tenang dan bertahan lama.
              </h1>
              <p className="text-base text-[#52524E] leading-relaxed max-w-md">
                Jelajahi katalog furnitur jati, pencahayaan kuningan, dan keramik
                buatan tangan. Pesan langsung dengan mudah melalui WhatsApp
                atau kelola daftar produk toko Anda sendiri.
              </p>
            </div>

            <div className="pt-8 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={onExploreCatalog}
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#1B4332] hover:bg-[#143326] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4332]"
              >
                Jelajahi Katalog ({productCount})
                <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onOpenAdmin}
                className="px-4 py-3 text-sm font-medium text-[#18181B] hover:text-[#1B4332] underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Tambah / Edit Produk
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="h-full min-h-[280px] sm:min-h-[380px] lg:min-h-[440px] rounded-xl overflow-hidden bg-[#EFECE6] border border-[#E5E2DC]">
              <img
                src="/src/assets/images/hero_studio_living_1795398914934.jpg"
                alt="Ruang tamu arsitektural Karya Ruang dengan kursi jati, meja batu travertine, dan vas keramik"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
