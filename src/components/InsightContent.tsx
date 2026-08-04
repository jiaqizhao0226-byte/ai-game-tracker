/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link';
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
function renderInline(text: string, keyPrefix: string) {
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
          <Link
            key={`${keyPrefix}-g${i}`}
            href={`/game/${id}`}
            className="text-indigo-600 hover:text-indigo-800 underline decoration-indigo-300 underline-offset-2 hover:decoration-indigo-600 font-medium"
          >
            {name}
          </Link>
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

/** 「> 案例：#70 #94 #75」→ 一排可点的案例卡片 */
function CaseRow({ raw, keyPrefix }: { raw: string; keyPrefix: string }) {
  const ids = Array.from(raw.matchAll(/#(\d+)/g)).map(m => Number(m[1])).filter(id => GAME_NAME[id]);
  if (!ids.length) return null;
  const label = raw.replace(/^>\s*/, '').split(/[:：]/)[0].trim() || '案例';
  return (
    <div className="my-3 rounded-md bg-neutral-50 border border-neutral-200 px-3 py-2.5">
      <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">
        {ids.map(id => (
          <Link
            key={`${keyPrefix}-c${id}`}
            href={`/game/${id}`}
            className="inline-flex items-center gap-1.5 bg-white border border-neutral-300 hover:border-indigo-500 hover:bg-indigo-50 px-2.5 py-1 rounded text-xs text-neutral-700 hover:text-indigo-700 transition-colors"
          >
            <span className="font-mono text-[10px] text-neutral-400">#{id}</span>
            {GAME_NAME[id]}
          </Link>
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

function Body({ lines, kp }: { lines: string[]; kp: string }) {
  return (
    <>
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return <div key={`${kp}-s${i}`} className="h-1.5" />;
        if (t.startsWith('>')) return <CaseRow key={`${kp}-c${i}`} raw={t} keyPrefix={`${kp}-${i}`} />;
        if (t.startsWith('- ')) {
          return (
            <div key={`${kp}-l${i}`} className="flex gap-2 mb-1.5">
              <span className="text-indigo-400 shrink-0 mt-0.5">▪</span>
              <span className="flex-1">{renderInline(t.slice(2), `${kp}-${i}`)}</span>
            </div>
          );
        }
        return (
          <p key={`${kp}-p${i}`} className="mb-2.5">
            {renderInline(t, `${kp}-${i}`)}
          </p>
        );
      })}
    </>
  );
}

export default function InsightContent({ content }: { content: string }) {
  const blocks = parse(content);
  const structured = blocks.some(b => b.title);

  if (!structured) {
    return (
      <div className="text-[15px] text-neutral-700 leading-8">
        <Body lines={blocks.flatMap(b => b.lines)} kp="f" />
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
              <Body lines={b.lines} kp={`b${i}`} />
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
              <Body lines={b.lines} kp={`b${i}`} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
