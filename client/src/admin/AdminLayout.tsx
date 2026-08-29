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
    <div className="min-h-screen flex bg-paper">
      <aside className="w-56 shrink-0 bg-ink text-cream flex flex-col">
        <div className="px-6 py-6 border-b border-cream/10">
          <div className="font-serif text-[18px] tracking-[0.15em]">HAVENIX</div>
          <div className="text-[10px] tracking-[0.3em] text-clay mt-1">ADMIN</div>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
          <Link
            to="/admin/products"
            className={`flex items-center gap-3 px-3 py-2.5 text-[13px] tracking-wide rounded-sm transition-colors ${
              isActive("/admin/products") ? "bg-cream/10 text-cream" : "text-cream/70 hover:bg-cream/5"
            }`}
          >
            <LayoutGrid size={16} />
            Products & Stock
          </Link>
        </nav>
        <div className="px-3 py-4 border-t border-cream/10 flex flex-col gap-1">
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
