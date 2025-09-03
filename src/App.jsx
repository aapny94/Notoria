import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Login from "./pages/login.jsx";
import Home from "./pages/home.jsx";
import DocEditPage from "./pages/docEditPage.jsx";
import Edit from "./pages/edit.jsx";

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "app_token";
const TOKEN_EXPIRY_HOURS = 2; // 2 hours

function useAuth() {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_KEY + "_expiry");
  if (!token || !expiry) return false;
  return Date.now() < Number(expiry);
}

function ProtectedRoute({ children }) {
  const isAuth = useAuth();
  const location = useLocation();
  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function App() {
  return (
    <>
      <div className="blobContainer"></div>
      <div className="content">
        <BrowserRouter>
          <Routes>
            {/* Edit page must come first to avoid any ambiguity */}
            <Route
              path="/edit/:idOrSlug/*"
              element={
                <ProtectedRoute>
                  <Edit />
                </ProtectedRoute>
              }
            />

            {/* Home without param */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            {/* Home with a single param for preview */}
            <Route
              path="/:idOrSlug"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            {/* Login last */}
            <Route
              path="/login"
              element={useAuth() ? <Navigate to="/" replace /> : <Login />}
            />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
