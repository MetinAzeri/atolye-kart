import React from "react";
import { useAuth } from "../context/AuthContext.js";

const { useState } = React;

const ERROR_MESSAGES = {
  "Invalid login credentials": "E-posta veya şifre hatalı",
  "User already registered": "Bu e-posta zaten kayıtlı",
};

export function LoginForm({ onSuccess }) {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
      } else {
        await signup(email.trim(), password, username.trim());
      }
      onSuccess();
    } catch (err) {
      setError(ERROR_MESSAGES[err.message] ?? err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function toggleMode() {
    setMode((current) => (current === "login" ? "signup" : "login"));
    setError(null);
  }

  return React.createElement(
    "form",
    { className: "card-form", onSubmit: handleSubmit },
    React.createElement("input", {
      className: "card-form-input",
      type: "email",
      placeholder: "E-posta",
      value: email,
      onChange: (event) => setEmail(event.target.value),
      required: true,
    }),
    mode === "signup" &&
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
    error &&
      React.createElement(
        "p",
        { className: "card-form-message card-form-message--error" },
        error
      ),
    React.createElement(
      "button",
      { type: "submit", className: "card-button", disabled: submitting },
      submitting
        ? (mode === "login" ? "Giriş yapılıyor..." : "Kayıt olunuyor...")
        : (mode === "login" ? "Giriş Yap" : "Kayıt Ol")
    ),
    React.createElement(
      "button",
      { type: "button", className: "card-button card-button--secondary", onClick: toggleMode },
      mode === "login" ? "Hesabın yok mu? Kayıt Ol" : "Zaten hesabın var mı? Giriş Yap"
    )
  );
}
