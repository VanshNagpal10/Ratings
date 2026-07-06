// Interactive 1-5 star widget. When `onRate` is provided the stars are clickable.
export default function StarRating({ value = 0, onRate }) {
  const rounded = Math.round(value);
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`star ${n <= rounded ? 'filled' : ''}`}
          onClick={onRate ? () => onRate(n) : undefined}
          disabled={!onRate}
          title={onRate ? `Rate ${n}` : `${value}`}
          aria-label={`${n} star`}
        >
          ★
        </button>
      ))}
    </span>
  );
}
