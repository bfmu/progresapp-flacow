import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { registerRequest } from "../../api/auth";
import { Link } from "react-router-dom";

const SignupForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    try {
      // Aquí puedes agregar la lógica para enviar los datos al servidor
      console.log("Form data submitted:", formData);
      // Simulación de registro exitoso
      await registerRequest(formData.name, formData.email, formData.password);
      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: "You have successfully registered!",
      }).then(() => {
        navigate("/app/login");
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Authentication Failed",
        text: "Registration failed. Please try again.",
      });
    }
  };

  return (
    <section className="flex flex-col items-center pt-6">
      <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            Crear cuenta
          </h1>
          <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit}>
            <input
              className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
              type="text"
              name="name"
              id="name"
              placeholder="Nombre completo"
              autoComplete="email"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
              type="text"
              name="email"
              id="email"
              placeholder="Correo electronico"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
              type="password"
              name="password"
              id="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <input
              className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Create an account
            </button>
            <p className="text-sm font-light text-gray-500 dark:text-gray-400">
              ¿Ya tienes una cuenta?{" "}
              <Link
                to="/app/login"
                className="font-medium text-blue-600 hover:underline dark:text-blue-500"
              >
                Inicia sesión aquí.
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignupForm;
