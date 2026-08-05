/* eslint-disable @typescript-eslint/no-explicit-any */
import TrackedLink from './TrackedLink';
import data from '../data.json';

/**
 * 洞察正文渲染。
 *
 * 相比 ProductIntro 多做两件事：
 * 1. 「#编号」自动渲染成指向产品详情页的链接并补上产品名——洞察是靠案例支撑的，
 *    读者必须能一键跳到那个产品去核对，否则编号只是噪音。
 * 2. 「> 案例：#a #b #c」整行渲染成案例卡片组，让论点与其证据在视觉上分层。
 *
 * 用 React 元素而不是 dangerouslySetInnerHTML，是因为链接要走 next/link 才能带上 basePath。
 */

type Block = { title: string | null; lines: string[] };

const GAME_NAME: Record<number, string> = Object.fromEntries(
  (data.games as any[]).map(g => [g.id, g.product_name]),
);

/** 把一行文本切成：普通文本 / **加粗** / #编号链接 */
function renderInline(text: string, keyPrefix: string, nav?: { from: string; fromLabel: string }) {
  const out: React.ReactNode[] = [];
  // 同时匹配 **粗体** 与 #数字
  const re = /\*\*(.+?)\*\*|#(\d+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) {
      out.push(
        <strong key={`${keyPrefix}-b${i}`} className="font-semibold text-neutral-900">
          {m[1]}
        </strong>,
      );
    } else {
      const id = Number(m[2]);
      const name = GAME_NAME[id];
      out.push(
        name ? (
          <TrackedLink
            key={`${keyPrefix}-g${i}`}
            href={`/game/${id}`}
            from={nav?.from ?? '/'}
            fromLabel={nav?.fromLabel ?? '看板'}
            className="text-indigo-600 hover:text-indigo-800 underline decoration-indigo-300 underline-offset-2 hover:decoration-indigo-600 font-medium"
          >
            {name}
          </TrackedLink>
        ) : (
          <span key={`${keyPrefix}-g${i}`}>#{id}</span>
        ),
      );
    }
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/**
 * 条形图块。正文里写：
 *   ::bar 图表标题
 *   标签|数值
 *   ...
 *   ::
 * 纯 CSS 横向条形——中文标签横排更好读，也省掉一个图表库依赖。
 */
