import { Box, Button, Typography } from "@mui/material";

export default function ErrorFallback() {
  return (
    <Box sx={{ minHeight: "50vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, textAlign: "center" }}>
      <Typography variant="h5" fontWeight={700}>Algo salió mal</Typography>
      <Typography variant="body2" color="text.secondary">Intenta recargar la página. Si el problema persiste, vuelve al inicio de sesión.</Typography>
      <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
        <Button variant="contained" color="primary" onClick={() => window.location.reload()}>Recargar</Button>
        <Button variant="outlined" color="secondary" onClick={() => (window.location.href = "/app/login")}>Ir a Login</Button>
      </Box>
    </Box>
  );
}


