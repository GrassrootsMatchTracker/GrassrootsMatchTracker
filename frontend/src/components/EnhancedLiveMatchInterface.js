import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EnhancedPitchVisualization from './EnhancedPitchVisualization';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const EnhancedLiveMatchInterface = ({ match, onBack }) => {
  const [matchState, setMatchState] = useState(match);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEventType, setSelectedEventType] = useState('goal');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [homeTeamPlayers, setHomeTeamPlayers] = useState([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState([]);
  const [userTeamPlayers, setUserTeamPlayers] = useState([]);
  const [oppositionName, setOppositionName] = useState('');
  const [homeTeamName, setHomeTeamName] = useState('');
  const [awayTeamName, setAwayTeamName] = useState('');
  const [playerEventIndicators, setPlayerEventIndicators] = useState({});

  useEffect(() => {
    // Load team data and determine team names
    loadMatchData();
    
    // If match is live, start timer
    if (matchState.status === 'live') {
      setIsTimerRunning(true);
    }
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setCurrentMinute(prev => prev + 1);
      }, 6000); // 6 seconds = 1 game minute (for demo purposes)
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const loadMatchData = async () => {
    try {
      console.log('Match state:', matchState); // Debug log
      
      // Determine team names based on match structure
      if (matchState.user_team_id) {
        const userTeamResponse = await axios.get(`${API_BASE_URL}/api/teams/${matchState.user_team_id}`);
        const userTeamName = userTeamResponse.data.name;
        setUserTeamPlayers(userTeamResponse.data.players || []);
        
        if (matchState.user_team_type === 'home') {
          setHomeTeamName(userTeamName);
          setAwayTeamName(matchState.opposition_name || 'Opposition');
          setHomeTeamPlayers(userTeamResponse.data.players || []);
        } else {
          setAwayTeamName(userTeamName);
          setHomeTeamName(matchState.opposition_name || 'Opposition');
          setAwayTeamPlayers(userTeamResponse.data.players || []);
        }
      } else {
        // Handle legacy format
        if (matchState.home_team_id) {
          const homeTeamResponse = await axios.get(`${API_BASE_URL}/api/teams/${matchState.home_team_id}`);
          setHomeTeamName(homeTeamResponse.data.name);
          setHomeTeamPlayers(homeTeamResponse.data.players || []);
        }
        
        if (matchState.away_team_id) {
          const awayTeamResponse = await axios.get(`${API_BASE_URL}/api/teams/${matchState.away_team_id}`);
          setAwayTeamName(awayTeamResponse.data.name);
          setAwayTeamPlayers(awayTeamResponse.data.players || []);
        }
      }

      setOppositionName(matchState.opposition_name || 'Opposition');
    } catch (error) {
      console.error('Error loading match data:', error);
      // Fallback to match data
      setHomeTeamName(matchState.home_team_name || 'Home Team');
      setAwayTeamName(matchState.away_team_name || 'Away Team');
      setOppositionName(matchState.opposition_name || 'Opposition');
    }
  };

  const handleStartMatch = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/matches/${matchState.id}/start`);
      setMatchState({...matchState, status: 'live'});
      setIsTimerRunning(true);
    } catch (error) {
      console.error('Error starting match:', error);
      alert('Error starting match');
    }
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(!isTimerRunning);
  };

  const handleAddEvent = async (isUserTeam = true) => {
    if (!selectedPlayer || !selectedEventType) {
      alert('Please select a player and event type');
      return;
    }

    try {
      const eventData = {
        match_id: matchState.id,
        player_id: isUserTeam ? selectedPlayer : null,
        player_name: isUserTeam ? null : selectedPlayer, // For opposition players, store name
        event_type: selectedEventType,
        minute: currentMinute,
        team_type: isUserTeam ? 'user' : 'opposition'
      };

      await axios.post(`${API_BASE_URL}/api/matches/${matchState.id}/events`, eventData);
      
      // Update local events
      const newEvent = {
        ...eventData,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      
      setEvents([...events, newEvent]);
      
      // Update score if it's a goal
      if (selectedEventType === 'goal') {
        if (isUserTeam) {
          if (matchState.user_team_type === 'home') {
            setMatchState(prev => ({...prev, score_home: prev.score_home + 1}));
          } else {
            setMatchState(prev => ({...prev, score_away: prev.score_away + 1}));
          }
        } else {
          if (matchState.user_team_type === 'home') {
            setMatchState(prev => ({...prev, score_away: prev.score_away + 1}));
          } else {
            setMatchState(prev => ({...prev, score_home: prev.score_home + 1}));
          }
        }
      }

      // Add event indicator to player on pitch
      if (isUserTeam && selectedPlayer) {
        setPlayerEventIndicators(prev => ({
          ...prev,
          [selectedPlayer]: [
            ...(prev[selectedPlayer] || []),
            { type: selectedEventType, minute: currentMinute }
          ]
        }));
      }

      // Reset form
      setSelectedPlayer('');
      setSelectedEventType('goal');
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Error adding event');
    }
  };

  const getPlayerName = (playerId) => {
    const player = userTeamPlayers.find(p => p.id === playerId);
    return player ? `${player.first_name} ${player.last_name}` : 'Unknown Player';
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'goal': return '⚽';
      case 'assist': return '🎯';
      case 'yellow_card': return '🟨';
      case 'red_card': return '🟥';
      case 'substitution': return '🔄';
      default: return '📝';
    }
  };

  const getEventIndicator = (playerId) => {
    const indicators = playerEventIndicators[playerId];
    if (!indicators || indicators.length === 0) return null;
    
    return (
      <div className="absolute -top-2 -right-2 flex space-x-0.5">
        {indicators.slice(-3).map((indicator, index) => (
          <span key={index} className="text-xs bg-yellow-400 text-black rounded-full w-4 h-4 flex items-center justify-center">
            {getEventIcon(indicator.type)}
          </span>
        ))}
      </div>
    );
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
        <h2 className="text-4xl font-bold text-white">Live Match</h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Match Info & Controls */}
        <div className="xl:col-span-1 space-y-6">
          {/* Score & Team Names */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
            <div className="text-center">
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <p className="text-white font-semibold text-lg">{homeTeamName}</p>
                  <p className="text-4xl font-bold text-blue-400">{matchState.score_home}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">VS</p>
                  <p className="text-2xl font-bold text-white">{currentMinute}'</p>
                  <p className="text-gray-400 text-xs">{matchState.match_format}</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold text-lg">{awayTeamName}</p>
                  <p className="text-4xl font-bold text-red-400">{matchState.score_away}</p>
                </div>
              </div>
              
              <div className="flex space-x-4">
                {matchState.status !== 'live' ? (
                  <button
                    onClick={handleStartMatch}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all"
                  >
                    Start Match
                  </button>
                ) : (
                  <button
                    onClick={handlePauseTimer}
                    className={`flex-1 py-3 rounded-xl transition-all ${
                      isTimerRunning 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                    } text-white`}
                  >
                    {isTimerRunning ? 'Pause' : 'Resume'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Event Controls */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-semibold text-white mb-4">Add Event</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Event Type</label>
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                >
                  <option value="goal">⚽ Goal</option>
                  <option value="assist">🎯 Assist</option>
                  <option value="yellow_card">🟨 Yellow Card</option>
                  <option value="red_card">🟥 Red Card</option>
                  <option value="substitution">🔄 Substitution</option>
                </select>
              </div>

              {/* User Team Player Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Your Team Player</label>
                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                >
                  <option value="">Select Your Player</option>
                  {userTeamPlayers.map(player => (
                    <option key={player.id} value={player.id}>
                      #{player.squad_number} {player.first_name} {player.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => handleAddEvent(true)}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Add Event (Your Team)
              </button>

              {/* Opposition Event */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Opposition Player Name</label>
                <input
                  type="text"
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400"
                  placeholder="Enter opposition player name..."
                />
              </div>

              <button
                onClick={() => handleAddEvent(false)}
                className="w-full bg-gradient-to-r from-red-500 to-pink-600 text-white py-3 rounded-xl hover:from-red-600 hover:to-pink-700 transition-all"
              >
                Add Event (Opposition)
              </button>
            </div>
          </div>

          {/* Events Timeline */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-semibold text-white mb-4">Match Events</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {events.map((event, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg">
                  <span className="text-2xl">{getEventIcon(event.event_type)}</span>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {event.team_type === 'user' 
                        ? getPlayerName(event.player_id)
                        : event.player_name
                      }
                    </p>
                    <p className="text-gray-400 text-sm">
                      {event.minute}' - {event.event_type.replace('_', ' ')} 
                      ({event.team_type === 'user' ? 'Your Team' : oppositionName})
                    </p>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-gray-400 text-center py-4">No events yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Smaller Pitch Visualization with Player Events */}
        <div className="xl:col-span-3">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-semibold text-white mb-4">Match Overview</h3>
            <div className="flex justify-center">
              <div className="relative">
                <EnhancedPitchVisualization
                  formation={matchState.home_formation || matchState.formation}
                  matchFormat={matchState.match_format || '11v11'}
                  selectedPlayers={matchState.home_positions || matchState.positions || {}}
                  teamPlayers={userTeamPlayers}
                  isHomeTeam={matchState.user_team_type === 'home'}
                  showPlayerNames={true}
                  substitutes={matchState.home_substitutes || matchState.substitutes || []}
                />
                
                {/* Event Indicators Overlay */}
                {Object.keys(playerEventIndicators).map(playerId => (
                  <div key={playerId}>
                    {getEventIndicator(playerId)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLiveMatchInterface;