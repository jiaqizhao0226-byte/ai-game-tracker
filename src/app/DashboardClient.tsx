/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useRef } from 'react';
import { GameRecord, GameEvent } from '@/lib/db';
import { addGame, updateGame, deleteGame, addGameEvent, deleteGameEvent, parseIntelligence, addGameWithEvents } from './actions';
import { X, Search, TerminalSquare, Activity, ExternalLink, Filter } from 'lucide-react';

export default function DashboardClient({ initialGames, initialEvents }: { initialGames: GameRecord[], initialEvents: GameEvent[] }) {
  const [games] = useState<GameRecord[]>(initialGames);
  const [events] = useState<GameEvent[]>(initialEvents);
  
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterSize, setFilterSize] = useState('All');
  const [filterFunding, setFilterFunding] = useState('All');
  const [editingGame, setEditingGame] = useState<GameRecord | null>(null);

  const filteredGames = games.filter(g => {
    const matchSearch = g.product_name.toLowerCase().includes(search.toLowerCase()) || 
      g.company_name.toLowerCase().includes(search.toLowerCase()) ||
      g.gameplay_type.toLowerCase().includes(search.toLowerCase()) ||
      (g.tags && g.tags.toLowerCase().includes(search.toLowerCase()));
    
    const matchType = filterType === 'All' || g.gameplay_type === filterType;
    const matchSize = filterSize === 'All' || g.company_size === filterSize;
    const matchFunding = filterFunding === 'All' || g.funding_round === filterFunding;

    return matchSearch && matchType && matchSize && matchFunding;
  });

  // Unique values for filters
  const uniqueTypes = Array.from(new Set(games.map(g => g.gameplay_type))).filter(Boolean);
  const uniqueSizes = Array.from(new Set(games.map(g => g.company_size))).filter(Boolean);
  const uniqueFunding = Array.from(new Set(games.map(g => g.funding_round))).filter(Boolean);

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
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-neutral-400" />
            <select 
              value={filterType} 
              onChange={e => setFilterType(e.target.value)}
              className="bg-white border border-neutral-300 text-xs py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono shadow-sm"
            >
              <option value="All">All Types</option>
              {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select 
              value={filterSize} 
              onChange={e => setFilterSize(e.target.value)}
              className="bg-white border border-neutral-300 text-xs py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono shadow-sm"
            >
              <option value="All">All Sizes</option>
              {uniqueSizes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <select 
              value={filterFunding} 
              onChange={e => setFilterFunding(e.target.value)}
              className="bg-white border border-neutral-300 text-xs py-1.5 px-2 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono shadow-sm"
            >
              <option value="All">All Funding</option>
              {uniqueFunding.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-2 text-xs font-mono text-neutral-400 border border-neutral-200 px-3 py-1.5 bg-white shadow-sm">
          <span>READ ONLY MODE (STATIC EXPORT)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredGames.map((game) => {
          const gameEvents = events.filter(e => e.game_id === game.id);
          const hasRecentEvents = gameEvents.length > 0;
          return (
          <div 
            key={game.id} 
            onClick={() => setEditingGame(game)}
            className="bg-white border border-neutral-200 hover:border-neutral-900 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between h-[240px] relative group"
          >
            <div className="p-5">
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
                  {game.gameplay_type}
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
                {game.tags && game.tags.split(',').filter(t => t.trim()).map((tag, i) => (
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
              
              <p className="text-xs text-neutral-600 line-clamp-4 leading-relaxed">
                {game.description}
              </p>
            </div>
            
            <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50 flex items-center justify-between text-[10px] text-neutral-400 font-mono uppercase tracking-wider group-hover:bg-neutral-100 transition-colors">
              <span className="flex items-center gap-1"><TerminalSquare className="h-3 w-3" /> Inspect Data</span>
              <span>ID:{game.id.toString().padStart(4, '0')}</span>
            </div>
          </div>
        )})}
      </div>

      {editingGame && (
        <GameModal 
          game={editingGame} 
          gameEvents={events.filter(e => e.game_id === editingGame.id)}
          onClose={() => setEditingGame(null)} 
        />
      )}
    </div>
  );
}

function AIImportModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: (data: any) => void }) {
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleImport(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsParsing(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    
    try {
      const data = await parseIntelligence(formData);
      onSuccess(data);
    } catch (err: any) {
      setError(err.message || "Failed to parse");
      setIsParsing(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-[2px] z-[60] flex items-center justify-center p-4">
      <div className="bg-white border border-neutral-300 shadow-2xl w-full max-w-lg flex flex-col">
        <div className="flex justify-between items-center px-5 py-4 border-b border-neutral-200 bg-indigo-50">
          <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-indigo-900 flex items-center gap-2">
            <Bot className="w-4 h-4" />
            AI Intelligence Parser
          </h2>
          <button onClick={onClose} className="text-indigo-400 hover:text-indigo-900 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <form onSubmit={handleImport} className="p-6 flex flex-col gap-4">
          <p className="text-xs text-neutral-500 leading-relaxed">
            粘贴产品研报片段、新闻链接，或直接上传 PDF/Word 文档。AI 将自动提取产品名称、开发状态及产品动态。
          </p>
          
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">文本或链接 (Text / URL)</label>
            <textarea 
              name="text" 
              placeholder="Paste text or URL here..."
              rows={5}
              className="border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 bg-neutral-50 focus:bg-white resize-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">上传文档 (PDF / Docx / Txt)</label>
            <div className="relative border border-dashed border-neutral-300 bg-neutral-50 hover:bg-neutral-100 transition-colors px-4 py-4 text-center cursor-pointer">
              <input 
                type="file" 
                name="file" 
                accept=".pdf,.docx,.txt"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex flex-col items-center gap-2 pointer-events-none">
                <Upload className="w-5 h-5 text-neutral-400" />
                <span className="text-xs text-neutral-500 font-mono">Click or drag file to upload</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 text-xs border border-red-200 mt-2">
              {error}
            </div>
          )}

          <div className="mt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-600 hover:bg-neutral-200"
              disabled={isParsing}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2"
              disabled={isParsing}
            >
              {isParsing ? 'Parsing...' : 'Analyze & Extract'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function GameModal({ game, gameEvents, parsedData, onClose }: { game: GameRecord | null, gameEvents: GameEvent[], parsedData: any, onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use parsedData to auto-fill if available
  const defaultProduct = parsedData?.product_name || game?.product_name || '';
  const defaultCompany = parsedData?.company_name || game?.company_name || '';
  const defaultCompanySize = parsedData?.company_size || game?.company_size || '未知';
  const defaultFundingRound = parsedData?.funding_round || game?.funding_round || '未知';
  const defaultGameplayType = parsedData?.gameplay_type || game?.gameplay_type || 'AI陪伴';
  const defaultStatus = parsedData?.status || game?.status || '研发中';
  const defaultDescription = parsedData?.description || game?.description || '';
  const defaultUrl = parsedData?.url || game?.url || '';
  const defaultTags = parsedData?.tags ? parsedData.tags.join(', ') : (game?.tags || '');
  const initialNewEvents = parsedData?.events || [];

  async function handleGameSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      if (game) {
        await updateGame(game.id, formData);
      } else {
        if (parsedData?.events && parsedData.events.length > 0) {
          formData.append('events_json', JSON.stringify(parsedData.events));
          await addGameWithEvents(formData);
        } else {
          await addGame(formData);
        }
      }
      onClose();
      window.location.reload();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  }

  async function handleGameDelete() {
    if (!game) return;
    if (confirm('Delete this record entirely?')) {
      setIsSubmitting(true);
      await deleteGame(game.id);
      onClose();
      window.location.reload();
    }
  }

  async function handleEventSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!game) return;
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await addGameEvent(game.id, formData);
      window.location.reload();
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  }

  async function handleEventDelete(eventId: number) {
    if (confirm('Delete this timeline event?')) {
      setIsSubmitting(true);
      try {
        await deleteGameEvent(eventId);
        window.location.reload();
      } catch (err) {
        console.error(err);
        setIsSubmitting(false);
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-neutral-900/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
      <div className={`bg-white border border-neutral-300 shadow-2xl w-full ${game || parsedData ? 'max-w-5xl' : 'max-w-xl'} flex flex-col max-h-[85vh]`}>
        <div className="flex justify-between items-center px-5 py-4 border-b border-neutral-200 bg-neutral-50">
          <h2 className="text-sm font-bold font-mono uppercase tracking-widest text-neutral-900 flex items-center gap-2">
            <TerminalSquare className="w-4 h-4" />
            {game ? `Data Record // ${game.product_name}` : (parsedData ? 'Review AI Extraction' : 'New Data Record')}
          </h2>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          <div className={`overflow-y-auto p-5 ${(game || parsedData) ? 'md:w-[45%] border-r border-neutral-200' : 'w-full'}`}>
            <h3 className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold mb-4 font-mono border-b border-neutral-100 pb-2">
              Core Attributes
            </h3>
            <form id="game-form" onSubmit={handleGameSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">Product Name</label>
                <input 
                  name="product_name" 
                  defaultValue={defaultProduct} 
                  required 
                  className="border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 bg-neutral-50 focus:bg-white transition-colors"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">Company / Team</label>
                <input 
                  name="company_name" 
                  defaultValue={defaultCompany} 
                  required 
                  className="border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 bg-neutral-50 focus:bg-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">Company Size</label>
                  <select 
                    name="company_size" 
                    defaultValue={defaultCompanySize} 
                    className="border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 bg-neutral-50 focus:bg-white"
                  >
                    <option value="大厂">大厂</option>
                    <option value="中小团队">中小团队</option>
                    <option value="独立开发者">独立开发者</option>
                    <option value="未知">未知</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">Funding Round</label>
                  <select 
                    name="funding_round" 
                    defaultValue={defaultFundingRound} 
                    className="border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 bg-neutral-50 focus:bg-white"
                  >
                    <option value="未融资">未融资</option>
                    <option value="天使/种子轮">天使/种子轮</option>
                    <option value="A轮">A轮</option>
                    <option value="B轮及以上">B轮及以上</option>
                    <option value="已上市">已上市</option>
                    <option value="被收购">被收购</option>
                    <option value="未知">未知</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">Gameplay Type</label>
                  <select 
                    name="gameplay_type" 
                    defaultValue={defaultGameplayType} 
                    className="border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 bg-neutral-50 focus:bg-white"
                  >
                    <option value="AI陪伴">AI陪伴</option>
                    <option value="传统玩法+AI NPC">传统玩法+AI NPC</option>
                    <option value="传统玩法+AI队友">传统玩法+AI队友</option>
                    <option value="AI原生玩法 (对话模拟)">AI原生玩法 (对话模拟)</option>
                    <option value="AI原生玩法 (派对游戏)">AI原生玩法 (派对游戏)</option>
                    <option value="AI原生玩法 (机制/卡牌)">AI原生玩法 (机制/卡牌)</option>
                    <option value="初代Chatbot (AI陪伴)">初代Chatbot (AI陪伴)</option>
                    <option value="生成式AI驱动UGC">生成式AI驱动UGC</option>
                    <option value="可交互视频">可交互视频</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">Status</label>
                  <input 
                    name="status" 
                    defaultValue={defaultStatus} 
                    required 
                    className="border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 bg-neutral-50 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">Summary / Intelligence</label>
                  <textarea 
                    name="description" 
                    defaultValue={defaultDescription} 
                    required 
                    rows={5}
                    className="border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 resize-none leading-relaxed bg-neutral-50 focus:bg-white"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide">URL / Related Link</label>
                  <input 
                    name="url" 
                    defaultValue={defaultUrl} 
                    placeholder="https://..."
                    className="border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 bg-neutral-50 focus:bg-white transition-colors"
                  />
                  
                  <label className="text-[11px] font-bold text-neutral-600 uppercase tracking-wide mt-2">Custom Tags</label>
                  <input 
                    name="tags" 
                    defaultValue={defaultTags} 
                    placeholder="e.g. 3D男女友, 出海 (comma separated)"
                    className="border border-neutral-300 px-3 py-2 text-sm focus:outline-none focus:border-neutral-900 bg-neutral-50 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {parsedData && parsedData.events && parsedData.events.length > 0 && !game && (
                <div className="mt-2 bg-indigo-50 border border-indigo-200 p-3 text-xs text-indigo-800">
                  <p className="font-bold mb-1">提示：</p>
                  <p>AI 解析到了 {parsedData.events.length} 条动态事件（见右侧）。保存当前产品时，这些事件将被一并录入。</p>
                </div>
              )}

            </form>
          </div>

          {(game || (parsedData && initialNewEvents.length > 0)) && (
            <div className="md:w-[55%] flex flex-col bg-white overflow-hidden relative">
              <div className="p-5 pb-3 border-b border-neutral-100 bg-white shrink-0">
                <h3 className="text-[10px] uppercase tracking-widest text-neutral-400 font-bold font-mono">
                  {game ? "Timeline / Updates" : "Parsed Events (Unsaved)"}
                </h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-5 bg-neutral-50/50">
                {gameEvents.length === 0 ? (
                  <div className="text-center py-10 text-neutral-400 text-xs font-mono">NO TIMELINE EVENTS RECORDED.</div>
                ) : (
                  <div className="space-y-4 relative border-l-2 border-neutral-200 ml-2 pl-4">
                    {gameEvents.map(evt => (
                      <div key={evt.id} className="relative group">
                        <div className="absolute w-2 h-2 rounded-full bg-neutral-900 -left-[21px] top-1.5 border-2 border-white"></div>
                        <div className="bg-white border border-neutral-200 p-3 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] uppercase font-bold tracking-widest px-1.5 py-0.5 ${evt.event_type === '融资动态' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                                {evt.event_type}
                              </span>
                              <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.5">{evt.event_date}</span>
                            </div>
                          </div>
                          <p className="text-xs text-neutral-700 leading-relaxed">{evt.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
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
