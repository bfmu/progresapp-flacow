import React, { useEffect, useState } from "react";
import { loginRequest } from "../../api/auth";
import { useAuthStore } from "../../store/auth";
import { userInfoRequest } from "../../api/users";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

export default function Login() {
  const { setToken, token } = useAuthStore((state) => state);
  const setProfile = useAuthStore((store) => store.setProfile);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (e.currentTarget.elements[0] as HTMLInputElement).value;
    const password = (e.currentTarget.elements[1] as HTMLInputElement).value;

    const res = await loginRequest(email, password);

    if (res.status >= 200 && res.status < 300) {
      const token = res.data.accessToken;
      setToken(token);
      const infoUser = await userInfoRequest();
      setProfile(infoUser);
    } else {
      if (res.response && res.response.status === 400) {
        setErrorMessage("Error en el inicio de sesión");
      }
    }
  };

  useEffect(() => {
    if (token) {
      navigate("/app/dashboard");
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <a href="/">
            {/* Logo */}
            <img
              src="https://storage.googleapis.com/devitary-image-host.appspot.com/15846435184459982716-LogoMakr_7POjrN.png"
              className="w-32 mx-auto"
            />
          </a>
          <div className="mt-12 flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-extrabold text-left">Identificate</h1>
            <div className="w-full flex-1 mt-8">
              <div className="mx-auto max-w-xs">
                <form onSubmit={handleSubmit}>
                  <input
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                    type="email"
                    name="email"
                    placeholder="Correo"
                    autoComplete="email"
                  />
                  <input
                    className="w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-5"
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    autoComplete="current-password"
                  />

                  <button
                    type="submit"
                    className="mt-5 w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                    Entrar
                  </button>
                </form>

                {errorMessage ? (
                  <p className="mt-6 text-xs text-red-600 text-center">
                    {errorMessage}
                  </p>
                ) : (
                  <></>
                )}

                <p className="mt-4 text-sm font-light text-gray-500 dark:text-gray-400">
                  ¿No tienes una cuenta?{" "}
                  <Link
                    to="/app/register"
                    className="font-medium text-blue-600 hover:underline dark:text-blue-500"
                  >
                    Regístrate aquí.
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
          <div
            className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat"
            style={{
              backgroundImage:
                "url('https://storage.googleapis.com/devitary-image-host.appspot.com/15848031292911696601-undraw_designer_life_w96d.svg')",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}
