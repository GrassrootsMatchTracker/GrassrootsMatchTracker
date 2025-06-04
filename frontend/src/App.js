import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

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

// Player Edit Modal Component
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
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white"
              disabled={isLoading}
            />
          </div>
        </div>
        
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

// Modern Dashboard Component
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
              <img 
                src="/grassroots-logo.png" 
                alt="Grassroots Match Tracker" 
                className="h-20 w-auto filter drop-shadow-2xl"
                onError={(e) => {
                  console.log('Logo failed to load, using fallback');
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{display: 'none'}} className="h-20 w-40 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-white font-bold text-2xl">GMT</span>
              </div>
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
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 hover:border-purple-400 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-400 text-sm font-medium uppercase tracking-wider">Players</p>
                  <p className="text-3xl font-bold text-white mt-2">{totalPlayers}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30 hover:border-green-400 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 text-sm font-medium uppercase tracking-wider">Matches</p>
                  <p className="text-3xl font-bold text-white mt-2">0</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v5a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L10 9.586V5z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/30 hover:border-yellow-400 transition-all duration-300 hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-400 text-sm font-medium uppercase tracking-wider">Leagues</p>
                  <p className="text-3xl font-bold text-white mt-2">0</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Main Action Buttons - Futuristic Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team Management */}
            <div 
              onClick={() => onNavigate('teams')}
              className="group relative bg-gradient-to-br from-cyan-500/10 to-blue-600/10 backdrop-blur-lg rounded-3xl p-8 border border-cyan-500/20 hover:border-cyan-400/50 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-cyan-300 transition-colors">Team Management</h3>
                <p className="text-gray-400 mb-6">Create and manage your football teams with advanced squad and player management tools</p>
                <div className="flex items-center text-cyan-400 font-medium">
                  <span>Manage Teams & Players</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Match Creation */}
            <div 
              onClick={() => onNavigate('matches')}
              className="group relative bg-gradient-to-br from-purple-500/10 to-pink-600/10 backdrop-blur-lg rounded-3xl p-8 border border-purple-500/20 hover:border-purple-400/50 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v5a1 1 0 00.293.707l3 3a1 1 0 001.414-1.414L10 9.586V5z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-300 transition-colors">Match Creation</h3>
                <p className="text-gray-400 mb-6">Schedule matches with simplified opponent entry and advanced formation selection</p>
                <div className="flex items-center text-purple-400 font-medium">
                  <span>Create Matches</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div 
              onClick={() => onNavigate('statistics')}
              className="group relative bg-gradient-to-br from-green-500/10 to-emerald-600/10 backdrop-blur-lg rounded-3xl p-8 border border-green-500/20 hover:border-green-400/50 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-green-300 transition-colors">Statistics</h3>
                <p className="text-gray-400 mb-6">Advanced team and player analytics with detailed performance tracking</p>
                <div className="flex items-center text-green-400 font-medium">
                  <span>View Stats</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Fixtures */}
            <div 
              onClick={() => onNavigate('fixtures')}
              className="group relative bg-gradient-to-br from-indigo-500/10 to-purple-600/10 backdrop-blur-lg rounded-3xl p-8 border border-indigo-500/20 hover:border-indigo-400/50 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">Fixtures</h3>
                <p className="text-gray-400 mb-6">Schedule management and match results tracking</p>
                <div className="flex items-center text-indigo-400 font-medium">
                  <span>View Fixtures</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Leagues */}
            <div 
              onClick={() => onNavigate('leagues')}
              className="group relative bg-gradient-to-br from-rose-500/10 to-pink-600/10 backdrop-blur-lg rounded-3xl p-8 border border-rose-500/20 hover:border-rose-400/50 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-rose-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-rose-300 transition-colors">Leagues</h3>
                <p className="text-gray-400 mb-6">Tournament and league management with web integration</p>
                <div className="flex items-center text-rose-400 font-medium">
                  <span>Manage Leagues</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Statistics View Component with Team Details
