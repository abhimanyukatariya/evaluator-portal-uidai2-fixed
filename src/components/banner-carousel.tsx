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
};

export default function BannerCarousel({
  slides,
  intervalMs = 5000,
  fullBleed = false,
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
      {/* Strict frame: rounded + overflow-hidden + aspect ratio */}
      <div
  className="relative w-full overflow-hidden rounded-2xl shadow-lg isolate"
  style={{
    aspectRatio: '1600 / 620', 
    height: 'auto',
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
    style={{ transform: `translateX(-${index * 100}%)`,borderRadius: 'inherit' }}
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
          className="object-cover object-center !block w-full h-full"
        />
      );
      return (
        <div key={`${s.src}-${i}`} className="relative w-full h-full shrink-0">
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
