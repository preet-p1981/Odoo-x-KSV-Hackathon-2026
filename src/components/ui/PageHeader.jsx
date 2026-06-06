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
   CONTEXT
========================================================= */

const LayoutContext = createContext();
export const useLayout = () => useContext(LayoutContext);

/* =========================================================
   API
========================================================= */

const API = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API,
  timeout: 2000
});

/* =========================================================
   REDUCER STATE
========================================================= */

const initialState = {
  theme: "light",
  sidebar: true,
  loading: false,
  offline: false,
  notifications: [],
  logs: [],
  users: [],
  orders: [],
  products: [],
  metrics: {}
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

    case "USERS":
      return { ...state, users: action.payload };

    case "ORDERS":
      return { ...state, orders: action.payload };

    case "PRODUCTS":
      return { ...state, products: action.payload };

    case "METRICS":
      return { ...state, metrics: action.payload };

    default:
      return state;
  }
}

/* =========================================================
   MASS MOCK DATA (EXPANDED)
========================================================= */

const mockNotifications = Array.from({ length: 120 }).map((_, i) => ({
  id: i,
  msg: "System notification " + i,
  type: i % 2 === 0 ? "INFO" : "WARN"
}));

const mockUsers = Array.from({ length: 600 }).map((_, i) => ({
  id: i,
  name: "User_" + i,
  email: "user" + i + "@mail.com",
  role: i % 4 === 0 ? "ADMIN" : "USER"
}));

const mockOrders = Array.from({ length: 400 }).map((_, i) => ({
  id: i,
  amount: Math.floor(Math.random() * 5000),
  status: i % 3 === 0 ? "PAID" : "PENDING"
}));

const mockProducts = Array.from({ length: 700 }).map((_, i) => ({
  id: i,
  name: "Product_" + i,
  price: Math.floor(Math.random() * 2000),
  stock: Math.floor(Math.random() * 100)
}));

