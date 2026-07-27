import React from "https://esm.sh/react@18";
import { useAuth } from "../context/AuthContext.js";

const { useState } = React;

export function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    login(username.trim());
    onSuccess();
  }

  return React.createElement(
    "form",
    { className: "card-form", onSubmit: handleSubmit },
    React.createElement("input", {
      className: "card-form-input",
      type: "text",
      placeholder: "Kullanıcı Adı",
      value: username,
      onChange: (event) => setUsername(event.target.value),
      required: true,
    }),
    React.createElement("input", {
      className: "card-form-input",
      type: "password",
      placeholder: "Şifre",
      value: password,
      onChange: (event) => setPassword(event.target.value),
      required: true,
    }),
    React.createElement("button", { type: "submit", className: "card-button" }, "Giriş Yap")
  );
}
