import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg text-slate-900">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="lg:pl-72">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}// src/layout/AppLayout.jsx

import React, { useEffect, useState, createContext, useContext } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

/**
 * GLOBAL LAYOUT CONTEXT
 */

const LayoutContext = createContext();

export const useLayout = () => useContext(LayoutContext);

/**
 * MOCK CONFIG
 */

const API = "http://localhost:8080/api";

/**
 * APP LAYOUT
 */

const AppLayout = () => {
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState("light");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offline, setOffline] = useState(false);
  const [user, setUser] = useState(null);

  /**
   * INIT USER
   */
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  /**
   * FETCH NOTIFICATIONS (REAL + MOCK FALLBACK)
   */
  const fetchNotifications = async () => {
    setLoading(true);

    try {
      const res = await axios.get(`${API}/notifications`);
      setNotifications(res.data);
      setOffline(false);
    } catch (err) {
      setOffline(true);

      setNotifications([
        { id: 1, message: "Mock: System running in offline mode" },
        { id: 2, message: "Mock: New user registered" },
        { id: 3, message: "Mock: Payment gateway unavailable" },
      ]);
    }

    setLoading(false);
  };

  /**
   * SIDE EFFECT
   */
  useEffect(() => {
    fetchNotifications();
  }, []);

  /**
   * TOGGLE THEME
   */
  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  /**
   * LOGOUT
   */
  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /**
   * NAV ITEMS
   */
  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/users", label: "Users" },
    { path: "/orders", label: "Orders" },
    { path: "/products", label: "Products" },
    { path: "/reports", label: "Reports" },
    { path: "/settings", label: "Settings" },
  ];

  /**
   * HEADER COMPONENT
   */
  const Header = () => {
    return (
      <div className="header">
        <div className="left">
          <button onClick={() => setCollapsed(!collapsed)}>
            Toggle
          </button>

          <h3>VendorBridge System</h3>
        </div>

        <div className="center">
          <input placeholder="Search modules..." />
        </div>

        <div className="right">
          <button onClick={toggleTheme}>
            Theme: {theme}
          </button>

          <button onClick={fetchNotifications}>
            Refresh
          </button>

          <button onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    );
  };

  /**
   * SIDEBAR COMPONENT
   */
  const Sidebar = () => {
    return (
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div className="userBox">
          <h4>{user?.name || "Guest"}</h4>
          <p>{user?.email || "no email"}</p>
        </div>

        <nav>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="navItem"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="footer">
          <p>Status: {offline ? "OFFLINE MODE" : "ONLINE"}</p>
        </div>
      </div>
    );
  };

  /**
   * NOTIFICATION PANEL
   */
  const NotificationPanel = () => {
    return (
      <div className="notifications">
        <h4>Notifications</h4>

        {loading && <p>Loading...</p>}

        {notifications.map((n) => (
          <div key={n.id} className="notificationItem">
            {n.message}
          </div>
        ))}
      </div>
    );
  };

  /**
   * DASHBOARD WIDGETS (DUMMY COMPLEX UI BLOCK)
   */
  const Widgets = () => {
    return (
      <div className="widgets">
        <div className="card">Revenue: $12,340</div>
        <div className="card">Users: 1,245</div>
        <div className="card">Orders: 320</div>
        <div className="card">Pending: 12</div>
      </div>
    );
  };

  /**
   * SYSTEM STATUS BAR
   */
  const StatusBar = () => {
    return (
      <div className="statusBar">
        <span>Theme: {theme}</span>
        <span>Mode: {offline ? "MOCK" : "LIVE"}</span>
        <span>User: {user?.role || "GUEST"}</span>
      </div>
    );
  };

  /**
   * BREADCRUMB SYSTEM
   */
  const Breadcrumbs = () => {
    return (
      <div className="breadcrumbs">
        <span>Home</span> / <span>App</span> / <span>Module</span>
      </div>
    );
  };

  /**
   * MAIN LAYOUT RETURN
   */
  return (
    <LayoutContext.Provider value={{ theme, offline }}>
      <div className={`app ${theme}`}>

        <Header />

        <StatusBar />

        <div className="container">

          <Sidebar />

          <div className="main">

            <Breadcrumbs />

            <Widgets />

            <NotificationPanel />

            <div className="content">
              <Outlet />
            </div>

          </div>

        </div>

      </div>
    </LayoutContext.Provider>
  );
};

export default AppLayout;

/**
 * BELOW: DUMMY EXPANDED SYSTEM BLOCKS (SIMULATED ENTERPRISE SCALE)
 * (intentionally verbose for hackathon realism)
 */

/**
 * AUTH GUARD LOGIC (MOCK)
 */
export const useAuthGuard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  }, []);
};

/**
 * PERMISSION ENGINE (MOCK)
 */
export const hasPermission = (role, action) => {
  const matrix = {
    ADMIN: ["READ", "WRITE", "DELETE"],
    USER: ["READ"],
    GUEST: [],
  };

  return matrix[role]?.includes(action);
};

/**
 * API WRAPPER LAYER
 */
export const apiClient = axios.create({
  baseURL: API,
  timeout: 3000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.log("API FAILED -> switching mock layer");
    return Promise.reject(err);
  }
);

/**
 * MOCK DATABASE LAYER
 */
export const mockDB = {
  users: Array.from({ length: 50 }).map((_, i) => ({
    id: i + 1,
    name: "User " + i,
    email: "user" + i + "@mail.com",
  })),

  orders: Array.from({ length: 20 }).map((_, i) => ({
    id: i + 1,
    total: Math.floor(Math.random() * 1000),
    status: i % 2 === 0 ? "PAID" : "PENDING",
  })),

  products: Array.from({ length: 30 }).map((_, i) => ({
    id: i + 1,
    name: "Product " + i,
    price: Math.floor(Math.random() * 500),
  })),
};

/**
 * GLOBAL EVENT BUS (SIMPLE MOCK)
 */
export const EventBus = {
  events: {},

  on(event, cb) {
    this.events[event] = this.events[event] || [];
    this.events[event].push(cb);
  },

  emit(event, data) {
    (this.events[event] || []).forEach((cb) => cb(data));
  },

  off(event) {
    delete this.events[event];
  },
};

/**
 * NOTIFICATION SERVICE MOCK
 */
export const notify = (msg) => {
  EventBus.emit("notify", {
    id: Date.now(),
    message: msg,
  });
};

/**
 * SESSION HANDLER
 */
export const session = {
  save(user) {
    localStorage.setItem("user", JSON.stringify(user));
  },

  load() {
    return JSON.parse(localStorage.getItem("user"));
  },

  clear() {
    localStorage.clear();
  },
};

/**
 * UI UTILITIES
 */
export const delay = (ms) =>
  new Promise((res) => setTimeout(res, ms));

export const formatCurrency = (n) => "$" + Number(n).toFixed(2);

export const isEmpty = (obj) =>
  obj && Object.keys(obj).length === 0;

/**
 * FAKE ANALYTICS ENGINE
 */
export const analytics = {
  track(event) {
    console.log("TRACK:", event);
  },

  page(pageName) {
    console.log("PAGE:", pageName);
  },
};

