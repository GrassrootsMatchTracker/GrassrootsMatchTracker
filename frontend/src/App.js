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
                src="/grassroots-logo.svg" 
                alt="Grassroots Match Tracker" 
                className="h-20 w-auto filter drop-shadow-2xl"
                onError={(e) => {
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
                <p className="text-gray-400 mb-6">Create and manage your football teams with advanced squad management tools</p>
                <div className="flex items-center text-cyan-400 font-medium">
                  <span>Manage Teams</span>
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
                <p className="text-gray-400 mb-6">Schedule matches with interactive formations and advanced squad selection</p>
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
                <p className="text-gray-400 mb-6">Advanced analytics and performance tracking for teams and players</p>
                <div className="flex items-center text-green-400 font-medium">
                  <span>View Stats</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                  </svg>
                </div>
              </div>
            </div>

            {/* Players */}
            <div 
              onClick={() => onNavigate('players')}
              className="group relative bg-gradient-to-br from-yellow-500/10 to-orange-600/10 backdrop-blur-lg rounded-3xl p-8 border border-yellow-500/20 hover:border-yellow-400/50 cursor-pointer transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-600/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"></path>
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-yellow-300 transition-colors">Players</h3>
                <p className="text-gray-400 mb-6">Comprehensive player database and performance management</p>
                <div className="flex items-center text-yellow-400 font-medium">
                  <span>Manage Players</span>
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
                <p className="text-gray-400 mb-6">Tournament and league management with rankings</p>
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

// Statistics View Component
const StatisticsView = ({ teams, onBack }) => {
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold mb-4 text-white">Teams by Age Group</h3>
          <div className="space-y-3">
            {['U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18'].map(ageGroup => {
              const count = teams.filter(team => team.age_group === ageGroup).length;
              return (
                <div key={ageGroup} className="flex justify-between items-center">
                  <span className="font-medium text-gray-300">{ageGroup}</span>
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {count} teams
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
          <h3 className="text-xl font-semibold mb-4 text-white">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-lg border border-green-500/30">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-white">System Ready</p>
                <p className="text-sm text-gray-300">Grassroots Match Tracker is operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Players View Component
const PlayersView = ({ teams, onBack }) => {
  const allPlayers = teams.flatMap(team => 
    (team.players || []).map(player => ({
      ...player,
      teamName: team.name,
      teamAgeGroup: team.age_group
    }))
  );

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
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">All Players</h2>
        <span className="ml-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
          {allPlayers.length} players
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allPlayers.map((player) => (
          <div key={player.id} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {player.squad_number}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">
                  {player.first_name} {player.last_name}
                </h3>
                <p className="text-blue-400 font-medium">{player.position}</p>
                <p className="text-gray-400 text-sm">Age: {player.age}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-300">Team: {player.teamName}</p>
              <p className="text-sm text-gray-300">Age Group: {player.teamAgeGroup}</p>
            </div>
          </div>
        ))}
        
        {allPlayers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-300 text-3xl">👥</span>
            </div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">No Players Found</h3>
            <p className="text-gray-400">Add teams and players to see them here</p>
          </div>
        )}
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

// Leagues View Component
const LeaguesView = ({ onBack }) => {
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

      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-3xl p-12 border border-slate-700/50 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-white text-4xl">🏆</span>
        </div>
        <h3 className="text-2xl font-semibold text-white mb-6">League Management Coming Soon</h3>
        <p className="text-gray-300 mb-8 max-w-md mx-auto">
          Create and manage leagues and tournaments for your grassroots teams. 
          Track standings, manage fixtures, and celebrate victories!
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-medium"
        >
          Coming Soon
        </button>
      </div>
    </div>
  );
};

// Team View Component
const TeamView = ({ teams, onTeamSelect, onAddTeam, onViewMatches, onBack }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    age_group: 'U13'
  });

  const ageGroups = ['U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onAddTeam(newTeam);
      setNewTeam({ name: '', age_group: 'U13' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding team:', error);
      alert('Error adding team. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="flex items-center justify-between mb-8">
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
        <div className="space-x-4">
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg font-medium"
          >
            ➕ Add New Team
          </button>
          <button 
            onClick={onViewMatches}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg font-medium"
          >
            📅 View Matches
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-slate-700/50">
          <h3 className="text-2xl font-semibold mb-6 text-white">Add New Team</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Team Name</label>
              <input
                type="text"
                value={newTeam.name}
                onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                placeholder="Enter team name..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Age Group</label>
              <select
                value={newTeam.age_group}
                onChange={(e) => setNewTeam({...newTeam, age_group: e.target.value})}
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                required
              >
                {ageGroups.map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>
            <div className="flex space-x-4">
              <button 
                type="submit"
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-medium"
              >
                Create Team
              </button>
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
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
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {team.name.charAt(0)}
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-semibold text-white group-hover:text-cyan-300 transition-colors">{team.name}</h3>
                <p className="text-cyan-400 font-medium">{team.age_group}</p>
              </div>
            </div>
            <div className="mb-4">
              <p className="text-gray-300">Players: {team.players?.length || 0}</p>
            </div>
            <button 
              onClick={() => onTeamSelect(team)}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 rounded-xl hover:from-cyan-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 font-medium"
            >
              Manage Team
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Squad View Component
const SquadView = ({ team, onBack, onPlayerAdd }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    first_name: '',
    last_name: '',
    age: 16,
    position: 'MID',
    squad_number: 1,
    photo_url: ''
  });

  const positions = ['GK', 'DEF', 'MID', 'FWD'];
  const ages = Array.from({length: 98}, (_, i) => i + 3);

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Error adding player. Please try again.');
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
              <select
                value={newPlayer.age}
                onChange={(e) => setNewPlayer({...newPlayer, age: parseInt(e.target.value)})}
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                required
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Photo URL (Optional)</label>
              <input
                type="url"
                value={newPlayer.photo_url}
                onChange={(e) => setNewPlayer({...newPlayer, photo_url: e.target.value})}
                className="w-full p-4 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="https://..."
              />
            </div>
            <div className="md:col-span-2 flex space-x-4">
              <button 
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
              >
                Add Player
              </button>
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
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
          <div key={player.id} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {player.squad_number}
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-white">
                  {player.first_name} {player.last_name}
                </h3>
                <p className="text-blue-400 font-medium">{player.position}</p>
                <p className="text-gray-400 text-sm">Age: {player.age}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Formation Pitch Component (keeping the same as it works)
const FormationPitch = ({ formation, players, selectedPlayers, onPlayerSelect, substitutes, onSubstituteSelect }) => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  
  if (!formation || !formation.positions) return null;

  const handlePositionClick = (position) => {
    setSelectedPosition(selectedPosition === position.id ? null : position.id);
  };

  const handlePlayerSelection = (playerId, positionId) => {
    onPlayerSelect(playerId, positionId);
    setSelectedPosition(null);
  };

  const getPlayerAtPosition = (positionId) => {
    return selectedPlayers.find(p => p.position === positionId);
  };

  const availablePlayers = players.filter(p => 
    !selectedPlayers.some(sp => sp.playerId === p.id) &&
    !substitutes.some(sub => sub.id === p.id)
  );

  return (
    <div className="space-y-6">
      {/* Main Pitch */}
      <div className="relative bg-gradient-to-b from-green-400 to-green-500 rounded-xl shadow-lg">
        <svg viewBox="0 0 100 100" className="w-full h-96">
          {/* Pitch markings */}
          <rect x="10" y="10" width="80" height="80" fill="none" stroke="white" strokeWidth="0.5"/>
          <line x1="10" y1="50" x2="90" y2="50" stroke="white" strokeWidth="0.3"/>
          <circle cx="50" cy="50" r="8" fill="none" stroke="white" strokeWidth="0.3"/>
          <rect x="10" y="25" width="15" height="50" fill="none" stroke="white" strokeWidth="0.3"/>
          <rect x="75" y="25" width="15" height="50" fill="none" stroke="white" strokeWidth="0.3"/>
          
          {/* Position markers */}
          {formation.positions.map((position) => {
            const assignedPlayer = getPlayerAtPosition(position.id);
            const isSelected = selectedPosition === position.id;
            
            return (
              <g key={position.id}>
                <circle
                  cx={position.x}
                  cy={position.y}
                  r="3"
                  fill={assignedPlayer ? "#3B82F6" : "#EF4444"}
                  stroke="white"
                  strokeWidth="0.5"
                  className="cursor-pointer hover:stroke-yellow-400 hover:stroke-2 transition-all"
                  onClick={() => handlePositionClick(position)}
                />
                <text
                  x={position.x}
                  y={position.y + 1}
                  textAnchor="middle"
                  fontSize="2"
                  fill="white"
                  className="pointer-events-none font-bold"
                >
                  {position.label}
                </text>
                {assignedPlayer && (
                  <text
                    x={position.x}
                    y={position.y - 4}
                    textAnchor="middle"
                    fontSize="1.5"
                    fill="white"
                    className="pointer-events-none"
                  >
                    {assignedPlayer.playerName.split(' ')[0]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Player Selection Dropdown */}
        {selectedPosition && (
          <div className="absolute top-4 right-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg shadow-lg p-4 w-64 z-10 border border-slate-700">
            <h4 className="font-semibold mb-2 text-white">
              Select Player for {formation.positions.find(p => p.id === selectedPosition)?.label}
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {availablePlayers.map(player => (
                <button
                  key={player.id}
                  onClick={() => handlePlayerSelection(player.id, selectedPosition)}
                  className="w-full text-left p-2 hover:bg-slate-700 rounded flex items-center text-white"
                >
                  <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-2">
                    {player.squad_number}
                  </span>
                  <div>
                    <div className="font-medium">{player.first_name} {player.last_name}</div>
                    <div className="text-sm text-gray-400">{player.position}</div>
                  </div>
                </button>
              ))}
              {availablePlayers.length === 0 && (
                <p className="text-gray-400 text-sm">No available players</p>
              )}
            </div>
            <button
              onClick={() => setSelectedPosition(null)}
              className="mt-2 w-full bg-gray-600 text-white py-1 rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Substitutes Bench */}
      <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-xl p-6 border border-slate-700/50">
        <h3 className="text-lg font-semibold mb-4 flex items-center text-white">
          <span className="mr-2">🪑</span>
          Substitutes Bench ({substitutes.length}/6)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({length: 6}).map((_, index) => {
            const substitute = substitutes[index];
            return (
              <div
                key={index}
                className={`border-2 border-dashed rounded-lg p-4 h-24 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  substitute ? 'border-blue-500 bg-blue-500/20' : 'border-gray-600 hover:border-gray-500'
                }`}
                onClick={() => {
                  if (!substitute && availablePlayers.length > 0) {
                    // Open substitute selection
                    const player = availablePlayers[0]; // For demo, select first available
                    onSubstituteSelect(player);
                  }
                }}
              >
                {substitute ? (
                  <>
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                      {substitute.squad_number}
                    </div>
                    <div className="text-xs text-center mt-1 text-white">
                      {substitute.first_name}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400 text-xs text-center">
                    Available
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Available players for substitutes */}
        {availablePlayers.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-300 mb-2">Available Players:</h4>
            <div className="flex flex-wrap gap-2">
              {availablePlayers.slice(0, 6 - substitutes.length).map(player => (
                <button
                  key={player.id}
                  onClick={() => onSubstituteSelect(player)}
                  className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded-full text-sm flex items-center text-white"
                >
                  <span className="w-5 h-5 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs mr-1">
                    {player.squad_number}
                  </span>
                  {player.first_name} {player.last_name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Match View Component (keeping similar structure but with futuristic styling)
const MatchView = ({ teams, onBack }) => {
  const [step, setStep] = useState(1);
  const [matchData, setMatchData] = useState({
    home_team_id: '',
    away_team_id: '',
    date: '',
    venue: '',
    home_formation: '',
    away_formation: '',
    home_lineup: [],
    away_lineup: [],
    home_substitutes: [],
    away_substitutes: []
  });
  const [homeTeamPlayers, setHomeTeamPlayers] = useState([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState([]);
  const [selectedHomePlayers, setSelectedHomePlayers] = useState([]);
  const [selectedAwayPlayers, setSelectedAwayPlayers] = useState([]);
  const [homeSubstitutes, setHomeSubstitutes] = useState([]);
  const [awaySubstitutes, setAwaySubstitutes] = useState([]);
  const [homeTeamAgeGroup, setHomeTeamAgeGroup] = useState('');
  const [awayTeamAgeGroup, setAwayTeamAgeGroup] = useState('');
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

    if (homeTeamAgeGroup) {
      fetchFormations(homeTeamAgeGroup).then(formations => {
        setAvailableFormations(prev => ({...prev, home: formations}));
        // Set default formation
        const formationNames = Object.keys(formations);
        if (formationNames.length > 0) {
          setMatchData(prev => ({...prev, home_formation: formationNames[0]}));
        }
      });
    }

    if (awayTeamAgeGroup) {
      fetchFormations(awayTeamAgeGroup).then(formations => {
        setAvailableFormations(prev => ({...prev, away: formations}));
        // Set default formation
        const formationNames = Object.keys(formations);
        if (formationNames.length > 0) {
          setMatchData(prev => ({...prev, away_formation: formationNames[0]}));
        }
      });
    }
  }, [homeTeamAgeGroup, awayTeamAgeGroup]);

  const handleFormationChange = (team, formation) => {
    if (team === 'home') {
      setMatchData(prev => ({...prev, home_formation: formation}));
      setSelectedHomePlayers([]); // Reset player selection when formation changes
    } else {
      setMatchData(prev => ({...prev, away_formation: formation}));
      setSelectedAwayPlayers([]); // Reset player selection when formation changes
    }
  };

  const handlePlayerSelect = (playerId, positionId, team) => {
    const player = team === 'home' 
      ? homeTeamPlayers.find(p => p.id === playerId)
      : awayTeamPlayers.find(p => p.id === playerId);
    
    if (!player) return;

    const newSelection = {
      playerId: player.id,
      playerName: `${player.first_name} ${player.last_name}`,
      position: positionId,
      squad_number: player.squad_number
    };

    if (team === 'home') {
      setSelectedHomePlayers(prev => {
        const filtered = prev.filter(p => p.position !== positionId);
        return [...filtered, newSelection];
      });
    } else {
      setSelectedAwayPlayers(prev => {
        const filtered = prev.filter(p => p.position !== positionId);
        return [...filtered, newSelection];
      });
    }
  };

  const handleSubstituteSelect = (player, team) => {
    if (team === 'home') {
      if (homeSubstitutes.length < 6) {
        setHomeSubstitutes(prev => [...prev, player]);
      }
    } else {
      if (awaySubstitutes.length < 6) {
        setAwaySubstitutes(prev => [...prev, player]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      // Fetch team players when moving to step 2
      try {
        const homeTeam = teams.find(t => t.id === matchData.home_team_id);
        const awayTeam = teams.find(t => t.id === matchData.away_team_id);
        
        setHomeTeamAgeGroup(homeTeam?.age_group || 'U13');
        setAwayTeamAgeGroup(awayTeam?.age_group || 'U13');

        const homePlayersResponse = await axios.get(`${API_BASE_URL}/api/teams/${matchData.home_team_id}/players`);
        const awayPlayersResponse = await axios.get(`${API_BASE_URL}/api/teams/${matchData.away_team_id}/players`);
        
        setHomeTeamPlayers(homePlayersResponse.data);
        setAwayTeamPlayers(awayPlayersResponse.data);
        setStep(2);
      } catch (error) {
        console.error('Error fetching team players:', error);
      }
    } else {
      // Create match
      try {
        const finalMatchData = {
          ...matchData,
          home_lineup: selectedHomePlayers.map(p => p.playerId),
          away_lineup: selectedAwayPlayers.map(p => p.playerId),
          home_substitutes: homeSubstitutes.map(p => p.id),
          away_substitutes: awaySubstitutes.map(p => p.id)
        };
        
        await axios.post(`${API_BASE_URL}/api/matches`, finalMatchData);
        alert('Match created successfully!');
        onBack();
      } catch (error) {
        console.error('Error creating match:', error);
        alert('Error creating match');
      }
    }
  };

  const canCreateMatch = () => {
    const homeFormation = availableFormations.home?.[matchData.home_formation];
    const awayFormation = availableFormations.away?.[matchData.away_formation];
    
    return selectedHomePlayers.length === (homeFormation?.positions?.length || 0) &&
           selectedAwayPlayers.length === (awayFormation?.positions?.length || 0);
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
        <div className="ml-6 flex items-center space-x-4">
          <div className={`flex items-center ${step >= 1 ? 'text-green-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-500 text-white' : 'bg-gray-600'}`}>
              1
            </div>
            <span className="ml-2">Match Details</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-600"></div>
          <div className={`flex items-center ${step >= 2 ? 'text-green-400' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-500 text-white' : 'bg-gray-600'}`}>
              2
            </div>
            <span className="ml-2">Squad Selection</span>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
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
                  {teams.filter(team => team.id !== matchData.home_team_id).map(team => (
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
            </div>
            <button 
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg font-medium"
            >
              Next: Squad Selection →
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
            <h3 className="text-2xl font-semibold mb-6 text-white">Squad Selection & Formation</h3>
            
            {/* Formation Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-lg font-medium mb-4 text-blue-400">Home Team Formation</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(availableFormations.home || {}).map(formation => (
                    <button
                      key={formation}
                      onClick={() => handleFormationChange('home', formation)}
                      className={`p-3 rounded-xl border-2 transition-all font-medium ${
                        matchData.home_formation === formation
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                          : 'border-slate-600 hover:border-slate-500 text-gray-300'
                      }`}
                    >
                      {formation}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium mb-4 text-red-400">Away Team Formation</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(availableFormations.away || {}).map(formation => (
                    <button
                      key={formation}
                      onClick={() => handleFormationChange('away', formation)}
                      className={`p-3 rounded-xl border-2 transition-all font-medium ${
                        matchData.away_formation === formation
                          ? 'border-red-500 bg-red-500/20 text-red-300'
                          : 'border-slate-600 hover:border-slate-500 text-gray-300'
                      }`}
                    >
                      {formation}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Squad Selection */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Home Team */}
              <div>
                <h4 className="text-lg font-medium mb-4 text-blue-400">
                  Home Team: {teams.find(t => t.id === matchData.home_team_id)?.name}
                  <span className="ml-2 text-sm text-gray-400">({selectedHomePlayers.length}/{availableFormations.home?.[matchData.home_formation]?.positions?.length || 0})</span>
                </h4>
                {availableFormations.home?.[matchData.home_formation] && (
                  <FormationPitch
                    formation={availableFormations.home[matchData.home_formation]}
                    players={homeTeamPlayers}
                    selectedPlayers={selectedHomePlayers}
                    onPlayerSelect={(playerId, positionId) => handlePlayerSelect(playerId, positionId, 'home')}
                    substitutes={homeSubstitutes}
                    onSubstituteSelect={(player) => handleSubstituteSelect(player, 'home')}
                  />
                )}
              </div>

              {/* Away Team */}
              <div>
                <h4 className="text-lg font-medium mb-4 text-red-400">
                  Away Team: {teams.find(t => t.id === matchData.away_team_id)?.name}
                  <span className="ml-2 text-sm text-gray-400">({selectedAwayPlayers.length}/{availableFormations.away?.[matchData.away_formation]?.positions?.length || 0})</span>
                </h4>
                {availableFormations.away?.[matchData.away_formation] && (
                  <FormationPitch
                    formation={availableFormations.away[matchData.away_formation]}
                    players={awayTeamPlayers}
                    selectedPlayers={selectedAwayPlayers}
                    onPlayerSelect={(playerId, positionId) => handlePlayerSelect(playerId, positionId, 'away')}
                    substitutes={awaySubstitutes}
                    onSubstituteSelect={(player) => handleSubstituteSelect(player, 'away')}
                  />
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button 
                onClick={() => setStep(1)}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all font-medium"
              >
                ← Previous
              </button>
              <button 
                onClick={handleSubmit}
                disabled={!canCreateMatch()}
                className={`px-8 py-3 rounded-xl font-medium transition-all ${
                  canCreateMatch()
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 shadow-lg'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                Create Match ⚽
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedTeam, setSelectedTeam] = useState(null);
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
      const response = await axios.get(`${API_BASE_URL}/api/teams`);
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamAdd = async (teamData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/teams`, teamData);
      console.log('Team creation response:', response.data);
      await fetchTeams(); // Refresh teams list
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  };

  const handlePlayerAdd = async (playerData) => {
    try {
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

  const handleNavigate = (view) => {
    setCurrentView(view);
    setSelectedTeam(null);
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
          onViewMatches={() => setCurrentView('matches')}
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {selectedTeam && (
        <SquadView 
          team={selectedTeam}
          onBack={() => setSelectedTeam(null)}
          onPlayerAdd={handlePlayerAdd}
        />
      )}

      {currentView === 'matches' && (
        <MatchView 
          teams={teams}
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'statistics' && (
        <StatisticsView 
          teams={teams}
          onBack={() => setCurrentView('dashboard')}
        />
      )}

      {currentView === 'players' && (
        <PlayersView 
          teams={teams}
          onBack={() => setCurrentView('dashboard')}
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