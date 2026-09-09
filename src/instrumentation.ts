export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initKeepAliveScheduler } = await import("@/lib/keepalive");
    initKeepAliveScheduler();
  }
}
