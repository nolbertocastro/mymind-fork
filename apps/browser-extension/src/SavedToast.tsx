import { useEffect } from "react";

import Logo from "./Logo";

/**
 * Ambient save confirmation, mymind-style.
 *
 * Shows a thin progress bar that drains over 1.5s, then closes the popup.
 * No actions, no undo, no bookmark title — the save happens silently,
 * the confirmation appears calmly, and the popup dismisses itself.
 *
 * All post-save enrichment (tags, notes, lists) is handled server-side —
 * DeepSeek auto-tags via the inference worker, so the extension has
 * nothing to prompt the user for.
 */
const AUTO_CLOSE_MS = 1500;

export default function SavedToast() {
  useEffect(() => {
    const t = setTimeout(() => {
      window.close();
    }, AUTO_CLOSE_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="krystal-saved-toast relative flex flex-col items-center justify-center gap-4 py-6">
      <div
        aria-hidden
        className="krystal-progress-bar absolute left-0 right-0 top-0 h-[3px] origin-left bg-primary"
      />
      <Logo />
      <p className="text-lg text-foreground">Saved to Krystal</p>
    </div>
  );
}
