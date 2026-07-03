/* eslint-disable @typescript-eslint/no-explicit-any */
import data from '../../../data.json';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft } from 'lucide-react';

export function generateStaticParams() {
  return data.insights.map((insight) => ({
    id: insight.id.toString(),
  }));
}

export default function InsightDetailPage({ params }: { params: { id: string } }) {
  const insightId = parseInt(params.id);
  const insight = data.insights.find((i) => i.id === insightId);

  if (!insight) {
    return (
      <main className="min-h-screen bg-[#F9FAFB] py-8 px-6 sm:px-12 lg:px-16 mx-auto max-w-[1200px]">
        <p className="text-neutral-500">未找到该洞察。</p>
        <Link href="/insights" className="text-indigo-600 hover:underline mt-4 inline-block">返回趋势洞察</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9FAFB]">
      {/* Breadcrumb bar */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-[1000px] mx-auto px-6 sm:px-12 py-3 flex items-center gap-2 text-xs font-mono text-neutral-500">
          <Link href="/insights" className="hover:text-neutral-900 transition-colors flex items-center gap-1">
            <ChevronLeft className="w-3 h-3" /> 趋势洞察
          </Link>
          <span className="text-neutral-300">/</span>
          <span className="text-neutral-700 truncate">{insight.title}</span>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 sm:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-700 px-2 py-1">
              {insight.category}
            </span>
            <span className="text-xs font-mono text-neutral-500">{insight.date}</span>
          </div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight mb-4 leading-tight">{insight.title}</h1>
          <div className="text-lg font-semibold text-neutral-600 border-l-4 border-indigo-200 pl-4 leading-relaxed mb-6">
            {insight.summary}
          </div>
        </div>

        {/* Cover image */}
        {insight.image_url && (
          <div className="mb-8 border border-neutral-200 overflow-hidden bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={insight.image_url} alt={insight.title} className="w-full h-auto" />
            <div className="px-4 py-2 text-[10px] text-neutral-400 font-mono bg-neutral-50 border-t border-neutral-200">
              信息来源：策略组分析，公开资料整理
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white border border-neutral-200 p-8">
          <div className="text-sm text-neutral-700 leading-8 whitespace-pre-wrap">{insight.content}</div>
        </div>

        {/* Back button */}
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <Link href="/insights" className="inline-flex items-center gap-2 px-6 py-2 text-xs font-bold uppercase tracking-wider bg-neutral-900 text-white hover:bg-neutral-800 transition-colors">
            <ArrowLeft className="w-4 h-4" /> 返回趋势洞察
          </Link>
        </div>
      </div>
    </main>
  );
}
