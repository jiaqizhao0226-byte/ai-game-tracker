/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, TerminalSquare, Activity, ExternalLink, Filter, ChevronDown, Check, Star } from 'lucide-react';
import Link from 'next/link';
import GameImage from '../components/GameImage';

type MSOption = string | { group: string };
function MultiSelect({ label, options, selected, onChange, className = "" }: { label: string, options: MSOption[], selected: string[], onChange: (s: string[]) => void, className?: string }) {
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
        <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 shadow-lg z-20 min-w-[150px] max-h-96 overflow-y-auto">
          <div className="px-3 py-2 flex items-center gap-2 hover:bg-neutral-50 cursor-pointer border-b border-neutral-100" onClick={() => onChange([])}>
            <div className={`w-3 h-3 border flex items-center justify-center shrink-0 ${selected.length === 0 ? 'bg-neutral-900 border-neutral-900' : 'border-neutral-300'}`}>
              {selected.length === 0 && <Check className="w-2 h-2 text-white" />}
            </div>
            <span className="text-xs font-mono truncate text-neutral-700">全部</span>
          </div>
          {options.map(opt => (
            typeof opt === 'object' ? (
              <div key={`g:${opt.group}`} className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-wider text-neutral-400 bg-neutral-50 border-b border-neutral-100 select-none">
                {opt.group}
              </div>
            ) : (
              <div key={opt} className="pl-5 pr-3 py-2 flex items-center gap-2 hover:bg-neutral-50 cursor-pointer" onClick={() => toggle(opt)}>
                <div className={`w-3 h-3 border flex items-center justify-center shrink-0 ${selected.includes(opt) ? 'bg-neutral-900 border-neutral-900' : 'border-neutral-300'}`}>
                  {selected.includes(opt) && <Check className="w-2 h-2 text-white" />}
                </div>
                <span className="text-xs font-mono truncate text-neutral-700">{opt}</span>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardClient({ initialGames, initialEvents }: { initialGames: any[], initialEvents: any[] }) {
  const [games] = useState<any[]>(initialGames);
  const [events] = useState<any[]>(initialEvents);
  
  // 从 sessionStorage 恢复筛选状态（返回列表页时保留筛选）
  const savedFilters = (() => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = sessionStorage.getItem('dashboardFilters');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const [search, setSearch] = useState<string>(savedFilters?.search ?? '');
  const [filterBatches, setFilterBatches] = useState<string[]>(savedFilters?.filterBatches ?? []);
  const [filterMainTypes, setFilterMainTypes] = useState<string[]>(savedFilters?.filterMainTypes ?? []);
  const [filterSubTypes, setFilterSubTypes] = useState<string[]>(savedFilters?.filterSubTypes ?? []);
  const [filterThemes, setFilterThemes] = useState<string[]>(savedFilters?.filterThemes ?? []);
  const [filterTiers, setFilterTiers] = useState<string[]>(savedFilters?.filterTiers ?? []);

  // 筛选变化时写入 sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem('dashboardFilters', JSON.stringify({
        search, filterBatches, filterMainTypes, filterSubTypes, filterThemes, filterTiers,
      }));
    } catch {
      // ignore
    }
  }, [search, filterBatches, filterMainTypes, filterSubTypes, filterThemes, filterTiers]);

  // 从卡片详情页返回时，恢复离开前的滚动位置（点卡片时写入，恢复后即清除）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const y = sessionStorage.getItem('dashboardScroll');
      if (y) {
        sessionStorage.removeItem('dashboardScroll');
        window.scrollTo(0, parseInt(y, 10));
      }
    } catch {
      // ignore
    }
  }, []);

  const filteredGames = games.filter(g => {
    const matchSearch = g.product_name.toLowerCase().includes(search.toLowerCase()) ||
      g.company_name.toLowerCase().includes(search.toLowerCase()) ||
      (g.gameplay_main && g.gameplay_main.toLowerCase().includes(search.toLowerCase())) ||
      (g.gameplay_sub && g.gameplay_sub.toLowerCase().includes(search.toLowerCase())) ||
      (g.tags && g.tags.toLowerCase().includes(search.toLowerCase()));

    const matchBatch = filterBatches.length === 0 || filterBatches.includes(g.batch);
    // 玩法大类：主品类命中，或任一次品类(facets)命中都算——让多标签产品(如 Whispers 的次标签「AI陪伴」)在筛该品类时也出现
    const matchMain = filterMainTypes.length === 0
      || filterMainTypes.includes(g.gameplay_main)
      || (g.gameplay_facets && g.gameplay_facets.split(/[,，]+/).some((f: string) => filterMainTypes.includes(f.trim())));
    const matchType = matchMain && (filterSubTypes.length === 0 || (g.gameplay_sub && g.gameplay_sub.split(/[,，]+/).some((s: string) => filterSubTypes.includes(s.trim()))));
    const matchTheme = filterThemes.length === 0 || (g.gameplay_theme && g.gameplay_theme.split(/[,，]+/).some((t: string) => filterThemes.includes(t.trim())));
    const matchTier = filterTiers.length === 0 || filterTiers.includes(g.scale_tier);
    return matchSearch && matchBatch && matchType && matchTheme && matchTier;
  });


  // 分类固定顺序：AI Native 5 类在前，AI in Game 在后；子类按大类顺序分组展示
  const MAIN_ORDER = ['AI陪伴', 'AI叙事对话', 'AI玩法机制', 'AI Agent(智能体)', 'AI生成UGC', '传统品类+AI', 'AI for Game'];
  const SUB_ORDER: Record<string, string[]> = {
    'AI陪伴': ['AI游戏陪玩', 'AI伴侣', 'AI宠物'],
    'AI叙事对话': ['对话模拟', '互动叙事'],
    'AI玩法机制': ['AI裁定/主持', 'AI生成元素'],
    'AI Agent(智能体)': ['智能体社会'],
    'AI生成UGC': ['AI UGC玩法', '零代码造游戏'],
    '传统品类+AI': ['AI NPC', 'AI 队友'],
    'AI for Game': ['游戏基础模型', '一站式生成平台', '创意孵化平台', '创作与分发平台', '资产与动捕'],
  };
  const subsInData = new Set(games.flatMap(g => g.gameplay_sub ? g.gameplay_sub.split(/[,，]+/).map((s: string) => s.trim()) : []).filter(Boolean));
  const activeMains = filterMainTypes.length ? MAIN_ORDER.filter(m => filterMainTypes.includes(m)) : MAIN_ORDER;
  const groupedSubOptions: MSOption[] = [];
  for (const m of activeMains) {
    const subs = (SUB_ORDER[m] || []).filter(s => subsInData.has(s));
    if (subs.length) { groupedSubOptions.push({ group: m }); groupedSubOptions.push(...subs); }
  }

  // #重点tag（字段仍为 gameplay_theme）：固定顺序展示，只保留数据中实际存在的
  const themeOrder = ['多模态玩法', '腾讯系', '网易系', '米哈游系', '二次元', '派对游戏', '推理探案', '模拟经营', 'AI男友', 'AI女友', '历史模拟'];
  const themesInData = new Set(games.flatMap(g => g.gameplay_theme ? g.gameplay_theme.split(/[,，]+/).map((t: string) => t.trim()) : []));
  const uniqueThemes = themeOrder.filter(t => themesInData.has(t));

  const uniqueBatches = Array.from(new Set(games.map(g => g.batch).filter(Boolean))).sort((a: string, b: string) => {
    const ca = a.startsWith('常态跟踪') ? 0 : 1;
    const cb = b.startsWith('常态跟踪') ? 0 : 1;
    if (ca !== cb) return ca - cb;
    return a.localeCompare(b, 'zh');
  });

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
              label="收录批次"
              options={uniqueBatches as string[]}
              selected={filterBatches}
              onChange={setFilterBatches}
            />

            <MultiSelect
              label="团队规模"
              options={["大厂/大厂孵化", "融资创业", "独立/Indie"]}
              selected={filterTiers}
              onChange={setFilterTiers}
            />

            <MultiSelect
              label="玩法大类"
              options={[
                { group: "AI Native" },
                "AI陪伴", "AI叙事对话", "AI玩法机制", "AI Agent(智能体)", "AI生成UGC",
                { group: "AI in Game" },
                "传统品类+AI",
                { group: "AI for Game (研发侧)" },
                "AI for Game",
              ]}
              selected={filterMainTypes}
              onChange={types => { setFilterMainTypes(types); setFilterSubTypes([]); }}
            />

            <MultiSelect
              label="玩法子类"
              options={groupedSubOptions}
              selected={filterSubTypes}
              onChange={setFilterSubTypes}
            />

            <MultiSelect
              label="#重点tag"
              options={uniqueThemes as string[]}
              selected={filterThemes}
              onChange={setFilterThemes}
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
          const facets = game.gameplay_facets ? game.gameplay_facets.split(/[,，]+/).map((f: string) => f.trim()).filter(Boolean) : [];
          return (
          <Link
            key={game.id}
            href={`/game/${game.id}`}
            onClick={() => { try { sessionStorage.setItem('dashboardScroll', String(window.scrollY)); } catch {} }}
            className="card-interactive bg-white border border-neutral-200 hover:border-neutral-900 hover:shadow-lg cursor-pointer flex flex-col justify-between h-full min-h-[240px] relative group overflow-hidden"
          >
            {game.featured && (
              <div className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm text-amber-700 text-[10px] font-bold tracking-wide pl-1.5 pr-2 py-1 rounded-full shadow-sm ring-1 ring-amber-300/70">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
                重点关注
              </div>
            )}
            <GameImage
              src={game.image_url}
              name={game.product_name}
              imgWrapperClassName="w-full h-32 bg-neutral-100 border-b border-neutral-100 shrink-0 relative"
              placeholderClassName="w-full h-32 bg-gradient-to-br from-neutral-800 to-neutral-600 border-b border-neutral-100 shrink-0 relative flex items-center justify-center"
              textClassName="text-white font-bold text-lg tracking-tight px-4 text-center line-clamp-2"
            />
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-1 gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <h3 className="font-bold text-base text-neutral-900 truncate" title={game.product_name}>{game.product_name}</h3>
                  {game.url && (
                    <span
                      role="link"
                      tabIndex={0}
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.open(game.url, '_blank', 'noopener,noreferrer'); }}
                      className="text-neutral-400 hover:text-indigo-600 transition-colors cursor-pointer"
                      title="访问外部链接"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </span>
                  )}
                </div>
                {/* 已停运需与在营状态一眼可分，否则读者会把退场产品当成在跑的 */}
                <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 border font-mono whitespace-nowrap ${
                  game.status === '已停运'
                    ? 'bg-white text-neutral-400 border-neutral-300 border-dashed line-through decoration-neutral-300'
                    : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                }`}>
                  {game.status}
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-500 mb-3">{game.company_name}</p>
              
              <div className="mb-3 flex flex-wrap gap-1">
                <span className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 bg-neutral-800 text-neutral-100">
                  {game.gameplay_main}{game.gameplay_sub && game.gameplay_sub !== "通用" ? ` - ${game.gameplay_sub}` : ""}
                </span>
                {facets.map((f: string) => (
                  <span key={f} className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 bg-neutral-100 text-neutral-500 border border-neutral-200" title="次品类标签">
                    +{f}
                  </span>
                ))}
                {game.funding_round && game.funding_round !== '未知' && game.funding_round !== '未披露' && (
                  <span className="inline-block text-[10px] uppercase font-mono px-1.5 py-0.5 border border-neutral-300 text-neutral-600 bg-white">
                    {game.funding_round}
                  </span>
                )}
                {hasRecentEvents && (
                   <span className="inline-flex items-center gap-1 text-[10px] uppercase font-mono px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100">
                    <Activity className="h-2.5 w-2.5" />
                    {gameEvents.length}
                  </span>
                )}
              </div>
              
              <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed flex-1">
                {game.description.length > 80 ? game.description.substring(0, 80) + '...' : game.description}
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

