import React, { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const InteractiveStarRating = ({ rating, onChange }) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={`w-6 h-6 ${
              star <= (hoveredRating || rating)
                ? 'text-amber-400 fill-amber-400'
                : 'text-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewForm = ({ projectId, revieweeId, onSubmit }) => {
  const [ratings, setRatings] = useState({
    overall: 0,
    communication: 0,
    quality: 0,
    timeliness: 0
  });
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (category, value) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!ratings.overall || !ratings.communication || !ratings.quality || !ratings.timeliness) {
      toast.error('Please provide all ratings');
      return;
    }
    
    if (!comment.trim()) {
      toast.error('Please provide a comment');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({ 
        projectId, 
        revieweeId, 
        ratings, 
        comment 
      });
      toast.success('Review submitted successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingCategories = [
    { key: 'overall', label: 'Overall Experience' },
    { key: 'communication', label: 'Communication' },
    { key: 'quality', label: 'Quality of Work' },
    { key: 'timeliness', label: 'Timeliness' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 tracking-tight">Leave a Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4 bg-gray-50/50 p-6 rounded-xl border border-gray-50">
          {ratingCategories.map(({ key, label }) => (
            <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-sm font-medium text-gray-700">{label}</label>
              <InteractiveStarRating 
                rating={ratings[key]} 
                onChange={(val) => handleRatingChange(key, val)} 
              />
            </div>
          ))}
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Feedback
          </label>
          <textarea
            id="comment"
            rows={5}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience working on this project..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 resize-none transition-shadow"
            required
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-3 font-medium transition-colors disabled:bg-indigo-400 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;
