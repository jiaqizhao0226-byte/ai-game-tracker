'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { assetUrl } from '@/lib/asset';

/**
 * 实机截图画廊：网格缩略图 + 点击放大的灯箱。
 * 竖图（手机端素材）走 4 列窄栏，横图（PC/主机素材）走 2 列 16:9。
 * 方向不能只按来源猜——TapTap 既有手游竖图（乌托）也有 PC 游戏横图（言灵计划），
 * 故以来源作初值避免首屏跳动，首图加载后再用真实宽高比校正。
 * 注：TapTap CDN 有 Referer 防盗链，外链在本站必然 567，故其素材一律转存本地 /images/shots/tt_*。
 */
export default function ScreenshotGallery({ name, shots }: { name: string; shots: string[] }) {
  const host = shots[0];
  const isAppStore = host.includes('mzstatic.com');
  const isTapTap = host.includes('tapimg.com') || host.includes('/shots/tt_');
  const source = isAppStore ? 'App Store 官方商店页' : isTapTap ? 'TapTap 官方商店页' : 'Steam 官方商店页';
  const [isPortrait, setIsPortrait] = useState(isAppStore || isTapTap);
  const [idx, setIdx] = useState<number | null>(null);
  const firstRef = useRef<HTMLImageElement>(null);

  // SSR 出的 img 常在水合前就加载完，此时 onLoad 不再触发——挂载后主动补测一次
  useEffect(() => {
    const im = firstRef.current;
    if (im?.complete && im.naturalWidth) setIsPortrait(im.naturalHeight > im.naturalWidth);
  }, []);

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
            ref={i === 0 ? firstRef : undefined}
            src={assetUrl(src)}
            alt={`${name} 实机截图 ${i + 1}`}
            loading={i === 0 ? 'eager' : 'lazy'}
            onLoad={i === 0 ? e => setIsPortrait(e.currentTarget.naturalHeight > e.currentTarget.naturalWidth) : undefined}
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
            src={assetUrl(shots[idx])}
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
