import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PitchVisualization from './PitchVisualization';
import PlayerSelectionModal from './PlayerSelectionModal';
import LiveMatchInterface from './LiveMatchInterface';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const MatchView = ({ teams, onBack }) => {
  const [matchData, setMatchData] = useState({
    home_team_id: '',
    away_team_id: '',
    date: '',
    venue: '',
    home_formation: '4-4-2',
    home_positions: {},
    home_substitutes: []
  });
  const [homeTeamPlayers, setHomeTeamPlayers] = useState([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState([]);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState('');
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

  const handlePositionClick = (positionId) => {
    setSelectedPosition(positionId);
    setShowPlayerModal(true);
  };

  const handlePlayerSelect = (player) => {
    setMatchData({
      ...matchData,
      home_positions: {
        ...matchData.home_positions,
        [selectedPosition]: player.id
      }
    });
    setShowPlayerModal(false);
  };

  const getExcludedPlayers = () => {
    return [
      ...Object.values(matchData.home_positions),
      ...matchData.home_substitutes
    ].filter(Boolean);
  };

  const handleSubstituteSelect = (player) => {
    const currentSubs = matchData.home_substitutes;
    
    if (currentSubs.length < 5) {
      setMatchData({
        ...matchData,
        home_substitutes: [...currentSubs, player.id]
      });
    }
    setShowPlayerModal(false);
  };

  const removeSubstitute = (playerId) => {
    setMatchData({
      ...matchData,
      home_substitutes: matchData.home_substitutes.filter(id => id !== playerId)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Copy away team data from home team for simplicity (as requested - no away formation)
      const matchDataToSend = {
        ...matchData,
        away_formation: matchData.home_formation,
        away_positions: {},
        away_substitutes: []
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/matches`, matchDataToSend);
      console.log('Match created:', response.data);
      setCreatedMatch(response.data);
      alert('Match created successfully!');
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Error creating match. Please try again.');
    }
  };

  const getPlayerName = (playerId) => {
    const player = homeTeamPlayers.find(p => p.id === playerId);
    return player ? `${player.first_name} ${player.last_name}` : null;
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Match Setup Form */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-2xl font-semibold mb-6 text-white">Match Details</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Home Team</label>
                  <select
                    value={matchData.home_team_id}
                    onChange={(e) => setMatchData({...matchData, home_team_id: e.target.value})}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
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
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
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
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Venue</label>
                  <input
                    type="text"
                    value={matchData.venue}
                    onChange={(e) => setMatchData({...matchData, venue: e.target.value})}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400"
                    placeholder="Enter venue..."
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Formation</label>
                  <select
                    value={matchData.home_formation}
                    onChange={(e) => setMatchData({...matchData, home_formation: e.target.value})}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
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

          {/* Substitute Bench */}
          {matchData.home_team_id && (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-semibold mb-4 text-white">Substitute Bench</h3>
              
              <div className="space-y-2 mb-3">
                {matchData.home_substitutes.map((playerId, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                    <span className="text-white">{getPlayerName(playerId)}</span>
                    <button
                      onClick={() => removeSubstitute(playerId)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              {matchData.home_substitutes.length < 5 && (
                <button
                  onClick={() => {
                    setSelectedPosition('substitute');
                    setShowPlayerModal(true);
                  }}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-all"
                >
                  Add Substitute ({matchData.home_substitutes.length}/5)
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pitch Visualization */}
        <div className="space-y-6">
          {matchData.home_team_id && (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Team Formation & Player Selection</h3>
              <p className="text-gray-300 mb-4">Click on position icons to assign players from your team.</p>
              
              <PitchVisualization
                formation={matchData.home_formation}
                selectedPlayers={matchData.home_positions}
                onPositionClick={handlePositionClick}
                teamPlayers={homeTeamPlayers}
                isHomeTeam={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Player Selection Modal */}
      <PlayerSelectionModal
        isOpen={showPlayerModal}
        onClose={() => setShowPlayerModal(false)}
        players={homeTeamPlayers}
        onPlayerSelect={selectedPosition === 'substitute' ? handleSubstituteSelect : handlePlayerSelect}
        position={selectedPosition}
        excludePlayers={getExcludedPlayers()}
        title={selectedPosition === 'substitute' ? 'Select Substitute' : `Select Player for ${selectedPosition}`}
      />
    </div>
  );
};

export default MatchView;