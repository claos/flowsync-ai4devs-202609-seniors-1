import { useEffect, useState } from "react";
import { apiClient } from "../lib/apiClient";
import type { User } from "../lib/types";

interface ProfileViewProps {
  token: string;
  initialUser: User;
  onLogout: () => void;
  onSessionExpired: () => void;
}

export default function ProfileView({
  token,
  initialUser,
  onLogout,
  onSessionExpired,
}: ProfileViewProps) {
  const [user, setUser] = useState(initialUser);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    apiClient
      .get<User>("/api/v1/account/profile", token)
      .then((freshUser) => {
        if (!cancelled) setUser(freshUser);
      })
      .catch(() => {
        if (!cancelled) onSessionExpired();
      });

    return () => {
      cancelled = true;
    };
  }, [token, onSessionExpired]);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await apiClient.post("/api/v1/account/logout", undefined, token);
    } catch {
      // logout optimista: si falla por red, igual cerramos la sesión localmente
    } finally {
      onLogout();
    }
  }

  return (
    <div className="profile-view">
      <div className="profile-avatar">{user.initials}</div>
      <h1>{user.fullName ?? user.email}</h1>
      <p>{user.email}</p>
      <button type="button" onClick={handleLogout} disabled={loggingOut}>
        {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
      </button>
    </div>
  );
}
