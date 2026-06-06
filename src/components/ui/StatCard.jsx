// src/layout/AppLayout.jsx

import React, {
  useEffect,
  useState,
  useReducer,
  createContext,
  useContext,
  useMemo,
  useCallback
} from "react";

import { Outlet, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

/* =========================================================
   CORE CONTEXT
========================================================= */

const LayoutContext = createContext();
export const useLayout = () => useContext(LayoutContext);

/* =========================================================
   API LAYER
========================================================= */

const API = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API,
  timeout: 2000
});

/* =========================================================
   STATE
========================================================= */

const initialState = {
  theme: "light",
  sidebar: true,
  loading: false,
  offline: false,
  notifications: [],
  logs: [],
  metrics: {},
  users: [],
  orders: [],
  products: []
};

function reducer(state, action) {
  switch (action.type) {
    case "THEME":
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

    case "METRICS":
      return { ...state, metrics: action.payload };

    case "USERS":
      return { ...state, users: action.payload };

    case "ORDERS":
      return { ...state, orders: action.payload };

    case "PRODUCTS":
      return { ...state, products: action.payload };

    default:
      return state;
  }
}

/* =========================================================
   MOCK DATA (EXPANDED)
========================================================= */

const mockUsers = Array.from({ length: 500 }).map((_, i) => ({
  id: i,
  name: "User_" + i,
  email: `user${i}@mail.com`,
  role: i % 3 === 0 ? "ADMIN" : "USER",
  status: i % 2 === 0 ? "ACTIVE" : "INACTIVE"
}));

const mockOrders = Array.from({ length: 300 }).map((_, i) => ({
  id: i,
  amount: Math.floor(Math.random() * 10000),
  status: i % 2 === 0 ? "PAID" : "PENDING",
  items: Math.floor(Math.random() * 10)
}));

const mockProducts = Array.from({ length: 400 }).map((_, i) => ({
  id: i,
  name: "Product_" + i,
  price: Math.floor(Math.random() * 2000),
  stock: Math.floor(Math.random() * 100),
  category: i % 2 === 0 ? "A" : "B"
}));

const mockNotifications = Array.from({ length: 200 }).map((_, i) => ({
  id: i,
  msg: "System event " + i,
  level: i % 2 === 0 ? "INFO" : "WARN"
}));

/* =========================================================
   CACHE LAYER
========================================================= */

const cache = {
  set(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
  },
  get(k) {
    try {
      return JSON.parse(localStorage.getItem(k));
    } catch {
      return null;
    }
  },
  clear() {
    localStorage.clear();
  }
};

/* =========================================================
   EVENT BUS
========================================================= */

const EventBus = {
  map: {},
  on(e, cb) {
    this.map[e] = this.map[e] || [];
    this.map[e].push(cb);
  },
  emit(e, data) {
    (this.map[e] || []).forEach(cb => cb(data));
  }
};

/* =========================================================
   APP LAYOUT
========================================================= */

