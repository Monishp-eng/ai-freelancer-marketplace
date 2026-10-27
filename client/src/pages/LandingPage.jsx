import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Target, Shield, ArrowRight } from 'lucide-react';
import { Users } from '../services/api';
import FreelancerCard from '../components/FreelancerCard';

export default function LandingPage() {
  const [topFreelancers, setTopFreelancers] = useState([]);

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const response = await Users.getTopFreelancers();
        setTopFreelancers(response.data || []);
      } catch (error) {
        console.error("Failed to fetch top freelancers", error);
      }
    };
    fetchFreelancers();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-50 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
            Find the Perfect Match with AI-Powered Freelancing
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Connect with top-tier talent and innovative projects using our smart matching algorithm. Build your dream team in minutes.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register?role=client" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 py-3.5 font-medium transition-colors text-lg">
              Hire Talent
            </Link>
            <Link to="/register?role=freelancer" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl px-8 py-3.5 font-medium transition-colors text-lg">
              Find Work
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-white border-y border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: 'Projects', value: '10,000+' },
              { label: 'Freelancers', value: '5,000+' },
              { label: 'Match Rate', value: '95%' },
              { label: 'Avg Rating', value: '4.9★' }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-indigo-600 mb-2">{stat.value}</div>
                <div className="text-gray-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Why Choose Us</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Smart Matching</h3>
              <p className="text-gray-500">Our advanced algorithm connects the right talent with the right projects instantly.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Milestone Tracking</h3>
              <p className="text-gray-500">Keep projects on track with transparent milestones and progress tracking.</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Payments</h3>
              <p className="text-gray-500">Work with confidence knowing payments are protected and processed securely.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">How It Works</h2>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center relative space-y-8 md:space-y-0">
            <div className="hidden md:block absolute top-8 left-12 right-12 h-0.5 bg-gray-100 z-0" />
            {[
              { num: 1, title: 'Post Your Project', desc: 'Describe your needs and budget' },
              { num: 2, title: 'AI Finds Matches', desc: 'Get instantly matched with top talent' },
              { num: 3, title: 'Track Progress', desc: 'Manage work through milestones' },
              { num: 4, title: 'Secure Payment', desc: 'Pay safely when work is done' }
            ].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center text-center max-w-[200px]">
                <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg ring-4 ring-white">
                  {step.num}
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h4>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Freelancers */}
      {topFreelancers.length > 0 && (
        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900">Top Rated Freelancers</h2>
              <Link to="/freelancers" className="text-indigo-600 font-medium hover:text-indigo-700 flex items-center">
                View All <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {topFreelancers.map((freelancer) => (
                <FreelancerCard key={freelancer.id} freelancer={freelancer} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-3xl p-12 text-center text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-indigo-100 mb-8 max-w-2xl mx-auto text-lg">
            Join thousands of satisfied clients and freelancers on the platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="bg-white text-indigo-700 hover:bg-gray-50 rounded-xl px-8 py-3.5 font-medium transition-colors text-lg">
              Create Account
            </Link>
            <Link to="/projects" className="bg-indigo-800 border border-indigo-500 hover:bg-indigo-900 text-white rounded-xl px-8 py-3.5 font-medium transition-colors text-lg">
              Explore Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><Link to="/browse">Browse Projects</Link></li>
                <li><Link to="/freelancers">Find Freelancers</Link></li>
                <li><Link to="/how-it-works">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><Link to="/help">Help Center</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/faq">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-500 text-sm">
                <li><a href="#">Twitter</a></li>
                <li><a href="#">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-8 text-center text-gray-400 text-sm">
            © {new Date().getFullYear()} FreelanceAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
