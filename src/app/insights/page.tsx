import data from '../../data.json';
import Link from 'next/link';

export default function InsightsPage() {
  const { insights } = data;

  // Group insights by year
  const insightsByYear = insights.reduce((acc: Record<string, typeof insights>, insight) => {
    const year = insight.date.split('-')[0];
    if (!acc[year]) acc[year] = [];
    acc[year].push(insight);
    return acc;
  }, {});

  // Sort years in descending order
  const sortedYears = Object.keys(insightsByYear).sort((a, b) => Number(b) - Number(a));

  return (
    <main className="min-h-screen bg-[#F9FAFB] py-8 px-6 sm:px-12 lg:px-16 mx-auto max-w-[1400px]">
      <header className="mb-8 border-b-2 border-neutral-800 pb-4 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold font-sans text-neutral-900 tracking-tight flex items-center gap-2">
            趋势洞察
          </h1>
          <p className="text-neutral-500 mt-2 text-xs uppercase tracking-widest font-mono">专题报告与趋势判断 / 光子策略分析组</p>
        </div>
      </header>

      <div className="space-y-12">
        {sortedYears.map(year => (
          <section key={year}>
            <h2 className="text-xl font-bold text-neutral-800 mb-6 font-mono border-l-4 border-indigo-600 pl-3">
              {year} 年
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {insightsByYear[year].map((insight) => (
                <Link
                  key={insight.id}
                  href={`/insight/${insight.id}`}
                  className="bg-white border border-neutral-200 shadow-sm hover:shadow-md hover:border-neutral-900 transition-all flex flex-col h-full relative group cursor-pointer overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>

                  {/* Cover image */}
                  {insight.image_url && (
                    <div className="w-full h-40 bg-neutral-100 border-b border-neutral-200 shrink-0 relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={insight.image_url} alt={insight.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-700 px-2 py-1">
                        {insight.category}
                      </span>
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="text-xs font-mono text-neutral-600 font-bold" title="所属期间">
                          {insight.date}
                        </span>
                        {insight.created_at && (
                          <span className="text-[9px] font-mono text-neutral-400" title="最新更新时间">
                            更新:{insight.created_at.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-neutral-900 mb-3 leading-tight font-serif">
                      {insight.title}
                    </h3>

                    <p className="text-sm font-semibold text-neutral-600 mb-4 border-l-2 border-indigo-200 pl-3 leading-relaxed">
                      {insight.summary}
                    </p>

                    <div className="mt-auto pt-4 border-t border-neutral-100">
                      <p className="text-sm text-neutral-500 leading-relaxed line-clamp-3">
                        {insight.content}
                      </p>
                      <div className="mt-3 text-xs text-indigo-600 font-mono uppercase tracking-wider group-hover:text-indigo-800 transition-colors">
                        查看详情 →
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
