import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/auth";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Tooltip,
} from "@mui/material";
import { Brightness4, Brightness7 } from "@mui/icons-material";

const Navbar = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  // Usar acciones de Zustand de manera más específica para evitar ciclos infinitos de renders.
  const logout = useAuthStore((state) => state.logout);
  const isAuth = useAuthStore((state) => state.isAuth);
  const profile = useAuthStore((state) => state.profile);
  const theme = useAuthStore((state) => state.theme);
  const toggleTheme = useAuthStore((state) => state.toggleTheme);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    window.location.href = "/";
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flex: 1 }}>
          <Link to="/app" style={{ textDecoration: "none", color: "inherit" }}>
            FLACOW
          </Link>
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Tooltip title="Cambiar tema">
            <IconButton
              onClick={() => toggleTheme()}
              color="inherit"
              aria-label="toggle theme"
              sx={{ mr: 2 }}
            >
              {theme === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Abrir menú">
            <IconButton
              onClick={handleMenuOpen}
              size="small"
              sx={{ ml: 2 }}
              aria-controls={open ? "account-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
            >
              <Avatar
                src="#"
                alt={profile ? profile.name?.toUpperCase() : "Invitado"}
              />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={open}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: "visible",
                mt: 1.5,
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
                "&:before": {
                  content: '""',
                  display: "block",
                  position: "absolute",
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: "background.paper",
                  transform: "translateY(-50%) rotate(45deg)",
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="body1">
                {profile ? profile.name : "Invitado"}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {profile ? profile.email : "Registrate"}
              </Typography>
            </Box>
            {profile
              ? [
                  <MenuItem
                    key="dashboard"
                    component={Link}
                    to="/app"
                    onClick={handleMenuClose}
                  >
                    Dashboard
                  </MenuItem>,
                  <MenuItem
                    key="settings"
                    component={Link}
                    to="/app/settings"
                    onClick={handleMenuClose}
                  >
                    Configuración
                  </MenuItem>,
                  <MenuItem key="signout" onClick={handleLogout}>
                    Cerrar sesión
                  </MenuItem>,
                ]
              : [
                  <MenuItem
                    key="login"
                    component={Link}
                    to="/app/login"
                    onClick={handleMenuClose}
                  >
                    Identifícate
                  </MenuItem>,
                  <MenuItem
                    key="register"
                    component={Link}
                    to="/app/register"
                    onClick={handleMenuClose}
                  >
                    Registrarse
                  </MenuItem>,
                ]}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
