import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EnhancedLiveMatchInterface from './EnhancedLiveMatchInterface';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const EnhancedFixturesView = ({ onBack, teams }) => {
  const [fixtures, setFixtures] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'live', 'result'
  const [newFixture, setNewFixture] = useState({
    user_team_id: '',
    user_team_type: 'home',
    opposition_name: '',
    date: '',
    venue: '',
    formation: '4-4-2',
    match_format: '11v11',
    match_type: 'Friendly'
  });

  const matchFormats = ['5v5', '6v6', '7v7', '8v8', '9v9', '10v10', '11v11'];
  const matchTypes = ['League', 'Friendly', 'Cup'];

  useEffect(() => {
    loadFixtures();
  }, []);

  const loadFixtures = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/matches`);
      setFixtures(response.data);
    } catch (error) {
      console.error('Error loading fixtures:', error);
    }
  };

  const handleAddFixture = async (e) => {
    e.preventDefault();
    try {
      const fixtureData = {
        ...newFixture,
        home_team_id: newFixture.user_team_type === 'home' ? newFixture.user_team_id : null,
        away_team_id: newFixture.user_team_type === 'away' ? newFixture.user_team_id : null,
        home_formation: newFixture.user_team_type === 'home' ? newFixture.formation : '4-4-2',
        away_formation: newFixture.user_team_type === 'away' ? newFixture.formation : '4-4-2',
        status: 'scheduled'
      };

      await axios.post(`${API_BASE_URL}/api/matches`, fixtureData);
      setNewFixture({
        user_team_id: '',
        user_team_type: 'home',
        opposition_name: '',
        date: '',
        venue: '',
        formation: '4-4-2',
        match_format: '11v11',
        match_type: 'Friendly'
      });
      setShowAddForm(false);
      loadFixtures();
      alert('Fixture added successfully!');
    } catch (error) {
      console.error('Error adding fixture:', error);
      alert('Error adding fixture. Please try again.');
    }
  };

  const handleDeleteFixture = async (fixtureId) => {
    if (window.confirm('Are you sure you want to delete this fixture?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/matches/${fixtureId}`);
        loadFixtures();
        alert('Fixture deleted successfully!');
      } catch (error) {
        console.error('Error deleting fixture:', error);
        alert('Error deleting fixture. Please try again.');
      }
    }
  };

  const handleStartMatch = (fixture) => {
    setSelectedMatch(fixture);
    setViewMode('live');
  };

  const handleViewResult = (fixture) => {
    setSelectedMatch(fixture);
    setViewMode('result');
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const getMatchStatus = (fixture) => {
    switch (fixture.status) {
      case 'scheduled':
        return { text: 'Scheduled', color: 'bg-blue-500' };
      case 'live':
        return { text: 'Live', color: 'bg-green-500' };
      case 'completed':
        return { text: 'Completed', color: 'bg-gray-500' };
      default:
        return { text: 'Unknown', color: 'bg-gray-400' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (viewMode === 'live' && selectedMatch) {
    return (
      <EnhancedLiveMatchInterface 
        match={selectedMatch} 
        onBack={() => {
          setViewMode('list');
          setSelectedMatch(null);
          loadFixtures(); // Reload to get updated match data
        }} 
      />
    );
  }

  if (viewMode === 'result' && selectedMatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => {
              setViewMode('list');
              setSelectedMatch(null);
            }}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 mr-4 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
            </svg>
            <span>Back to Fixtures</span>
          </button>
          <h2 className="text-4xl font-bold text-white">Match Result</h2>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 border border-slate-700/50">
            {/* Match Header */}
            <div className="text-center mb-8">
              <h3 className="text-3xl font-bold text-white mb-4">
                {selectedMatch.home_team_id ? getTeamName(selectedMatch.home_team_id) : selectedMatch.opposition_name}
                <span className="mx-6 text-purple-400">VS</span>
                {selectedMatch.away_team_id ? getTeamName(selectedMatch.away_team_id) : selectedMatch.opposition_name}
              </h3>
              <p className="text-gray-300">{formatDate(selectedMatch.date)} • {selectedMatch.venue}</p>
              <p className="text-gray-400">{selectedMatch.match_format} • {selectedMatch.match_type}</p>
            </div>

            {/* Score */}
            <div className="flex items-center justify-center mb-8">
              <div className="text-center">
                <p className="text-6xl font-bold text-blue-400">{selectedMatch.score_home}</p>
              </div>
              <div className="mx-8">
                <p className="text-2xl text-gray-400">-</p>
              </div>
              <div className="text-center">
                <p className="text-6xl font-bold text-red-400">{selectedMatch.score_away}</p>
              </div>
            </div>

            {/* Match Events */}
            {selectedMatch.events && selectedMatch.events.length > 0 && (
              <div className="mt-8">
                <h4 className="text-xl font-semibold text-white mb-4">Match Events</h4>
                <div className="space-y-3">
                  {selectedMatch.events.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">
                          {event.event_type === 'goal' && '⚽'}
                          {event.event_type === 'assist' && '🎯'}
                          {event.event_type === 'yellow_card' && '🟨'}
                          {event.event_type === 'red_card' && '🟥'}
                          {event.event_type === 'substitution' && '🔄'}
                        </span>
                        <div>
                          <p className="text-white font-medium">
                            {event.player_name || 'Player'}
                          </p>
                          <p className="text-gray-400 text-sm capitalize">
                            {event.event_type.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{event.minute}'</p>
                        <p className="text-gray-400 text-sm">
                          {event.team_type === 'user' ? 'Your Team' : 'Opposition'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
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
        <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Fixtures & Results</h2>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
        <div>
          <p className="text-gray-300">Manage your season fixtures and view match results</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-300 shadow-lg font-medium"
        >
          ➕ Add New Fixture
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-slate-700/50">
          <h3 className="text-2xl font-semibold mb-6 text-white">Add New Fixture</h3>
          <form onSubmit={handleAddFixture} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Your Team</label>
              <select
                value={newFixture.user_team_id}
                onChange={(e) => setNewFixture({...newFixture, user_team_id: e.target.value})}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                required
              >
                <option value="">Select Your Team</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name} ({team.age_group})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">You are playing</label>
              <select
                value={newFixture.user_team_type}
                onChange={(e) => setNewFixture({...newFixture, user_team_type: e.target.value})}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
              >
                <option value="home">Home</option>
                <option value="away">Away</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Opposition Team</label>
              <input
                type="text"
                value={newFixture.opposition_name}
                onChange={(e) => setNewFixture({...newFixture, opposition_name: e.target.value})}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400"
                placeholder="Enter opposition team name..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date & Time</label>
              <input
                type="datetime-local"
                value={newFixture.date}
                onChange={(e) => setNewFixture({...newFixture, date: e.target.value})}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Venue</label>
              <input
                type="text"
                value={newFixture.venue}
                onChange={(e) => setNewFixture({...newFixture, venue: e.target.value})}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400"
                placeholder="Enter venue..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Match Format</label>
              <select
                value={newFixture.match_format}
                onChange={(e) => setNewFixture({...newFixture, match_format: e.target.value})}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
              >
                {matchFormats.map(format => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Match Type</label>
              <select
                value={newFixture.match_type}
                onChange={(e) => setNewFixture({...newFixture, match_type: e.target.value})}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
              >
                {matchTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex space-x-4">
              <button 
                type="submit"
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-medium"
              >
                Add Fixture
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

      {/* Fixtures List */}
      <div className="space-y-4">
        {fixtures.length === 0 ? (
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-3xl p-12 border border-slate-700/50 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
              <span className="text-white text-4xl">📅</span>
            </div>
            <h3 className="text-2xl font-semibold text-white mb-6">No Fixtures Yet</h3>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              Start by adding your first fixture for the season. You can manage all your matches here.
            </p>
          </div>
        ) : (
          fixtures.map((fixture) => {
            const status = getMatchStatus(fixture);
            return (
              <div key={fixture.id} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className={`inline-block px-3 py-1 text-xs font-semibold text-white rounded-full ${status.color} mr-3`}>
                        {status.text}
                      </span>
                      <span className="text-gray-400 text-sm">{fixture.match_format} • {fixture.match_type}</span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-xl font-semibold text-white">
                        {fixture.home_team_id ? getTeamName(fixture.home_team_id) : fixture.opposition_name}
                      </h3>
                      <span className="text-purple-400 font-bold">VS</span>
                      <h3 className="text-xl font-semibold text-white">
                        {fixture.away_team_id ? getTeamName(fixture.away_team_id) : fixture.opposition_name}
                      </h3>
                      {fixture.status === 'completed' && (
                        <div className="flex items-center space-x-2 text-2xl font-bold">
                          <span className="text-blue-400">{fixture.score_home}</span>
                          <span className="text-gray-400">-</span>
                          <span className="text-red-400">{fixture.score_away}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-300 text-sm">{formatDate(fixture.date)} • {fixture.venue}</p>
                  </div>
                  
                  <div className="flex space-x-3">
                    {fixture.status === 'scheduled' && (
                      <button
                        onClick={() => handleStartMatch(fixture)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all font-medium"
                      >
                        Start Match
                      </button>
                    )}
                    
                    {fixture.status === 'live' && (
                      <button
                        onClick={() => handleStartMatch(fixture)}
                        className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-2 rounded-xl hover:from-orange-600 hover:to-red-700 transition-all font-medium animate-pulse"
                      >
                        Continue Live
                      </button>
                    )}
                    
                    {fixture.status === 'completed' && (
                      <button
                        onClick={() => handleViewResult(fixture)}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all font-medium"
                      >
                        View Result
                      </button>
                    )}
                    
                    {fixture.status === 'scheduled' && (
                      <button
                        onClick={() => handleDeleteFixture(fixture.id)}
                        className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EnhancedFixturesView;