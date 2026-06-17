/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, TerminalSquare, Activity, ExternalLink, Filter, X, ChevronDown, Check } from 'lucide-react';

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
  const [filterSizes, setFilterSizes] = useState<string[]>([]);
  const [filterRegions, setFilterRegions] = useState<string[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [viewingGame, setViewingGame] = useState<any | null>(null);

  const filteredGames = games.filter(g => {
    const matchSearch = g.product_name.toLowerCase().includes(search.toLowerCase()) || 
      g.company_name.toLowerCase().includes(search.toLowerCase()) ||
      g.gameplay_type.toLowerCase().includes(search.toLowerCase()) ||
      (g.tags && g.tags.toLowerCase().includes(search.toLowerCase()));
    
    const matchType = (filterMainTypes.length === 0 || filterMainTypes.includes(g.gameplay_main)) && (filterSubTypes.length === 0 || filterSubTypes.includes(g.gameplay_sub));
    const matchSize = filterSizes.length === 0 || filterSizes.includes(g.company_size);
    const matchRegion = filterRegions.length === 0 || filterRegions.includes(g.region);
    const matchStatus = filterStatuses.length === 0 || filterStatuses.includes(g.status);

    return matchSearch && matchType && matchSize && matchRegion && matchStatus;
  });

  
  const uniqueSubTypes = Array.from(new Set(games.filter(g => filterMainTypes.length === 0 || filterMainTypes.includes(g.gameplay_main)).map(g => g.gameplay_sub))).filter(Boolean);
  const uniqueSizes = Array.from(new Set(games.map(g => g.company_size))).filter(Boolean);
  
  
  const uniqueStatuses = Array.from(new Set(games.map(g => g.status))).filter(Boolean);

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
              options={["AI陪伴", "传统玩法+AI", "AI原生玩法", "生成式AI驱动UGC", "可交互视频", "Agent类/通用智能体", "其他"]} 
              selected={filterMainTypes} 
              onChange={types => { setFilterMainTypes(types); setFilterSubTypes([]); }} 
            />
            
            <MultiSelect 
              label="玩法子类" 
              options={uniqueSubTypes as string[]} 
              selected={filterSubTypes} 
              onChange={setFilterSubTypes} 
            />
            
            <MultiSelect 
              label="团队规模" 
              options={["大厂", "中小团队", "独立开发者", "未知", ...(uniqueSizes.filter(s => !["大厂", "中小团队", "独立开发者", "未知"].includes(s as string)) as string[])]} 
              selected={filterSizes} 
              onChange={setFilterSizes} 
            />
            
            <MultiSelect 
              label="当前状态" 
              options={["已上线", "测试中", "研发中", "早期/原型", "停止开发", "未知", ...(uniqueStatuses.filter(st => !["已上线", "测试中", "研发中", "早期/原型", "停止开发", "未知"].includes(st as string)) as string[])]} 
              selected={filterStatuses} 
              onChange={setFilterStatuses} 
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
          <div 
            key={game.id} 
            onClick={() => setViewingGame(game)}
            className="bg-white border border-neutral-200 hover:border-neutral-900 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between h-full min-h-[240px] relative group overflow-hidden"
          >
            {game.image_url && (
              <div className="w-full h-32 bg-neutral-100 border-b border-neutral-100 shrink-0 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={game.image_url} alt={game.product_name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2 pr-2">
                  <h3 className="font-bold text-base text-neutral-900 truncate">{game.product_name}</h3>
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
                {game.company_size && game.company_size !== '未知' && (
                  <span className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 border border-neutral-300 text-neutral-600 bg-white">
                    {game.company_size}
                  </span>
                )}
                {game.funding_round && game.funding_round !== '未知' && (
                  <span className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 border border-neutral-300 text-neutral-600 bg-white">
                    {game.funding_round}
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
              
              <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed flex-1">
                {game.description}
              </p>
            </div>
            
            <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-[10px] text-neutral-400 font-mono uppercase tracking-wider group-hover:bg-neutral-100 transition-colors shrink-0">
              <span className="flex items-center gap-1"><TerminalSquare className="h-3 w-3" /> 查看详情</span>
              <span>编号:{game.id.toString().padStart(4, '0')}</span>
            </div>
          </div>
        )})}
      </div>

      {viewingGame && (
        <GameModal 
          game={viewingGame} 
          gameEvents={events.filter(e => e.game_id === viewingGame.id)}
          onClose={() => setViewingGame(null)} 
        />
      )}
    </div>
  );
}

