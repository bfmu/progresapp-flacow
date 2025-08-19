import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { resetPasswordRequest } from "../../api/auth";
import { Container, TextField, Button, Typography, Box, Paper, LinearProgress, Stack } from "@mui/material";
import { useSnackbar } from "notistack";

function scorePassword(pw: string) {
  // Aproximar a IsStrongPassword de class-validator (min 8, upper, lower, number, symbol)
  let score = 0;
  if (pw.length >= 8) score += 20;
  if (/[a-z]/.test(pw)) score += 20;
  if (/[A-Z]/.test(pw)) score += 20;
  if (/[0-9]/.test(pw)) score += 20;
  if (/[^A-Za-z0-9]/.test(pw)) score += 20;
  return Math.min(score, 100);
}

function strengthLabel(score: number) {
  if (score >= 80) return { label: "Fuerte", color: "success" as const };
  if (score >= 60) return { label: "Media", color: "warning" as const };
  return { label: "Débil", color: "error" as const };
}

export default function ResetPassword() {
  const [sp] = useSearchParams();
  const token = sp.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      enqueueSnackbar("Token faltante.", { variant: "warning" });
    }
  }, [token]);

  const score = useMemo(() => scorePassword(password), [password]);
  const { label, color } = strengthLabel(score);
  const passwordsMatch = password.length > 0 && password === confirm;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) {
      enqueueSnackbar("Las contraseñas no coinciden.", { variant: "warning" });
      return;
    }
    if (score < 80) {
      enqueueSnackbar("La contraseña debe ser fuerte (8+ car., mayúscula, minúscula, número y símbolo).", { variant: "warning" });
      return;
    }
    try {
      setLoading(true);
      await resetPasswordRequest(token, password);
      enqueueSnackbar("Contraseña actualizada, inicia sesión.", { variant: "success" });
      navigate("/app/login");
    } catch (e) {
      enqueueSnackbar("Token inválido o expirado.", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Restablecer contraseña</Typography>
          <Box component="form" onSubmit={onSubmit}>
            <TextField label="Nueva contraseña" type="password" fullWidth required value={password} onChange={(e)=>setPassword(e.target.value)} margin="normal" />
            <Box sx={{ mt: 1 }}>
              <LinearProgress variant="determinate" value={score} color={color} sx={{ height: 8, borderRadius: 1 }} />
              <Typography variant="caption" color="text.secondary">Fuerza: {label} (debe incluir mayúsculas, minúsculas, número y símbolo)</Typography>
            </Box>
            <TextField label="Confirmar contraseña" type="password" fullWidth required value={confirm} onChange={(e)=>setConfirm(e.target.value)} margin="normal" error={confirm.length>0 && !passwordsMatch} helperText={confirm.length>0 && !passwordsMatch ? "Las contraseñas no coinciden" : ""} />
            <Button type="submit" variant="contained" fullWidth disabled={!token || loading} sx={{ mt: 1 }}>
              {loading ? "Actualizando..." : "Cambiar contraseña"}
            </Button>
          </Box>
          <Typography variant="body2" align="center">
            <Link to="/app/login" style={{ textDecoration: "none" }}>Volver a iniciar sesión</Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}