type DeployDebugPayload = {
  runId: string;
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
};

export function logDeployDebug(payload: DeployDebugPayload) {
  const body = {
    sessionId: "a73999",
    timestamp: Date.now(),
    ...payload,
  };
  const encoded = encodeURIComponent(JSON.stringify(body));
  if (typeof Image !== "undefined") {
    const img = new Image();
    img.src = `http://localhost:3000/api/deploy-debug-log?payload=${encoded}&t=${Date.now()}`;
  }

  fetch("http://localhost:3000/api/deploy-debug-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => {});
}
