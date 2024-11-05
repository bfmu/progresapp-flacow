import { useEffect, useState } from "react";
import {
  Button,
  Container,
  IconButton,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Autocomplete,
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import { useSnackbar } from "notistack";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  createExercises,
  deleteExercises,
  getAllExercises,
  updateExercises,
} from "../../api/exercises";
import { getAllMuscles } from "../../api/muscles";

const ExerciseList = () => {
  const [exercises, setExercises] = useState([]);
  const [filteredExercises, setFilteredExercises] = useState([]);
  const [muscles, setMuscles] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchExercises();
    fetchMuscles();
  }, []);

  useEffect(() => {
    setFilteredExercises(
      exercises.filter((exercise) =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, exercises]);

  const fetchExercises = async () => {
    try {
      const response = await getAllExercises();
      setExercises(response.data);
    } catch (error) {
      enqueueSnackbar("Error al obtener la lista de ejercicios", {
        variant: "error",
      });
    }
  };

  const fetchMuscles = async () => {
    try {
      const response = await getAllMuscles();
      setMuscles(response.data);
    } catch (error) {
      enqueueSnackbar("Error al obtener la lista de músculos", {
        variant: "error",
      });
    }
  };

  const handleOpen = (exercise = null) => {
    setSelectedExercise(exercise);
    formik.resetForm();
    formik.setValues(
      exercise
        ? { name: exercise.name, description: exercise.description, muscleId: exercise.muscle?.id }
        : { name: "", description: "", muscleId: "" }
    );
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedExercise(null);
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      muscleId: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("El nombre es requerido"),
      description: Yup.string().required("La descripción es requerida"),
      muscleId: Yup.string().required("El músculo es requerido"),
    }),
    onSubmit: async (values) => {
      try {
        if (selectedExercise) {
          await updateExercises(selectedExercise.id, values);
          enqueueSnackbar("Ejercicio actualizado con éxito", { variant: "success" });
        } else {
          await createExercises(values);
          enqueueSnackbar("Ejercicio agregado con éxito", { variant: "success" });
        }
        fetchExercises();
        handleClose();
      } catch (error) {
        enqueueSnackbar("Error al guardar el ejercicio", { variant: "error" });
      }
    },
  });

  const handleDelete = async (id) => {
    try {
      await deleteExercises(id);
      enqueueSnackbar("Ejercicio eliminado con éxito", { variant: "success" });
      fetchExercises();
    } catch (error) {
      enqueueSnackbar("Error al eliminar el ejercicio", { variant: "error" });
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <Container>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        onClick={() => handleOpen()}
      >
        Agregar Ejercicio
      </Button>
      <TextField
        label="Buscar"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <TableContainer component={Paper} style={{ marginTop: "16px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Músculo</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredExercises
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((exercise) => (
                <TableRow key={exercise.id}>
                  <TableCell>{exercise.name}</TableCell>
                  <TableCell>{exercise.description}</TableCell>
                  <TableCell>
                    {muscles.find((muscle) => muscle.id === exercise.muscle.id)?.name}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => handleOpen(exercise)}>
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleDelete(exercise.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredExercises.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedExercise ? "Editar Ejercicio" : "Agregar Ejercicio"}
        </DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="name"
              label="Nombre"
              type="text"
              fullWidth
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <TextField
              margin="dense"
              name="description"
              label="Descripción"
              type="text"
              fullWidth
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />
            <Autocomplete
              options={muscles}
              getOptionLabel={(option) => option.name}
              value={muscles.find((muscle) => muscle.id === formik.values.muscleId) || null}
              onChange={(event, newValue) => {
                formik.setFieldValue("muscleId", newValue?.id || "");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Músculo"
                  margin="dense"
                  fullWidth
                  error={formik.touched.muscleId && Boolean(formik.errors.muscleId)}
                  helperText={formik.touched.muscleId && formik.errors.muscleId}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancelar
            </Button>
            <Button type="submit" color="primary">
              {selectedExercise ? "Actualizar" : "Agregar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default ExerciseList;
