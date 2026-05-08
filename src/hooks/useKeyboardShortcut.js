import { useEffect } from "react";

/**
 * A custom hook to handle keyboard shortcuts.
 * @param {string} key - The key to listen for (e.g., 's', 'n', '/', 'p')
 * @param {Function} callback - The function to call when the shortcut is triggered
 * @param {Object} options - Options object
 * @param {boolean} options.global - If false, the shortcut won't trigger if the user is typing in an input/textarea. Defaults to true.
 * @param {boolean} options.preventDefault - If true, prevents the default browser action. Defaults to true.
 */
export function useKeyboardShortcut(key, callback, options = {}) {
  const { global = true, preventDefault = true } = options;

  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't trigger if user is typing in an input/textarea and global is false
      if (
        !global &&
        (event.target.tagName === "INPUT" ||
          event.target.tagName === "TEXTAREA" ||
          event.target.isContentEditable)
      ) {
        return;
      }

      // Check if Command (Mac) or Control (Windows/Linux) is pressed
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === key.toLowerCase()) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback(event);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [key, callback, global, preventDefault]);
}
