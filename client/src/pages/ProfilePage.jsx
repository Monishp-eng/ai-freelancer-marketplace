import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Calendar, Star, Briefcase, MessageSquare, CheckCircle } from 'lucide-react';
import { Users, Reviews } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import SkillTags from '../components/SkillTags';
import StarRating from '../components/StarRating';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const isOwnProfile = currentUser && currentUser._id === id;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const profileRes = await Users.getUserById(id);
        // Auto-unwrapped: res.data = { ...user, reviews }
        const data = profileRes.data;
        setProfile(data);
        setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
        setError(false);
      } catch (err) {
        setError(true);
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [id]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h2>
        <p className="text-gray-600 mb-8">The user you're looking for doesn't exist or has been removed.</p>
        <Link to="/" className="inline-flex bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 font-medium transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  const joinDate = new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold flex-shrink-0 overflow-hidden">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2 justify-center md:justify-start">
                {profile.name}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
              </h1>
              {profile.role === 'freelancer' && profile.title && (
                <p className="text-gray-600 mt-1 font-medium">{profile.title}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 justify-center md:justify-start flex-wrap">
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {profile.location || 'Remote'}</span>
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> Joined {joinDate}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            {isOwnProfile ? (
              <Link to="/settings" className="flex-1 md:flex-none justify-center inline-flex bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl px-6 py-2.5 font-medium transition-colors">
                Edit Profile
              </Link>
            ) : (
              <Link to={`/messages?userId=${profile._id}`} className="flex-1 md:flex-none justify-center inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 font-medium transition-colors">
                <MessageSquare className="w-4 h-4 mr-2" />
                Message
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600"><CheckCircle className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Completed Projects</p>
            <p className="text-2xl font-bold text-gray-900">{profile.stats?.completedProjects || 0}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600"><Star className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">Average Rating</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-gray-900">{profile.stats?.rating ? profile.stats.rating.toFixed(1) : 'N/A'}</p>
              {profile.stats?.rating > 0 && <StarRating rating={profile.stats.rating} size="sm" />}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-xl text-indigo-600"><Briefcase className="w-6 h-6" /></div>
          <div>
            <p className="text-sm font-medium text-gray-500">{profile.role === 'freelancer' ? 'Hourly Rate' : 'Total Spent'}</p>
            <p className="text-2xl font-bold text-gray-900">{profile.hourlyRate ? `₹${profile.hourlyRate}/hr` : 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">About</h2>
            <div className="text-gray-600 whitespace-pre-line">
              {profile.bio || "No bio provided yet."}
            </div>
          </div>

          {/* Portfolio Section (Freelancer Only) */}
          {profile.role === 'freelancer' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Portfolio</h2>
              {profile.portfolio?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.portfolio.map((item, index) => (
                    <div key={index} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.description}</p>
                      {item.link && (
                        <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-indigo-600 text-sm font-medium mt-3 inline-block hover:underline">
                          View Project &rarr;
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No portfolio items added yet.</p>
              )}
            </div>
          )}

          {/* Reviews Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Reviews ({reviews.length})</h2>
            {reviews.length > 0 ? (
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-semibold text-gray-600">
                          {review.reviewer?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{review.reviewer?.name || 'Unknown User'}</p>
                          <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3">
                       <div className="text-xs text-gray-500 flex items-center justify-between bg-gray-50 p-2 rounded">
                         <span>Communication</span> <StarRating rating={review.subRatings?.communication || review.rating} size="sm" />
                       </div>
                       <div className="text-xs text-gray-500 flex items-center justify-between bg-gray-50 p-2 rounded">
                         <span>Quality</span> <StarRating rating={review.subRatings?.quality || review.rating} size="sm" />
                       </div>
                       <div className="text-xs text-gray-500 flex items-center justify-between bg-gray-50 p-2 rounded">
                         <span>Timeliness</span> <StarRating rating={review.subRatings?.timeliness || review.rating} size="sm" />
                       </div>
                    </div>
                    <p className="text-gray-600 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No reviews yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {profile.role === 'freelancer' && profile.skills && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Skills</h2>
              <SkillTags skills={profile.skills} />
            </div>
          )}
          
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
             <h2 className="text-lg font-bold text-gray-900 mb-4">Verification</h2>
             <div className="space-y-3">
                <div className="flex items-center text-sm">
                   <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                   <span className="text-gray-600">Email verified</span>
                </div>
                <div className="flex items-center text-sm">
                   <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                   <span className="text-gray-600">Payment verified</span>
                </div>
                <div className="flex items-center text-sm">
                   <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                   <span className="text-gray-600">Identity verified</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
