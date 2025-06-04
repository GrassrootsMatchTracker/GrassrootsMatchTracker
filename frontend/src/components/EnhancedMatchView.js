import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EnhancedPitchVisualization from './EnhancedPitchVisualization';
import PlayerSelectionModal from './PlayerSelectionModal';
import EnhancedLiveMatchInterface from './EnhancedLiveMatchInterface';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const EnhancedMatchView = ({ teams, onBack }) => {
  const [matchData, setMatchData] = useState({
    user_team_id: '',
    user_team_type: 'home', // 'home' or 'away'
    opposition_name: '',
    date: '',
    venue: '',
    formation: '4-4-2',
    match_format: '11v11',
    match_type: 'Friendly',
    positions: {},
    substitutes: []
  });
  const [userTeamPlayers, setUserTeamPlayers] = useState([]);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedSubIndex, setSelectedSubIndex] = useState(-1);
  const [createdMatch, setCreatedMatch] = useState(null);

  const matchFormats = ['5v5', '6v6', '7v7', '8v8', '9v9', '10v10', '11v11'];
  const matchTypes = ['League', 'Friendly', 'Cup'];

  // Get formations based on match format
  const getFormationsForFormat = (format) => {
    switch (format) {
      case '5v5':
        return ['2-1-1', '1-2-1'];
      case '6v6':
        return ['2-2-1', '1-3-1'];
      case '7v7':
        return ['2-3-1', '3-2-1'];
      case '8v8':
        return ['3-3-1', '2-4-1'];
      case '9v9':
        return ['3-4-1', '3-3-2'];
      case '10v10':
        return ['3-4-2', '4-3-2'];
      case '11v11':
      default:
        return ['4-4-2', '4-3-3', '3-5-2', '5-3-2', '4-2-3-1', '4-1-4-1', '3-4-3', '4-5-1'];
    }
  };

  const availableFormations = getFormationsForFormat(matchData.match_format);

  useEffect(() => {
    if (matchData.user_team_id) {
      loadTeamPlayers(matchData.user_team_id);
    }
  }, [matchData.user_team_id]);

  useEffect(() => {
    // Reset formation when match format changes
    const formations = getFormationsForFormat(matchData.match_format);
    if (!formations.includes(matchData.formation)) {
      setMatchData(prev => ({
        ...prev,
        formation: formations[0],
        positions: {},
        substitutes: []
      }));
    }
  }, [matchData.match_format]);

  const loadTeamPlayers = async (teamId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/teams/${teamId}/players`);
      setUserTeamPlayers(response.data);
    } catch (error) {
      console.error('Error loading team players:', error);
    }
  };

  const handlePositionClick = (positionId) => {
    setSelectedPosition(positionId);
    setSelectedSubIndex(-1);
    setShowPlayerModal(true);
  };

  const handleSubstituteClick = (subIndex) => {
    setSelectedSubIndex(subIndex);
    setSelectedPosition('');
    setShowPlayerModal(true);
  };

  const handlePlayerSelect = (player) => {
    if (selectedSubIndex >= 0) {
      // Assigning substitute
      const newSubstitutes = [...matchData.substitutes];
      newSubstitutes[selectedSubIndex] = player.id;
      setMatchData({
        ...matchData,
        substitutes: newSubstitutes
      });
    } else {
      // Assigning to position
      setMatchData({
        ...matchData,
        positions: {
          ...matchData.positions,
          [selectedPosition]: player.id
        }
      });
    }
    setShowPlayerModal(false);
  };

  const getExcludedPlayers = () => {
    return [
      ...Object.values(matchData.positions),
      ...matchData.substitutes
    ].filter(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const matchDataToSend = {
        home_team_id: matchData.user_team_type === 'home' ? matchData.user_team_id : null,
        away_team_id: matchData.user_team_type === 'away' ? matchData.user_team_id : null,
        opposition_name: matchData.opposition_name,
        date: matchData.date,
        venue: matchData.venue,
        home_formation: matchData.user_team_type === 'home' ? matchData.formation : '4-4-2',
        away_formation: matchData.user_team_type === 'away' ? matchData.formation : '4-4-2',
        match_format: matchData.match_format,
        match_type: matchData.match_type,
        home_positions: matchData.user_team_type === 'home' ? matchData.positions : {},
        away_positions: matchData.user_team_type === 'away' ? matchData.positions : {},
        home_substitutes: matchData.user_team_type === 'home' ? matchData.substitutes : [],
        away_substitutes: matchData.user_team_type === 'away' ? matchData.substitutes : []
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

      <div className="max-w-7xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Match Setup */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-2xl font-semibold mb-6 text-white">Match Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Your Team */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Your Team</label>
                <select
                  value={matchData.user_team_id}
                  onChange={(e) => setMatchData({...matchData, user_team_id: e.target.value})}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                  required
                >
                  <option value="">Select Your Team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name} ({team.age_group})</option>
                  ))}
                </select>
              </div>

              {/* Home/Away Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">You are playing</label>
                <select
                  value={matchData.user_team_type}
                  onChange={(e) => setMatchData({...matchData, user_team_type: e.target.value})}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                >
                  <option value="home">Home</option>
                  <option value="away">Away</option>
                </select>
              </div>

              {/* Opposition Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Opposition Team</label>
                <input
                  type="text"
                  value={matchData.opposition_name}
                  onChange={(e) => setMatchData({...matchData, opposition_name: e.target.value})}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400"
                  placeholder="Enter opposition team name..."
                  required
                />
              </div>

              {/* Date */}
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

              {/* Venue */}
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

              {/* Match Format */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Match Format</label>
                <select
                  value={matchData.match_format}
                  onChange={(e) => setMatchData({...matchData, match_format: e.target.value})}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                >
                  {matchFormats.map(format => (
                    <option key={format} value={format}>{format}</option>
                  ))}
                </select>
              </div>

              {/* Formation */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Formation</label>
                <select
                  value={matchData.formation}
                  onChange={(e) => setMatchData({...matchData, formation: e.target.value})}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                >
                  {availableFormations.map(formation => (
                    <option key={formation} value={formation}>{formation}</option>
                  ))}
                </select>
              </div>

              {/* Match Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Match Type</label>
                <select
                  value={matchData.match_type}
                  onChange={(e) => setMatchData({...matchData, match_type: e.target.value})}
                  className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                >
                  {matchTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Team Formation & Player Selection */}
          {matchData.user_team_id && (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Team Labels */}
                <div className="lg:col-span-2 flex justify-between items-center mb-4">
                  <div className={`text-center ${matchData.user_team_type === 'home' ? 'text-blue-400' : 'text-gray-400'}`}>
                    <h3 className="text-2xl font-semibold">
                      {matchData.user_team_type === 'home' ? '🏠 Home Team' : 'Away Team'}
                    </h3>
                    <p className="text-lg">
                      {matchData.user_team_type === 'home' 
                        ? teams.find(t => t.id === matchData.user_team_id)?.name || 'Your Team'
                        : matchData.opposition_name || 'Opposition'}
                    </p>
                  </div>
                  
                  <div className="text-center text-gray-300">
                    <p className="text-sm">VS</p>
                    <p className="text-lg font-bold">{matchData.match_format}</p>
                    <p className="text-sm">{matchData.formation}</p>
                  </div>
                  
                  <div className={`text-center ${matchData.user_team_type === 'away' ? 'text-red-400' : 'text-gray-400'}`}>
                    <h3 className="text-2xl font-semibold">
                      {matchData.user_team_type === 'away' ? '✈️ Away Team' : 'Home Team'}
                    </h3>
                    <p className="text-lg">
                      {matchData.user_team_type === 'away' 
                        ? teams.find(t => t.id === matchData.user_team_id)?.name || 'Your Team'
                        : matchData.opposition_name || 'Opposition'}
                    </p>
                  </div>
                </div>

                {/* Pitch Visualization */}
                <div className="lg:col-span-2">
                  <h3 className="text-xl font-semibold text-white mb-4">Team Formation & Player Selection</h3>
                  <p className="text-gray-300 mb-4">Click on position icons to assign players. Substitutes are shown on the right.</p>
                  
                  <EnhancedPitchVisualization
                    formation={matchData.formation}
                    matchFormat={matchData.match_format}
                    selectedPlayers={matchData.positions}
                    onPositionClick={handlePositionClick}
                    teamPlayers={userTeamPlayers}
                    isHomeTeam={matchData.user_team_type === 'home'}
                    substitutes={matchData.substitutes}
                    onSubstituteClick={handleSubstituteClick}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Create Match Button */}
          <div className="text-center">
            <button 
              type="submit"
              className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-12 py-4 rounded-xl hover:from-purple-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg font-medium text-lg"
            >
              Create Match ⚽
            </button>
          </div>
        </form>
      </div>

      {/* Player Selection Modal */}
      <PlayerSelectionModal
        isOpen={showPlayerModal}
        onClose={() => setShowPlayerModal(false)}
        players={userTeamPlayers}
        onPlayerSelect={handlePlayerSelect}
        position={selectedSubIndex >= 0 ? `Substitute ${selectedSubIndex + 1}` : selectedPosition}
        excludePlayers={getExcludedPlayers()}
        title={selectedSubIndex >= 0 ? `Select Substitute ${selectedSubIndex + 1}` : `Select Player for ${selectedPosition}`}
      />
    </div>
  );
};

export default EnhancedMatchView;