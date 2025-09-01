import { Box, Button } from "@mui/material";
import logoMain from "../assets/Notoria-logo-04w.png";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

const TOKEN_KEY = import.meta.env.VITE_TOKEN_KEY || "app_token";

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY + "_expiry");
    navigate("/login");
  };

  return (
    <Box className="header">
      <Box className="header-content">
        <img src={logoMain} alt="Notoria Logo" />
        <Button
          style={{
            borderRadius: "1.5rem",
            width: "8rem",
            padding: "0px !important",
            textTransform: "none",
          }}
          variant="contained"
          startIcon={<LogoutIcon />}
          color="primary"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}

export default Header;