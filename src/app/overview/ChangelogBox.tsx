'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Entry = {
  date: string;
  title: string;
  count: number;
  delta: string;
  items: string[];
};

const PER_PAGE = 3;

export default function ChangelogBox({ entries }: { entries: Entry[] }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(entries.length / PER_PAGE));
  const start = page * PER_PAGE;
  const visible = entries.slice(start, start + PER_PAGE);

  return (
    <div className="bg-white border border-neutral-200 shadow-sm flex flex-col">
      {/* 固定高度容器，保证翻页时框体不跳动 */}
      <div className="p-6 min-h-[340px]">
        <div className="relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-neutral-200" aria-hidden="true" />
          <div className="space-y-6">
            {visible.map((e, i) => {
              const isLatest = page === 0 && i === 0;
              return (
                <div key={e.date} className="relative pl-8">
                  <div className={`absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 ${isLatest ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-neutral-300'}`} />
                  <div className="flex flex-wrap items-baseline gap-2.5 mb-2">
                    <span className="font-mono text-sm font-bold text-neutral-900">{e.date}</span>
                    <span className="text-sm font-bold text-neutral-700">{e.title}</span>
                    {isLatest && (
                      <span className="text-[10px] font-mono uppercase tracking-wider bg-indigo-600 text-white px-1.5 py-0.5">最新</span>
                    )}
                    <span className="text-[10px] font-mono text-neutral-400 ml-auto whitespace-nowrap">
                      收录 {e.count}
                      {e.delta && e.delta !== '0' && <span className="ml-1 text-neutral-500">({e.delta})</span>}
                    </span>
                  </div>
                  <ul className="space-y-0.5">
                    {e.items.map((it, j) => (
                      <li key={j} className="text-xs text-neutral-600 leading-relaxed flex gap-2">
                        <span className="text-neutral-300 shrink-0">·</span><span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 翻页 */}
      <div className="border-t border-neutral-100 bg-neutral-50 px-4 py-2.5 flex items-center justify-between">
        <span className="text-[10px] font-mono text-neutral-400">
          共 {entries.length} 次更新
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="上一页"
            className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              aria-label={`第 ${i + 1} 页`}
              aria-current={page === i}
              className={`w-6 h-6 text-[10px] font-mono transition-colors ${page === i ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:bg-neutral-200'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            aria-label="下一页"
            className="p-1 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
