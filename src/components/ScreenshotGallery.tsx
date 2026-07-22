'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { assetUrl } from '@/lib/asset';

/**
 * 实机截图画廊：单行横向滑轨 + 左右翻页箭头，点击放大为灯箱。
 *
 * 不用网格是因为张数不定（3～9 张）：固定列数必然出现末行只剩一两张的断行。
 * 横向滑轨让张数与排版解耦，多少张都是一条完整的带子。
 *
 * 缩略图宽度按方向给：竖图（手机素材）窄、横图（PC/主机素材）宽。
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
  const railRef = useRef<HTMLDivElement>(null);
  // 到达两端时对应箭头隐藏；内容不溢出时两个都不显示
  const [edge, setEdge] = useState({ start: true, end: true });

  // SSR 出的 img 常在水合前就加载完，此时 onLoad 不再触发——挂载后主动补测一次
  useEffect(() => {
    const im = firstRef.current;
    if (im?.complete && im.naturalWidth) setIsPortrait(im.naturalHeight > im.naturalWidth);
  }, []);

  // 滑轨边界检测。图片是懒加载的，宽度会随加载变化，故同时监听 scroll 与尺寸变化
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const sync = () => {
      const overflow = el.scrollWidth - el.clientWidth;
      setEdge(
        overflow <= 2
          ? { start: true, end: true } // 不溢出：两端都算“到底”，箭头全部隐藏
          : { start: el.scrollLeft <= 2, end: el.scrollLeft >= overflow - 2 },
      );
    };
    sync();
    el.addEventListener('scroll', sync, { passive: true });
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    Array.from(el.children).forEach(c => ro.observe(c));
    return () => {
      el.removeEventListener('scroll', sync);
      ro.disconnect();
    };
  }, [shots.length, isPortrait]);

  // 一次翻动约一屏，留 10% 重叠让用户有连续感
  const page = (dir: 1 | -1) => {
    const el = railRef.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  };

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
      <div className="relative group/rail">
        <div
          ref={railRef}
          className="no-scrollbar flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory items-start"
        >
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
              className={`snap-start shrink-0 border border-neutral-200 bg-neutral-100 cursor-zoom-in hover:opacity-90 transition-opacity ${
                isPortrait ? 'w-[168px] h-auto' : 'w-[340px] aspect-video object-cover'
              }`}
            />
          ))}
        </div>

        {/* 箭头悬浮在滑轨上方；到端即隐藏，内容不溢出时两侧都不出现 */}
        {([-1, 1] as const).map(dir => {
          const hidden = dir === -1 ? edge.start : edge.end;
          return (
            <button
              key={dir}
              onClick={() => page(dir)}
              aria-label={dir === -1 ? '上一屏截图' : '下一屏截图'}
              tabIndex={hidden ? -1 : 0}
              className={`absolute top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200 shadow-md text-neutral-700
                hover:bg-white hover:text-neutral-900 hover:shadow-lg
                transition-[opacity,box-shadow,background-color,color] duration-[var(--dur-base)]
                ${dir === -1 ? 'left-2' : 'right-2'}
                ${hidden ? 'opacity-0 pointer-events-none' : 'opacity-70 group-hover/rail:opacity-100'}`}
            >
              {dir === -1 ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>
          );
        })}
      </div>
      <p className="text-[10px] text-neutral-400 font-mono mt-2">
        素材来源:{source} · 共 {shots.length} 张 · 点击查看大图
      </p>

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
