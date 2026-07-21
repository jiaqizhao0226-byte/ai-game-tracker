/**
 * 数字滚轮：每一位是一条 0-9 的竖列，滚动到目标数字，逐位错开形成翻页感。
 *
 * 刻意做成纯 CSS、无 state 的 server component：
 * 最终 transform 直接写在内联 style 上，所以 SSR 出的 HTML 已经停在正确数字上；
 * keyframes 只给 from（translateY(0)），to 自动取元素计算值。
 * 若改用 useState + useEffect 触发，未水合时会先显示 0 再跳变。
 *
 * 竖列铺两轮 0-9，滚到第二轮的目标位，使每位都滚过 10+ 个数字——
 * 否则「1」只滚 1 格、「9」滚 9 格，各位快慢不一，反而没有翻页的整齐感。
 */
export default function RollingNumber({
  value,
  className = '',
  stagger = 90,
}: {
  value: number | string;
  className?: string;
  /** 相邻位之间的延迟（ms），越大层次越明显 */
  stagger?: number;
}) {
  const digits = String(value).split('');

  return (
    <span className={`inline-flex tabular-nums ${className}`} role="text" aria-label={String(value)}>
      {digits.map((ch, i) => {
        // 非数字（小数点、逗号等）直接原样渲染，不参与滚动
        if (!/\d/.test(ch)) {
          return (
            <span key={i} aria-hidden="true">
              {ch}
            </span>
          );
        }
        const target = 10 + Number(ch); // 第二轮的目标位
        return (
          <span
            key={i}
            aria-hidden="true"
            className="inline-block overflow-hidden"
            style={{ height: '1em', lineHeight: 1 }}
          >
            <span
              className="digit-col block"
              style={{
                transform: `translateY(-${target}em)`,
                ['--d' as string]: `${i * stagger}ms`,
              } as React.CSSProperties}
            >
              {Array.from({ length: 20 }, (_, k) => (
                <span key={k} className="block" style={{ height: '1em', lineHeight: 1 }}>
                  {k % 10}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </span>
  );
}
