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
import DocCreatePage from "./pages/docCreatePage.jsx";
import Create from "./pages/create.jsx";

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "app_token";
const TOKEN_EXPIRY_HOURS = 2; // 2 hours

function useAuth() {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_KEY + "_expiry");
  const user = JSON.parse(localStorage.getItem(TOKEN_KEY + "_user") || "null");
  if (!token || !expiry || !user) return false;
  // Strapi user has an 'blocked' property for active status
  if (user.blocked) return false;
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
              path="/edit/:id"
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
              path="/:id"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            <Route
              path="/docCreate"
              element={
                <ProtectedRoute>
                  <Create />
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
