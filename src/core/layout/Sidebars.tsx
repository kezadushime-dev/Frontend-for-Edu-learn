import { Link } from 'react-router-dom';

type SidebarLink = {
  label: string;
  to?: string;
  active?: boolean;
};

type SidebarProps = {
  title: string;
  links: SidebarLink[];
};

export function Sidebar({ title, links }: SidebarProps) {
  return (
    <aside className="h-fit rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_14px_30px_-20px_rgba(15,23,42,0.5)] lg:sticky lg:top-24">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600">{title}</p>
      <nav className="mt-3 grid gap-1.5 text-sm">
        {links.map((link) => {
          const baseClass = 'flex items-center justify-between rounded-xl px-3 py-2.5 font-medium transition-colors';
          const className = link.active
            ? `${baseClass} bg-blue-600 text-white shadow-sm`
            : `${baseClass} text-slate-600 hover:bg-slate-100 hover:text-slate-900`;

          if (!link.to) {
            return (
              <span key={link.label} className={className}>
                <span>{link.label}</span>
                {link.active ? <span className="h-2 w-2 rounded-full bg-white/90" /> : null}
              </span>
            );
          }

          return (
            <Link key={link.label} to={link.to} className={className}>
              <span>{link.label}</span>
              {link.active ? <span className="h-2 w-2 rounded-full bg-white/90" /> : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
