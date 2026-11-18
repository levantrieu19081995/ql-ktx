export function getWebSocketBaseUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL?.trim();
  const browserOrigin =
    typeof window !== "undefined" ? window.location.origin : "";

  if (!configuredUrl) {
    return browserOrigin;
  }

  if (
    typeof window !== "undefined" &&
    window.location.protocol === "https:" &&
    configuredUrl.startsWith("http://")
  ) {
    throw new Error(
      "NEXT_PUBLIC_WEBSOCKET_URL must use HTTPS when the application uses HTTPS",
    );
  }

  return configuredUrl.replace(/\/+$/, "");
}

export function buildSockJsUrl(servicePath: string): string {
  const baseUrl = getWebSocketBaseUrl();
  const normalizedPath = `/${servicePath.replace(/^\/+|\/+$/g, "")}/stomp`;

  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}
