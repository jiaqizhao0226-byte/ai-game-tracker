/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { ExternalLink } from 'lucide-react';

export default function EventsTabs({ productEvents, fundingEvents, articleEvents }: {
  productEvents: any[];
  fundingEvents: any[];
  articleEvents: any[];
}) {
  const [activeTab, setActiveTab] = useState<'product' | 'funding' | 'article'>('product');

  // 始终显示3个Tab，不过滤空的
  const tabs = [
    { key: 'product' as const, label: '产品动态', events: productEvents, dot: 'bg-indigo-500', line: 'bg-indigo-200', activeColor: 'border-indigo-500 text-indigo-700' },
    { key: 'funding' as const, label: '融资动态', events: fundingEvents, dot: 'bg-emerald-500', line: 'bg-emerald-200', activeColor: 'border-emerald-500 text-emerald-700' },
    { key: 'article' as const, label: '相关文章', events: articleEvents, dot: 'bg-amber-500', line: 'bg-amber-200', activeColor: 'border-amber-500 text-amber-700' },
  ];

  const current = tabs.find(t => t.key === activeTab) || tabs[0];

  return (
    <div>
      {/* Tab bar - 始终显示3个Tab */}
      <div className="flex border-b border-neutral-200 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              current.key === tab.key ? tab.activeColor : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${tab.dot}`} />
            {tab.label}
            <span className="text-xs font-mono text-neutral-400">{tab.events.length}</span>
          </button>
        ))}
      </div>

      {/* Timeline - fixed min height to prevent page jump */}
      <div className="relative pl-6 min-h-[200px]">
        {current.events.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 text-sm font-mono">
            暂无{current.label}记录。
          </div>
        ) : (
          <>
            <div className={`absolute left-[7px] top-2 bottom-2 w-px ${current.line}`} />
            {current.events.map((evt: any) => (
              <div key={evt.id} className="relative pb-5 last:pb-0">
                <div className={`absolute -left-[22px] top-1.5 w-3 h-3 rounded-full ${current.dot} border-2 border-white shadow-sm`} />
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold text-neutral-700">{evt.event_date}</span>
                </div>
                <div className="bg-white border border-neutral-200 p-3.5">
                  {evt.url ? (
                    <a href={evt.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline leading-relaxed flex items-start gap-1">
                      {evt.content} <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    </a>
                  ) : (
                    <p className="text-sm text-neutral-700 leading-relaxed">{evt.content}</p>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