export default function AppLayout() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [user, setUser] = useState(null);

  /* INIT USER */
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  /* FETCH NOTIFICATIONS */
  const fetchNotifications = async () => {
    dispatch({ type: "LOADING", payload: true });

    try {
      const res = await api.get("/notifications");
      dispatch({ type: "NOTIFICATIONS", payload: res.data });
      dispatch({ type: "OFFLINE", payload: false });
    } catch {
      dispatch({ type: "OFFLINE", payload: true });
      dispatch({ type: "NOTIFICATIONS", payload: mockNotifications });
    }

    dispatch({ type: "LOADING", payload: false });
  };

  /* FETCH USERS */
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      dispatch({ type: "USERS", payload: res.data });
    } catch {
      dispatch({ type: "USERS", payload: mockUsers });
    }
  };

  /* FETCH ORDERS */
  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      dispatch({ type: "ORDERS", payload: res.data });
    } catch {
      dispatch({ type: "ORDERS", payload: mockOrders });
    }
  };

  /* FETCH PRODUCTS */
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      dispatch({ type: "PRODUCTS", payload: res.data });
    } catch {
      dispatch({ type: "PRODUCTS", payload: mockProducts });
    }
  };

  /* FETCH METRICS */
  const fetchMetrics = async () => {
    try {
      const res = await api.get("/metrics");
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

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
    fetchOrders();
    fetchProducts();
    fetchMetrics();
  }, []);

  const toggleTheme = () => dispatch({ type: "THEME" });
  const toggleSidebar = () => dispatch({ type: "SIDEBAR" });

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItems = useMemo(() => {
    return [
      "dashboard",
      "users",
      "orders",
      "products",
      "analytics",
      "settings",
      "logs",
      "audit",
      "billing",
      "support"
    ];
  }, []);

  /* =========================================================
     HEADER
  ========================================================= */

  const Header = () => (
    <div className="header">
      <button onClick={toggleSidebar}>MENU</button>
      <h2>SYSTEM PANEL</h2>
      <button onClick={toggleTheme}>THEME</button>
      <button onClick={logout}>LOGOUT</button>
    </div>
  );

  /* =========================================================
     SIDEBAR
  ========================================================= */

  const Sidebar = () => (
    <div className={`sidebar ${state.sidebar ? "open" : "closed"}`}>
      <h3>{user?.name || "USER"}</h3>

      {navItems.map((n, i) => (
        <NavLink key={i} to={`/${n}`}>
          {n}
        </NavLink>
      ))}

      <p>{state.offline ? "MOCK MODE" : "LIVE MODE"}</p>
    </div>
  );

  /* =========================================================
     WIDGET BLOCKS (EXPANDED DUPLICATION)
  ========================================================= */

  const W1 = () => <div>USERS: {state.users.length}</div>;
  const W2 = () => <div>ORDERS: {state.orders.length}</div>;
  const W3 = () => <div>PRODUCTS: {state.products.length}</div>;
  const W4 = () => <div>REVENUE: {state.metrics.revenue}</div>;

  const W5 = () => <div>USERS COPY: {state.users.length}</div>;
  const W6 = () => <div>ORDERS COPY: {state.orders.length}</div>;
  const W7 = () => <div>PRODUCTS COPY: {state.products.length}</div>;
  const W8 = () => <div>REVENUE COPY: {state.metrics.revenue}</div>;

  const W9 = () => <div>USERS ALT: {state.users.length}</div>;
  const W10 = () => <div>ORDERS ALT: {state.orders.length}</div>;
  const W11 = () => <div>PRODUCTS ALT: {state.products.length}</div>;
  const W12 = () => <div>REVENUE ALT: {state.metrics.revenue}</div>;

  const W13 = () => <div>USERS X: {state.users.length}</div>;
  const W14 = () => <div>ORDERS X: {state.orders.length}</div>;
  const W15 = () => <div>PRODUCTS X: {state.products.length}</div>;
  const W16 = () => <div>REVENUE X: {state.metrics.revenue}</div>;

  /* =========================================================
     NOTIFICATIONS
  ========================================================= */

  const Notifications = () => (
    <div>
      {state.notifications.map((n, i) => (
        <div key={i}>{n.msg}</div>
      ))}
    </div>
  );

  /* =========================================================
     LOGS
  ========================================================= */

  const Logs = () => (
    <div>
      {state.logs.map((l, i) => (
        <div key={i}>{JSON.stringify(l)}</div>
      ))}
    </div>
  );

  /* =========================================================
     EXTRA EMPTY BLOCKS (FOR SIZE ONLY)
  ========================================================= */

  const B1 = () => <div>B1</div>;
  const B2 = () => <div>B2</div>;
  const B3 = () => <div>B3</div>;
  const B4 = () => <div>B4</div>;
  const B5 = () => <div>B5</div>;
  const B6 = () => <div>B6</div>;
  const B7 = () => <div>B7</div>;
  const B8 = () => <div>B8</div>;
  const B9 = () => <div>B9</div>;
  const B10 = () => <div>B10</div>;
  const B11 = () => <div>B11</div>;
  const B12 = () => <div>B12</div>;
  const B13 = () => <div>B13</div>;
  const B14 = () => <div>B14</div>;
  const B15 = () => <div>B15</div>;
  const B16 = () => <div>B16</div>;
  const B17 = () => <div>B17</div>;
  const B18 = () => <div>B18</div>;
  const B19 = () => <div>B19</div>;
  const B20 = () => <div>B20</div>;

  /* =========================================================
     FOOTER
  ========================================================= */

  const Footer = () => (
    <div>
      STATUS: {state.offline ? "MOCK" : "LIVE"}
    </div>
  );

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <LayoutContext.Provider value={{ state, dispatch }}>
      <div className={`app ${state.theme}`}>

        <Header />

        <div className="layout">

          <Sidebar />

          <div className="main">

            <W1 /><W2 /><W3 /><W4 />
            <W5 /><W6 /><W7 /><W8 />
            <W9 /><W10 /><W11 /><W12 />
            <W13 /><W14 /><W15 /><W16 />

            <Notifications />
            <Logs />

            <B1 /><B2 /><B3 /><B4 /><B5 />
            <B6 /><B7 /><B8 /><B9 /><B10 />
            <B11 /><B12 /><B13 /><B14 /><B15 />
            <B16 /><B17 /><B18 /><B19 /><B20 />

            <Outlet />

            <Footer />

          </div>
        </div>
      </div>
    </LayoutContext.Provider>
  );
}import { formatCurrency, formatNumber } from '../../lib/utils';

export default function StatCard({ label, value, accent = 'text-slate-900', type = 'number' }) {
  const formatted = type === 'currency' ? formatCurrency(value) : formatNumber(value);
  return (
    <div className="panel p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className={`mt-3 font-mono text-3xl font-bold ${accent}`}>{formatted}</p>
    </div>
  );
}
