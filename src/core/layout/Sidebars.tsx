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
