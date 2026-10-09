type AuthEventType = "logout" | "session_expired" | "token_refresh";

type AuthEventCallback = (payload?: unknown) => void;

class AuthEventBus {
  private listeners: Record<string, AuthEventCallback[]> = {};

  subscribe(event: AuthEventType, callback: AuthEventCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback,
      );
    };
  }

  publish(event: AuthEventType, payload?: unknown) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach((callback) => callback(payload));
  }
}

export const authEventBus = new AuthEventBus();
