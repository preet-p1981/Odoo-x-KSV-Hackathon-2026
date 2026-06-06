import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../lib/axios';

const AuthContext = createContext(null);

const safeDecode = (token) => {
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(token ? safeDecode(token) : null);
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data?.data || safeDecode(token));
      } catch {
        setUser(safeDecode(token));
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, [token]);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login: (nextToken) => {
        localStorage.setItem('token', nextToken);
        setToken(nextToken);
        setUser(safeDecode(nextToken));
      },
      logout: () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      },
      isRole: (role) => user?.role === role,
      hasAnyRole: (roles = []) => roles.includes(user?.role),
    }),
    [loading, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// src/context/AuthContext.jsx

import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

/**
 * AUTH CONTEXT
 * - handles login, logout, register
 * - supports API + fallback mock mode
 * - persists session in localStorage
 */

const AuthContext = createContext();

// Base API (change as per backend)
const API = "http://localhost:8080/api/auth";

// MOCK USER (fallback when backend fails)
const mockUser = {
  id: "mock_001",
  name: "Hackathon User",
  email: "demo@hackathon.com",
  role: "ADMIN",
  token: "mock_token_123456",
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  /**
   * INIT AUTH FROM STORAGE
   */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  /**
   * LOGIN FUNCTION
   */
  const login = async (email, password) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API}/login`, {
        email,
        password,
      });

      const data = res.data;

      const loggedUser = {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        token: data.token,
      };

      setUser(loggedUser);
      localStorage.setItem("user", JSON.stringify(loggedUser));
      localStorage.setItem("token", data.token);

      setIsOfflineMode(false);
      setLoading(false);

      return loggedUser;
    } catch (err) {
      console.log("API failed → switching to MOCK login");

      // fallback mock login
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      localStorage.setItem("token", mockUser.token);

      setIsOfflineMode(true);
      setLoading(false);

      return mockUser;
    }
  };

  /**
   * REGISTER FUNCTION
   */
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post(`${API}/register`, userData);

      setLoading(false);
      return res.data;
    } catch (err) {
      console.log("Register failed → mock response");

      const fakeResponse = {
        message: "User registered successfully (MOCK)",
        user: {
          id: Date.now(),
          ...userData,
        },
      };

      setLoading(false);
      setIsOfflineMode(true);

      return fakeResponse;
    }
  };

  /**
   * LOGOUT
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  /**
   * CHECK AUTH
   */
  const isAuthenticated = !!user;

  /**
   * GET TOKEN
   */
  const getToken = () => {
    return localStorage.getItem("token");
  };

  /**
   * AUTH HEADER HELPER
   */
  const authHeader = () => {
    const token = getToken();
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    };
  };

  /**
   * GLOBAL ERROR RESET
   */
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated,
        getToken,
        authHeader,
        clearError,
        isOfflineMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * CUSTOM HOOK
 */
export const useAuth = () => {
  return useContext(AuthContext);
};
