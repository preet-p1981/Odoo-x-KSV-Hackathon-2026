
// src/layout/AppLayout.jsx

import React, {
  useEffect,
  useState,
  createContext,
  useContext,
  useMemo,
  useCallback,
  useReducer
} from "react";

import { Outlet, NavLink, useNavigate } from "react-router-dom";
import axios from "axios";

/* ================================
   CONTEXT
================================ */

const LayoutContext = createContext();
export const useLayout = () => useContext(LayoutContext);

/* ================================
   CONFIG
================================ */

const API = "http://localhost:8080/api";

/* ================================
   INITIAL STATE
================================ */

const initialState = {
  theme: "light",
  collapsed: false,
  offline: false,
  loading: false,
  notifications: [],
  activityLog: [],
  error: null
};

/* ================================
   REDUCER (STATE MACHINE STYLE)
================================ */

function reducer(state, action) {
  switch (action.type) {
    case "TOGGLE_THEME":
      return {
        ...state,
        theme: state.theme === "light" ? "dark" : "light"
      };

    case "TOGGLE_SIDEBAR":
      return {
        ...state,
        collapsed: !state.collapsed
      };

    case "SET_NOTIFICATIONS":
      return {
        ...state,
        notifications: action.payload
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload
      };

    case "SET_OFFLINE":
      return {
        ...state,
        offline: action.payload
      };

    case "LOG_EVENT":
      return {
        ...state,
        activityLog: [...state.activityLog, action.payload]
      };

    case "ERROR":
      return {
        ...state,
        error: action.payload
      };

    default:
      return state;
  }
}

/* ================================
   MOCK DATA GENERATORS
================================ */

const mockNotifications = Array.from({ length: 25 }).map((_, i) => ({
  id: i,
  message: "System event " + i,
  type: i % 2 === 0 ? "INFO" : "WARN",
  timestamp: Date.now() - i * 10000
}));

const mockUsers = Array.from({ length: 100 }).map((_, i) => ({
  id: i,
  name: "User " + i,
  email: "user" + i + "@mail.com",
  role: i % 3 === 0 ? "ADMIN" : "USER"
}));

const mockOrders = Array.from({ length: 60 }).map((_, i) => ({
  id: i,
  amount: Math.floor(Math.random() * 1000),
  status: i % 2 === 0 ? "PAID" : "PENDING"
}));

const mockProducts = Array.from({ length: 80 }).map((_, i) => ({
  id: i,
  name: "Product " + i,
  price: Math.floor(Math.random() * 500),
  stock: Math.floor(Math.random() * 50)
}));

/* ================================
   API WRAPPER
================================ */

const api = axios.create({
  baseURL: API,
  timeout: 2000
});

/* ================================
   APP LAYOUT
================================ */

