'use client';

import { useState, useRef, useEffect } from 'react';
import { assetUrl } from '../lib/asset';

/**
 * 图片渲染 + 优雅降级：
 * 当 src 为空、或图片加载失败(404/损坏)时，回退到带产品名的渐变占位块，
 * 避免出现浏览器默认的「裂图」图标。卡片与详情页共用。
 */
export default function GameImage({
  src,
  name,
  imgWrapperClassName,
  placeholderClassName,
  textClassName,
}: {
  src?: string | null;
  name: string;
  imgWrapperClassName: string;
  placeholderClassName: string;
  textClassName: string;
}) {
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const resolvedSrc = assetUrl(src);

  // 处理 SSR 竞态：图片可能在 hydration 挂上 onError 之前就已加载失败，
  // 此时 error 事件早于监听器丢失，需在挂载后用 naturalWidth 再补判一次。
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      setFailed(true);
    }
  }, []);

  if (resolvedSrc && !failed) {
    return (
      <div className={imgWrapperClassName}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={resolvedSrc}
          alt={name}
          onError={() => setFailed(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={placeholderClassName}>
      <span className={textClassName}>{name}</span>
    </div>
  );
}
