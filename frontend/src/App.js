import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';
import PitchVisualization from './components/PitchVisualization';
import PlayerSelectionModal from './components/PlayerSelectionModal';
import LiveMatchInterface from './components/LiveMatchInterface';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Logo component with base64 fallback
const Logo = ({ className = "h-20 w-auto" }) => {
  const [useBase64, setUseBase64] = useState(false);
  
  // Base64 representation of the red & black Grassroots Match Tracker logo
  const logoBase64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9InBhaW50MF9saW5lYXJfMV8xIiB4MT0iMTAwIiB5MT0iMCIgeDI9IjEwMCIgeTI9IjEwMCIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgo8c3RvcCBzdG9wLWNvbG9yPSIjRDMxMjEyIi8+CjxzdG9wIG9mZnNldD0iMSIgc3RvcC1jb2xvcj0iIzc5MTkxOSIvPgo8L2xpbmVhckdyYWRpZW50Pgo8L2RlZnM+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiByeD0iMTAiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl8xXzEpIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMzAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIGZvbnQtd2VpZ2h0PSJib2xkIj5HUkFTU1JPT1RTPC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmb250LXdlaWdodD0iYm9sZCI+TUFUQ0ggVFJBQ0tFUjwvdGV4dD4KPGV4dCB4PSIxMDAiIHk9IjcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGRkZGIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTAiPkVTVC4gMjAyNTwvdGV4dD4KPGV4dCB4PSIxMDAiIHk9Ijg1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjRkZGRkZGIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiPuKavcKgPC90ZXh0Pgo8L3N2Zz4K";

  return (
    <div className={`filter drop-shadow-2xl ${className}`}>
      {!useBase64 ? (
        <img
          src="/grassroots-logo.png"
          alt="Grassroots Match Tracker"
          className="h-full w-auto"
          onError={() => setUseBase64(true)}
        />
      ) : (
        <img
          src={logoBase64}
          alt="Grassroots Match Tracker"
          className="h-full w-auto"
        />
      )}
    </div>
  );
};

// Privacy Policy Modal Component
const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl max-h-96 overflow-y-auto m-4">
        <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
        <div className="space-y-4 text-sm">
          <p>Last updated: June 2025</p>
          <h3 className="font-semibold">1. Information We Collect</h3>
          <p>We collect information you provide directly to us, such as team details, player information, and match data.</p>
          <h3 className="font-semibold">2. How We Use Information</h3>
          <p>We use information to provide, maintain, and improve our services, including match tracking and team management.</p>
          <h3 className="font-semibold">3. Information Sharing</h3>
          <p>We do not sell, trade, or rent your personal information to third parties.</p>
          <h3 className="font-semibold">4. Data Security</h3>
          <p>We implement appropriate security measures to protect your information against unauthorized access.</p>
        </div>
        <button 
          onClick={onClose}
          className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Terms & Conditions Modal Component
const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl max-h-96 overflow-y-auto m-4">
        <h2 className="text-2xl font-bold mb-4">Terms & Conditions</h2>
        <div className="space-y-4 text-sm">
          <p>Last updated: June 2025</p>
          <h3 className="font-semibold">1. Acceptance of Terms</h3>
          <p>By using our service, you agree to these terms and conditions.</p>
          <h3 className="font-semibold">2. Service Description</h3>
          <p>Grassroots Match Tracker provides football team and match management tools.</p>
          <h3 className="font-semibold">3. User Responsibilities</h3>
          <p>Users are responsible for maintaining accurate team and player information.</p>
          <h3 className="font-semibold">4. Limitation of Liability</h3>
          <p>We are not liable for any indirect, incidental, or consequential damages.</p>
        </div>
        <button 
          onClick={onClose}
          className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Cookie Policy Modal Component
const CookieModal = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <p className="mb-4 md:mb-0">
          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
        </p>
        <div className="flex space-x-4">
          <button 
            onClick={onAccept}
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
          >
            Accept
          </button>
          <button 
            onClick={onClose}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

