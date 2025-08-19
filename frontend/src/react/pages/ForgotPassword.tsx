import { useState } from "react";
import { passwordResetRequest } from "../../api/auth";
import { Container, TextField, Button, Typography, Box, Paper, Stack } from "@mui/material";
import { useSnackbar } from "notistack";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    try {
      setLoading(true);
      const res = await passwordResetRequest(email);
      // Si el back lanza 503 con error email_not_sent, capturamos en catch
      if (res?.status >= 200 && res?.status < 300) {
        enqueueSnackbar("Si el email existe, recibirás un enlace de recuperación.", { variant: "info" });
      } else {
        enqueueSnackbar("No se pudo enviar el correo. Intenta más tarde.", { variant: "warning" });
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const code = err?.response?.data?.error;
      if (status === 503 && code === 'email_not_sent') {
        enqueueSnackbar("No se pudo enviar el correo. Servicio no disponible.", { variant: "error" });
      } else {
        enqueueSnackbar("No se pudo procesar la solicitud ahora mismo.", { variant: "warning" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Recuperar contraseña</Typography>
          <Typography variant="body2" color="text.secondary">
            Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
          </Typography>
          <Box component="form" onSubmit={onSubmit}>
            <TextField
              label="Correo electrónico"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
            />
            <Button type="submit" variant="contained" fullWidth disabled={loading}>
              {loading ? "Enviando..." : "Enviar enlace"}
            </Button>
          </Box>
          <Typography variant="body2" align="center">
            <Link to="/app/login" style={{ textDecoration: "none" }}>
              Volver a iniciar sesión
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}