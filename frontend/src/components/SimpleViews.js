import React, { useState } from 'react';

// Simple Fixtures View Component  
export const FixturesView = ({ onBack }) => {
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
export const LeaguesView = ({ onBack }) => {
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