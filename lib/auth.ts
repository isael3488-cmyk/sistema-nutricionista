export type UserRole = "admin" | "patient";

export function getUserRole(roleValue: unknown): UserRole {
  return roleValue === "patient" ? "patient" : "admin";
}

export function getRoleHomeRoute(role: UserRole) {
  return role === "patient" ? "/patient" : "/dashboard";
}

export function getRoleFallbackRoute(role: UserRole) {
  return role === "patient" ? "/dashboard" : "/patient";
}
