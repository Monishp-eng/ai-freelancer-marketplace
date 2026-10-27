import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Menu, X, User, ChevronDown, LogOut, Settings, LayoutDashboard, Briefcase, MessageSquare, CreditCard, Search, PlusCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
      isActive(path)
        ? 'bg-indigo-50 text-indigo-700'
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Briefcase size={18} className="text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight">
                Freelance<span className="text-indigo-600">AI</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {!user && (
              <>
                <Link to="/projects" className={navLinkClass('/projects')}>Browse Projects</Link>
                <Link to="/login" className={navLinkClass('/login')}>Sign In</Link>
                <Link
                  to="/register"
                  className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors duration-200"
                >
                  Get Started
                </Link>
              </>
            )}

            {user && user.role === 'client' && (
              <>
                <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                  <span className="flex items-center gap-1.5"><LayoutDashboard size={16} />Dashboard</span>
                </Link>
                <Link to="/my-projects" className={navLinkClass('/my-projects')}>
                  <span className="flex items-center gap-1.5"><Briefcase size={16} />My Projects</span>
                </Link>
                <Link to="/messages" className={navLinkClass('/messages')}>
                  <span className="flex items-center gap-1.5"><MessageSquare size={16} />Messages</span>
                </Link>
                <Link to="/payments" className={navLinkClass('/payments')}>
                  <span className="flex items-center gap-1.5"><CreditCard size={16} />Payments</span>
                </Link>
                <Link
                  to="/projects/new"
                  className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors duration-200 flex items-center gap-1.5"
                >
                  <PlusCircle size={16} />Post Project
                </Link>
              </>
            )}

            {user && user.role === 'freelancer' && (
              <>
                <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                  <span className="flex items-center gap-1.5"><LayoutDashboard size={16} />Dashboard</span>
                </Link>
                <Link to="/projects" className={navLinkClass('/projects')}>
                  <span className="flex items-center gap-1.5"><Search size={16} />Browse</span>
                </Link>
                <Link to="/my-projects" className={navLinkClass('/my-projects')}>
                  <span className="flex items-center gap-1.5"><Briefcase size={16} />My Work</span>
                </Link>
                <Link to="/messages" className={navLinkClass('/messages')}>
                  <span className="flex items-center gap-1.5"><MessageSquare size={16} />Messages</span>
                </Link>
                <Link to="/payments" className={navLinkClass('/payments')}>
                  <span className="flex items-center gap-1.5"><CreditCard size={16} />Payments</span>
                </Link>
              </>
            )}

            {/* Profile Dropdown */}
            {user && (
              <div className="relative ml-3">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <span className="text-indigo-600 font-semibold text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-700 hidden lg:block">{user.name}</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        to={`/profile/${user._id}`}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User size={16} className="text-gray-400" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings size={16} className="text-gray-400" />
                        Settings
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 pt-3 pb-4 space-y-1">
            {!user && (
              <>
                <Link to="/projects" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">Browse Projects</Link>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">Sign In</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-lg bg-indigo-600 text-white text-center font-medium mt-2">Get Started</Link>
              </>
            )}
            {user && (
              <>
                <div className="flex items-center gap-3 px-3 py-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">{user.name?.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <Link to="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50"><LayoutDashboard size={18} />Dashboard</Link>
                {user.role === 'freelancer' && (
                  <Link to="/projects" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50"><Search size={18} />Browse Projects</Link>
                )}
                <Link to="/my-projects" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50"><Briefcase size={18} />My Projects</Link>
                <Link to="/messages" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50"><MessageSquare size={18} />Messages</Link>
                <Link to="/payments" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50"><CreditCard size={18} />Payments</Link>
                <Link to={`/profile/${user._id}`} onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50"><User size={18} />Profile</Link>
                <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-50"><Settings size={18} />Settings</Link>
                <div className="border-t border-gray-100 mt-2 pt-2">
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50"><LogOut size={18} />Sign Out</button>
                </div>
                {user.role === 'client' && (
                  <Link to="/projects/new" onClick={() => setIsOpen(false)} className="block px-3 py-2.5 rounded-lg bg-indigo-600 text-white text-center font-medium mt-2">Post Project</Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
