export const dashboardConfig = {
  title: process.env.NEXT_PUBLIC_DASHBOARD_TITLE || "Status For Systems",
  description: process.env.NEXT_PUBLIC_DASHBOARD_DESCRIPTION || "Real-time status of all systems and services"
} as const; 