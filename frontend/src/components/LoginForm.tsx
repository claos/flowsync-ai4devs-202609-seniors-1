import { useState, type FormEvent } from "react";
import { apiClient, ApiError, NetworkError } from "../lib/apiClient";
import type { AuthResponse } from "../lib/types";

interface LoginFormProps {
  onLoginSuccess: (auth: AuthResponse) => void;
  onSwitchToSignup: () => void;
}

export default function LoginForm({
  onLoginSuccess,
  onSwitchToSignup,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      const auth = await apiClient.post<AuthResponse>("/api/v1/auth/login", {
        email: email.trim(),
        password,
      });
      onLoginSuccess(auth);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 400 || err.status === 401
            ? "Email o contraseña incorrectos."
            : (err.message ?? "Ocurrió un error inesperado."),
        );
      } else if (err instanceof NetworkError) {
        setError(err.message);
      } else {
        setError("Ocurrió un error inesperado.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h1>Iniciar sesión</h1>

      <label htmlFor="login-email">Email</label>
      <input
        id="login-email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
      />

      <label htmlFor="login-password">Contraseña</label>
      <input
        id="login-password"
        type="password"
        required
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="current-password"
      />

      {error && <p className="form-error">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Entrando…" : "Entrar"}
      </button>

      <p className="form-switch">
        ¿No tienes cuenta?{" "}
        <button type="button" onClick={onSwitchToSignup}>
          Regístrate
        </button>
      </p>
    </form>
  );
}
