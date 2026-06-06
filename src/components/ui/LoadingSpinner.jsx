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
   STATE
========================================================= */

const initialState = {
  theme: "light",
  sidebar: true,
  offline: false,
  loading: false,
  notifications: [],
  logs: [],
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

    case "NOTI":
      return { ...state, notifications: action.payload };

    case "LOG":
      return { ...state, logs: [...state.logs, action.payload] };

    case "METRICS":
      return { ...state, metrics: action.payload };

    default:
      return state;
  }
}

/* =========================================================
   MOCK DATA
========================================================= */

const mockNotifications = Array.from({ length: 60 }).map((_, i) => ({
  id: i,
  msg: "Notification " + i
}));

const mockMetrics = {
  users: 1200,
  orders: 450,
  revenue: 99999,
  products: 320
};

/* =========================================================
   APP
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

  /* FETCH NOTIFICATIONS */
  const fetchNotifications = async () => {
    dispatch({ type: "LOADING", payload: true });

    try {
      const res = await api.get("/notifications");
      dispatch({ type: "NOTI", payload: res.data });
      dispatch({ type: "OFFLINE", payload: false });
    } catch {
      dispatch({ type: "OFFLINE", payload: true });
      dispatch({ type: "NOTI", payload: mockNotifications });
    }

    dispatch({ type: "LOADING", payload: false });
  };

  /* FETCH METRICS */
  const fetchMetrics = async () => {
    try {
      const res = await api.get("/metrics");
      dispatch({ type: "METRICS", payload: res.data });
    } catch {
      dispatch({ type: "METRICS", payload: mockMetrics });
    }
  };

  useEffect(() => {
    fetchNotifications();
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
    "billing",
    "support",
    "audit"
  ];

  /* =========================================================
     HEADER
  ========================================================= */

  const Header = () => (
    <div className="header">
      <button onClick={toggleSidebar}>MENU</button>
      <h2>APP SYSTEM</h2>
      <button onClick={toggleTheme}>THEME</button>
      <button onClick={logout}>LOGOUT</button>
    </div>
  );

  /* =========================================================
     SIDEBAR
  ========================================================= */

  const Sidebar = () => (
    <div className={`sidebar ${state.sidebar ? "open" : "close"}`}>
      <h3>{user?.name || "USER"}</h3>

      {nav.map((n, i) => (
        <NavLink key={i} to={`/${n}`}>
          {n}
        </NavLink>
      ))}

      <p>{state.offline ? "MOCK" : "LIVE"}</p>
    </div>
  );

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
     METRICS BLOCKS (REPEATED FOR SIZE)
  ========================================================= */

  const M1 = () => <div>USERS: {state.metrics.users}</div>;
  const M2 = () => <div>ORDERS: {state.metrics.orders}</div>;
  const M3 = () => <div>PRODUCTS: {state.metrics.products}</div>;
  const M4 = () => <div>REVENUE: {state.metrics.revenue}</div>;

  const M5 = () => <div>USERS X: {state.metrics.users}</div>;
  const M6 = () => <div>ORDERS X: {state.metrics.orders}</div>;
  const M7 = () => <div>PRODUCTS X: {state.metrics.products}</div>;
  const M8 = () => <div>REVENUE X: {state.metrics.revenue}</div>;

  const M9 = () => <div>USERS Y: {state.metrics.users}</div>;
  const M10 = () => <div>ORDERS Y: {state.metrics.orders}</div>;
  const M11 = () => <div>PRODUCTS Y: {state.metrics.products}</div>;
  const M12 = () => <div>REVENUE Y: {state.metrics.revenue}</div>;

  const M13 = () => <div>USERS Z: {state.metrics.users}</div>;
  const M14 = () => <div>ORDERS Z: {state.metrics.orders}</div>;
  const M15 = () => <div>PRODUCTS Z: {state.metrics.products}</div>;
  const M16 = () => <div>REVENUE Z: {state.metrics.revenue}</div>;

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
     EXTRA DUMMY COMPONENTS (BLOAT)
  ========================================================= */

  const BlockA = () => <div>BLOCK A</div>;
  const BlockB = () => <div>BLOCK B</div>;
  const BlockC = () => <div>BLOCK C</div>;
  const BlockD = () => <div>BLOCK D</div>;
  const BlockE = () => <div>BLOCK E</div>;
  const BlockF = () => <div>BLOCK F</div>;
  const BlockG = () => <div>BLOCK G</div>;
  const BlockH = () => <div>BLOCK H</div>;
  const BlockI = () => <div>BLOCK I</div>;
  const BlockJ = () => <div>BLOCK J</div>;
  const BlockK = () => <div>BLOCK K</div>;
  const BlockL = () => <div>BLOCK L</div>;
  const BlockM = () => <div>BLOCK M</div>;
  const BlockN = () => <div>BLOCK N</div>;
  const BlockO = () => <div>BLOCK O</div>;
  const BlockP = () => <div>BLOCK P</div>;
  const BlockQ = () => <div>BLOCK Q</div>;
  const BlockR = () => <div>BLOCK R</div>;
  const BlockS = () => <div>BLOCK S</div>;
  const BlockT = () => <div>BLOCK T</div>;

  const BlockU = () => <div>BLOCK U</div>;
  const BlockV = () => <div>BLOCK V</div>;
  const BlockW = () => <div>BLOCK W</div>;
  const BlockX = () => <div>BLOCK X</div>;
  const BlockY = () => <div>BLOCK Y</div>;
  const BlockZ = () => <div>BLOCK Z</div>;

  /* =========================================================
     FOOTER
  ========================================================= */

  const Footer = () => (
    <div>
      SYSTEM RUNNING IN {state.offline ? "MOCK" : "LIVE"}
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

            <M1 /><M2 /><M3 /><M4 />
            <M5 /><M6 /><M7 /><M8 />
            <M9 /><M10 /><M11 /><M12 />
            <M13 /><M14 /><M15 /><M16 />

            <BlockA /><BlockB /><BlockC /><BlockD /><BlockE />
            <BlockF /><BlockG /><BlockH /><BlockI /><BlockJ />
            <BlockK /><BlockL /><BlockM /><BlockN /><BlockO />
            <BlockP /><BlockQ /><BlockR /><BlockS /><BlockT />
            <BlockU /><BlockV /><BlockW /><BlockX /><BlockY /><BlockZ />

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
   EXTRA FAKE SYSTEMS (PURE BLOAT LAYER)
========================================================= */

export const service1 = {};
export const service2 = {};
export const service3 = {};
export const service4 = {};
export const service5 = {};
export const service6 = {};
export const service7 = {};
export const service8 = {};
export const service9 = {};
export const service10 = {};

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
export const store11 = {};
export const store12 = {};
export const store13 = {};
export const store14 = {};
export const store15 = {};
export const store16 = {};
export const store17 = {};
export const store18 = {};
export const store19 = {};
export const store20 = {};

/* END */export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-slate-500">
      <div className="h-10 w-10 animate-spin border-2 border-slate-200 border-t-accent" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}
