
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("accessToken")
  );

  const [loading, setLoading] = useState(
    () => Boolean(localStorage.getItem("accessToken"))
  );

  // Xác minh phiên đăng nhập
  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");

        const currentUser = response.data.data;

        setUser(currentUser);
        localStorage.setItem("user", JSON.stringify(currentUser));
      } catch (error) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("user");

        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [token]);

  // Đăng nhập
  const login = (userData, accessToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("user", JSON.stringify(userData));

    setToken(accessToken);
    setUser(userData);
  };

  // Cập nhật thông tin người dùng trong Context
  const updateUser = (updatedUser) => {
    setUser((currentUser) => {
      const newUser = {
        ...currentUser,
        ...updatedUser,
      };

      localStorage.setItem("user", JSON.stringify(newUser));

      return newUser;
    });
  };

  // Đăng xuất
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth phải được sử dụng bên trong AuthProvider"
    );
  }

  return context;
};