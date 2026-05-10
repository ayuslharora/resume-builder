const GROQ_API_KEYS = [
  import.meta.env.VITE_GROQ_API_KEY,
  import.meta.env.VITE_GROQ_API_KEY_1,
  import.meta.env.VITE_GROQ_API_KEY_2,
  import.meta.env.VITE_GROQ_API_KEY_3,
  import.meta.env.VITE_GROQ_API_KEY_4,
].filter(Boolean);

const DEFAULT_COOLDOWN_MS = 60 * 1000;

const keyState = GROQ_API_KEYS.map(() => ({
  available: true,
  cooldownUntil: null,
  invalid: false,
}));

let currentIndex = 0;
let lastUsedIndex = 0;

function getNextAvailableKeyIndex(startIndex = 0) {
  const now = Date.now();

  for (let i = 0; i < GROQ_API_KEYS.length; i++) {
    const index = (startIndex + i) % GROQ_API_KEYS.length;
    const state = keyState[index];

    if (state.invalid) continue;

    if (state.available || (state.cooldownUntil && now >= state.cooldownUntil)) {
      state.available = true;
      state.cooldownUntil = null;
      return index;
    }
  }

  return -1;
}

export function getNextGroqKey() {
  if (GROQ_API_KEYS.length === 0) {
    throw new Error("No Groq API keys configured");
  }

  const index = getNextAvailableKeyIndex(currentIndex);

  if (index === -1) {
    const allInvalid = keyState.every(state => state.invalid);
    if (allInvalid) {
      throw new Error("All API keys are invalid");
    }

    const earliestCooldown = keyState.reduce((min, state) => {
      if (state.cooldownUntil && (!min || state.cooldownUntil < min)) {
        return state.cooldownUntil;
      }
      return min;
    }, null);

    const waitTime = earliestCooldown ? earliestCooldown - Date.now() : 0;
    throw new Error(`All API keys rate-limited. Retry after ${Math.ceil(waitTime / 1000)}s`);
  }

  lastUsedIndex = index;
  currentIndex = (index + 1) % GROQ_API_KEYS.length;
  return GROQ_API_KEYS[index];
}

export function markKeyRateLimited(retryAfterSeconds = 60) {
  const cooldownMs = retryAfterSeconds * 1000 || DEFAULT_COOLDOWN_MS;

  if (keyState[lastUsedIndex]) {
    keyState[lastUsedIndex] = {
      available: false,
      cooldownUntil: Date.now() + cooldownMs,
      invalid: false,
    };
  }
}

export function markKeyInvalid() {
  if (keyState[lastUsedIndex]) {
    keyState[lastUsedIndex] = {
      available: false,
      cooldownUntil: null,
      invalid: true,
    };
  }
}

export function getGroqKeyCount() {
  return GROQ_API_KEYS.length;
}

export function isRateLimitError(status) {
  return status === 429;
}

export function getKeyStates() {
  return keyState.map((state, i) => ({
    index: i,
    available: state.available,
    cooldownUntil: state.cooldownUntil,
    invalid: state.invalid,
    keyPreview: GROQ_API_KEYS[i] ? `${GROQ_API_KEYS[i].slice(0, 8)}...` : null,
  }));
}

export function resetAllKeyStates() {
  for (let i = 0; i < keyState.length; i++) {
    keyState[i] = { available: true, cooldownUntil: null, invalid: false };
  }
  currentIndex = 0;
  lastUsedIndex = 0;
}