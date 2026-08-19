/**
 * 产品介绍渲染：把 product_intro 按「**小标题**」切成独立段落块，
 * 让八段骨架（一句话定位 / 核心玩法机制 / 数据表现 / …）在视觉上真正分开，
 * 而不是逐行渲染糊成一团。
 *
 * 兼容薄案例：正文没有任何小标题时，退化为普通散文渲染。
 */

type Block = { title: string | null; suffix: string; lines: string[] };

const BASE_PATH = process.env.NODE_ENV === 'production' ? '/ai-game-tracker' : '';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * 行内富文本：**加粗** 与 [文字](链接)。
 *
 * 正文走 dangerouslySetInnerHTML，故 href 必须白名单——只放行站内绝对路径与
 * http(s)，挡掉 javascript:/data: 一类；链接文字与地址都要转义后再拼进 HTML。
 * 站外链接开新标签并带 noopener。
 */
const inline = (s: string) =>
  s
    .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (whole, text: string, href: string) => {
      const external = /^https?:\/\//i.test(href);
      if (!external && !href.startsWith('/')) return whole; // 认不出的协议原样留着，不生成链接
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
      const resolvedHref = external ? href : `${BASE_PATH}${href}`;
      return `<a href="${esc(resolvedHref)}"${attrs} class="text-indigo-600 hover:text-indigo-800 underline decoration-indigo-300 underline-offset-2 hover:decoration-indigo-600">${esc(text)}</a>`;
    })
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-neutral-900">$1</strong>');

function parse(intro: string): Block[] {
  const blocks: Block[] = [];
  let cur: Block = { title: null, suffix: '', lines: [] };
  for (const raw of intro.split('\n')) {
    const line = raw.trimEnd();
    // 整行以 **标题** 开头 = 段落小标题，后面可带补充说明，如 **核心玩法机制**(AI介入:核心驱动)
    const m = line.trim().match(/^\*\*(.+?)\*\*\s*(.*)$/);
    if (m && m[1].length <= 20) {
      if (cur.title !== null || cur.lines.some(l => l.trim())) blocks.push(cur);
      cur = { title: m[1], suffix: m[2].trim(), lines: [] };
    } else {
      cur.lines.push(line);
    }
  }
  if (cur.title !== null || cur.lines.some(l => l.trim())) blocks.push(cur);
  return blocks;
}

function Body({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={i} className="h-2" />;
        if (/^\s{2,}-\s/.test(line)) {
          return (
            <div key={i} className="flex gap-2 mb-1 ml-4">
              <span className="text-neutral-300 shrink-0">◦</span>
              <span className="flex-1 text-neutral-600" dangerouslySetInnerHTML={{ __html: inline(t.slice(2)) }} />
            </div>
          );
        }
        if (t.startsWith('- ')) {
          return (
            <div key={i} className="flex gap-2 mb-1.5">
              <span className="text-indigo-400 shrink-0 mt-0.5">▪</span>
              <span className="flex-1" dangerouslySetInnerHTML={{ __html: inline(t.slice(2)) }} />
            </div>
          );
        }
        return <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: inline(t) }} />;
      })}
    </>
  );
}

export default function ProductIntro({ intro }: { intro: string }) {
  const blocks = parse(intro);
  const structured = blocks.some(b => b.title);

  // 薄案例：没有小标题，按散文渲染
  if (!structured) {
    return (
      <div className="text-sm text-neutral-700 leading-7">
        <Body lines={blocks.flatMap(b => b.lines)} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {blocks.map((b, i) => (
        <section key={i}>
          {b.title && (
            <div className="flex items-baseline gap-2 mb-2 flex-wrap">
              <h4 className="text-xs font-bold text-neutral-900 bg-neutral-100 border-l-2 border-indigo-600 px-2.5 py-1 tracking-wide">
                {b.title}
              </h4>
              {b.suffix && (
                <span className="text-[10px] font-mono text-neutral-400">{b.suffix}</span>
              )}
            </div>
          )}
          <div className="text-sm text-neutral-700 leading-7 pl-3">
            <Body lines={b.lines} />
          </div>
        </section>
      ))}
    </div>
  );
}
