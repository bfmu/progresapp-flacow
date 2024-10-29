import React from "react";
import { loginRequest } from "../../api/auth";

export default function Login() {
  const handleSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = (e.currentTarget.elements[0] as HTMLInputElement).value;
    const password = (e.currentTarget.elements[1] as HTMLInputElement).value;

    const res = await loginRequest(email, password)
    console.log(res);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="email" placeholder="correo@example.com" />
      <input type="password" placeholder="******" />
      <button>Entrar</button>
    </form>
  );
}
