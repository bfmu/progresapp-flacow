import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
} from "@mui/material";
import {
  createLiftingHistorie,
  getAllLiftingHistoriesForExercise,
} from "../../api/lifting-histories";
import { enqueueSnackbar } from "notistack";
import Navbar from "../components/Navbar";
import { getExercise } from "../../api/exercises";

const LiftingHistoryPage = () => {
  const { exerciseId } = useParams();
  const [exercise, setExercise] = useState(null);
  const [weight, setWeight] = useState("");
  const [repeatNumber, setRepeatNumber] = useState("");
  const [liftingHistories, setLiftingHistories] = useState([]);
  

  const getNameOfExerciseForId = async (id: number) => {
    if(id){
        const response = await getExercise(id);
        setExercise(response.data)
    }else {
        setExercise(null)
    }
  };

  useEffect(() => {
    const fetchLiftingHistories = async () => {
      try {
        const response = await getAllLiftingHistoriesForExercise(+exerciseId);
        await getNameOfExerciseForId(+exerciseId);
        setLiftingHistories(response.data);
      } catch (error) {
        enqueueSnackbar("Error al obtener el historial de levantamiento.", {
          variant: "error",
        });
      }
    };

    fetchLiftingHistories();
  }, [exerciseId]);

  const handleAddHistory = async () => {
    if (!weight || !repeatNumber) {
      enqueueSnackbar("Por favor complete todos los campos.", {
        variant: "warning",
      });
      return;
    }

    const newHistory = {
      weight: parseFloat(weight),
      repeatNumber: parseInt(repeatNumber, 10),
      exerciseId: parseInt(exerciseId, 10),
    };

    try {
      await createLiftingHistorie(newHistory);
      enqueueSnackbar("Historial de levantamiento agregado con éxito.", {
        variant: "success",
      });
      setWeight("");
      setRepeatNumber("");
      // Actualizar la lista de historiales después de agregar
      const response = await getAllLiftingHistoriesForExercise(+exerciseId);
      setLiftingHistories(response.data);
    } catch (error) {
      enqueueSnackbar("Error al agregar el historial de levantamiento.", {
        variant: "error",
      });
    }
  };

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Historial: {exercise?.name}
        </Typography>

        <Box sx={{ mb: 4 }}>
          <TextField
            label="Peso (kg)"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <TextField
            label="Número de Repeticiones"
            type="number"
            value={repeatNumber}
            onChange={(e) => setRepeatNumber(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddHistory}
          >
            Agregar Historial
          </Button>
        </Box>

        <Typography variant="h5" gutterBottom>
          Historial de Levantamientos
        </Typography>
        <Grid container spacing={3}>
          {liftingHistories.map((history) => (
            <Grid item xs={12} sm={6} md={4} key={history.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">
                    Peso: {history.weight} kg
                  </Typography>
                  <Typography>
                    Número de Repeticiones: {history.repeatNumber}
                  </Typography>
                  <Typography>
                    Fecha: {new Date(history.date).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default LiftingHistoryPage;
