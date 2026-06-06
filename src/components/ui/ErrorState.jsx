// src/layout/AppLayout.jsx

import React, {
  useEffect,
  useState,
  useReducer,
  useCallback,
  useMemo,
  createContext,
  useContext
} from "react";

import { Outlet, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

/* =========================================================
   CONTEXT SYSTEM
========================================================= */

const LayoutContext = createContext();
export const useLayout = () => useContext(LayoutContext);

/* =========================================================
   API LAYER
========================================================= */

const API = "http://localhost:8080/api";

const apiClient = axios.create({
  baseURL: API,
  timeout: 2500
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/* =========================================================
   REDUX-LIKE STATE MACHINE
========================================================= */

const initialState = {
  theme: "light",
  sidebar: true,
  offline: false,
  loading: false,
  notifications: [],
  logs: [],
  errors: [],
  metrics: {},
  socketConnected: false,
  cacheHydrated: false
};

function reducer(state, action) {
  switch (action.type) {

    case "THEME_TOGGLE":
      return { ...state, theme: state.theme === "light" ? "dark" : "light" };

    case "SIDEBAR":
      return { ...state, sidebar: !state.sidebar };

    case "LOADING":
      return { ...state, loading: action.payload };

    case "OFFLINE":
      return { ...state, offline: action.payload };

    case "NOTIFICATIONS":
      return { ...state, notifications: action.payload };

    case "LOG":
      return { ...state, logs: [...state.logs, action.payload] };

    case "ERROR":
      return { ...state, errors: [...state.errors, action.payload] };

    case "METRICS":
      return { ...state, metrics: action.payload };

    case "SOCKET":
      return { ...state, socketConnected: action.payload };

    case "CACHE":
      return { ...state, cacheHydrated: action.payload };

    default:
      return state;
  }
}

/* =========================================================
   MOCK DATABASE (FAKE ENTERPRISE SCALE)
========================================================= */

const mockUsers = Array.from({ length: 200 }).map((_, i) => ({
  id: i,
  name: "User_" + i,
  email: `user${i}@mail.com`,
  role: i % 4 === 0 ? "ADMIN" : "USER",
  status: i % 2 === 0 ? "ACTIVE" : "INACTIVE"
}));

const mockOrders = Array.from({ length: 150 }).map((_, i) => ({
  id: i,
  amount: Math.floor(Math.random() * 10000),
  status: i % 3 === 0 ? "PAID" : "PENDING",
  createdAt: Date.now() - i * 50000
}));

const mockProducts = Array.from({ length: 300 }).map((_, i) => ({
  id: i,
  name: "Product_" + i,
  price: Math.floor(Math.random() * 1000),
  stock: Math.floor(Math.random() * 100),
  category: i % 2 === 0 ? "A" : "B"
}));

const mockNotifications = Array.from({ length: 100 }).map((_, i) => ({
  id: i,
  message: "System event " + i,
  level: i % 2 === 0 ? "INFO" : "WARN"
}));

/* =========================================================
   EVENT BUS SYSTEM
========================================================= */

const EventBus = {
  events: {},

  on(event, cb) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(cb);
  },

  emit(event, data) {
    (this.events[event] || []).forEach((cb) => cb(data));
  },

  clear(event) {
    delete this.events[event];
  }
};

/* =========================================================
   CACHE SYSTEM
========================================================= */

const cache = {
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  get(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  }
};

/* =========================================================
   SOCKET MOCK
========================================================= */

const socket = {
  connect() {
    console.log("socket connected");
  },

  disconnect() {
    console.log("socket disconnected");
  },

  emit(e, d) {
    console.log("emit", e, d);
  }
};

/* =========================================================
   APP LAYOUT
========================================================= */

export default function AppLayout() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [user, setUser] = useState(null);

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));

    dispatch({ type: "CACHE", payload: true });
  }, []);

  /* ---------------- FETCH LAYERS ---------------- */

  const fetchNotifications = async () => {
    dispatch({ type: "LOADING", payload: true });

    try {
      const res = await apiClient.get("/notifications");
      dispatch({ type: "NOTIFICATIONS", payload: res.data });
      dispatch({ type: "OFFLINE", payload: false });
    } catch {
      dispatch({ type: "OFFLINE", payload: true });
      dispatch({ type: "NOTIFICATIONS", payload: mockNotifications });
    }

    dispatch({ type: "LOADING", payload: false });
  };

  const fetchMetrics = async () => {
    try {
      const res = await apiClient.get("/metrics");
      dispatch({ type: "METRICS", payload: res.data });
    } catch {
      dispatch({
        type: "METRICS",
        payload: {
          users: mockUsers.length,
          orders: mockOrders.length,
          products: mockProducts.length,
          revenue: 999999
        }
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get("/users");
      cache.set("users", res.data);
    } catch {
      cache.set("users", mockUsers);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await apiClient.get("/orders");
      cache.set("orders", res.data);
    } catch {
      cache.set("orders", mockOrders);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await apiClient.get("/products");
      cache.set("products", res.data);
    } catch {
      cache.set("products", mockProducts);
    }
  };

  /* ---------------- INIT LOAD ---------------- */

  useEffect(() => {
    fetchNotifications();
    fetchMetrics();
    fetchUsers();
    fetchOrders();
    fetchProducts();
  }, []);

  /* ---------------- ACTIONS ---------------- */

  const toggleTheme = () => dispatch({ type: "THEME_TOGGLE" });
  const toggleSidebar = () => dispatch({ type: "SIDEBAR" });

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /* ---------------- NAV ---------------- */

  const navItems = useMemo(
    () => [
      "dashboard",
      "users",
      "orders",
      "products",
      "analytics",
      "settings",
      "logs",
      "billing",
      "support",
      "audit"
    ],
    []
  );

  /* ---------------- HEADER ---------------- */

  const Header = () => (
    <div className="header">
      <button onClick={toggleSidebar}>TOGGLE</button>
      <h3>ENTERPRISE CONTROL PANEL</h3>
      <button onClick={toggleTheme}>{state.theme}</button>
      <button onClick={logout}>LOGOUT</button>
    </div>
  );

  /* ---------------- SIDEBAR ---------------- */

  const Sidebar = () => (
    <div className={`sidebar ${state.sidebar ? "open" : "closed"}`}>
      <h4>{user?.name}</h4>

      {navItems.map((n, i) => (
        <NavLink key={i} to={`/${n}`}>
          {n.toUpperCase()}
        </NavLink>
      ))}

      <p>{state.offline ? "MOCK MODE" : "LIVE MODE"}</p>
    </div>
  );

  /* ---------------- WIDGET SYSTEM ---------------- */

  const WidgetA = () => <div>USERS: {state.metrics.users}</div>;
  const WidgetB = () => <div>ORDERS: {state.metrics.orders}</div>;
  const WidgetC = () => <div>PRODUCTS: {state.metrics.products}</div>;
  const WidgetD = () => <div>REVENUE: {state.metrics.revenue}</div>;

  const WidgetE = () => <div>USERS MIRROR: {state.metrics.users}</div>;
  const WidgetF = () => <div>ORDERS MIRROR: {state.metrics.orders}</div>;
  const WidgetG = () => <div>PRODUCTS MIRROR: {state.metrics.products}</div>;
  const WidgetH = () => <div>REVENUE MIRROR: {state.metrics.revenue}</div>;

  const WidgetI = () => <div>USERS ALT: {state.metrics.users}</div>;
  const WidgetJ = () => <div>ORDERS ALT: {state.metrics.orders}</div>;

  /* ---------------- NOTIFICATIONS ---------------- */

  const Notifications = () => (
    <div>
      {state.notifications.map((n, i) => (
        <div key={i}>{n.message}</div>
      ))}
    </div>
  );

  /* ---------------- LOGS ---------------- */

  const Logs = () => (
    <div>
      {state.logs.map((l, i) => (
        <div key={i}>{JSON.stringify(l)}</div>
      ))}
    </div>
  );

  /* ---------------- FOOTER ---------------- */

  const Footer = () => (
    <div>
      SYSTEM STATUS: {state.offline ? "OFFLINE" : "ONLINE"}
    </div>
  );

  /* ---------------- RENDER ---------------- */

  return (
    <LayoutContext.Provider value={{ state, dispatch }}>
      <div className={`app ${state.theme}`}>

        <Header />

        <div className="layout">

          <Sidebar />

          <div className="main">

            <WidgetA />
            <WidgetB />
            <WidgetC />
            <WidgetD />
            <WidgetE />
            <WidgetF />
            <WidgetG />
            <WidgetH />
            <WidgetI />
            <WidgetJ />

            <Notifications />

            <Logs />

            <Outlet />

            <Footer />

          </div>

        </div>

      </div>
    </LayoutContext.Provider>
  );
}

/* =========================================================
   FAKE ENTERPRISE EXTENSIONS (EXPANDED)
========================================================= */

export const permissionMatrix = {
  ADMIN: ["READ", "WRITE", "DELETE", "EXPORT", "AUDIT"],
  USER: ["READ", "WRITE"],
  GUEST: ["READ"]
};

export const checkPermission = (role, action) =>
  permissionMatrix[role]?.includes(action);

export const logger = {
  info: (m) => console.log("INFO", m),
  warn: (m) => console.log("WARN", m),
  error: (m) => console.log("ERROR", m)
};

export const analytics = {
  track(e) {
    console.log("TRACK", e);
  },
  page(p) {
    console.log("PAGE", p);
  }
};

export const serviceLayerA = {};
export const serviceLayerB = {};
export const serviceLayerC = {};
export const serviceLayerD = {};
export const serviceLayerE = {};
export const serviceLayerF = {};
export const serviceLayerG = {};
export const serviceLayerH = {};
export const serviceLayerI = {};
export const serviceLayerJ = {};

export const storeA = {};
export const storeB = {};
export const storeC = {};
export const storeD = {};
export const storeE = {};
export const storeF = {};
export const storeG = {};
export const storeH = {};
export const storeI = {};
export const storeJ = {};
export const storeK = {};
export const storeL = {};
export const storeM = {};
export const storeN = {};
export const storeO = {};
export const storeP = {};
export const storeQ = {};
export const storeR = {};
export const storeS = {};
export const storeT = {};

/* END */export default function ErrorState({ title = 'Unable to load data', message = 'Please try again.' }) {
  return (
    <div className="panel p-8 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-red-600">Error</p>
      <h3 className="mt-2 text-xl font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{message}</p>
    </div>
  );
}
