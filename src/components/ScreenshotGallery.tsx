'use client';

import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * 实机截图画廊：网格缩略图 + 点击放大的灯箱。
 * Steam 素材为 16:9 横屏走 2 列；App Store(mzstatic) 为手机竖屏走 4 列窄栏。
 */
export default function ScreenshotGallery({ name, shots }: { name: string; shots: string[] }) {
  const isPortrait = shots[0].includes('mzstatic.com');
  const source = isPortrait ? 'App Store 官方商店页' : 'Steam 官方商店页';
  const [idx, setIdx] = useState<number | null>(null);

  useEffect(() => {
    if (idx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIdx(null);
      if (e.key === 'ArrowLeft') setIdx(i => (i === null ? i : (i + shots.length - 1) % shots.length));
      if (e.key === 'ArrowRight') setIdx(i => (i === null ? i : (i + 1) % shots.length));
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [idx, shots.length]);

  return (
    <>
      <div className={isPortrait ? 'grid grid-cols-4 gap-2 items-start' : 'grid grid-cols-2 gap-2'}>
        {shots.map((src, i) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={i}
            src={src}
            alt={`${name} 实机截图 ${i + 1}`}
            loading="lazy"
            onClick={() => setIdx(i)}
            className={`w-full border border-neutral-200 bg-neutral-100 cursor-zoom-in hover:opacity-90 transition-opacity ${isPortrait ? 'h-auto' : 'aspect-video object-cover'}`}
          />
        ))}
      </div>
      <p className="text-[10px] text-neutral-400 font-mono mt-2">素材来源:{source} · 点击查看大图</p>

      {idx !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center"
          onClick={() => setIdx(null)}
          role="dialog"
          aria-label={`${name} 截图大图 ${idx + 1}/${shots.length}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={shots[idx]}
            alt={`${name} 实机截图大图 ${idx + 1}`}
            onClick={e => e.stopPropagation()}
            className="max-w-[92vw] max-h-[88vh] object-contain shadow-2xl"
          />
          <button
            onClick={e => { e.stopPropagation(); setIdx(null); }}
            aria-label="关闭"
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          {shots.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); setIdx((idx + shots.length - 1) % shots.length); }}
                aria-label="上一张"
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={e => { e.stopPropagation(); setIdx((idx + 1) % shots.length); }}
                aria-label="下一张"
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-xs font-mono">
            {idx + 1} / {shots.length}
          </span>
        </div>
      )}
    </>
  );
}
