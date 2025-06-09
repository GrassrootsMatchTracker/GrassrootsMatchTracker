import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NewLiveMatchInterface from './NewLiveMatchInterface';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const StartMatchView = ({ onBack, teams }) => {
  const [fixtures, setFixtures] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedFixtureId, setSelectedFixtureId] = useState('');
  const [viewMode, setViewMode] = useState('select');

  useEffect(() => {
    loadScheduledFixtures();
  }, []);

  const loadScheduledFixtures = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/matches`);
      const scheduledMatches = response.data.filter(match => match.status === 'scheduled');
      const sortedMatches = scheduledMatches.sort((a, b) => new Date(a.date) - new Date(b.date));
      setFixtures(sortedMatches);
    } catch (error) {
      console.error('Error loading fixtures:', error);
    }
  };

  const getTeamName = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMatchDisplayName = (fixture) => {
    const homeTeam = fixture.user_team_type === 'home' ? getTeamName(fixture.user_team_id) : fixture.opposition_name;
    const awayTeam = fixture.user_team_type === 'away' ? getTeamName(fixture.user_team_id) : fixture.opposition_name;
    return `${homeTeam} vs ${awayTeam} - ${formatDate(fixture.date)}`;
  };

  const handleStartMatch = async () => {
    if (!selectedFixtureId) {
      alert('Please select a match to start');
      return;
    }

    const fixture = fixtures.find(f => f.id === selectedFixtureId);
    if (!fixture) {
      alert('Selected match not found');
      return;
    }

    try {
      await axios.post(`${API_BASE_URL}/api/matches/${selectedFixtureId}/start`);
      setSelectedMatch(fixture);
      setViewMode('live');
    } catch (error) {
      console.error('Error starting match:', error);
      alert('Error starting match. Please try again.');
    }
  };

  if (viewMode === 'live' && selectedMatch) {
    return (
      <NewLiveMatchInterface 
        match={selectedMatch} 
        onBack={() => {
          setViewMode('select');
          setSelectedMatch(null);
          loadScheduledFixtures();
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
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
            onClick={onBack}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 mr-4 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
            </svg>
            <span>Back</span>
          </button>
          <h1 className="text-4xl font-bold text-white">Start Match</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl p-8 border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Select Match to Start</h2>
            
            {fixtures.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">No Scheduled Matches</h3>
                <p className="text-gray-600 mb-4">You need to add fixtures before you can start a match.</p>
                <button
                  onClick={() => onBack()}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Fixtures & Results
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Choose a scheduled match:
                  </label>
                  <select
                    value={selectedFixtureId}
                    onChange={(e) => setSelectedFixtureId(e.target.value)}
                    className="w-full p-4 border border-gray-300 rounded-lg text-gray-800 text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">-- Select a match --</option>
                    {fixtures.map(fixture => (
                      <option key={fixture.id} value={fixture.id}>
                        {getMatchDisplayName(fixture)}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedFixtureId && (
                  <div className="bg-gray-50 rounded-lg p-6 mb-6">
                    {(() => {
                      const selectedFixture = fixtures.find(f => f.id === selectedFixtureId);
                      if (!selectedFixture) return null;
                      
                      return (
                        <>
                          <h3 className="text-lg font-semibold text-gray-800 mb-4">Match Details</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">Date:</span>
                              <div className="text-gray-800">{formatDate(selectedFixture.date)}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Venue:</span>
                              <div className="text-gray-800">{selectedFixture.venue}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Format:</span>
                              <div className="text-gray-800">{selectedFixture.match_format || '11v11'}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Type:</span>
                              <div className="text-gray-800">{selectedFixture.match_type || 'League'}</div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                <button
                  onClick={handleStartMatch}
                  disabled={!selectedFixtureId}
                  className={`w-full py-4 rounded-lg text-lg font-semibold transition-all ${
                    selectedFixtureId
                      ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white hover:from-green-700 hover:to-emerald-800 transform hover:scale-105 shadow-lg'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🚀 Start Live Match
                </button>
              </>
            )}
          </div>

          {fixtures.length > 0 && (
            <div className="mt-8 text-center">
              <div className="bg-white/90 backdrop-blur rounded-lg p-4 inline-block">
                <p className="text-gray-700">
                  <span className="font-semibold text-green-600">{fixtures.length}</span> scheduled match{fixtures.length !== 1 ? 'es' : ''} ready to start
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StartMatchView;