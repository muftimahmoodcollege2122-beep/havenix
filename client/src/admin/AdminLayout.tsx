import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { LayoutGrid, LogOut, ExternalLink } from "lucide-react";
import { getAdminKey, clearAdminKey } from "./adminApi";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  if (!getAdminKey()) {
    navigate("/admin/login");
    return null;
  }

  const logout = () => {
    clearAdminKey();
    navigate("/admin/login");
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-paper">
      <aside className="w-full lg:w-56 shrink-0 bg-ink text-cream flex flex-col">
        <div className="px-4 sm:px-6 py-4 sm:py-6 border-b border-cream/10 flex items-center justify-between lg:block">
          <div>
            <div className="font-serif text-[16px] sm:text-[18px] tracking-[0.15em]">HAVENIX</div>
            <div className="text-[10px] tracking-[0.3em] text-clay mt-1">ADMIN</div>
          </div>
          <div className="flex items-center gap-3 lg:hidden">
            <a href="/" target="_blank" rel="noreferrer" className="text-cream/70 hover:text-cream" aria-label="View Store">
              <ExternalLink size={18} />
            </a>
            <button onClick={logout} className="text-cream/70 hover:text-cream" aria-label="Log Out">
              <LogOut size={18} />
            </button>
          </div>
        </div>
        <nav className="flex lg:flex-col gap-1 px-3 py-2 lg:py-4 overflow-x-auto lg:overflow-visible">
          <Link
            to="/admin/products"
            className={`shrink-0 flex items-center gap-3 px-3 py-2.5 text-[13px] tracking-wide rounded-sm transition-colors whitespace-nowrap ${
              isActive("/admin/products") ? "bg-cream/10 text-cream" : "text-cream/70 hover:bg-cream/5"
            }`}
          >
            <LayoutGrid size={16} />
            Products & Stock
          </Link>
        </nav>
        <div className="hidden lg:flex flex-col px-3 py-4 border-t border-cream/10 gap-1 mt-auto">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-cream/70 hover:bg-cream/5 rounded-sm transition-colors"
          >
            <ExternalLink size={16} />
            View Store
          </a>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-cream/70 hover:bg-cream/5 rounded-sm transition-colors text-left"
          >
            <LogOut size={16} />
            Log Out
          </button>
        </div>
      </aside>
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