function BarChart({ title, rows, vertical }: { title: string; rows: Array<[string, number]>; vertical?: boolean }) {
  const max = Math.max(...rows.map(r => r[1]), 1);
  const total = rows.reduce((s, r) => s + r[1], 0);

  // ::bar! → 竖向柱状，项数少时比横向条形省一半纵向空间
  if (vertical) {
    return (
      <figure className="my-4 rounded-lg border border-neutral-200 bg-neutral-50/60 px-4 pt-4 pb-3">
        {title && (
          <figcaption className="text-xs font-bold text-neutral-700 mb-2.5 flex items-baseline gap-2">
            {title}
            <span className="font-mono text-[10px] font-normal text-neutral-400">n={total}</span>
          </figcaption>
        )}
        {/* 数值另起一行、柱子只占固定高的容器——否则数值会挤压柱区，
            让 13 与 12 这种小差异被压成同高 */}
        <div className="flex items-end gap-2">
          {rows.map(([label, v], i) => (
            <div key={i} className="flex-1 flex flex-col items-center min-w-0">
              <span className="font-mono text-[11px] text-neutral-500 mb-1 tabular-nums">{v}</span>
              <div className="w-full h-[68px] flex items-end">
                <div
                  className="w-full bg-indigo-500 rounded-t-sm"
                  style={{ height: `${Math.max((v / max) * 100, 4)}%` }}
                  title={`${label}：${v}（${((v / total) * 100).toFixed(1)}%）`}
                />
              </div>
              <span
                className="mt-1.5 text-center text-[10px] text-neutral-600 leading-none whitespace-nowrap overflow-hidden text-ellipsis w-full"
                title={label}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </figure>
    );
  }

  return (
    <figure className="my-4 rounded-lg border border-neutral-200 bg-neutral-50/60 px-4 py-3.5 leading-normal">
      {title && (
        <figcaption className="text-xs font-bold text-neutral-700 mb-2.5 flex items-baseline gap-2 leading-snug">
          {title}
          <span className="font-mono text-[10px] font-normal text-neutral-400">n={total}</span>
        </figcaption>
      )}
      <div className="space-y-1">
        {rows.map(([label, v], i) => (
          <div key={i} className="flex items-center gap-2 text-[13px] leading-none">
            <span className="w-[74px] sm:w-[112px] shrink-0 text-right text-neutral-600 leading-tight whitespace-nowrap overflow-hidden text-ellipsis text-[11px] sm:text-[13px]" title={label}>{label}</span>
            <div className="flex-1 h-[18px] bg-neutral-200/50 rounded-sm overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-sm"
                style={{ width: `${Math.max((v / max) * 100, 2)}%` }}
              />
            </div>
            <span className="w-[34px] sm:w-[74px] shrink-0 font-mono text-[11px] text-neutral-500 tabular-nums whitespace-nowrap text-right">
              {v}<span className="hidden sm:inline"> · {((v / total) * 100).toFixed(1)}%</span>
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
}

/** 「> 案例：#70 #94 #75」→ 一排可点的案例卡片 */
function CaseRow({ raw, keyPrefix, nav }: { raw: string; keyPrefix: string; nav: { from: string; fromLabel: string } }) {
  const ids = Array.from(raw.matchAll(/#(\d+)/g)).map(m => Number(m[1])).filter(id => GAME_NAME[id]);
  if (!ids.length) return null;
  const label = raw.replace(/^>\s*/, '').split(/[:：]/)[0].trim() || '案例';
  return (
    <div className="my-3 rounded-md bg-neutral-50 border border-neutral-200 px-3 py-2.5">
      <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {ids.map(id => (
          <TrackedLink
            key={`${keyPrefix}-c${id}`}
            href={`/game/${id}`}
            from={nav.from}
            fromLabel={nav.fromLabel}
            className="inline-flex items-center gap-1.5 bg-white border border-neutral-300 hover:border-indigo-500 hover:bg-indigo-50 px-2.5 py-1 rounded text-xs text-neutral-700 hover:text-indigo-700 transition-colors"
          >
            <span className="font-mono text-[10px] text-neutral-400">#{id}</span>
            {GAME_NAME[id]}
          </TrackedLink>
        ))}
      </div>
    </div>
  );
}

function parse(content: string): Block[] {
  const blocks: Block[] = [];
  let cur: Block = { title: null, lines: [] };
  for (const raw of content.split('\n')) {
    const line = raw.trimEnd();
    // 整行形如「## 小标题」= 段落标题
    const m = line.trim().match(/^##\s+(.+)$/);
    if (m) {
      if (cur.title !== null || cur.lines.some(l => l.trim())) blocks.push(cur);
      cur = { title: m[1], lines: [] };
    } else {
      cur.lines.push(line);
    }
  }
  if (cur.title !== null || cur.lines.some(l => l.trim())) blocks.push(cur);
  return blocks;
}

function Body({ lines, kp, nav }: { lines: string[]; kp: string; nav: { from: string; fromLabel: string } }) {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();

    // ::bar 标题 … :: → 条形图，整块一次消费掉
    const bar = t.match(/^::bar(!?)\s*(.*)$/);
    if (bar) {
      const rows: Array<[string, number]> = [];
      let j = i + 1;
      for (; j < lines.length && lines[j].trim() !== '::'; j++) {
        const m = lines[j].trim().match(/^(.+?)\|\s*(-?\d+(?:\.\d+)?)\s*$/);
        if (m) rows.push([m[1].trim(), Number(m[2])]);
      }
      if (rows.length) out.push(<BarChart key={`${kp}-bar${i}`} title={bar[2].trim()} rows={rows} vertical={bar[1] === '!'} />);
      i = j; // 跳过收尾的 ::
      continue;
    }

    if (!t) { out.push(<div key={`${kp}-s${i}`} className="h-1.5" />); continue; }
    if (t.startsWith('>')) { out.push(<CaseRow key={`${kp}-c${i}`} raw={t} keyPrefix={`${kp}-${i}`} nav={nav} />); continue; }
    if (t.startsWith('- ')) {
      out.push(
        <div key={`${kp}-l${i}`} className="flex gap-2 mb-1.5">
          <span className="text-indigo-400 shrink-0 mt-0.5">▪</span>
          <span className="flex-1">{renderInline(t.slice(2), `${kp}-${i}`, nav)}</span>
        </div>,
      );
      continue;
    }
    out.push(
      <p key={`${kp}-p${i}`} className="mb-2.5">
        {renderInline(t, `${kp}-${i}`, nav)}
      </p>,
    );
  }
  return <>{out}</>;
}

export default function InsightContent({ content, insightId, insightTitle }: { content: string; insightId: number; insightTitle: string }) {
  const from = `/insight/${insightId}`;
  const fromLabel = insightTitle.length > 12 ? insightTitle.slice(0, 12) + '…' : insightTitle;
  const blocks = parse(content);
  const structured = blocks.some(b => b.title);

  if (!structured) {
    return (
      <div className="text-[15px] text-neutral-700 leading-8">
        <Body lines={blocks.flatMap(b => b.lines)} kp="f" nav={{ from, fromLabel }} />
      </div>
    );
  }

  // 有标题的段落各自成卡片，并抽出「一、」这类前缀做序号徽章——
  // 洞察通常是几条并列的判断，仅靠间距区分会糊成一片长文
  let seq = 0;
  return (
    <div className="space-y-5">
      {blocks.map((b, i) => {
        if (!b.title) {
          return (
            <div key={i} className="text-[15px] text-neutral-700 leading-8">
              <Body lines={b.lines} kp={`b${i}`} nav={{ from, fromLabel }} />
            </div>
          );
        }
        seq += 1;
        // 「一、展区构成与整体判断」→ 徽章「一」+ 标题「展区构成与整体判断」
        const m = b.title.match(/^([一二三四五六七八九十]+|\d+)[、.．]\s*(.+)$/);
        const badge = m ? m[1] : String(seq);
        const heading = m ? m[2] : b.title;
        return (
          <section
            key={i}
            className="bg-white border border-neutral-200 rounded-lg overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
          >
            <div className="flex items-center gap-3 bg-neutral-50 border-b border-neutral-200 px-4 py-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                {badge}
              </span>
              <h3 className="text-base font-bold text-neutral-900 leading-snug">{heading}</h3>
            </div>
            <div className="px-4 py-4 text-[15px] text-neutral-700 leading-8">
              <Body lines={b.lines} kp={`b${i}`} nav={{ from, fromLabel }} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
