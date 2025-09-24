import { useNavigate, useLocation } from "react-router-dom";

export function TopMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: "Home", path: "/" },
    { label: "Category", path: "/category" },
    { label: "Create Doc", path: "/docCreate" },
  ];

  return (
    <div className="topMenu" style={{ display: "flex", gap: 16, padding: "12px 0" }}>
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              background: isActive ? "    rgba(17, 24, 28, 0.05)" : "transparent",
              color: isActive ? "#fff" : "#ccc",
              border: "none",
              borderRadius: 5,
              fontWeight: isActive ? 700 : 400,
              cursor: "pointer",
              fontSize: "1rem",
              transition: "background 0.2s",
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}