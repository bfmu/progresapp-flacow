import React, { useEffect, useState } from "react";
import { loginRequest } from "../../api/auth";
import { useAuthStore } from "../../store/auth";
import { userInfoRequest } from "../../api/users";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useFormik } from "formik";
import * as Yup from "yup";
import Navbar from "../components/Navbar";

export default function Login() {
  const { enqueueSnackbar } = useSnackbar();
  const { setToken, token } = useAuthStore((state) => state);
  const setProfile = useAuthStore((store) => store.setProfile);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Email inválido")
        .required("El email es requerido"),
      password: Yup.string().required("La contraseña es requerida"),
    }),
    onSubmit: async (values) => {
      try {
        const res = await loginRequest(values.email, values.password);

        if (res.status >= 200 && res.status < 300) {
          const token = res.data.accessToken;
          setToken(token);
          const infoUser = await userInfoRequest();
          setProfile(infoUser);
          enqueueSnackbar("Inicio de sesión exitoso", { variant: "success" });
          navigate("/app");
        } else {
          enqueueSnackbar("Error en el inicio de sesión", { variant: "error" });
        }
      } catch (error) {
        enqueueSnackbar(
          "Error en el inicio de sesión. Por favor, inténtalo de nuevo.",
          { variant: "error" }
        );
      }
    },
  });

  useEffect(() => {
    if (token) {
      navigate("/app");
    }
  }, [token]);

  return (
    <>
      <Navbar />
      <Container component="main" maxWidth="xs">
        <Paper elevation={3} sx={{ padding: 4, marginTop: 6 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Typography component="h1" variant="h5">
              Identifícate
            </Typography>
            <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 3 }}>
              <TextField
                fullWidth
                id="email"
                name="email"
                label="Correo Electrónico"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                margin="normal"
              />
              <TextField
                fullWidth
                id="password"
                name="password"
                label="Contraseña"
                type="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.password && Boolean(formik.errors.password)
                }
                helperText={formik.touched.password && formik.errors.password}
                margin="normal"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                sx={{ mt: 3, mb: 2 }}
              >
                Entrar
              </Button>
              <Typography variant="body2" align="center">
                ¿No tienes una cuenta?{" "}
                <Link
                  to="/app/register"
                  style={{ color: "#1976d2", textDecoration: "none" }}
                >
                  Regístrate aquí.
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
