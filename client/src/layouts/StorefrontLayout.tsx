import { Routes, Route } from "react-router-dom";
import TopBar from "../components/TopBar";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Home from "../pages/Home";
import Collections from "../pages/Collections";
import Collection from "../pages/Collection";
import ProductPage from "../pages/ProductPage";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import SearchResults from "../pages/SearchResults";
import Account from "../pages/Account";
import SizeGuide from "../pages/SizeGuide";
import OrderTracking from "../pages/OrderTracking";

export default function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-cream font-body">
      <TopBar />
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/new-in" element={<Collection />} />
          <Route path="/sale" element={<Collection />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/collections/:category" element={<Collection />} />
          <Route path="/products/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/account" element={<Account />} />
          <Route path="/size-guide" element={<SizeGuide />} />
          <Route path="/orders/:id" element={<OrderTracking />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
