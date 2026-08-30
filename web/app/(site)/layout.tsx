import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <TopBar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </AuthProvider>
    </CartProvider>
  );
}
