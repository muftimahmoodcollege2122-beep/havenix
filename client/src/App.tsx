import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import StorefrontLayout from "./layouts/StorefrontLayout";
import AdminApp from "./admin/AdminApp";

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/*" element={<StorefrontLayout />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
