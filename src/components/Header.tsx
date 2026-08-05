'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Database, Lightbulb, LayoutGrid } from 'lucide-react';
import LogoMark from './LogoMark';

const NAV = [
  { href: '/overview', label: '概览', Icon: LayoutGrid },
  { href: '/', label: '产品情报看板', short: '看板', Icon: Database },
  { href: '/insights', label: '趋势洞察', short: '洞察', Icon: Lightbulb },
];

export default function Header() {
  const pathname = usePathname();
  // basePath 下 pathname 仍是 '/'，但保险起见把带前缀的形式也算上
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' || pathname === '/ai-game-tracker' : pathname.startsWith(href);

  return (
    <header className="bg-white border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-12 lg:px-16 h-14 sm:h-16 flex items-center justify-between gap-3">
        <Link
          href="/"
          onClick={(e) => {
            try { sessionStorage.removeItem('dashboardFilters'); sessionStorage.removeItem('dashboardScroll'); } catch {}
            if (window.location.pathname === '/' || window.location.pathname === '/ai-game-tracker' || window.location.pathname === '/ai-game-tracker/') {
              e.preventDefault();
              window.location.reload();
            }
          }}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity shrink-0"
          title="点击返回并重置筛选"
        >
          <LogoMark className="w-8 h-8 shrink-0" />
          {/* 窄屏放不下三个导航 + 全称，隐藏文字只留标记 */}
          <div className="hidden md:block">
            <h1 className="font-bold text-sm tracking-tight text-neutral-900 leading-tight">AI+游戏玩法</h1>
            <p className="text-[10px] uppercase tracking-widest text-neutral-500 font-mono">常态化监控</p>
          </div>
        </Link>

        {/*
          导航此前是 hidden sm:flex——移动端被整个藏掉且没有替代入口，
          页面之间无从切换。现在窄屏改为图标+短标签，始终可见。
        */}
        <nav className="flex items-center gap-1 flex-1 sm:flex-none justify-end">
          {NAV.map(({ href, label, short, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`flex-1 sm:flex-none flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2
                  px-2 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors
                  text-[11px] sm:text-sm font-bold sm:uppercase sm:tracking-wider
                  ${active ? 'bg-neutral-100 text-neutral-900' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'}`}
              >
                <Icon className="w-[18px] h-[18px] sm:w-4 sm:h-4 shrink-0" />
                <span className="sm:hidden leading-none">{short ?? label}</span>
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