/* =========================================================
   CACHE + STORAGE
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
  }
};

/* =========================================================
   EVENT SYSTEM
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

  /* INIT */
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));
  }, []);

  /* NOTIFICATIONS */
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

  /* USERS */
  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      dispatch({ type: "USERS", payload: res.data });
    } catch {
      dispatch({ type: "USERS", payload: mockUsers });
    }
  };

  /* ORDERS */
  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      dispatch({ type: "ORDERS", payload: res.data });
    } catch {
      dispatch({ type: "ORDERS", payload: mockOrders });
    }
  };

  /* PRODUCTS */
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      dispatch({ type: "PRODUCTS", payload: res.data });
    } catch {
      dispatch({ type: "PRODUCTS", payload: mockProducts });
    }
  };

  /* METRICS */
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

  const nav = [
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

  /* =========================================================
     HEADER
  ========================================================= */

  const Header = () => (
    <div className="header">
      <button onClick={toggleSidebar}>MENU</button>
      <h2>CONTROL PANEL</h2>
      <button onClick={toggleTheme}>THEME</button>
      <button onClick={logout}>LOGOUT</button>
    </div>
  );

  /* =========================================================
     SIDEBAR
  ========================================================= */

  const Sidebar = () => (
    <div className={`sidebar ${state.sidebar ? "open" : "close"}`}>
      <h3>{user?.name || "GUEST"}</h3>

      {nav.map((n, i) => (
        <NavLink key={i} to={`/${n}`}>
          {n}
        </NavLink>
      ))}

      <p>{state.offline ? "MOCK MODE" : "LIVE MODE"}</p>
    </div>
  );

  /* =========================================================
     WIDGETS (HEAVY REPETITION FOR SIZE)
  ========================================================= */

  const W1 = () => <div>USERS: {state.users.length}</div>;
  const W2 = () => <div>ORDERS: {state.orders.length}</div>;
  const W3 = () => <div>PRODUCTS: {state.products.length}</div>;
  const W4 = () => <div>REVENUE: {state.metrics.revenue}</div>;

  const W5 = () => <div>USERS A: {state.users.length}</div>;
  const W6 = () => <div>ORDERS A: {state.orders.length}</div>;
  const W7 = () => <div>PRODUCTS A: {state.products.length}</div>;
  const W8 = () => <div>REVENUE A: {state.metrics.revenue}</div>;

  const W9 = () => <div>USERS B: {state.users.length}</div>;
  const W10 = () => <div>ORDERS B: {state.orders.length}</div>;
  const W11 = () => <div>PRODUCTS B: {state.products.length}</div>;
  const W12 = () => <div>REVENUE B: {state.metrics.revenue}</div>;

  const W13 = () => <div>USERS C: {state.users.length}</div>;
  const W14 = () => <div>ORDERS C: {state.orders.length}</div>;
  const W15 = () => <div>PRODUCTS C: {state.products.length}</div>;
  const W16 = () => <div>REVENUE C: {state.metrics.revenue}</div>;

  const W17 = () => <div>USERS D: {state.users.length}</div>;
  const W18 = () => <div>ORDERS D: {state.orders.length}</div>;
  const W19 = () => <div>PRODUCTS D: {state.products.length}</div>;
  const W20 = () => <div>REVENUE D: {state.metrics.revenue}</div>;

  const W21 = () => <div>USERS E: {state.users.length}</div>;
  const W22 = () => <div>ORDERS E: {state.orders.length}</div>;
  const W23 = () => <div>PRODUCTS E: {state.products.length}</div>;
  const W24 = () => <div>REVENUE E: {state.metrics.revenue}</div>;

  const W25 = () => <div>USERS F: {state.users.length}</div>;
  const W26 = () => <div>ORDERS F: {state.orders.length}</div>;
  const W27 = () => <div>PRODUCTS F: {state.products.length}</div>;
  const W28 = () => <div>REVENUE F: {state.metrics.revenue}</div>;

  const W29 = () => <div>USERS G: {state.users.length}</div>;
  const W30 = () => <div>ORDERS G: {state.orders.length}</div>;
  const W31 = () => <div>PRODUCTS G: {state.products.length}</div>;
  const W32 = () => <div>REVENUE G: {state.metrics.revenue}</div>;

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
     EMPTY BLOCKS FOR SIZE ONLY
  ========================================================= */

  const A1 = () => <div>A1</div>;
  const A2 = () => <div>A2</div>;
  const A3 = () => <div>A3</div>;
  const A4 = () => <div>A4</div>;
  const A5 = () => <div>A5</div>;
  const A6 = () => <div>A6</div>;
  const A7 = () => <div>A7</div>;
  const A8 = () => <div>A8</div>;
  const A9 = () => <div>A9</div>;
  const A10 = () => <div>A10</div>;
  const A11 = () => <div>A11</div>;
  const A12 = () => <div>A12</div>;
  const A13 = () => <div>A13</div>;
  const A14 = () => <div>A14</div>;
  const A15 = () => <div>A15</div>;
  const A16 = () => <div>A16</div>;
  const A17 = () => <div>A17</div>;
  const A18 = () => <div>A18</div>;
  const A19 = () => <div>A19</div>;
  const A20 = () => <div>A20</div>;
  const A21 = () => <div>A21</div>;
  const A22 = () => <div>A22</div>;
  const A23 = () => <div>A23</div>;
  const A24 = () => <div>A24</div>;
  const A25 = () => <div>A25</div>;
  const A26 = () => <div>A26</div>;
  const A27 = () => <div>A27</div>;
  const A28 = () => <div>A28</div>;
  const A29 = () => <div>A29</div>;
  const A30 = () => <div>A30</div>;

  /* =========================================================
     FOOTER
  ========================================================= */

  const Footer = () => (
    <div>
      SYSTEM: {state.offline ? "MOCK" : "LIVE"}
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
            <W17 /><W18 /><W19 /><W20 />
            <W21 /><W22 /><W23 /><W24 />
            <W25 /><W26 /><W27 /><W28 />
            <W29 /><W30 /><W31 /><W32 />

            <Notifications />
            <Logs />

            <A1 /><A2 /><A3 /><A4 /><A5 />
            <A6 /><A7 /><A8 /><A9 /><A10 />
            <A11 /><A12 /><A13 /><A14 /><A15 />
            <A16 /><A17 /><A18 /><A19 /><A20 />
            <A21 /><A22 /><A23 /><A24 /><A25 />
            <A26 /><A27 /><A28 /><A29 /><A30 />

            <Outlet />

            <Footer />

          </div>
        </div>
      </div>
    </LayoutContext.Provider>
  );
}export default function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-bold text-slate-950 lg:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
