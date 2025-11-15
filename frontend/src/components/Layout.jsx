// frontend/src/components/Layout.jsx
// Smart Layout - Shows Header on authenticated pages only

import { useLocation } from "react-router-dom";
import Header from "./Header";

const Layout = ({ children }) => {
  const location = useLocation();

  // Routes that should NOT show the header
  const noHeaderRoutes = ["/login", "/signup", "/"];
  const showHeader = !noHeaderRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Conditionally show Header */}
      {showHeader && <Header />}

      {/* Page Content */}
      <main className={showHeader ? "h-[calc(100vh-4rem)]" : "h-screen"}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
