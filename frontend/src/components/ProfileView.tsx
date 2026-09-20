import { useState } from "react";
import { apiClient } from "../lib/apiClient";
import type { User } from "../lib/types";

interface ProfileViewProps {
  token: string;
  initialUser: User;
  onLogout: () => void;
}

export default function ProfileView({
  token,
  initialUser: user,
  onLogout,
}: ProfileViewProps) {
  const [loggingOut, setLoggingOut] = useState(false);

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
