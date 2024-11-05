import React from "react";
import Navbar from "../components/Navbar";
import ExerciseListDashboard from "../components/ExercisesListDashboard";
import { Button, Container } from "@mui/material";

export default function Dashboard() {
  return (
    <>
      <Navbar />
      <Container>
        <ExerciseListDashboard />
      </Container>
    </>
  );
}
