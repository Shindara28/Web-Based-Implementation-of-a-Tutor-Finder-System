import React from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ value, onChange, readOnly = false }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(n)}
          className={readOnly ? 'cursor-default' : 'cursor-pointer'}
        >
          <Star
            size={20}
            className={n <= value ? 'text-accent fill-accent' : 'text-gray-300'}
          />
        </button>
      ))}
    </div>
  );
}
