'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * 产品详情页的「返回」。
 *
 * 详情页可以从看板进，也可以从趋势洞察的案例卡进——固定返回看板会把读者
 * 从正在读的那篇洞察里甩出去。进入时由来源页写下 backTo，这里读出来决定去哪。
 * 读不到（直接访问、外部跳入）就回落到看板。
 */
type Dest = { href: string; label: string };
const HOME: Dest = { href: '/', label: '看板' };

export function useBackDest(): Dest {
  const [dest, setDest] = useState<Dest>(HOME);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('backTo');
      if (!raw) return;
      const d = JSON.parse(raw);
      // 只接受站内相对路径，避免被写入外部地址
      if (d && typeof d.href === 'string' && d.href.startsWith('/') && !d.href.startsWith('//')) {
        setDest({ href: d.href, label: d.label || '上一页' });
      }
    } catch {
      // ignore
    }
  }, []);
  return dest;
}

export function BackBreadcrumb({ className = '' }: { className?: string }) {
  const dest = useBackDest();
  return (
    <Link href={dest.href} className={className}>
      {dest.label}
    </Link>
  );
}

/**
 * 底部的返回按钮。整块在这里渲染——children 若传函数会跨 Server/Client
 * 边界，Next 不允许。
 */
export default function BackLink({ className = '' }: { className?: string }) {
  const dest = useBackDest();
  return (
    <Link href={dest.href} className={className}>
      <ArrowLeft className="w-4 h-4" /> 返回{dest.label}
    </Link>
  );
}
