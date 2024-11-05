import React from "react";
import Navbar from "../components/Navbar";
import ExerciseList from "../components/ExercisesList";
import {Button, Container} from '@mui/material';

export default function Dashboard() {
  return (
    <Container>
      <Navbar />
      <ExerciseList />
    </Container>
  );
}
