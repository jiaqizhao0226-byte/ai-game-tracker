'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Database, Lightbulb } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-16 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-neutral-900 flex items-center justify-center rounded-sm shadow-inner">
              <Database className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-neutral-900 leading-tight">AI+游戏玩法</h1>
              <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">常态化监控</p>
            </div>
          </div>
          
          <nav className="hidden sm:flex items-center gap-1">
            <Link 
              href="/" 
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-md transition-colors flex items-center gap-2 ${pathname === '/' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50'}`}
            >
              <Database className="w-4 h-4" />
              Intelligence Board
            </Link>
            <Link 
              href="/insights" 
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-md transition-colors flex items-center gap-2 ${pathname === '/insights' ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50'}`}
            >
              <Lightbulb className="w-4 h-4" />
              Trend Insights
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
