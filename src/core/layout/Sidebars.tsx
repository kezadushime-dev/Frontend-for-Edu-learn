import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

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
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false);
      }
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, [mobileOpen]);

  const renderLinks = (onItemClick?: () => void) => (
    <nav className="grid gap-2 text-sm">
      {links.map((link) => {
        const className = link.active
          ? 'px-4 py-3 rounded-md bg-primary text-white'
          : 'px-4 py-3 rounded-md hover:bg-blue-50';
        if (!link.to) {
          return (
            <span key={link.label} className={className}>
              {link.label}
            </span>
          );
        }
        return (
          <Link
            key={link.label}
            to={link.to}
            onClick={onItemClick}
            className={className}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <aside className="h-fit animate-slideInLeft">
      <button
        onClick={() => setMobileOpen((prev) => !prev)}
        className="lg:hidden w-full mb-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-primary shadow-sm"
        aria-expanded={mobileOpen}
        aria-label={`${mobileOpen ? 'Hide' : 'Show'} ${title} menu`}
      >
        {mobileOpen ? `Hide ${title} Menu` : `Show ${title} Menu`}
      </button>

      <div className="hidden lg:block">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">{title}</p>
          {renderLinks()}
        </div>
      </div>

      {mobileOpen ? (
        <div className="lg:hidden">
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar menu"
          />
          <div className="fixed top-[112px] left-4 right-4 z-50 rounded-xl bg-white p-5 shadow-2xl border border-gray-200 transition-all duration-300 ease-out animate-slideInLeft">
            <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">{title}</p>
            {renderLinks(() => setMobileOpen(false))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
