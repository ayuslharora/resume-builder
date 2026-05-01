const CHUNK_LOAD_PATTERNS = [
  /failed to fetch dynamically imported module/i,
  /importing a module script failed/i,
  /loading chunk [\w-]+ failed/i,
  /chunkloaderror/i,
];

function extractErrorMessage(error) {
  if (!error) {
    return "Unknown application error";
  }

  if (typeof error === "string") {
    return error;
  }

  if (error instanceof Error && typeof error.message === "string") {
    return error.message;
  }

  if (typeof error.statusText === "string" && error.statusText) {
    return error.statusText;
  }

  if (typeof error.data === "string" && error.data) {
    return error.data;
  }

  if (typeof error.message === "string" && error.message) {
    return error.message;
  }

  return "Unknown application error";
}

function isChunkLoadError(message) {
  return CHUNK_LOAD_PATTERNS.some((pattern) => pattern.test(message));
}

export function classifyAppError(error) {
  const detail = extractErrorMessage(error);

  if (isChunkLoadError(detail)) {
    return {
      kind: "chunk-load",
      title: "The app updated while you were using it",
      message: "A newer version is available. Refresh the app to load the latest files and continue.",
      detail,
      canRetry: true,
    };
  }

  return {
    kind: "generic",
    title: "Unexpected application error",
    message: "Something went wrong while rendering this screen. Try reloading the app or going back to a stable page.",
    detail,
    canRetry: true,
  };
}
