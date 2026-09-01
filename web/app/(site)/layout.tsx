import { CartProvider } from "@/context/CartContext";
import { CartFxProvider } from "@/context/CartFxContext";
import { AuthProvider } from "@/context/AuthContext";
import TopBar from "@/components/TopBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FlyToCartOverlay from "@/components/FlyToCartOverlay";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <CartFxProvider>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <TopBar />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <FlyToCartOverlay />
        </AuthProvider>
      </CartFxProvider>
    </CartProvider>
  );
}
