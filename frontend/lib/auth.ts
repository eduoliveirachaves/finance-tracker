import { useQuery, useQueryClient } from "@tanstack/react-query";
import { get, post } from "./api";
import type { User } from "./types";

export function useCurrentUser() {
  return useQuery<User>({
    queryKey: ["currentUser"],
    queryFn: () => get<User>("/auth/me"),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export async function logout(): Promise<void> {
  await post("/auth/logout");
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
}

export async function refreshToken(): Promise<void> {
  await post("/auth/refresh");
}
