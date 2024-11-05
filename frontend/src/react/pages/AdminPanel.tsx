import { useState } from "react";
import {
  Route,
  Routes,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  AppBar,
  Tabs,
  Tab,
  Box,
  CssBaseline,
  Toolbar,
  Typography,
  Container,
} from "@mui/material";
import MuscleList from "../components/MuscleList";
import ExerciseList from "../components/ExerciseList";
import Navbar from "../components/Navbar";
import SettingsInfo from "../components/SettingsInfo";

function AdminPanel() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(() => {
    // Determinar la pestaña inicial en función de la ruta actual
    if (location.pathname.includes("muscles")) return 0;
    if (location.pathname.includes("exercises")) return 1;
    if (location.pathname.includes("")) return 2;
    return 0;
  });

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    // Navegar a la ruta correspondiente al cambiar de pestaña
    switch (newValue) {
      case 0:
        navigate("/app/settings/muscles");
        break;
      case 1:
        navigate("/app/settings/exercises");
        break;
      case 2:
        navigate("/app/settings");
        break;
      default:
        break;
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <Navbar />

      <AppBar position="static" color="default">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Panel de Administrador
          </Typography>
        </Toolbar>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="Panel de Administración Tabs"
        >
          <Tab label="Músculos" component={Link} to="/app/settings/muscles" />
          <Tab
            label="Ejercicios"
            component={Link}
            to="/app/settings/exercises"
          />
          <Tab
            label="Info"
            component={Link}
            to="/app/settings"
          />
        </Tabs>
      </AppBar>

      <Container component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Routes>
          <Route path="/muscles" element={<MuscleList />} />
          <Route path="/exercises" element={<ExerciseList />} />
          <Route path="/" element={<SettingsInfo />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default AdminPanel;
