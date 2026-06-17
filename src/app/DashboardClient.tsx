/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Search, TerminalSquare, Activity, ExternalLink, Filter, X } from 'lucide-react';

export default function DashboardClient({ initialGames, initialEvents }: { initialGames: any[], initialEvents: any[] }) {
  const [games] = useState<any[]>(initialGames);
  const [events] = useState<any[]>(initialEvents);
  
  const [search, setSearch] = useState('');
  const [filterMainType, setFilterMainType] = useState('All');
  const [filterSubType, setFilterSubType] = useState('All');
  const [filterSize, setFilterSize] = useState('All');
  const [filterFunding, setFilterFunding] = useState('All');
  const [filterRegion, setFilterRegion] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [viewingGame, setViewingGame] = useState<any | null>(null);

  const filteredGames = games.filter(g => {
    const matchSearch = g.product_name.toLowerCase().includes(search.toLowerCase()) || 
      g.company_name.toLowerCase().includes(search.toLowerCase()) ||
      g.gameplay_type.toLowerCase().includes(search.toLowerCase()) ||
      (g.tags && g.tags.toLowerCase().includes(search.toLowerCase()));
    
    const matchType = (filterMainType === 'All' || g.gameplay_main === filterMainType) && (filterSubType === 'All' || g.gameplay_sub === filterSubType);
    const matchSize = filterSize === 'All' || g.company_size === filterSize;
    const matchFunding = filterFunding === 'All' || g.funding_round === filterFunding;
    const matchRegion = filterRegion === 'All' || g.region === filterRegion;
    const matchStatus = filterStatus === 'All' || g.status === filterStatus;

    return matchSearch && matchType && matchSize && matchFunding && matchRegion && matchStatus;
  });

  
  const uniqueSubTypes = Array.from(new Set(games.filter(g => filterMainType === 'All' || g.gameplay_main === filterMainType).map(g => g.gameplay_sub))).filter(Boolean);
  const uniqueSizes = Array.from(new Set(games.map(g => g.company_size))).filter(Boolean);
  const uniqueFunding = Array.from(new Set(games.map(g => g.funding_round))).filter(Boolean);
  
  const uniqueStatuses = Array.from(new Set(games.map(g => g.status))).filter(Boolean);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white border border-neutral-300 shadow-sm text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-400 shrink-0" />
            <select 
              value={filterRegion} 
              onChange={e => setFilterRegion(e.target.value)}
              className="bg-white border border-neutral-300 text-xs py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono shadow-sm"
            >
              <option value="All">国内/海外</option>
              <option value="国内">国内</option>
              <option value="海外">海外</option>
              <option value="未知">未知</option>
            </select>

            <select 
              value={filterMainType} 
              onChange={e => { setFilterMainType(e.target.value); setFilterSubType('All'); }}
              className="bg-white border border-neutral-300 text-xs py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono shadow-sm max-w-[120px] truncate"
            >
              <option value="All">玩法大类 (All)</option>
              <option value="AI陪伴">AI陪伴</option>
              <option value="传统玩法+AI">传统玩法+AI</option>
              <option value="AI原生玩法">AI原生玩法</option>
              <option value="生成式AI驱动UGC">生成式AI驱动UGC</option>
              <option value="可交互视频">可交互视频</option>
              <option value="Agent类/通用AI智能体">Agent类/通用智能体</option>
              <option value="其他">其他</option>
            </select>
            <select 
              value={filterSubType} 
              onChange={e => setFilterSubType(e.target.value)}
              className="bg-white border border-neutral-300 text-xs py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono shadow-sm max-w-[120px] truncate"
            >
              <option value="All">玩法子类 (All)</option>
              {uniqueSubTypes.map(t => <option key={t as string} value={t as string}>{t as string}</option>)}
            </select>

            <select 
              value={filterSize} 
              onChange={e => setFilterSize(e.target.value)}
              className="bg-white border border-neutral-300 text-xs py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono shadow-sm"
            >
              <option value="All">All Sizes</option>
              <option value="大厂">大厂</option>
              <option value="中小团队">中小团队</option>
              <option value="独立开发者">独立开发者</option>
              <option value="未知">未知</option>
              {uniqueSizes.filter(s => !["大厂", "中小团队", "独立开发者", "未知"].includes(s as string)).map(s => <option key={s as string} value={s as string}>{s as string}</option>)}
            </select>

            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-white border border-neutral-300 text-xs py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono shadow-sm"
            >
              <option value="All">All Status</option>
              <option value="已上线">已上线</option>
              <option value="测试中">测试中</option>
              <option value="研发中">研发中</option>
              <option value="早期/原型">早期/原型</option>
              <option value="停止开发">停止开发</option>
              <option value="未知">未知</option>
              {uniqueStatuses.filter(st => !["已上线", "测试中", "研发中", "早期/原型", "停止开发", "未知"].includes(st as string)).map(st => <option key={st as string} value={st as string}>{st as string}</option>)}
            </select>

            <select 
              value={filterFunding} 
              onChange={e => setFilterFunding(e.target.value)}
              className="bg-white border border-neutral-300 text-xs py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono shadow-sm"
            >
              <option value="All">All Funding</option>
              <option value="未融资">未融资</option>
              <option value="天使/种子轮">天使/种子轮</option>
              <option value="A轮">A轮</option>
              <option value="B轮及以上">B轮及以上</option>
              <option value="已上市">已上市</option>
              <option value="被收购/大厂内部孵化">被收购/大厂内部孵化</option>
              <option value="未知">未知</option>
              {uniqueFunding.filter(f => !["未融资", "天使/种子轮", "A轮", "B轮及以上", "已上市", "被收购/大厂内部孵化", "未知", "被收购"].includes(f as string)).map(f => <option key={f as string} value={f as string}>{f as string}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-2 text-xs font-mono text-neutral-400 border border-neutral-200 px-3 py-1.5 bg-white shadow-sm">
          <span>READ ONLY MODE (GITHUB PAGES)</span>
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
              
              <p className="text-xs text-neutral-600 line-clamp-6 leading-relaxed flex-1">
                {game.description}
              </p>
            </div>
            
            <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-[10px] text-neutral-400 font-mono uppercase tracking-wider group-hover:bg-neutral-100 transition-colors shrink-0">
              <span className="flex items-center gap-1"><TerminalSquare className="h-3 w-3" /> Inspect Data</span>
              <span>ID:{game.id.toString().padStart(4, '0')}</span>
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
            Data Record // {game.product_name}
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          <div className="overflow-y-auto p-5 md:w-[45%] border-r border-neutral-200">
            <h3 className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-4 font-mono border-b border-neutral-100 pb-2">
              Core Attributes
            </h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">Product Name</label>
                <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.product_name}</div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">Company / Team</label>
                <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.company_name}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">Company Size</label>
                  <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.company_size || '未知'}</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">Funding Round</label>
                  <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.funding_round || '未知'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">Gameplay Type</label>
                  <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.gameplay_main}{game.gameplay_sub && game.gameplay_sub !== "通用" ? ` (${game.gameplay_sub})` : ""}</div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">Status</label>
                  <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800">{game.status}</div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">Summary / Intelligence</label>
                <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800 whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">{game.description}</div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">Image URL (Logo / Cover)</label>
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
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">URL / Related Link</label>
                <div className="px-3 py-2 text-sm bg-neutral-50 border border-neutral-200 text-neutral-800 break-all">
                  {game.url ? (
                    <a href={game.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{game.url}</a>
                  ) : '-'}
                </div>
              </div>
                  
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">Custom Tags</label>
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
                <div className="text-center py-10 text-neutral-400 text-xs font-mono">NO {activeTab === '产品动态' ? 'PRODUCT' : 'FUNDING'} EVENTS RECORDED.</div>
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
                          CLICK TO EXPAND
                        </div>
                      )}
                      {isExpanded && (
                        <div className="mt-2 text-[10px] text-neutral-400 font-mono flex items-center">
                          CLICK TO COLLAPSE
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
