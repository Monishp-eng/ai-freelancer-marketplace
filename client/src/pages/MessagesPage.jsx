import React, { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Search, ArrowLeft } from 'lucide-react';
import { Messages } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import ChatWindow from '../components/ChatWindow';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function MessagesPage() {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const initialUserId = searchParams.get('userId');
  
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const res = await Messages.getConversations();
        const convos = Array.isArray(res.data) ? res.data : [];
        setConversations(convos);
        
        if (initialUserId && convos.length > 0) {
           const existing = convos.find(c => c.participants.some(p => p._id === initialUserId));
           if (existing) {
             setSelectedConversationId(existing._id);
             setShowMobileList(false);
           }
        }
      } catch (err) {
        console.error('Failed to load conversations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [initialUserId]);

  const filteredConversations = conversations.filter(conv => {
    const otherParticipant = conv.participants.find(p => p._id !== user?._id);
    return otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSelectConversation = (id) => {
    setSelectedConversationId(id);
    setShowMobileList(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-8 h-[calc(100vh-4rem)]">
      <div className="flex h-full bg-white sm:rounded-2xl shadow-sm sm:border border-gray-100 overflow-hidden relative">
        
        {/* Left Panel - Conversation List */}
        <div className={`w-full md:w-80 flex-shrink-0 flex flex-col border-r border-gray-100 ${showMobileList ? 'block' : 'hidden md:flex'}`}>
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 flex justify-center"><LoadingSpinner /></div>
            ) : filteredConversations.length > 0 ? (
              <ul className="divide-y divide-gray-50">
                {filteredConversations.map((conv) => {
                  const other = conv.participants.find(p => p._id !== user?._id) || {};
                  const isSelected = selectedConversationId === conv._id;
                  
                  return (
                    <li key={conv._id}>
                      <button
                        onClick={() => handleSelectConversation(conv._id)}
                        className={`w-full text-left p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                          isSelected ? 'bg-indigo-50 border-l-2 border-indigo-600' : 'border-l-2 border-transparent'
                        }`}
                      >
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center font-bold text-gray-500">
                          {other.avatar ? (
                            <img src={other.avatar} alt={other.name} className="w-full h-full object-cover" />
                          ) : (
                            other.name?.charAt(0) || 'U'
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-0.5">
                            <p className="text-sm font-semibold text-gray-900 truncate">{other.name || 'User'}</p>
                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                              {conv.lastMessage?.createdAt ? new Date(conv.lastMessage.createdAt).toLocaleDateString() : ''}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 truncate">
                            {conv.lastMessage?.content || 'Started a conversation'}
                          </p>
                        </div>
                        {conv.unreadCount > 0 && (
                           <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full flex-shrink-0 mt-1.5"></div>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">
                No conversations found.
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Chat Window */}
        <div className={`flex-1 flex flex-col min-w-0 bg-white ${!showMobileList ? 'flex' : 'hidden md:flex'}`}>
          {selectedConversationId ? (
            <>
              <div className="md:hidden p-3 border-b border-gray-100 flex items-center bg-white shadow-sm z-10">
                <button onClick={() => setShowMobileList(true)} className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg mr-2">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="font-semibold text-gray-900">Back to messages</span>
              </div>
              <ChatWindow conversationId={selectedConversationId} currentUser={user} />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <EmptyState 
                 icon={MessageSquare}
                 title="Select a conversation"
                 description="Choose an existing conversation from the list or start a new one to begin messaging."
              />
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
