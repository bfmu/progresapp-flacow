import { createTheme } from "@mui/material/styles";
import type { Theme } from "@mui/material/styles";
import { alpha } from "@mui/material/styles";

export type ThemeMode = "light" | "dark";

export function getAppTheme(mode: ThemeMode): Theme {
  const isDark = mode === "dark";

  const palette = {
    mode,
    primary: { main: "#1e88e5", contrastText: "#0a1628" },
    secondary: { main: "#00bcd4", contrastText: "#0a1628" },
    background: {
      default: isDark ? "#0a1628" : "#f4f7fb",
      paper: isDark ? "#0f1b2d" : "#ffffff",
    },
    text: {
      primary: isDark ? "#E6ECF5" : "#0d1b2a",
      secondary: isDark ? "#B6C2D0" : "#4a5d73",
    },
    error: { main: "#ef5350" },
    warning: { main: "#ffb300" },
    info: { main: "#42a5f5" },
    success: { main: "#66bb6a" },
    divider: isDark ? alpha("#E6ECF5", 0.12) : alpha("#0d1b2a", 0.12),
  } as const;

  return createTheme({
    palette: palette as any,
    typography: {
      fontFamily: `'Roboto', system-ui, -apple-system, 'Segoe UI', Arial, sans-serif`,
      h1: { fontSize: "2.125rem", fontWeight: 700 },
      h2: { fontSize: "1.75rem", fontWeight: 700 },
      h3: { fontSize: "1.5rem", fontWeight: 700 },
      h4: { fontSize: "1.25rem", fontWeight: 600 },
      h5: { fontSize: "1.125rem", fontWeight: 600 },
      h6: { fontSize: "1rem", fontWeight: 600 },
      body1: { fontSize: "1rem" },
      body2: { fontSize: "0.875rem" },
      button: { textTransform: "none", fontWeight: 600 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: isDark
              ? "radial-gradient(1000px 500px at 100% -10%, #0f2746 0%, transparent 70%), radial-gradient(800px 450px at -10% 120%, #0c213b 0%, transparent 70%), #0a1628"
              : "radial-gradient(1000px 500px at 100% -10%, #e3f2fd 0%, transparent 70%), radial-gradient(800px 450px at -10% 120%, #e0f7fa 0%, transparent 70%), #f4f7fb",
            minHeight: "100vh",
            color: isDark ? "#E6ECF5" : "#0d1b2a",
          },
        },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0, color: "transparent" },
        styleOverrides: {
          root: {
            backdropFilter: "saturate(180%) blur(10px)",
            backgroundColor: alpha(isDark ? "#0f1b2d" : "#ffffff", isDark ? 0.4 : 0.7),
            borderBottom: `1px solid ${alpha(isDark ? "#E6ECF5" : "#0d1b2a", 0.1)}`,
          },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${alpha(isDark ? "#E6ECF5" : "#0d1b2a", 0.08)}`,
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${palette.primary.main} 0%, #1565c0 100%)`,
            color: palette.primary.contrastText,
          },
          containedSecondary: {
            background: `linear-gradient(135deg, ${palette.secondary.main} 0%, #26c6da 100%)`,
            color: palette.secondary.contrastText,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
          },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            border: `1px solid ${alpha(isDark ? "#E6ECF5" : "#0d1b2a", 0.08)}`,
          },
        },
      },
    },
  });
}


