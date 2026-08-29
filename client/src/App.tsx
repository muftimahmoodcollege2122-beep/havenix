import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import StorefrontLayout from "./layouts/StorefrontLayout";
import AdminApp from "./admin/AdminApp";
import MockGateway from "./pages/MockGateway";

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
          <Route path="/payments/mock-gateway" element={<MockGateway />} />
          <Route path="/*" element={<StorefrontLayout />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
