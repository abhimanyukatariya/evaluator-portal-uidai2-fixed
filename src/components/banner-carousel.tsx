'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

type Slide = { src: string; alt: string; href?: string };

type Props = {
  slides: Slide[];
  intervalMs?: number;
  fullBleed?: boolean;
  /** How the image should fit inside the frame. Use 'contain' to avoid cropping. */
  fit?: 'cover' | 'contain';
  /** Optional custom aspect ratio (w/h), e.g. '1600 / 620' */
  aspect?: string;
};

export default function BannerCarousel({
  slides,
  intervalMs = 5000,
  fullBleed = false,
  fit = 'contain',                 // << default to contain so the whole banner is visible
  aspect = '1600 / 620',           // << keep your original aspect
}: Props) {
  const [index, setIndex] = useState(0);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveringRef = useRef(false);

  const go = (i: number) => setIndex((p) => (i + slides.length) % slides.length);
  const next = () => go(index + 1);
  const prev = () => go(index - 1);

  useEffect(() => {
    if (hoveringRef.current) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    timerRef.current = setTimeout(next, intervalMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [index, intervalMs, slides.length]);

  return (
    <section className={clsx(fullBleed ? 'w-screen relative left-1/2 right-1/2 -mx-[50vw]' : 'w-full')}>
      <div
        className={clsx(
          'relative w-full overflow-hidden rounded-2xl shadow-lg isolate',
          // give a small fixed height on very small screens so the slider isn’t too short
          'h-[200px] md:h-auto'
        )}
        style={{
          // aspect ratio drives the height on md+; small screens get the fixed height above
          aspectRatio: aspect,
        }}
        onMouseEnter={() => {
          hoveringRef.current = true;
          if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
          }
        }}
        onMouseLeave={() => {
          hoveringRef.current = false;
          timerRef.current = setTimeout(next, intervalMs);
        }}
        aria-roledescription="carousel"
      >
        <div
          className="absolute inset-0 flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${index * 100}%)`, borderRadius: 'inherit' }}
        >
          {slides.map((s, i) => {
            const img = (
              <Image
                key={s.src}
                src={s.src}
                alt={s.alt}
                fill
                priority={i === 0}
                sizes="100vw"
                // contain => show the whole banner (no cropping). cover => fill & crop.
                className={clsx(
                  'w-full h-full !block rounded-2xl',             // keep rounding on the image too
                  fit === 'contain' ? 'object-contain' : 'object-cover',
                  'object-center'
                )}
                // ensure the image respects the parent rounding
                style={{ borderRadius: 'inherit' }}
              />
            );

            return (
              <div key={`${s.src}-${i}`} className="relative w-full h-full shrink-0 bg-white">
                {/* bg-white avoids transparency edges when using object-contain */}
                {s.href ? <a href={s.href} className="block w-full h-full">{img}</a> : img}
              </div>
            );
          })}
        </div>

        {/* Navigation arrows */}
        <button
          onClick={prev}
          aria-label="Previous banner"
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 hover:bg-white shadow-md"
        >
          <ChevronLeft />
        </button>
        <button
          onClick={next}
          aria-label="Next banner"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 hover:bg-white shadow-md"
        >
          <ChevronRight />
        </button>

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={clsx(
                'h-2.5 w-2.5 rounded-full transition',
                i === index ? 'bg-white ring-2 ring-black/20' : 'bg-white/60 hover:bg-white'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
