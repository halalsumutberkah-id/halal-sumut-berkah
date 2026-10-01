'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface BannerItem {
  id: string;
  imageUrl: string;
  link: string | null;
}

const HIDE_UNTIL_KEY = 'promo-banner-hide-until';
const AUTO_PLAY_MS = 7000; // Durasi slider diperlambat (7 detik)

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 0,
  }),
};

export function PromoBannerPopup() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [hideDurationHours, setHideDurationHours] = useState(24);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    const hideUntil = localStorage.getItem(HIDE_UNTIL_KEY);
    if (hideUntil && Number(hideUntil) > Date.now()) {
      return;
    }

    fetch('/api/public/banners')
      .then((res) => res.json())
      .then((res) => {
        const data: BannerItem[] = res.data || [];
        if (data.length > 0) {
          setBanners(data);
          setHideDurationHours(res.hideDurationHours ?? 24);
          setOpen(true);
        }
      })
      .catch(() => {});
  }, []);

  function handleClose() {
    setOpen(false);
  }

  function handleDontShowAgain() {
    const hideUntil = Date.now() + hideDurationHours * 60 * 60 * 1000;
    localStorage.setItem(HIDE_UNTIL_KEY, String(hideUntil));
    setOpen(false);
  }

  const goNext = useCallback(() => {
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setActiveIndex((prev) => (prev - 1 + banners.length) % banners.length);
  }, [banners.length]);

  function goTo(index: number) {
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  }

  useEffect(() => {
    if (!open || banners.length <= 1) return;
    const timer = setInterval(goNext, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [open, banners.length, goNext]);

  if (banners.length === 0) return null;

  const active = banners[activeIndex];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        showCloseButton={false}
        contentClassName="p-0 gap-0 overflow-hidden"
        className="w-[88vw] max-w-sm overflow-hidden rounded-2xl border-0 bg-transparent p-0 shadow-2xl ring-0 sm:w-[min(560px,calc(80vh*4/5))] sm:max-w-[min(560px,calc(80vh*4/5))]"
      >
        <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl">
          {/* Tombol Tutup (X) */}
          <button
            type="button"
            onClick={handleClose}
            className="absolute right-3 top-3 z-30 flex size-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-colors hover:bg-black/60"
            aria-label="Tutup"
          >
            <X className="size-4" />
          </button>

          {/* Banner Image Slide */}
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.a
              key={active.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', ease: 'easeInOut', duration: 0.4 }}
              href={active.link || undefined}
              target={active.link ? '_blank' : undefined}
              rel={active.link ? 'noopener noreferrer' : undefined}
              className={cn('absolute inset-0 block', !active.link && 'pointer-events-none')}
            >
              <Image src={active.imageUrl} alt="Banner promosi" fill className="object-cover" priority sizes="(min-width: 640px) 560px, 88vw" />
            </motion.a>
          </AnimatePresence>

          {/* Navigasi Panah Kecil & Dots */}
          {banners.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2.5 top-1/2 z-20 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/60"
                aria-label="Sebelumnya"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2.5 top-1/2 z-20 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition-colors hover:bg-black/60"
                aria-label="Selanjutnya"
              >
                <ChevronRight className="size-4" />
              </button>

              <div className="absolute inset-x-0 bottom-12 z-20 flex justify-center gap-1.5">
                {banners.map((banner, i) => (
                  <button key={banner.id} type="button" onClick={() => goTo(i)} className={cn('h-1.5 rounded-full transition-all', i === activeIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75')} aria-label={`Slide ${i + 1}`} />
                ))}
              </div>
            </>
          )}

          {/* Footer di dalam banner */}
          <div className="absolute inset-x-0 bottom-0 z-30 flex h-10 items-center justify-center bg-black/35 backdrop-blur-md">
            <button type="button" onClick={handleDontShowAgain} className="text-xs font-medium text-white/85 transition-colors hover:text-white hover:underline">
              Jangan tampilkan lagi
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
