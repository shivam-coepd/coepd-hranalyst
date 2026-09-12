import "server-only";

type LogLevel = "info" | "warn" | "error";

type Metadata = Record<string, unknown>;

function write(level: LogLevel, message: string, metadata: Metadata = {}) {
  const payload = {
    timestamp: new Date().toISOString(),

    level,

    service: "hranalyst-placement",

    environment: process.env.NODE_ENV,

    message,

    ...metadata,
  };

  const output = JSON.stringify(payload);

  switch (level) {
    case "error":
      console.error(output);
      break;

    case "warn":
      console.warn(output);
      break;

    default:
      console.log(output);
  }
}

export const logger = {
  info(message: string, metadata?: Metadata) {
    write("info", message, metadata);
  },

  warn(message: string, metadata?: Metadata) {
    write("warn", message, metadata);
  },

  error(message: string, metadata?: Metadata) {
    write("error", message, metadata);
  },
};
