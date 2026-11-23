interface HeaderProps {
  activeView: 'store' | 'detail' | 'admin';
  onNavigateStore: (category?: string) => void;
  onNavigateAdmin: () => void;
}

export function Header({
  activeView,
  onNavigateStore,
  onNavigateAdmin,
}: HeaderProps) {
  const isAdmin = activeView === 'admin';

  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F6]/95 backdrop-blur-sm border-b border-[#E5E2DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element Brand Wordmark */}
        <a
          href="#katalog"
          onClick={(e) => {
            e.preventDefault();
            onNavigateStore('Semua');
          }}
          className="font-display text-xl font-medium tracking-tight text-[#18181B] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1B4332]"
        >
          Karya Ruang
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav
          aria-label="Navigasi utama"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#52524E]"
        >
          <a
            href="#katalog"
            onClick={(e) => {
              e.preventDefault();
              onNavigateStore('Semua');
            }}
            className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Katalog
          </a>
          <a
            href="#furnitur"
            onClick={(e) => {
              e.preventDefault();
              onNavigateStore('Furnitur');
            }}
            className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Furnitur
          </a>
          <a
            href="#pencahayaan"
            onClick={(e) => {
              e.preventDefault();
              onNavigateStore('Pencahayaan');
            }}
            className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Pencahayaan
          </a>
          <a
            href="#keramik"
            onClick={(e) => {
              e.preventDefault();
              onNavigateStore('Keramik & Meja');
            }}
            className="hover:text-[#18181B] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Keramik & Meja
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          {isAdmin ? (
            <button
              type="button"
              onClick={() => onNavigateStore('Semua')}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-[#18181B] bg-[#EFECE6] hover:bg-[#E5E2DC] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4332]"
            >
              Lihat Katalog
            </button>
          ) : (
            <button
              type="button"
              onClick={onNavigateAdmin}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-[#1B4332] hover:bg-[#143326] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1B4332]"
            >
              Kelola Produk
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
