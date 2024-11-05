import { Box, Typography, Avatar, Grid, Paper, Button, Container } from "@mui/material";
import { GitHub, Language, Email } from "@mui/icons-material";
import { Link } from "react-router-dom";

const SettingsInfo = () => {
  return (
    <Container sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
            <Avatar
              src="https://via.placeholder.com/150" // Aquí podrías poner una imagen tuya
              alt="Bryan Felipe Muñoz Molina"
              sx={{ width: 150, height: 150, mx: "auto" }}
            />
            <Typography variant="h5" sx={{ mt: 2 }}>
              Bryan Felipe Muñoz Molina
            </Typography>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography variant="h6">Contacto</Typography>
            <Box sx={{ mt: 1 }}>
              <Button
                startIcon={<Email />}
                color="primary"
                component="a"
                href="mailto:bfmumo@gmail.com"
              >
                bfmumo@gmail.com
              </Button>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6">Redes y Sitio Web</Typography>
              <Box sx={{ mt: 1 }}>
                <Button
                  startIcon={<GitHub />}
                  color="inherit"
                  component="a"
                  href="https://github.com/redflox"
                  target="_blank"
                >
                  GitHub: redflox
                </Button>
              </Box>
              <Box sx={{ mt: 1 }}>
                <Button
                  startIcon={<Language />}
                  color="inherit"
                  component="a"
                  href="https://redflox.com"
                  target="_blank"
                >
                  Página Web: redflox.com
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Acerca de la Configuración</Typography>
          <Typography sx={{ mt: 2 }}>
            Bienvenido al apartado de configuración de ProgresApp - FLACOW. Aquí puedes agregar
            nuevos músculos y ejercicios que están relacionados con los músculos, navegando por las pestañas superiores.
          </Typography>
          <Typography sx={{ mt: 2 }}>
            El proyecto es de código abierto, y puedes encontrar el repositorio en el siguiente enlace:
          </Typography>
          <Button
            startIcon={<GitHub />}
            color="primary"
            component="a"
            href="https://github.com/redflox/progresapp-flacow"
            target="_blank"
            sx={{ mt: 1 }}
          >
            GitHub: ProgresApp - FLACOW
          </Button>
          <Typography sx={{ mt: 2 }}>
            Cualquier inquietud o sugerencia, no dudes en comunicarte al correo o puedes hacer una PR al repositorio.
          </Typography>
        </Box>
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Licencia</Typography>
          <Typography sx={{ mt: 2 }}>
            Este proyecto se encuentra bajo la Licencia Creative Commons BY-NC-SA 4.0, lo que significa que:
          </Typography>
          <ul>
            <li>Se puede compartir y utilizar libremente.</li>
            <li>Está prohibido el uso comercial del proyecto, es decir, no se puede lucrar ni comercializar sin permiso.</li>
            <li>Se puede contribuir y modificar el proyecto, pero las modificaciones deben tener el mismo tipo de licencia (sin ánimo de lucro).</li>
          </ul>
        </Box>
      </Paper>
    </Container>
  );
};

export default SettingsInfo;
