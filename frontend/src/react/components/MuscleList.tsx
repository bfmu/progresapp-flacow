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
} from "@mui/material";
import { Add, Edit, Delete } from "@mui/icons-material";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  createMuscle,
  deleteMuscle,
  getAllMuscles,
  updateMuscle,
} from "../../api/muscles";

const MuscleList = () => {
  const [muscles, setMuscles] = useState([]);
  const [filteredMuscles, setFilteredMuscles] = useState([]);
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchMuscles();
  }, []);

  useEffect(() => {
    setFilteredMuscles(
      muscles.filter((muscle) =>
        muscle.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, muscles]);

  const fetchMuscles = async () => {
    try {
      const response = await getAllMuscles();
      setMuscles(response.data);
    } catch (error) {
      if (error.response && error.response.status === 403) {
        enqueueSnackbar(
          "No tienes permiso para acceder a la lista de músculos.",
          {
            variant: "warning",
          }
        );
      } else {
        enqueueSnackbar("Error al obtener la lista de músculos", {
          variant: "error",
        });
      }
    }
  };

  const handleOpen = (muscle = null) => {
    setSelectedMuscle(muscle);
    formik.resetForm();
    formik.setValues(muscle ? { name: muscle.name } : { name: "" });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedMuscle(null);
  };

  const formik = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("El nombre es requerido"),
    }),
    onSubmit: async (values) => {
      try {
        if (selectedMuscle) {
          await updateMuscle(selectedMuscle.id, values);
          enqueueSnackbar("Músculo actualizado con éxito", {
            variant: "success",
          });
        } else {
          await createMuscle(values);
          enqueueSnackbar("Músculo agregado con éxito", { variant: "success" });
        }
        fetchMuscles();
        handleClose();
      } catch (error) {
        console.log(error);
        enqueueSnackbar("Error al guardar el músculo", { variant: "error" });
      }
    },
  });

  const handleDelete = async (id) => {
    try {
      await deleteMuscle(id);
      enqueueSnackbar("Músculo eliminado con éxito", { variant: "success" });
      fetchMuscles();
    } catch (error) {
      enqueueSnackbar("Error al eliminar el músculo", { variant: "error" });
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
      <Typography variant="h4" gutterBottom>
        Administración de Músculos
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Add />}
        onClick={() => handleOpen()}
      >
        Agregar Músculo
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
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredMuscles
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((muscle) => (
                <TableRow key={muscle.id}>
                  <TableCell>{muscle.name}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="primary"
                      onClick={() => handleOpen(muscle)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleDelete(muscle.id)}
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
          count={filteredMuscles.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>
          {selectedMuscle ? "Editar Músculo" : "Agregar Músculo"}
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
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="primary">
              Cancelar
            </Button>
            <Button type="submit" color="primary">
              {selectedMuscle ? "Actualizar" : "Agregar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default MuscleList;
