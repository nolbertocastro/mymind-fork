import { useEffect } from "react";

/**
 * Ambient save confirmation, mymind-style.
 *
 * Renders a dark card with a subtle gradient border, a slowly-pulsing
 * ellipse mark, and centered muted-white body copy. During the save
 * request we show "One moment. I'm saving this for you." — once the
 * bookmark resolves we swap to "Saved to Krystal." and let the popup
 * dismiss itself after AUTO_CLOSE_MS.
 *
 * No wordmark, no logo, no progress bar, no buttons — the pulsing
 * mark IS the receipt.
 */
const AUTO_CLOSE_MS = 2500;

interface SavedToastProps {
  /** When true, this is the post-save confirmation and the popup will auto-close. */
  saved?: boolean;
}

export default function SavedToast({ saved = false }: SavedToastProps) {
  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => {
      window.close();
    }, AUTO_CLOSE_MS);
    return () => clearTimeout(t);
  }, [saved]);

  return (
    <div className="krystal-toast-shell">
      <div className="krystal-toast-card">
        <div
          className="krystal-toast-ellipse"
          aria-hidden
        />
        {saved ? (
          <p className="krystal-toast-copy">Saved to Krystal.</p>
        ) : (
          <p className="krystal-toast-copy">
            One moment.
            <br />
            I&rsquo;m saving this for you.
          </p>
        )}
      </div>
    </div>
  );
}
