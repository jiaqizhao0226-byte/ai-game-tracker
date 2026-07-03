/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, TerminalSquare, Activity, ExternalLink, Filter, ChevronDown, Check } from 'lucide-react';
import Link from 'next/link';

function MultiSelect({ label, options, selected, onChange, className = "" }: { label: string, options: string[], selected: string[], onChange: (s: string[]) => void, className?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(x => x !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`bg-white border border-neutral-300 text-xs py-1.5 px-2 focus:outline-none hover:border-neutral-400 font-mono shadow-sm flex items-center justify-between gap-2 min-w-[110px] max-w-[150px] ${className}`}
      >
        <span className="truncate flex-1 text-left">{selected.length === 0 ? label : `${label} (${selected.length})`}</span>
        <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 shadow-lg z-20 min-w-[150px] max-h-60 overflow-y-auto">
          {options.map(opt => (
            <div key={opt} className="px-3 py-2 flex items-center gap-2 hover:bg-neutral-50 cursor-pointer" onClick={() => toggle(opt)}>
              <div className={`w-3 h-3 border flex items-center justify-center shrink-0 ${selected.includes(opt) ? 'bg-neutral-900 border-neutral-900' : 'border-neutral-300'}`}>
                {selected.includes(opt) && <Check className="w-2 h-2 text-white" />}
              </div>
              <span className="text-xs font-mono truncate text-neutral-700">{opt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardClient({ initialGames, initialEvents }: { initialGames: any[], initialEvents: any[] }) {
  const [games] = useState<any[]>(initialGames);
  const [events] = useState<any[]>(initialEvents);
  
  const [search, setSearch] = useState('');
  const [filterMainTypes, setFilterMainTypes] = useState<string[]>([]);
  const [filterSubTypes, setFilterSubTypes] = useState<string[]>([]);
  const [filterRegions, setFilterRegions] = useState<string[]>([]);

  const filteredGames = games.filter(g => {
    const matchSearch = g.product_name.toLowerCase().includes(search.toLowerCase()) ||
      g.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (g.gameplay_main && g.gameplay_main.toLowerCase().includes(search.toLowerCase())) ||
      (g.gameplay_sub && g.gameplay_sub.toLowerCase().includes(search.toLowerCase())) ||
      (g.tags && g.tags.toLowerCase().includes(search.toLowerCase()));

    const matchType = (filterMainTypes.length === 0 || filterMainTypes.includes(g.gameplay_main)) && (filterSubTypes.length === 0 || (g.gameplay_sub && g.gameplay_sub.split(/[,，]+/).some((s: string) => filterSubTypes.includes(s.trim()))));
    const matchRegion = filterRegions.length === 0 || filterRegions.includes(g.region);

    return matchSearch && matchType && matchRegion;
  });

  
  const uniqueSubTypes = Array.from(new Set(games.filter(g => filterMainTypes.length === 0 || filterMainTypes.includes(g.gameplay_main)).flatMap(g => g.gameplay_sub ? g.gameplay_sub.split(/[,，]+/).map((s: string) => s.trim()) : []))).filter(Boolean);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="搜索产品、公司、标签..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-neutral-300 shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-400 shrink-0" />
            <MultiSelect 
              label="全部区域" 
              options={["国内", "海外", "未知"]} 
              selected={filterRegions} 
              onChange={setFilterRegions} 
            />
            
            <MultiSelect
              label="玩法大类"
              options={["AI陪伴", "传统玩法+AI", "AI原生玩法", "生成式AI驱动UGC", "可交互视频", "其他"]}
              selected={filterMainTypes}
              onChange={types => { setFilterMainTypes(types); setFilterSubTypes([]); }}
            />
            
            <MultiSelect
              label="玩法子类"
              options={uniqueSubTypes as string[]}
              selected={filterSubTypes}
              onChange={setFilterSubTypes}
            />

          </div>
        </div>

        <div className="flex gap-2 text-xs font-mono text-neutral-400 border border-neutral-200 px-3 py-1.5 bg-white shadow-sm">
          <span>静态看板模式 (只读)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredGames.map((game) => {
          const gameEvents = events.filter(e => e.game_id === game.id);
          const hasRecentEvents = gameEvents.length > 0;
          return (
          <Link
            key={game.id}
            href={`/game/${game.id}`}
            className="bg-white border border-neutral-200 hover:border-neutral-900 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between h-full min-h-[240px] relative group overflow-hidden"
          >
            {game.image_url ? (
              <div className="w-full h-32 bg-neutral-100 border-b border-neutral-100 shrink-0 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={game.image_url} alt={game.product_name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-full h-32 bg-gradient-to-br from-neutral-800 to-neutral-600 border-b border-neutral-100 shrink-0 relative flex items-center justify-center">
                <span className="text-white font-bold text-lg tracking-tight px-4 text-center line-clamp-2">{game.product_name}</span>
              </div>
            )}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-1 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <h3 className="font-bold text-base text-neutral-900 truncate" title={game.product_name}>{game.product_name}</h3>
                  {game.url && (
                    <a href={game.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-neutral-400 hover:text-indigo-600 transition-colors" title="访问外部链接">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-neutral-100 text-neutral-600 border border-neutral-200 font-mono whitespace-nowrap">
                  {game.status}
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-500 mb-3">{game.company_name}</p>
              
              <div className="mb-3 flex flex-wrap gap-1">
                <span className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 bg-neutral-800 text-neutral-100">
                  {game.gameplay_main}{game.gameplay_sub && game.gameplay_sub !== "通用" ? ` - ${game.gameplay_sub}` : ""}
                </span>
                {game.platform && game.platform !== '未知' && (
                  <span className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 border border-neutral-300 text-neutral-600 bg-white">
                    {game.platform}
                  </span>
                )}
                {game.company_size && game.company_size !== '未知' && (
                  <span className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 border border-neutral-300 text-neutral-600 bg-white">
                    {game.company_size}
                  </span>
                )}
                {game.funding_round && game.funding_round !== '未知' && (
                  <span className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 border border-neutral-300 text-neutral-600 bg-white">
                    {game.funding_round}{game.funding_amount ? ` ${game.funding_amount}` : ""}
                  </span>
                )}
                {game.launch_date && (
                  <span className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-100">
                    {game.launch_date}
                  </span>
                )}
                {game.tags && game.tags.split(',').filter((t: string) => t.trim()).map((tag: string, i: number) => (
                  <span key={i} className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 bg-neutral-200 text-neutral-700">
                    #{tag.trim()}
                  </span>
                ))}
                {hasRecentEvents && (
                   <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100">
                    <Activity className="h-2.5 w-2.5" />
                    Updates: {gameEvents.length}
                  </span>
                )}
              </div>
              
              <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed flex-1">
                {game.description}
              </p>
            </div>
            
            <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-[10px] text-neutral-400 font-mono uppercase tracking-wider group-hover:bg-neutral-100 transition-colors shrink-0">
              <span className="flex items-center gap-1"><TerminalSquare className="h-3 w-3" /> 查看详情</span>
              <div className="flex items-center gap-3">
                <span title="最新数据更新时间">更新:{game.updated_at ? game.updated_at.split(' ')[0] : '未知'}</span>
                <span>编号:{game.id.toString().padStart(4, '0')}</span>
              </div>
            </div>
          </Link>
        )})}
      </div>
    </div>
  );
}

