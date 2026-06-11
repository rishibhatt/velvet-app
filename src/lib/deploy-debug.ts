type DeployDebugPayload = {
  runId: string;
  hypothesisId: string;
  location: string;
  message: string;
  data?: Record<string, unknown>;
};

export function logDeployDebug(payload: DeployDebugPayload) {
  fetch("http://localhost:3000/api/deploy-debug-log", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "a73999",
      timestamp: Date.now(),
      ...payload,
    }),
  }).catch(() => {});
}
