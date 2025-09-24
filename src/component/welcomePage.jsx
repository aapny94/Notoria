import { useNavigate } from "react-router-dom";
import notoriaImhome from "../assets/Notoria-logo-04w.png";

export default function WelcomePage() {
  const navigate = useNavigate();
  return (
    <div style={{ display: "flex", flex: 1, flexDirection: "row" }}>
      <div style={{ flex: 1, padding: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 44, width: "40%" }}>
            <img src={notoriaImhome} alt="Notoria Logo" />
          </div>
          <h1 style={{ marginTop: 0 }}>Welcome to Notoria</h1>

          <p>
            This system helps you manage your documentation and categories
            efficiently.
            <br />
            Here’s how to use it:
          </p>
          <ul>
            <li>
              <b>Categories:</b> Create, edit, and delete categories. Each
              category can only be deleted if it has no documents.
            </li>
            <li>
              <b>Documents:</b> Add new docs, assign them to categories, and tag
              them for easy searching.
            </li>
            <li>
              <b>Search & Filter:</b> Use the search bar to quickly find docs by
              title, tag, or category.
            </li>
            <li>
              <b>User Access:</b> You only see and manage categories and docs
              linked to your account.
            </li>
          </ul>
          <p>
            <b>Tip:</b> Use the top menu to navigate between Home, Categories,
            and Create Doc pages.
          </p>
          <button
            onClick={() => navigate("/docCreate")}
            style={{
              marginTop: 44,
              width: "50%",
              padding: "10px 28px",
              background: "#dc1806ff",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: "1rem",
              cursor: "pointer",
              boxShadow: "0 2px 8px #0002",
            }}
          >
            Getting Started - Create Your First Document
          </button>
        </div>
        <p style={{ fontSize: 12, color: "#aaa", marginTop: 32 }}>
          Notoria Documentation System &copy; 2025 | Version:{" "}
          {import.meta.env.VITE_VERSION}
        </p>
      </div>
      <div style={{ minWidth: 230 }}>
        {" "}
        <p style={{ marginTop: 34 }} className="preview-title">Updates</p>
      </div>
    </div>
  );
}
