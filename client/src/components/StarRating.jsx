import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, size = 'md', interactive = false, onChange }) => {
  const stars = [1, 2, 3, 4, 5];
  const sizeMap = { sm: 16, md: 20, lg: 24 };

  return (
    <div className="flex gap-1">
      {stars.map((star) => (
        <Star
          key={star}
          size={sizeMap[size]}
          className={`${star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} ${interactive ? 'cursor-pointer hover:text-yellow-500' : ''}`}
          onClick={() => interactive && onChange && onChange(star)}
        />
      ))}
    </div>
  );
};

export default StarRating;
