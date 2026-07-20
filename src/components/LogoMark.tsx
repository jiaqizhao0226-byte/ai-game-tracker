/**
 * 站点标记：三节点构成的稳定三角，连线弱化、主节点用靛蓝高亮。
 * 靛蓝 #4f46e5 与看板 AI Native 主色一致。
 */
export default function LogoMark({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="AI+游戏玩法 常态化监控"
    >
      <rect width="32" height="32" rx="5" fill="#171717" />
      <path
        d="M16 10.5 L10.2 20.5 M16 10.5 L21.8 20.5 M10.2 20.5 L21.8 20.5"
        stroke="#fff"
        strokeWidth="1.2"
        opacity="0.3"
      />
      <circle cx="16" cy="10.5" r="3.3" fill="#fff" />
      <circle cx="10.2" cy="20.5" r="3.3" fill="#fff" opacity="0.55" />
      <circle cx="21.8" cy="20.5" r="3.3" fill="#4f46e5" />
    </svg>
  );
}
