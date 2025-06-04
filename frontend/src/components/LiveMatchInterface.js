import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PitchVisualization from './PitchVisualization';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const LiveMatchInterface = ({ match, onBack }) => {
  const [matchState, setMatchState] = useState(match);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEventType, setSelectedEventType] = useState('goal');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [homeTeamPlayers, setHomeTeamPlayers] = useState([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState([]);

  useEffect(() => {
    // Load team players
    loadTeamPlayers();
    
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
      }, 60000); // 1 minute = 60 seconds (for demo, using 60000ms)
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const loadTeamPlayers = async () => {
    try {
      const [homeResponse, awayResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/teams/${matchState.home_team_id}/players`),
        axios.get(`${API_BASE_URL}/api/teams/${matchState.away_team_id}/players`)
      ]);
      
      setHomeTeamPlayers(homeResponse.data);
      setAwayTeamPlayers(awayResponse.data);
    } catch (error) {
      console.error('Error loading team players:', error);
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

  const handleAddEvent = async () => {
    if (!selectedPlayer || !selectedEventType) {
      alert('Please select a player and event type');
      return;
    }

    try {
      const eventData = {
        match_id: matchState.id,
        player_id: selectedPlayer,
        event_type: selectedEventType,
        minute: currentMinute
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
        const isHomePlayer = homeTeamPlayers.some(p => p.id === selectedPlayer);
        setMatchState(prev => ({
          ...prev,
          score_home: isHomePlayer ? prev.score_home + 1 : prev.score_home,
          score_away: !isHomePlayer ? prev.score_away + 1 : prev.score_away
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
    const allPlayers = [...homeTeamPlayers, ...awayTeamPlayers];
    const player = allPlayers.find(p => p.id === playerId);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Match Info & Controls */}
        <div className="lg:col-span-1 space-y-6">
          {/* Score */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
            <div className="text-center">
              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <p className="text-white font-semibold text-lg">Home</p>
                  <p className="text-4xl font-bold text-blue-400">{matchState.score_home}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">VS</p>
                  <p className="text-2xl font-bold text-white">{currentMinute}'</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold text-lg">Away</p>
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

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Player</label>
                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                >
                  <option value="">Select Player</option>
                  <optgroup label="Home Team">
                    {homeTeamPlayers.map(player => (
                      <option key={player.id} value={player.id}>
                        #{player.squad_number} {player.first_name} {player.last_name}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Away Team">
                    {awayTeamPlayers.map(player => (
                      <option key={player.id} value={player.id}>
                        #{player.squad_number} {player.first_name} {player.last_name}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <button
                onClick={handleAddEvent}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
              >
                Add Event
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
                      {getPlayerName(event.player_id)}
                    </p>
                    <p className="text-gray-400 text-sm">{event.minute}' - {event.event_type.replace('_', ' ')}</p>
                  </div>
                </div>
              ))}
              {events.length === 0 && (
                <p className="text-gray-400 text-center py-4">No events yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Pitch Visualization */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
            <h3 className="text-xl font-semibold text-white mb-4">Match Overview</h3>
            <PitchVisualization
              formation={matchState.home_formation}
              selectedPlayers={matchState.home_positions || {}}
              teamPlayers={homeTeamPlayers}
              isHomeTeam={true}
              showPlayerNames={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMatchInterface;