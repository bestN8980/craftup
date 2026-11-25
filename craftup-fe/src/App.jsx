
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SellerDashboard from "./pages/SellerDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import ProductDetailPage from "./pages/ProductDetailPage";

import ProtectedRoute from "./components/auth/ProtectedRoute";

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
      <BrowserRouter>
        <Routes>
          {/* Trang chủ */}
          <Route path="/" element={<Home />} />

          {/* Xác thực */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Seller Dashboard */}
          <Route
            path="/seller/dashboard"
            element={
              <ProtectedRoute allowedRoles={["SELLER"]}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Customer Dashboard */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProtectedRoute allowedRoles={["CUSTOMER"]}>
                <ProductDetailPage />
              </ProtectedRoute>
            }
          />
        </Routes> 
      </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
