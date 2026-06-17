import data from '../../data.json';

export default function InsightsPage() {
  const { insights } = data;

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

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {insights.map((insight) => (
          <div key={insight.id} className="bg-white border border-neutral-200 p-6 shadow-sm hover:shadow-md hover:border-neutral-900 transition-all flex flex-col h-full relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-bold uppercase tracking-widest bg-indigo-50 text-indigo-700 px-2 py-1">
                {insight.category}
              </span>
              <span className="text-xs font-mono text-neutral-400">
                {insight.date}
              </span>
            </div>

            <h3 className="text-lg font-bold text-neutral-900 mb-3 leading-tight font-serif">
              {insight.title}
            </h3>

            <p className="text-sm font-semibold text-neutral-600 mb-4 border-l-2 border-indigo-200 pl-3 leading-relaxed">
              {insight.summary}
            </p>

            <div className="mt-auto pt-4 border-t border-neutral-100">
              <p className="text-sm text-neutral-600 leading-relaxed">
                {insight.content}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