// Enhanced Player Edit Modal with photo upload
const PlayerEditModal = ({ isOpen, onClose, player, onSave, onDelete }) => {
  const [editedPlayer, setEditedPlayer] = useState(player || {});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (player) {
      setEditedPlayer(player);
    }
  }, [player]);

  if (!isOpen || !player) return null;

  const positions = ['GK', 'DEF', 'MID', 'FWD'];
  const ages = Array.from({length: 98}, (_, i) => i + 3);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditedPlayer({...editedPlayer, photo_base64: event.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(editedPlayer);
      onClose();
    } catch (error) {
      alert('Error updating player');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${player.first_name} ${player.last_name}?`)) {
      setIsLoading(true);
      try {
        await onDelete(player.id);
        onClose();
      } catch (error) {
        alert('Error deleting player');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-2xl w-full mx-4 border border-slate-700">
        <h3 className="text-2xl font-semibold mb-6 text-white">Edit Player</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
            <input
              type="text"
              value={editedPlayer.first_name || ''}
              onChange={(e) => setEditedPlayer({...editedPlayer, first_name: e.target.value})}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
            <input
              type="text"
              value={editedPlayer.last_name || ''}
              onChange={(e) => setEditedPlayer({...editedPlayer, last_name: e.target.value})}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
            <select
              value={editedPlayer.age || 16}
              onChange={(e) => setEditedPlayer({...editedPlayer, age: parseInt(e.target.value)})}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
              disabled={isLoading}
            >
              {ages.map(age => (
                <option key={age} value={age}>{age}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
            <select
              value={editedPlayer.position || 'MID'}
              onChange={(e) => setEditedPlayer({...editedPlayer, position: e.target.value})}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
              disabled={isLoading}
            >
              {positions.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Squad Number</label>
            <input
              type="number"
              min="1"
              max="99"
              value={editedPlayer.squad_number || 1}
              onChange={(e) => setEditedPlayer({...editedPlayer, squad_number: parseInt(e.target.value)})}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Photo Upload</label>
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white"
              disabled={isLoading}
            />
          </div>
        </div>
        
        {editedPlayer.photo_base64 && (
          <div className="mb-6">
            <img 
              src={editedPlayer.photo_base64} 
              alt="Player photo" 
              className="w-20 h-20 rounded-full object-cover border-2 border-slate-600"
            />
          </div>
        )}
        
        <div className="flex justify-between">
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all"
          >
            {isLoading ? 'Deleting...' : 'Delete Player'}
          </button>
          
          <div className="space-x-4">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Dashboard Component
const DashboardView = ({ teams, onNavigate }) => {
  const totalPlayers = teams.reduce((total, team) => total + (team.players?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent"></div>
        </div>
        
        <div className="relative z-10 p-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Logo />
            </div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 mb-4">
              GRASSROOTS MATCH TRACKER
            </h1>
            <p className="text-xl text-gray-300 font-light tracking-wide">
              The Future of Football Management
            </p>
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-lg rounded-2xl p-6 border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-cyan-400 text-sm font-medium uppercase tracking-wider">Teams</p>
                  <p className="text-3xl font-bold text-white mt-2">{teams.length}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30 hover:border-green-400 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium uppercase tracking-wider">Players</p>
                  <p className="text-3xl font-bold text-white mt-2">{totalPlayers}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/30 hover:border-yellow-400 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-400 text-sm font-medium uppercase tracking-wider">Matches</p>
                  <p className="text-3xl font-bold text-white mt-2">0</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 text-sm font-medium uppercase tracking-wider">Leagues</p>
                  <p className="text-3xl font-bold text-white mt-2">0</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <button
              onClick={() => onNavigate('teams')}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 group text-left"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white ml-4 group-hover:text-cyan-300 transition-colors">Manage Teams</h3>
              </div>
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors">
                Create and manage your football teams
              </p>
            </button>

            <button
              onClick={() => onNavigate('matches')}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 hover:border-green-500/50 transition-all duration-300 hover:scale-105 group text-left"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white ml-4 group-hover:text-green-300 transition-colors">Create Match</h3>
              </div>
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors">
                Schedule and manage matches
              </p>
            </button>

            <button
              onClick={() => onNavigate('fixtures')}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 group text-left"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white ml-4 group-hover:text-purple-300 transition-colors">Fixtures</h3>
              </div>
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors">
                View upcoming fixtures and results
              </p>
            </button>

            <button
              onClick={() => onNavigate('leagues')}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 group text-left"
            >
              <div className="flex items-center mb-4">
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white ml-4 group-hover:text-yellow-300 transition-colors">Leagues</h3>
              </div>
              <p className="text-gray-300 group-hover:text-gray-200 transition-colors">
                Manage leagues and tournaments
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Continue from previous imports
// Enhanced Squad View Component with Fixed Player Management
const SquadView = ({ team, onBack, onPlayerAdd, onPlayerUpdate, onPlayerDelete }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    first_name: '',
    last_name: '',
    age: 16,
    position: 'MID',
    squad_number: 1,
    photo_base64: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const positions = ['GK', 'DEF', 'MID', 'FWD'];
  const ages = Array.from({length: 98}, (_, i) => i + 3);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewPlayer({...newPlayer, photo_base64: event.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onPlayerAdd(newPlayer);
      setNewPlayer({
        first_name: '',
        last_name: '',
        age: 16,
        position: 'MID',
        squad_number: 1,
        photo_base64: ''
      });
      setShowAddForm(false);
      alert('Player added successfully!');
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Error adding player. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
  };

  const handlePlayerUpdate = async (updatedPlayer) => {
    await onPlayerUpdate(updatedPlayer);
    setShowPlayerModal(false);
  };

  const handlePlayerDelete = async (playerId) => {
    await onPlayerDelete(playerId);
    setShowPlayerModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="flex items-center mb-8">
        <button 
          onClick={onBack}
          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 mr-4 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
          </svg>
          <span>Back</span>
        </button>
        <h2 className="text-4xl font-bold text-white">{team.name} Squad</h2>
        <span className="ml-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">
          {team.age_group}
        </span>
      </div>

      <div className="mb-8">
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg font-medium"
        >
          ➕ Add New Player
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-slate-700/50">
          <h3 className="text-2xl font-semibold mb-6 text-white">Add New Player</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
              <input
                type="text"
                value={newPlayer.first_name}
                onChange={(e) => setNewPlayer({...newPlayer, first_name: e.target.value})}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
              <input
                type="text"
                value={newPlayer.last_name}
                onChange={(e) => setNewPlayer({...newPlayer, last_name: e.target.value})}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
              <select
                value={newPlayer.age}
                onChange={(e) => setNewPlayer({...newPlayer, age: parseInt(e.target.value)})}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                disabled={isLoading}
              >
                {ages.map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
              <select
                value={newPlayer.position}
                onChange={(e) => setNewPlayer({...newPlayer, position: e.target.value})}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                disabled={isLoading}
              >
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Squad Number</label>
              <input
                type="number"
                min="1"
                max="99"
                value={newPlayer.squad_number}
                onChange={(e) => setNewPlayer({...newPlayer, squad_number: parseInt(e.target.value)})}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Photo Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white"
                disabled={isLoading}
              />
            </div>
            
            {newPlayer.photo_base64 && (
              <div className="col-span-2">
                <img 
                  src={newPlayer.photo_base64} 
                  alt="Player preview" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-600"
                />
              </div>
            )}
            
            <div className="col-span-2 flex space-x-4">
              <button 
                type="submit"
                disabled={isLoading}
                className={`px-8 py-3 rounded-xl font-medium transition-all ${
                  isLoading 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                }`}
              >
                {isLoading ? 'Adding...' : 'Add Player'}
              </button>
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                disabled={isLoading}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {team.players && team.players.map((player) => (
          <div 
            key={player.id} 
            onClick={() => handlePlayerClick(player)}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
          >
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {player.squad_number}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {player.first_name} {player.last_name}
                </h3>
                <p className="text-blue-400 font-medium">{player.position}</p>
                <p className="text-gray-400 text-sm">Age {player.age}</p>
              </div>
            </div>
            
            {player.photo_base64 && (
              <div className="mb-4">
                <img 
                  src={player.photo_base64} 
                  alt={`${player.first_name} ${player.last_name}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="text-sm text-gray-300">
              <p>Goals: {player.stats?.goals || 0}</p>
              <p>Assists: {player.stats?.assists || 0}</p>
              <p>Appearances: {player.stats?.appearances || 0}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedPlayer && (
        <PlayerEditModal
          isOpen={showPlayerModal}
          onClose={() => setShowPlayerModal(false)}
          player={selectedPlayer}
          onSave={handlePlayerUpdate}
          onDelete={handlePlayerDelete}
        />
      )}
    </div>
  );
};

