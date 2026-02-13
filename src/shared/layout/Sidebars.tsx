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
    <aside className="bg-white rounded-xl shadow-lg p-6 h-fit animate-slideInLeft">
      <p className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">{title}</p>
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
            <Link key={link.label} to={link.to} className={className}>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}