const StatisticsView = ({ teams, onBack, onTeamSelect }) => {
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
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">Statistics Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              📊
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-white">Total Teams</h3>
              <p className="text-3xl font-bold text-blue-400">{teams.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              👥
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-white">Total Players</h3>
              <p className="text-3xl font-bold text-green-400">
                {teams.reduce((total, team) => total + (team.players?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-lg rounded-2xl p-6 border border-yellow-500/30">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              ⚽
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-white">Total Matches</h3>
              <p className="text-3xl font-bold text-yellow-400">0</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              🏆
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-white">Active Leagues</h3>
              <p className="text-3xl font-bold text-purple-400">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Selection for Detailed Stats */}
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-white mb-6">Select Team for Detailed Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team) => (
            <div 
              key={team.id} 
              onClick={() => onTeamSelect(team)}
              className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 hover:border-green-500/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {team.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h4 className="text-xl font-semibold text-white group-hover:text-green-300 transition-colors">{team.name}</h4>
                  <p className="text-green-400 font-medium">{team.age_group}</p>
                </div>
              </div>
              <div className="text-gray-300">
                <p>Players: {team.players?.length || 0}</p>
                <p>Matches: 0</p>
                <p>Points: 0</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Team Detailed Statistics View
const TeamStatsView = ({ team, onBack }) => {
  // Mock data for demonstration - in real app this would come from API
  const teamStats = {
    matchesPlayed: 12,
    matchesWon: 8,
    matchesDrawn: 2,
    matchesLost: 2,
    goalsScored: 24,
    goalsConceded: 12,
    points: 26
  };

  const playerStats = [
    { name: "John Smith", goals: 8, assists: 4, playerOfTheMatch: 3 },
    { name: "Mike Johnson", goals: 5, assists: 6, playerOfTheMatch: 2 },
    { name: "David Wilson", goals: 3, assists: 2, playerOfTheMatch: 1 },
  ];

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
        <span className="ml-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">
          {team.age_group}
        </span>
      </div>

      {/* Team Statistics Grid */}
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

      {/* Player Statistics */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
        <h3 className="text-2xl font-semibold text-white mb-6">Player Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-white">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="text-left py-3 px-4">Player</th>
                <th className="text-center py-3 px-4">Goals</th>
                <th className="text-center py-3 px-4">Assists</th>
                <th className="text-center py-3 px-4">POTM Awards</th>
              </tr>
            </thead>
            <tbody>
              {playerStats.map((player, index) => (
                <tr key={index} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                  <td className="py-4 px-4 font-medium">{player.name}</td>
                  <td className="py-4 px-4 text-center text-green-400">{player.goals}</td>
                  <td className="py-4 px-4 text-center text-blue-400">{player.assists}</td>
                  <td className="py-4 px-4 text-center text-yellow-400">{player.playerOfTheMatch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Enhanced Leagues View with Web Link Integration
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
        {/* League URL Configuration */}
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
              <button 
                onClick={() => window.open(savedUrl, '_blank')}
                className="mt-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all"
              >
                Open League Website
              </button>
            </div>
          )}
        </div>

        {/* League Features Coming Soon */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-3xl p-12 border border-slate-700/50 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="text-white text-4xl">🏆</span>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-6">Advanced League Management Coming Soon</h3>
          <p className="text-gray-300 mb-8 max-w-md mx-auto">
            Create and manage leagues and tournaments with automatic standings, fixture generation, and live updates from your league website.
          </p>
          <div className="text-gray-400 text-sm">
            <p>• Automatic league table updates</p>
            <p>• Live fixture integration</p>
            <p>• Tournament brackets</p>
            <p>• League statistics and reports</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simplified Match Creation View
const MatchView = ({ teams, onBack }) => {
  const [matchData, setMatchData] = useState({
    user_team_id: '',
    opponent_name: '',
    date: '',
    venue: '',
    is_home_game: true,
    formation: ''
  });
  const [userTeam, setUserTeam] = useState(null);
  const [availableFormations, setAvailableFormations] = useState({});

  useEffect(() => {
    const fetchFormations = async (ageGroup) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/formations/${ageGroup}`);
        return response.data.formations;
      } catch (error) {
        console.error('Error fetching formations:', error);
        return {};
      }
    };

    if (userTeam?.age_group) {
      fetchFormations(userTeam.age_group).then(formations => {
        setAvailableFormations(formations);
        const formationNames = Object.keys(formations);
        if (formationNames.length > 0) {
          setMatchData(prev => ({...prev, formation: formationNames[0]}));
        }
      });
    }
  }, [userTeam]);

  const handleTeamChange = (teamId) => {
    const selectedTeam = teams.find(t => t.id === teamId);
    setUserTeam(selectedTeam);
    setMatchData(prev => ({...prev, user_team_id: teamId}));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Create simplified match data
      const simpleMatchData = {
        user_team: userTeam.name,
        opponent_team: matchData.opponent_name,
        date: matchData.date,
        venue: matchData.venue,
        is_home_game: matchData.is_home_game,
        formation: matchData.formation,
        status: 'scheduled'
      };
      
      console.log('Creating simplified match:', simpleMatchData);
      alert('Match created successfully!');
      
      // Reset form
      setMatchData({
        user_team_id: '',
        opponent_name: '',
        date: '',
        venue: '',
        is_home_game: true,
        formation: ''
      });
      setUserTeam(null);
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Error creating match');
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
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">Create Match</h2>
      </div>

      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50 max-w-4xl mx-auto">
        <h3 className="text-2xl font-semibold mb-6 text-white">Match Details</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Your Team</label>
              <select
                value={matchData.user_team_id}
                onChange={(e) => handleTeamChange(e.target.value)}
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
              >
                <option value="">Select Your Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name} ({team.age_group})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Opposition Team</label>
              <input
                type="text"
                value={matchData.opponent_name}
                onChange={(e) => setMatchData({...matchData, opponent_name: e.target.value})}
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Enter opponent team name..."
                required
              />
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
          </div>

          {/* Home/Away Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-4">Match Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMatchData({...matchData, is_home_game: true})}
                className={`p-4 rounded-xl border-2 transition-all ${
                  matchData.is_home_game
                    ? 'border-green-500 bg-green-500/20 text-green-300'
                    : 'border-slate-600 hover:border-slate-500 text-gray-300'
                }`}
              >
                🏠 Home Game
                <p className="text-sm mt-1">Your team plays at home venue</p>
              </button>
              <button
                type="button"
                onClick={() => setMatchData({...matchData, is_home_game: false})}
                className={`p-4 rounded-xl border-2 transition-all ${
                  !matchData.is_home_game
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                    : 'border-slate-600 hover:border-slate-500 text-gray-300'
                }`}
              >
                ✈️ Away Game
                <p className="text-sm mt-1">Your team plays away</p>
              </button>
            </div>
          </div>

          {/* Formation Selection */}
          {userTeam && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">Formation</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.keys(availableFormations).map(formation => (
                  <button
                    key={formation}
                    type="button"
                    onClick={() => setMatchData({...matchData, formation})}
                    className={`p-3 rounded-xl border-2 transition-all font-medium ${
                      matchData.formation === formation
                        ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                        : 'border-slate-600 hover:border-slate-500 text-gray-300'
                    }`}
                  >
                    {formation}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Match Preview */}
          {matchData.user_team_id && matchData.opponent_name && (
            <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600">
              <h4 className="text-lg font-semibold text-white mb-4">Match Preview</h4>
              <div className="flex items-center justify-between">
                <div className={`text-center ${matchData.is_home_game ? 'order-1' : 'order-3'}`}>
                  <p className="text-white font-semibold">{userTeam?.name}</p>
                  <p className="text-sm text-gray-400">{matchData.is_home_game ? 'Home' : 'Away'}</p>
                </div>
                <div className="order-2 text-center">
                  <p className="text-2xl font-bold text-white">VS</p>
                  <p className="text-sm text-gray-400">{new Date(matchData.date).toLocaleDateString()}</p>
                </div>
                <div className={`text-center ${matchData.is_home_game ? 'order-3' : 'order-1'}`}>
                  <p className="text-white font-semibold">{matchData.opponent_name}</p>
                  <p className="text-sm text-gray-400">{matchData.is_home_game ? 'Away' : 'Home'}</p>
                </div>
              </div>
            </div>
          )}
          
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

// Fixtures View Component  
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
        <button 
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-medium"
        >
          Create Your First Match
        </button>
      </div>
    </div>
  );
};

// Enhanced Team View Component with Player Management
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
      console.log('Creating team:', newTeam);
      await onAddTeam(newTeam);
      console.log('Team created successfully');
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
                  <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd"></path>
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
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

// Enhanced Squad View Component with Player Management
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
    photo_url: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const positions = ['GK', 'DEF', 'MID', 'FWD'];
  const ages = Array.from({length: 98}, (_, i) => i + 3);

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
        photo_url: ''
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
    // Refresh the team data would happen in parent component
  };

  const handlePlayerDelete = async (playerId) => {
    await onPlayerDelete(playerId);
    // Refresh the team data would happen in parent component
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
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="First name..."
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
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Last name..."
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
              <select
                value={newPlayer.age}
                onChange={(e) => setNewPlayer({...newPlayer, age: parseInt(e.target.value)})}
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
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
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
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
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Photo Upload</label>
              <input
                type="file"
                accept="image/*"
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white"
                disabled={isLoading}
              />
            </div>
            <div className="md:col-span-2 flex space-x-4">
              <button 
                type="submit"
                disabled={isLoading}
                className={`px-8 py-3 rounded-xl font-medium transition-all ${
                  isLoading 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
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
        {team.players?.map((player) => (
          <div 
            key={player.id} 
            onClick={() => handlePlayerClick(player)}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
          >
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {player.squad_number}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {player.first_name} {player.last_name}
                </h3>
                <p className="text-blue-400 font-medium">{player.position}</p>
                <p className="text-gray-400 text-sm">Age: {player.age}</p>
              </div>
            </div>
            <div className="text-xs text-gray-400 text-center">
              Click to edit
            </div>
          </div>
        ))}
      </div>

      {/* Player Edit Modal */}
      <PlayerEditModal
        isOpen={showPlayerModal}
        onClose={() => setShowPlayerModal(false)}
        player={selectedPlayer}
        onSave={handlePlayerUpdate}
        onDelete={handlePlayerDelete}
      />
    </div>
  );
};

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedTeamForStats, setSelectedTeamForStats] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showCookieModal, setShowCookieModal] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      console.log('Fetching teams from:', `${API_BASE_URL}/api/teams`);
      const response = await axios.get(`${API_BASE_URL}/api/teams`);
      console.log('Teams fetched:', response.data);
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamAdd = async (teamData) => {
    try {
      console.log('Frontend: Starting team creation with data:', teamData);
      console.log('API URL:', `${API_BASE_URL}/api/teams`);
      
      const response = await axios.post(`${API_BASE_URL}/api/teams`, teamData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Frontend: Team creation response:', response.data);
      
      // Force refresh teams list
      console.log('Frontend: Refreshing teams list...');
      await fetchTeams();
      console.log('Frontend: Teams refreshed successfully');
      
      return response.data;
    } catch (error) {
      console.error('Frontend: Error creating team:', error);
      console.error('Frontend: Error details:', error.response?.data);
      throw error;
    }
  };

  const handlePlayerAdd = async (playerData) => {
    try {
      console.log('Adding player:', playerData, 'to team:', selectedTeam.id);
      await axios.post(`${API_BASE_URL}/api/teams/${selectedTeam.id}/players`, playerData);
      
      // Update team players
      const response = await axios.get(`${API_BASE_URL}/api/teams/${selectedTeam.id}/players`);
      setSelectedTeam({
        ...selectedTeam,
        players: response.data
      });
    } catch (error) {
      console.error('Error adding player:', error);
      throw error;
    }
  };

  const handlePlayerUpdate = async (updatedPlayer) => {
    try {
      await axios.put(`${API_BASE_URL}/api/teams/${selectedTeam.id}/players/${updatedPlayer.id}`, updatedPlayer);
      
      // Update team players
      const response = await axios.get(`${API_BASE_URL}/api/teams/${selectedTeam.id}/players`);
      setSelectedTeam({
        ...selectedTeam,
        players: response.data
      });
    } catch (error) {
      console.error('Error updating player:', error);
      throw error;
    }
  };

  const handlePlayerDelete = async (playerId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/teams/${selectedTeam.id}/players/${playerId}`);
      
      // Update team players
      const response = await axios.get(`${API_BASE_URL}/api/teams/${selectedTeam.id}/players`);
      setSelectedTeam({
        ...selectedTeam,
        players: response.data
      });
    } catch (error) {
      console.error('Error deleting player:', error);
      throw error;
    }
  };

  const handleTeamDelete = async (teamId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/teams/${teamId}`);
      await fetchTeams(); // Refresh teams list
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    setSelectedTeam(null);
    setSelectedTeamForStats(null);
  };

  const handleTeamSelectForStats = (team) => {
    setSelectedTeamForStats(team);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-4 border-cyan-500 border-t-transparent mx-auto mb-8"></div>
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-4">
            Loading Grassroots Match Tracker
          </h2>
          <p className="text-gray-400">Initializing the future of football management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Main Content */}
      {currentView === 'dashboard' && (
        <DashboardView 
          teams={teams}
          onNavigate={handleNavigate}
        />
      )}

      {currentView === 'teams' && !selectedTeam && (
        <TeamView 
          teams={teams}
          onTeamSelect={setSelectedTeam}
          onAddTeam={handleTeamAdd}
          onDeleteTeam={handleTeamDelete}
          onViewMatches={() => setCurrentView('matches')}
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {selectedTeam && (
        <SquadView 
          team={selectedTeam}
          onBack={() => setSelectedTeam(null)}
          onPlayerAdd={handlePlayerAdd}
          onPlayerUpdate={handlePlayerUpdate}
          onPlayerDelete={handlePlayerDelete}
        />
      )}

      {currentView === 'matches' && (
        <MatchView 
          teams={teams}
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'statistics' && !selectedTeamForStats && (
        <StatisticsView 
          teams={teams}
          onBack={() => setCurrentView('dashboard')}
          onTeamSelect={handleTeamSelectForStats}
        />
      )}

      {selectedTeamForStats && (
        <TeamStatsView 
          team={selectedTeamForStats}
          onBack={() => setSelectedTeamForStats(null)}
        />
      )}

      {currentView === 'fixtures' && (
        <FixturesView 
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'leagues' && (
        <LeaguesView 
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {/* Footer - only show on dashboard */}
      {currentView === 'dashboard' && (
        <footer className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-8 border-t border-slate-700">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <p>&copy; 2025 Grassroots Match Tracker. All rights reserved.</p>
              </div>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <button 
                  onClick={() => setShowPrivacyModal(true)}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Privacy Policy
                </button>
                <button 
                  onClick={() => setShowTermsModal(true)}
                  className="hover:text-cyan-400 transition-colors"
                >
                  Terms & Conditions
                </button>
                <a href="#" className="hover:text-cyan-400 transition-colors">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}

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