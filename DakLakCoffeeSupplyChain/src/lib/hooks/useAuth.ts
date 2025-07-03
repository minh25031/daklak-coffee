export function useAuth() {
  if (typeof window === "undefined") return { user: null };

  const id = localStorage.getItem("user_id");
  const role = localStorage.getItem("user_role");
  const email = localStorage.getItem("email");

  if (!id || !role) return { user: null };

  return {
    user: {
      id,
      role,
      email,
    },
  };
}
