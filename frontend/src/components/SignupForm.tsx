import { useState, type FormEvent } from "react";
import { apiClient, ApiError, NetworkError } from "../lib/apiClient";
import type { AuthResponse } from "../lib/types";

interface SignupFormProps {
  onSignupSuccess: (auth: AuthResponse) => void;
  onSwitchToLogin: () => void;
}

export default function SignupForm({
  onSignupSuccess,
  onSwitchToLogin,
}: SignupFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setError(null);

    if (password !== passwordConfirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const trimmedFullName = fullName.trim();
    const trimmedEmail = email.trim();

    setSubmitting(true);
    try {
      const auth = await apiClient.post<AuthResponse>("/api/v1/auth/signup", {
        fullName: trimmedFullName || null,
        email: trimmedEmail,
        password,
        passwordConfirmation,
      });
      onSignupSuccess(auth);
    } catch (err) {
      if (err instanceof ApiError) {
        const emailTaken = err.errors?.some(
          (e) => e.field === "email" && e.rule === "database.unique",
        );
        setError(
          emailTaken
            ? "Este email ya está registrado."
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
      <h1>Crear cuenta</h1>

      <label htmlFor="signup-full-name">Nombre completo (opcional)</label>
      <input
        id="signup-full-name"
        type="text"
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        autoComplete="name"
      />

      <label htmlFor="signup-email">Email</label>
      <input
        id="signup-email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
      />

      <label htmlFor="signup-password">Contraseña</label>
      <input
        id="signup-password"
        type="password"
        required
        minLength={8}
        maxLength={32}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        autoComplete="new-password"
      />

      <label htmlFor="signup-password-confirmation">Confirmar contraseña</label>
      <input
        id="signup-password-confirmation"
        type="password"
        required
        minLength={8}
        maxLength={32}
        value={passwordConfirmation}
        onChange={(event) => setPasswordConfirmation(event.target.value)}
        autoComplete="new-password"
      />

      {error && <p className="form-error">{error}</p>}

      <button type="submit" disabled={submitting}>
        {submitting ? "Creando cuenta…" : "Crear cuenta"}
      </button>

      <p className="form-switch">
        ¿Ya tienes cuenta?{" "}
        <button type="button" onClick={onSwitchToLogin}>
          Inicia sesión
        </button>
      </p>
    </form>
  );
}
