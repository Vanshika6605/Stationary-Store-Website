import React, { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, onRate, readOnly = false, size = 20 }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= displayRating ? '#f59e0b' : 'none'}
          color={star <= displayRating ? '#f59e0b' : '#d1d5db'}
          style={{
            cursor: readOnly ? 'default' : 'pointer',
            transition: 'transform 0.1s ease, color 0.1s ease'
          }}
          onMouseEnter={() => !readOnly && setHoverRating(star)}
          onMouseLeave={() => !readOnly && setHoverRating(0)}
          onClick={() => !readOnly && onRate && onRate(star)}
        />
      ))}
    </div>
  );
};

export default StarRating;
