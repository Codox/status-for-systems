/**
 * Dashboard configuration utilities
 * Centralized functions to get dashboard configuration with default fallbacks
 */

const DEFAULT_DASHBOARD_TITLE = 'System Status Dashboard';
const DEFAULT_DASHBOARD_DESCRIPTION = 'Real-time monitoring of all services and systems';
const DEFAULT_BASE_URL = 'http://localhost:3000';

/**
 * Get the dashboard title from environment variables or return default
 * @returns {string} Dashboard title
 */
export function getDashboardTitle(): string {
  return process.env.NEXT_PUBLIC_DASHBOARD_TITLE || DEFAULT_DASHBOARD_TITLE;
}

/**
 * Get the dashboard description from environment variables or return default
 * @returns {string} Dashboard description
 */
export function getDashboardDescription(): string {
  return process.env.NEXT_PUBLIC_DASHBOARD_DESCRIPTION || DEFAULT_DASHBOARD_DESCRIPTION;
}

/**
 * Get the base URL from environment variables or return default
 * @returns {string} Base URL
 */
export function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || DEFAULT_BASE_URL;
}