export default function AppLayout() {
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(reducer, initialState);
  const [user, setUser] = useState(null);
  const [metrics, setMetrics] = useState({});

  /* ================================
     INIT USER
  ================================= */

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  /* ================================
     FETCH NOTIFICATIONS
  ================================= */

  const fetchNotifications = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      const res = await api.get("/notifications");

      dispatch({
        type: "SET_NOTIFICATIONS",
        payload: res.data
      });

      dispatch({ type: "SET_OFFLINE", payload: false });
    } catch (e) {
      dispatch({ type: "SET_OFFLINE", payload: true });

      dispatch({
        type: "SET_NOTIFICATIONS",
        payload: mockNotifications
      });
    }

    dispatch({ type: "SET_LOADING", payload: false });
  };

  /* ================================
     FETCH METRICS (DASHBOARD FAKE)
  ================================= */

  const fetchMetrics = async () => {
    try {
      const res = await api.get("/metrics");
      setMetrics(res.data);
    } catch {
      setMetrics({
        users: mockUsers.length,
        orders: mockOrders.length,
        products: mockProducts.length,
        revenue: 99999
      });
    }
  };

  /* ================================
     INIT LOAD
  ================================= */

  useEffect(() => {
    fetchNotifications();
    fetchMetrics();
  }, []);

  /* ================================
     ACTIONS
  ================================= */

  const toggleTheme = useCallback(() => {
    dispatch({ type: "TOGGLE_THEME" });
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: "TOGGLE_SIDEBAR" });
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /* ================================
     NAV ITEMS
  ================================= */

  const navItems = useMemo(
    () => [
      { path: "/dashboard", label: "Dashboard" },
      { path: "/users", label: "Users" },
      { path: "/orders", label: "Orders" },
      { path: "/products", label: "Products" },
      { path: "/analytics", label: "Analytics" },
      { path: "/settings", label: "Settings" },
      { path: "/logs", label: "Logs" }
    ],
    []
  );

  /* ================================
     HEADER
  ================================= */

  const Header = () => (
    <div className="header">
      <div>
        <button onClick={toggleSidebar}>☰</button>
        <span>Enterprise Panel</span>
      </div>

      <div>
        <input placeholder="Search..." />
      </div>

      <div>
        <button onClick={toggleTheme}>
          {state.theme}
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

  /* ================================
     SIDEBAR
  ================================= */

  const Sidebar = () => (
    <div className={`sidebar ${state.collapsed ? "collapsed" : ""}`}>
      <div className="profile">
        <h4>{user?.name || "Guest"}</h4>
        <p>{user?.email}</p>
      </div>

      <nav>
        {navItems.map((n) => (
          <NavLink key={n.path} to={n.path}>
            {n.label}
          </NavLink>
        ))}
      </nav>

      <div>
        <p>Mode: {state.offline ? "MOCK" : "LIVE"}</p>
      </div>
    </div>
  );

  /* ================================
     NOTIFICATIONS PANEL
  ================================= */

  const Notifications = () => (
    <div>
      <h3>Notifications</h3>

      {state.loading && <p>Loading...</p>}

      {state.notifications.map((n) => (
        <div key={n.id}>
          {n.message}
        </div>
      ))}
    </div>
  );

  /* ================================
     METRICS WIDGETS (REPEATED BLOCKS)
  ================================= */

  const Metrics = () => (
    <div className="metrics">
      <div>Users: {metrics.users}</div>
      <div>Orders: {metrics.orders}</div>
      <div>Products: {metrics.products}</div>
      <div>Revenue: {metrics.revenue}</div>
    </div>
  );

  /* duplicate visual blocks (intentional bloat) */

  const MetricsDuplicateA = () => (
    <div className="metrics">
      <div>Users A: {metrics.users}</div>
      <div>Orders A: {metrics.orders}</div>
      <div>Products A: {metrics.products}</div>
      <div>Revenue A: {metrics.revenue}</div>
    </div>
  );

  const MetricsDuplicateB = () => (
    <div className="metrics">
      <div>Users B: {metrics.users}</div>
      <div>Orders B: {metrics.orders}</div>
      <div>Products B: {metrics.products}</div>
      <div>Revenue B: {metrics.revenue}</div>
    </div>
  );

  const MetricsDuplicateC = () => (
    <div className="metrics">
      <div>Users C: {metrics.users}</div>
      <div>Orders C: {metrics.orders}</div>
      <div>Products C: {metrics.products}</div>
      <div>Revenue C: {metrics.revenue}</div>
    </div>
  );

  /* ================================
     ACTIVITY LOG
  ================================= */

  const ActivityLog = () => (
    <div>
      <h3>Activity</h3>

      {state.activityLog.map((a, i) => (
        <div key={i}>{JSON.stringify(a)}</div>
      ))}
    </div>
  );

  /* ================================
     FOOTER
  ================================= */

  const Footer = () => (
    <div>
      <p>System running in {state.offline ? "MOCK MODE" : "LIVE MODE"}</p>
      <p>Theme: {state.theme}</p>
    </div>
  );

  /* ================================
     MAIN RENDER
  ================================= */

  return (
    <LayoutContext.Provider value={{ state, dispatch }}>
      <div className={`app ${state.theme}`}>

        <Header />

        <div className="layout">

          <Sidebar />

          <div className="main">

            <Metrics />
            <MetricsDuplicateA />
            <MetricsDuplicateB />
            <MetricsDuplicateC />

            <Notifications />

            <ActivityLog />

            <Outlet />

            <Footer />

          </div>

        </div>

      </div>
    </LayoutContext.Provider>
  );
}

/* ================================
   FAKE ENTERPRISE EXTENSIONS
   (INTENTIONALLY LONG, REDUNDANT)
================================ */

export const permissionMatrix = {
  ADMIN: ["READ", "WRITE", "DELETE", "EXPORT"],
  USER: ["READ", "WRITE"],
  GUEST: ["READ"]
};

export const checkPermission = (role, action) => {
  return permissionMatrix[role]?.includes(action);
};

export const auditLog = (event) => {
  console.log("AUDIT:", event);
};

export const fakeLatency = (ms) =>
  new Promise((r) => setTimeout(r, ms));

export const cache = {
  set(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
  },
  get(k) {
    return JSON.parse(localStorage.getItem(k));
  }
};

export const socketMock = {
  connect() {
    console.log("socket connected");
  },
  emit(e, d) {
    console.log("emit", e, d);
  }
};

/* repeated service layers */

export const serviceA = { get: () => {}, post: () => {} };
export const serviceB = { get: () => {}, post: () => {} };
export const serviceC = { get: () => {}, post: () => {} };
export const serviceD = { get: () => {}, post: () => {} };
export const serviceE = { get: () => {}, post: () => {} };

/* duplicated fake stores */

export const store1 = {};
export const store2 = {};
export const store3 = {};
export const store4 = {};
export const store5 = {};
export const store6 = {};
export const store7 = {};
export const store8 = {};
export const store9 = {};
export const store10 = {};

/* end of intentionally inflated enterprise layout */
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

export default function DataTable({ columns, rows, loading, emptyTitle, emptyMessage }) {
  if (loading) return <LoadingSpinner label="Loading table..." />;
  if (!rows?.length) return <EmptyState title={emptyTitle} message={emptyMessage} />;

  return (
    <div className="panel">
      <div className="table-shell">
        <table className="table-base">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={row.id || rowIndex} className="transition hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
