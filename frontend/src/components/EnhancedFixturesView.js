import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewLiveMatchInterface from './NewLiveMatchInterface';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const EnhancedFixturesView = ({ onBack, teams }) => {
  const [fixtures, setFixtures] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list', 'live'
  const [newFixture, setNewFixture] = useState({
    user_team_id: '',
    user_team_type: 'home',
    opposition_name: '',
    date: '',
    venue: '',
    age_group: 'U13',
    fixture_type: 'League'
  });

  const ageGroups = ['U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18'];
  const fixtureTypes = ['League', 'Cup', 'Friendly', 'Tournament', 'Play-off'];

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
        match_type: newFixture.competition,
        match_format: '11v11',
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
        competition: 'League',
        attendance: ''
      });
      setShowAddForm(false);
      loadFixtures();
      alert('Fixture added successfully!');
    } catch (error) {
      console.error('Error adding fixture:', error);
      alert('Error adding fixture. Please try again.');
    }
  };

  const handleStartMatch = (fixture) => {
    setSelectedMatch(fixture);
    setViewMode('live');
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Competition</label>
                <select
                  value={newFixture.competition}
                  onChange={(e) => setNewFixture({...newFixture, competition: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800"
                >
                  {competitions.map(comp => (
                    <option key={comp} value={comp}>{comp}</option>
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendance</label>
                <input
                  type="number"
                  value={newFixture.attendance}
                  onChange={(e) => setNewFixture({...newFixture, attendance: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded text-gray-800"
                  placeholder="0"
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
          <div className="grid grid-cols-8 gap-4 p-4 bg-gray-100 border-b border-gray-200 text-sm font-semibold text-gray-700">
            <div>Date</div>
            <div>H/A</div>
            <div className="col-span-2">Opponent</div>
            <div>Competition</div>
            <div>KO/Score</div>
            <div>Attd</div>
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
                <div key={fixture.id} className="grid grid-cols-8 gap-4 p-4 hover:bg-gray-50 transition-colors items-center">
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

                  {/* Competition */}
                  <div className="text-sm text-gray-600">
                    {fixture.match_type || 'League'}
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

                  {/* Attendance */}
                  <div className="text-sm text-gray-600">
                    {fixture.attendance || '-'}
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-1">
                    {fixture.status === 'scheduled' && (
                      <button
                        onClick={() => handleStartMatch(fixture)}
                        className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 transition-all"
                      >
                        Start
                      </button>
                    )}
                    {fixture.status === 'live' && (
                      <button
                        onClick={() => handleStartMatch(fixture)}
                        className="bg-orange-600 text-white px-3 py-1 rounded text-xs hover:bg-orange-700 transition-all animate-pulse"
                      >
                        Live
                      </button>
                    )}
                    {fixture.status === 'completed' && (
                      <button
                        className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-all"
                      >
                        View
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