function GameModal({ game, gameEvents, onClose }: { game: any, gameEvents: any[], onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'产品动态' | '融资动态'>('产品动态');
  const [expandedEventId, setExpandedEventId] = useState<number | null>(null);
  
  if (!game) return null;
  
  const filteredEvents = gameEvents.filter(e => e.event_type === activeTab);

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-neutral-300 shadow-2xl w-full max-w-5xl flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center px-5 py-4 border-b border-neutral-200 bg-neutral-50">
          <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-neutral-900 flex items-center gap-2">
            <TerminalSquare className="w-4 h-4" />
            数据档案 // {game.product_name}
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          <div className="overflow-y-auto p-5 md:w-[45%] border-r border-neutral-200">
            <h3 className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-4 font-mono border-b border-neutral-100 pb-2">
              核心属性
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">产品名称</label>
                <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.product_name}</div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">公司 / 团队</label>
                <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.company_name}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">团队规模</label>
                  <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.company_size || '未知'}</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">融资轮次</label>
                  <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.funding_round || '未知'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">玩法类型</label>
                  <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.gameplay_main}{game.gameplay_sub && game.gameplay_sub !== "通用" ? ` (${game.gameplay_sub})` : ""}</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">当前状态</label>
                  <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.status}</div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">核心简介</label>
                <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">{game.description}</div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">产品配图</label>
                <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800 break-all">
                  {game.image_url ? (
                    <div className="flex flex-col gap-2">
                      <a href={game.image_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{game.image_url}</a>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={game.image_url} alt="Cover Preview" className="h-20 w-auto rounded border border-neutral-200 object-cover" />
                    </div>
                  ) : '-'}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">相关链接</label>
                <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800 break-all">
                  {game.url ? (
                    <a href={game.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{game.url}</a>
                  ) : '-'}
                </div>
              </div>
                  
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">自定义标签</label>
                <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">
                  {game.tags || '-'}
                </div>
              </div>
            </div>
          </div>

          <div className="md:w-[55%] flex flex-col bg-white overflow-hidden relative">
            <div className="flex border-b border-neutral-100 bg-white shrink-0 px-5 pt-3">
              <button 
                onClick={() => setActiveTab('产品动态')}
                className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold font-mono border-b-2 transition-colors ${activeTab === '产品动态' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
              >
                产品动态
              </button>
              <button 
                onClick={() => setActiveTab('融资动态')}
                className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold font-mono border-b-2 transition-colors ${activeTab === '融资动态' ? 'border-neutral-900 text-neutral-900' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
              >
                融资动态
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 bg-neutral-50/50">
              {filteredEvents.length === 0 ? (
                <div className="text-center py-10 text-neutral-400 text-xs font-mono">暂无{activeTab}记录。</div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {filteredEvents.map(evt => {
                    const isExpanded = expandedEventId === evt.id;
                    return (
                    <div 
                      key={evt.id} 
                      onClick={() => setExpandedEventId(isExpanded ? null : evt.id)}
                      className="bg-white border border-neutral-200 p-4 shadow-sm hover:border-neutral-900 hover:shadow-md cursor-pointer transition-all flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 ${evt.event_type === '融资动态' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                            {evt.event_type}
                          </span>
                          <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5">{evt.event_date}</span>
                        </div>
                      </div>
                      <p className={`text-xs text-neutral-700 leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {evt.content}
                      </p>
                      {!isExpanded && evt.content.length > 50 && (
                        <div className="mt-2 text-[10px] text-neutral-400 font-mono flex items-center">
                          点击展开
                        </div>
                      )}
                      {isExpanded && (
                        <div className="mt-2 text-[10px] text-neutral-400 font-mono flex items-center">
                          点击收起
                        </div>
                      )}
                    </div>
                  )})}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-neutral-100 border-t border-neutral-200 flex justify-end items-center shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="px-6 py-2 text-xs font-bold uppercase tracking-wider bg-neutral-900 text-white hover:bg-neutral-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
