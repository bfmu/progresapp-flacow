import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/auth";
import { userInfoRequest } from "@progresapp/shared/api/users";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function AuthCallback() {
  const { setToken, setProfile } = useAuthStore((state) => state);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const errorParam = params.get("error");

    if (errorParam === "google_denied") {
      window.location.href = "/app/login?error=google_denied";
      return;
    }

    if (!token) {
      window.location.href = "/app/login?error=missing_token";
      return;
    }

    setToken(token);
    userInfoRequest()
      .then((profile) => {
        setProfile(profile);
        window.location.href = "/app";
      })
      .catch(() => {
        setError("No se pudo completar la autenticación.");
        window.location.href = "/app/login?error=auth_failed";
      });
  }, []);

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography>Autenticando...</Typography>
    </Box>
  );
}
