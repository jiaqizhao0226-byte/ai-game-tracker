'use client';

import Link from 'next/link';

/**
 * 跳转到产品详情页的链接，同时记下「从哪来」，供详情页的返回按钮读取。
 * 看板自身的卡片不用这个——它另有滚动位置恢复逻辑，来源固定是看板。
 */
export default function TrackedLink({
  href,
  from,
  fromLabel,
  className,
  children,
}: {
  href: string;
  from: string;
  fromLabel: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() => {
        try {
          sessionStorage.setItem('backTo', JSON.stringify({ href: from, label: fromLabel }));
        } catch {
          // ignore
        }
      }}
    >
      {children}
    </Link>
  );
}
