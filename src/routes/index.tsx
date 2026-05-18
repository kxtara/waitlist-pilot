import { createFileRoute, redirect } from "@tanstack/react-router";

export const baseUrl = import.meta.env.VITE_API_BASE_URL;


export const Route = createFileRoute("/")({
  beforeLoad: ({ location }) => {
    if(location.pathname === "/") {
      throw redirect({ 
        to: "/admin",
        replace: true,
      });
    }
  },
});