// Enhanced Match Creation View with Formation Selection and Pitch Visualization
const MatchView = ({ teams, onBack }) => {
  const [matchData, setMatchData] = useState({
    home_team_id: '',
    away_team_id: '',
    date: '',
    venue: '',
    home_formation: '4-4-2',
    away_formation: '4-4-2',
    home_positions: {},
    away_positions: {},
    home_substitutes: [],
    away_substitutes: []
  });
  const [homeTeamPlayers, setHomeTeamPlayers] = useState([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState([]);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedTeamType, setSelectedTeamType] = useState('home');
  const [createdMatch, setCreatedMatch] = useState(null);

  const formations = ['4-4-2', '4-3-3', '4-5-1', '3-5-2', '4-2-3-1', '5-3-2'];

  useEffect(() => {
    if (matchData.home_team_id) {
      loadTeamPlayers(matchData.home_team_id, 'home');
    }
  }, [matchData.home_team_id]);

  useEffect(() => {
    if (matchData.away_team_id) {
      loadTeamPlayers(matchData.away_team_id, 'away');
    }
  }, [matchData.away_team_id]);

  const loadTeamPlayers = async (teamId, teamType) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/teams/${teamId}/players`);
      if (teamType === 'home') {
        setHomeTeamPlayers(response.data);
      } else {
        setAwayTeamPlayers(response.data);
      }
    } catch (error) {
      console.error('Error loading team players:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/matches`, matchData);
      console.log('Match created:', response.data);
      setCreatedMatch(response.data);
      alert('Match created successfully!');
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Error creating match. Please try again.');
    }
  };

  if (createdMatch) {
    return <LiveMatchInterface match={{...matchData, ...createdMatch}} onBack={onBack} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="flex items-center mb-8">
        <button 
          onClick={onBack}
          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 mr-4 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
          </svg>
          <span>Back</span>
        </button>
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Create Match</h2>
      </div>

      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 max-w-4xl mx-auto border border-slate-700/50">
        <h3 className="text-2xl font-semibold mb-6 text-white">Match Details</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Home Team</label>
              <select
                value={matchData.home_team_id}
                onChange={(e) => setMatchData({...matchData, home_team_id: e.target.value})}
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              >
                <option value="">Select Home Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name} ({team.age_group})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Away Team</label>
              <select
                value={matchData.away_team_id}
                onChange={(e) => setMatchData({...matchData, away_team_id: e.target.value})}
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              >
                <option value="">Select Away Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name} ({team.age_group})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date & Time</label>
              <input
                type="datetime-local"
                value={matchData.date}
                onChange={(e) => setMatchData({...matchData, date: e.target.value})}
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Venue</label>
              <input
                type="text"
                value={matchData.venue}
                onChange={(e) => setMatchData({...matchData, venue: e.target.value})}
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter venue..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Home Formation</label>
              <select
                value={matchData.home_formation}
                onChange={(e) => setMatchData({...matchData, home_formation: e.target.value})}
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {formations.map(formation => (
                  <option key={formation} value={formation}>{formation}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Away Formation</label>
              <select
                value={matchData.away_formation}
                onChange={(e) => setMatchData({...matchData, away_formation: e.target.value})}
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {formations.map(formation => (
                  <option key={formation} value={formation}>{formation}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg font-medium"
          >
            Create Match ⚽
          </button>
        </form>
      </div>
    </div>
  );
};

// Simple Fixtures View Component  
const FixturesView = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="flex items-center mb-8">
        <button 
          onClick={onBack}
          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 mr-4 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
          </svg>
          <span>Back</span>
        </button>
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Fixtures & Results</h2>
      </div>

      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-3xl p-12 border border-slate-700/50 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-white text-4xl">📅</span>
        </div>
        <h3 className="text-2xl font-semibold text-white mb-6">Fixtures Coming Soon</h3>
        <p className="text-gray-300 mb-8 max-w-md mx-auto">
          Create matches to see upcoming fixtures and results here. 
          Use the Match Creation feature to schedule games between your teams.
        </p>
      </div>
    </div>
  );
};

// Enhanced Leagues View 
const LeaguesView = ({ onBack }) => {
  const [leagueUrl, setLeagueUrl] = useState('');
  const [savedUrl, setSavedUrl] = useState('');

  const handleSaveUrl = () => {
    if (leagueUrl.trim()) {
      setSavedUrl(leagueUrl);
      alert('League URL saved successfully!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="flex items-center mb-8">
        <button 
          onClick={onBack}
          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 mr-4 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
          </svg>
          <span>Back</span>
        </button>
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">Leagues & Tournaments</h2>
      </div>

      <div className="space-y-8">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
          <h3 className="text-2xl font-semibold text-white mb-6">League Web Integration</h3>
          <p className="text-gray-300 mb-6">
            Connect your league's website for automatic updates and live standings.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">League Website URL</label>
              <input
                type="url"
                value={leagueUrl}
                onChange={(e) => setLeagueUrl(e.target.value)}
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all"
                placeholder="https://your-league-website.com"
              />
            </div>
            
            <button 
              onClick={handleSaveUrl}
              className="bg-gradient-to-r from-rose-500 to-pink-600 text-white px-8 py-3 rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all font-medium"
            >
              Save League URL
            </button>
          </div>

          {savedUrl && (
            <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
              <p className="text-green-400 font-medium">✅ League URL Saved</p>
              <p className="text-gray-300 text-sm">{savedUrl}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Team Statistics View
const TeamStatsView = ({ team, onBack }) => {
  const teamStats = {
    matchesPlayed: 0,
    matchesWon: 0,
    matchesDrawn: 0,
    matchesLost: 0,
    goalsScored: 0,
    goalsConceded: 0,
    points: 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="flex items-center mb-8">
        <button 
          onClick={onBack}
          className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 mr-4 flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
          </svg>
          <span>Back</span>
        </button>
        <h2 className="text-4xl font-bold text-white">{team.name} Statistics</h2>
      </div>

      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
        <h3 className="text-2xl font-semibold text-white mb-6">Team Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-4 text-center border border-blue-500/30">
            <p className="text-blue-400 text-sm font-medium">Played</p>
            <p className="text-2xl font-bold text-white">{teamStats.matchesPlayed}</p>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-4 text-center border border-green-500/30">
            <p className="text-green-400 text-sm font-medium">Won</p>
            <p className="text-2xl font-bold text-white">{teamStats.matchesWon}</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl p-4 text-center border border-yellow-500/30">
            <p className="text-yellow-400 text-sm font-medium">Drawn</p>
            <p className="text-2xl font-bold text-white">{teamStats.matchesDrawn}</p>
          </div>
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl p-4 text-center border border-red-500/30">
            <p className="text-red-400 text-sm font-medium">Lost</p>
            <p className="text-2xl font-bold text-white">{teamStats.matchesLost}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-4 text-center border border-purple-500/30">
            <p className="text-purple-400 text-sm font-medium">Goals For</p>
            <p className="text-2xl font-bold text-white">{teamStats.goalsScored}</p>
          </div>
          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl p-4 text-center border border-orange-500/30">
            <p className="text-orange-400 text-sm font-medium">Goals Against</p>
            <p className="text-2xl font-bold text-white">{teamStats.goalsConceded}</p>
          </div>
          <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-xl p-4 text-center border border-cyan-500/30">
            <p className="text-cyan-400 text-sm font-medium">Points</p>
            <p className="text-2xl font-bold text-white">{teamStats.points}</p>
          </div>
        </div>

        <h4 className="text-xl font-semibold text-white mb-4">Player Statistics</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-3 px-4">Player</th>
                <th className="text-center py-3 px-4">Appearances</th>
                <th className="text-center py-3 px-4">Goals</th>
                <th className="text-center py-3 px-4">Assists</th>
              </tr>
            </thead>
            <tbody>
              {team.players && team.players.map((player, index) => (
                <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-4 px-4 font-medium">{player.first_name} {player.last_name}</td>
                  <td className="py-4 px-4 text-center text-blue-400">{player.stats?.appearances || 0}</td>
                  <td className="py-4 px-4 text-center text-green-400">{player.stats?.goals || 0}</td>
                  <td className="py-4 px-4 text-center text-yellow-400">{player.stats?.assists || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Enhanced Team View Component with Fixed Delete
const TeamView = ({ teams, onTeamSelect, onAddTeam, onViewMatches, onBack, onDeleteTeam }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    age_group: 'U13'
  });
  const [isCreating, setIsCreating] = useState(false);

  const ageGroups = ['U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newTeam.name.trim()) {
      alert('Please enter a team name');
      return;
    }

    setIsCreating(true);
    try {
      await onAddTeam(newTeam);
      setNewTeam({ name: '', age_group: 'U13' });
      setShowAddForm(false);
      alert('Team created successfully!');
    } catch (error) {
      console.error('Error adding team:', error);
      alert('Error adding team. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteTeam = async (teamId, teamName) => {
    if (window.confirm(`Are you sure you want to delete "${teamName}" and all its players? This action cannot be undone.`)) {
      try {
        await onDeleteTeam(teamId);
        alert('Team deleted successfully!');
      } catch (error) {
        console.error('Error deleting team:', error);
        alert('Error deleting team. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
        <div className="flex items-center">
          <button 
            onClick={onBack}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 mr-4 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
            </svg>
            <span>Back</span>
          </button>
          <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Team Management</h2>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg font-medium text-center"
          >
            ➕ Add New Team
          </button>
          <button 
            onClick={onViewMatches}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg font-medium text-center"
          >
            📅 Create Match
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-slate-700/50">
          <h3 className="text-2xl font-semibold mb-6 text-white">Add New Team</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Team Name *</label>
              <input
                type="text"
                value={newTeam.name}
                onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="Enter team name..."
                required
                disabled={isCreating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Age Group</label>
              <select
                value={newTeam.age_group}
                onChange={(e) => setNewTeam({...newTeam, age_group: e.target.value})}
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                required
                disabled={isCreating}
              >
                {ageGroups.map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button 
                type="submit"
                disabled={isCreating}
                className={`px-8 py-3 rounded-xl font-medium transition-all ${
                  isCreating 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                }`}
              >
                {isCreating ? 'Creating...' : 'Create Team'}
              </button>
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                disabled={isCreating}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105 group">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {team.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-white group-hover:text-cyan-300 transition-colors">{team.name}</h3>
                  <p className="text-cyan-400 font-medium">{team.age_group}</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteTeam(team.id, team.name)}
                className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/20 transition-all"
                title="Delete Team"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
              </button>
            </div>
            <div className="mb-4">
              <p className="text-gray-300">Players: {team.players?.length || 0}</p>
            </div>
            <button 
              onClick={() => onTeamSelect(team)}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 font-medium"
            >
              Manage Team & Players
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showCookieModal, setShowCookieModal] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/teams`);
      setTeams(response.data);
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  };

  const handleAddTeam = async (teamData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/teams`, teamData);
      await loadTeams(); // Reload teams
      return response.data;
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/teams/${teamId}`);
      await loadTeams(); // Reload teams
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  };

  const handleAddPlayer = async (playerData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/teams/${selectedTeam.id}/players`, playerData);
      // Reload the selected team
      const teamResponse = await axios.get(`${API_BASE_URL}/api/teams/${selectedTeam.id}`);
      setSelectedTeam(teamResponse.data);
      await loadTeams(); // Reload all teams
      return response.data;
    } catch (error) {
      console.error('Error adding player:', error);
      throw error;
    }
  };

  const handleUpdatePlayer = async (playerData) => {
    try {
      await axios.put(`${API_BASE_URL}/api/teams/${selectedTeam.id}/players/${playerData.id}`, playerData);
      // Reload the selected team
      const teamResponse = await axios.get(`${API_BASE_URL}/api/teams/${selectedTeam.id}`);
      setSelectedTeam(teamResponse.data);
      await loadTeams(); // Reload all teams
    } catch (error) {
      console.error('Error updating player:', error);
      throw error;
    }
  };

  const handleDeletePlayer = async (playerId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/teams/${selectedTeam.id}/players/${playerId}`);
      // Reload the selected team
      const teamResponse = await axios.get(`${API_BASE_URL}/api/teams/${selectedTeam.id}`);
      setSelectedTeam(teamResponse.data);
      await loadTeams(); // Reload all teams
    } catch (error) {
      console.error('Error deleting player:', error);
      throw error;
    }
  };

  const handleTeamSelect = async (team) => {
    try {
      // Get full team details with players
      const response = await axios.get(`${API_BASE_URL}/api/teams/${team.id}`);
      setSelectedTeam(response.data);
      setCurrentView('squad');
    } catch (error) {
      console.error('Error loading team details:', error);
      alert('Error loading team details');
    }
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    setSelectedTeam(null);
    setSelectedMatch(null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView teams={teams} onNavigate={handleNavigate} />;
      
      case 'teams':
        return (
          <TeamView
            teams={teams}
            onTeamSelect={handleTeamSelect}
            onAddTeam={handleAddTeam}
            onDeleteTeam={handleDeleteTeam}
            onViewMatches={() => setCurrentView('matches')}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      
      case 'squad':
        return selectedTeam ? (
          <SquadView
            team={selectedTeam}
            onBack={() => setCurrentView('teams')}
            onPlayerAdd={handleAddPlayer}
            onPlayerUpdate={handleUpdatePlayer}
            onPlayerDelete={handleDeletePlayer}
          />
        ) : (
          <div>Loading...</div>
        );
      
      case 'matches':
        return (
          <MatchView
            teams={teams}
            onBack={() => setCurrentView('dashboard')}
          />
        );
      
      case 'fixtures':
        return <FixturesView onBack={() => setCurrentView('dashboard')} />;
      
      case 'leagues':
        return <LeaguesView onBack={() => setCurrentView('dashboard')} />;
      
      case 'statistics':
        return selectedTeam ? (
          <TeamStatsView
            team={selectedTeam}
            onBack={() => setCurrentView('teams')}
          />
        ) : (
          <div>Select a team first</div>
        );
      
      default:
        return <DashboardView teams={teams} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
      
      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 border-t border-slate-700">
        <div className="container mx-auto px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center mb-4 md:mb-0">
              <Logo className="h-8 w-auto mr-4" />
              <span className="text-sm text-gray-400">
                © 2025 Grassroots Match Tracker. All rights reserved.
              </span>
            </div>
            <div className="flex space-x-6">
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setShowTermsModal(true)}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Terms & Conditions
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
      <CookieModal
        isOpen={showCookieModal}
        onClose={() => setShowCookieModal(false)}
        onAccept={() => setShowCookieModal(false)}
      />
    </div>
  );
}

export default App;