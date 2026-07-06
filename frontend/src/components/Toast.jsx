import { useEffect } from 'react';

// A small success popup that auto-dismisses after a few seconds.
export default function Toast({ message, onDone, duration = 3000 }) {
  useEffect(() => {
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [message, duration, onDone]);

  return (
    <div className="toast" role="status">
      <span className="toast-check">✓</span>
      <span>{message}</span>
    </div>
  );
}
