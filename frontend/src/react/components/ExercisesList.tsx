import { useEffect, useState } from "react";
import { getAllExercises } from "../../api/exercises";
import Swal from "sweetalert2";
import {
  TextField,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
} from "@mui/material";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import { IconButton } from "@mui/material";

const ExerciseList = () => {
  const [exercises, setExercises] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const data = await getAllExercises();
        setExercises(data);
      } catch (error) {
        console.error("Error fetching exercises", error);
      }
    };
    fetchExercises();
  }, []);

  const filteredExercises = exercises.filter((exercise) =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCardClick = (exercise) => {
    Swal.fire({
      icon: "info",
      title: exercise.name,
      text: exercise.description,
    });
  };

  return (
    <section
      style={{
        paddingTop: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "600px" }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Buscar ejercicio..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: "16px" }}
        />
        <Grid container spacing={3}>
          {filteredExercises.map((exercise) => (
            <Grid item xs={12} sm={12} key={exercise.id}>
              <Card
                onClick={() => handleCardClick(exercise)}
                style={{ cursor: "pointer" }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", gap: 2}}>
                    <Box sx={{flex: 1}}>
                      <Typography variant="h6" component="h3">
                        {exercise?.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {exercise?.muscle?.name}
                      </Typography>
                    </Box>
                    <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                      <IconButton>
                        <FitnessCenterIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </div>
    </section>
  );
};

export default ExerciseList;
