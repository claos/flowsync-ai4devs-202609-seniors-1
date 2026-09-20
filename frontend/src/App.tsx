import { useEffect, useState } from "react";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";
import ProfileView from "./components/ProfileView";
import { apiClient, ApiError } from "./lib/apiClient";
import { clearToken, getToken, saveToken } from "./lib/auth";
import type { AuthResponse, User } from "./lib/types";
import "./App.css";

type View = "login" | "signup";

interface Session {
  user: User;
  token: string;
}

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [view, setView] = useState<View>("login");
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setBootstrapping(false);
      return;
    }

    apiClient
      .get<User>("/api/v1/account/profile", token)
      .then((user) => setSession({ user, token }))
      .catch((err) => {
        // Solo el backend confirmando que el token ya no es válido debe cerrar
        // la sesión; un fallo de red o un 5xx no debe expulsar a un usuario
        // con una sesión legítima.
        if (
          err instanceof ApiError &&
          (err.status === 401 || err.status === 403)
        ) {
          clearToken();
        }
      })
      .finally(() => setBootstrapping(false));
  }, []);

  function handleAuthSuccess(auth: AuthResponse) {
    saveToken(auth.token);
    setSession({ user: auth.user, token: auth.token });
  }

  function handleLogout() {
    clearToken();
    setSession(null);
    setView("login");
  }

  if (bootstrapping) return null;

  if (session) {
    return (
      <ProfileView
        token={session.token}
        initialUser={session.user}
        onLogout={handleLogout}
      />
    );
  }

  return view === "login" ? (
    <LoginForm
      onLoginSuccess={handleAuthSuccess}
      onSwitchToSignup={() => setView("signup")}
    />
  ) : (
    <SignupForm
      onSignupSuccess={handleAuthSuccess}
      onSwitchToLogin={() => setView("login")}
    />
  );
}

export default App;
