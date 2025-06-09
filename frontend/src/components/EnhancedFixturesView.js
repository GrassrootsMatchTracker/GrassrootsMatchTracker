import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewLiveMatchInterface from './NewLiveMatchInterface';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const EnhancedFixturesView = ({ onBack, teams }) => {
  const [fixtures, setFixtures] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'result'
  const [newFixture, setNewFixture] = useState({
    user_team_id: '',
    user_team_type: 'home',
    opposition_name: '',
    date: '',
    venue: '',
    formation: '4-4-2',
    match_format: '11v11',
    age_group: 'U13',
    fixture_type: 'League'
  });

  const ageGroups = ['U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18'];
  const fixtureTypes = ['League', 'Cup', 'Friendly', 'Tournament', 'Play-off'];
  const formations = ['4-4-2', '4-3-3', '3-5-2', '4-5-1', '3-4-3', '5-3-2', '4-2-3-1'];

  useEffect(() => {
    loadFixtures();
  }, []);

  const loadFixtures = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/matches`);
      // Sort fixtures by date (oldest first - chronological order)
      const sortedFixtures = response.data.sort((a, b) => new Date(a.date) - new Date(b.date));
      setFixtures(sortedFixtures);
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
        match_type: newFixture.fixture_type,
        status: 'scheduled',
        score_home: 0,
        score_away: 0
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
        age_group: 'U13',
        fixture_type: 'League'
      });
      setShowAddForm(false);
      loadFixtures();
      alert('Fixture added successfully!');
    } catch (error) {
      console.error('Error adding fixture:', error);
      alert('Error adding fixture. Please try again.');
    }
  };

  const handleViewResult = (fixture) => {
    setSelectedMatch(fixture);
    setViewMode('result');
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

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getHomeAway = (fixture) => {
    if (fixture.user_team_type === 'home') {
      return 'H';
    } else {
      return 'A';
    }
  };

  const getOpponent = (fixture) => {
    if (fixture.user_team_type === 'home') {
      // User is home, show away team (opposition)
      return fixture.opposition_name || 'Unknown';
    } else {
      // User is away, show home team (opposition) 
      return fixture.opposition_name || 'Unknown';
    }
  };

  const getUserTeamName = (fixture) => {
    const team = teams.find(t => t.id === fixture.user_team_id);
    return team ? team.name : 'Your Team';
  };

  const getScoreOrTime = (fixture) => {
    if (fixture.status === 'completed') {
      return `${fixture.score_home} - ${fixture.score_away}`;
    } else if (fixture.status === 'live') {
      return 'LIVE';
    } else {
      return formatTime(fixture.date);
    }
  };

  if (viewMode === 'live' && selectedMatch) {
    return (
      <NewLiveMatchInterface 
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
      <div className="min-h-screen relative overflow-hidden">
        {/* Football Background */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1920&h=1080&fit=crop&crop=center" 
            alt="Football Stadium" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-slate-900/90"></div>
        </div>

        <div className="relative z-10 p-8">
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
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 border border-gray-200">
              {/* Match Header */}
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-800 mb-4">
                  {selectedMatch.user_team_type === 'home' ? getUserTeamName(selectedMatch) : selectedMatch.opposition_name}
                  <span className="mx-6 text-purple-600">VS</span>
                  {selectedMatch.user_team_type === 'away' ? getUserTeamName(selectedMatch) : selectedMatch.opposition_name}
                </h3>
                <p className="text-gray-600">{formatDate(selectedMatch.date)} • {selectedMatch.venue}</p>
                <p className="text-gray-500">{selectedMatch.match_format} • {selectedMatch.match_type}</p>
              </div>

              {/* Score */}
              <div className="flex items-center justify-center mb-8">
                <div className="text-center">
                  <p className="text-6xl font-bold text-blue-600">{selectedMatch.score_home}</p>
                </div>
                <div className="mx-8">
                  <p className="text-2xl text-gray-400">-</p>
                </div>
                <div className="text-center">
                  <p className="text-6xl font-bold text-red-600">{selectedMatch.score_away}</p>
                </div>
              </div>

              {/* Formation Display */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {selectedMatch.user_team_type === 'home' ? getUserTeamName(selectedMatch) : selectedMatch.opposition_name}
                  </h4>
                  <p className="text-gray-600">Formation: {selectedMatch.home_formation || '4-4-2'}</p>
                </div>
                <div className="text-center">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {selectedMatch.user_team_type === 'away' ? getUserTeamName(selectedMatch) : selectedMatch.opposition_name}
                  </h4>
                  <p className="text-gray-600">Formation: {selectedMatch.away_formation || '4-4-2'}</p>
                </div>
              </div>

              {/* Match Events */}
              {selectedMatch.events && selectedMatch.events.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-xl font-semibold text-gray-800 mb-4">Match Events</h4>
                  <div className="space-y-3">
                    {selectedMatch.events.map((event, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">
                            {event.event_type === 'goal' && '⚽'}
                            {event.event_type === 'assist' && '🎯'}
                            {event.event_type === 'yellow_card' && '🟨'}
                            {event.event_type === 'red_card' && '🟥'}
                            {event.event_type === 'substitution' && '🔄'}
                          </span>
                          <div>
                            <p className="text-gray-800 font-medium">
                              {event.player_name || 'Player'}
                            </p>
                            <p className="text-gray-600 text-sm capitalize">
                              {event.event_type.replace('_', ' ')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-blue-600 font-bold">{event.minute}'</p>
                          <p className="text-gray-500 text-sm">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Football Background */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1920&h=1080&fit=crop&crop=center" 
          alt="Football Stadium" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/85 to-slate-900/90"></div>
      </div>

      <div className="relative z-10 p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button 
              onClick={onBack}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all mr-4 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
              </svg>
              <span>Back</span>
            </button>
            <h1 className="text-3xl font-bold text-white">Fixtures & Results</h1>
          </div>
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all font-medium"
          >
            + Add Fixture
          </button>
        </div>

        {/* Add Fixture Form */}
        {showAddForm && (
          <div className="bg-white/95 backdrop-blur-lg rounded-lg p-6 mb-6 border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Add New Fixture</h3>
            <form onSubmit={handleAddFixture} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Team</label>
                <select
                  value={newFixture.user_team_id}
                  onChange={(e) => setNewFixture({...newFixture, user_team_id: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800"
                  required
                >
                  <option value="">Select Team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">H/A</label>
                <select
                  value={newFixture.user_team_type}
                  onChange={(e) => setNewFixture({...newFixture, user_team_type: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800"
                >
                  <option value="home">Home</option>
                  <option value="away">Away</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opponent</label>
                <input
                  type="text"
                  value={newFixture.opposition_name}
                  onChange={(e) => setNewFixture({...newFixture, opposition_name: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800"
                  placeholder="Opposition team"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Formation</label>
                <select
                  value={newFixture.formation}
                  onChange={(e) => setNewFixture({...newFixture, formation: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800"
                >
                  {formations.map(formation => (
                    <option key={formation} value={formation}>{formation}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
                <select
                  value={newFixture.age_group}
                  onChange={(e) => setNewFixture({...newFixture, age_group: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800"
                >
                  {ageGroups.map(age => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fixture Type</label>
                <select
                  value={newFixture.fixture_type}
                  onChange={(e) => setNewFixture({...newFixture, fixture_type: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800"
                >
                  {fixtureTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  value={newFixture.date}
                  onChange={(e) => setNewFixture({...newFixture, date: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                <input
                  type="text"
                  value={newFixture.venue}
                  onChange={(e) => setNewFixture({...newFixture, venue: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800"
                  placeholder="Venue"
                  required
                />
              </div>

              <div className="flex space-x-2">
                <button 
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-all"
                >
                  Add
                </button>
                <button 
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Fixtures Table */}
        <div className="bg-white/95 backdrop-blur-lg rounded-lg overflow-hidden border border-gray-200">
          {/* Table Header */}
          <div className="grid grid-cols-7 gap-4 p-4 bg-gray-100 border-b border-gray-200 text-sm font-semibold text-gray-700">
            <div>Date</div>
            <div>H/A</div>
            <div className="col-span-2">Opponent</div>
            <div>Type</div>
            <div>KO/Score</div>
            <div>Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200">
            {fixtures.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p className="text-lg">No fixtures added yet</p>
                <p className="text-sm">Add your first fixture to get started</p>
              </div>
            ) : (
              fixtures.map((fixture) => (
                <div key={fixture.id} className="grid grid-cols-7 gap-4 p-4 hover:bg-gray-50 transition-colors items-center">
                  {/* Date */}
                  <div className="text-sm text-gray-800 font-medium">
                    {formatDate(fixture.date)}
                  </div>

                  {/* H/A */}
                  <div className="text-center">
                    <span className={`inline-block w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center text-white ${
                      getHomeAway(fixture) === 'H' ? 'bg-blue-600' : 'bg-red-600'
                    }`}>
                      {getHomeAway(fixture)}
                    </span>
                  </div>

                  {/* Opponent */}
                  <div className="col-span-2 text-sm text-gray-800 font-medium">
                    {getOpponent(fixture)}
                  </div>

                  {/* Fixture Type */}
                  <div className="text-sm text-gray-600">
                    {fixture.match_type || fixture.age_group || 'League'}
                  </div>

                  {/* KO/Score */}
                  <div className="text-sm font-medium">
                    {fixture.status === 'completed' ? (
                      <span className="text-gray-800">{getScoreOrTime(fixture)}</span>
                    ) : fixture.status === 'live' ? (
                      <span className="text-red-600 font-bold animate-pulse">LIVE</span>
                    ) : (
                      <span className="text-gray-600">{getScoreOrTime(fixture)}</span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-1">
                    {fixture.status === 'completed' && (
                      <button
                        onClick={() => handleViewResult(fixture)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-all"
                      >
                        View
                      </button>
                    )}
                    {fixture.status === 'scheduled' && (
                      <button
                        onClick={() => handleDeleteFixture(fixture.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 transition-all"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedFixturesView;