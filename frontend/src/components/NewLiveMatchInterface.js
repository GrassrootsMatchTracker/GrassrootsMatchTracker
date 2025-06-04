import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const NewLiveMatchInterface = ({ match, onBack }) => {
  const [matchState, setMatchState] = useState(match);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [currentSecond, setCurrentSecond] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [matchPhase, setMatchPhase] = useState('first_half');
  const [events, setEvents] = useState([]);
  const [selectedEventType, setSelectedEventType] = useState('goal');
  const [selectedUserPlayer, setSelectedUserPlayer] = useState('');
  const [userTeamPlayers, setUserTeamPlayers] = useState([]);
  const [homeTeamName, setHomeTeamName] = useState('');
  const [awayTeamName, setAwayTeamName] = useState('');
  const [oppositionName, setOppositionName] = useState('');

  useEffect(() => {
    loadMatchData();
    if (matchState.status === 'live') {
      setIsTimerRunning(true);
    }
  }, []);

  useEffect(() => {
    let interval;
    if (isTimerRunning && matchPhase !== 'half_time' && matchPhase !== 'full_time') {
      interval = setInterval(() => {
        setCurrentSecond(prevSecond => {
          if (prevSecond >= 59) {
            setCurrentMinute(prevMinute => prevMinute + 1);
            return 0;
          }
          return prevSecond + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, matchPhase]);

  const loadMatchData = async () => {
    try {
      let homeTeam = 'Home Team';
      let awayTeam = 'Away Team';
      let opposition = 'Opposition';
      
      if (matchState.user_team_id) {
        try {
          const userTeamResponse = await axios.get(`${API_BASE_URL}/api/teams/${matchState.user_team_id}`);
          const userTeam = userTeamResponse.data;
          setUserTeamPlayers(userTeam.players || []);
          
          if (matchState.user_team_type === 'home') {
            homeTeam = userTeam.name;
            awayTeam = matchState.opposition_name || 'Opposition';
          } else {
            awayTeam = userTeam.name;
            homeTeam = matchState.opposition_name || 'Opposition';
          }
          opposition = matchState.opposition_name || 'Opposition';
        } catch (teamError) {
          console.error('Error loading user team:', teamError);
        }
      }

      setHomeTeamName(homeTeam);
      setAwayTeamName(awayTeam);
      setOppositionName(opposition);
      
    } catch (error) {
      console.error('Error loading match data:', error);
      setHomeTeamName('Home Team');
      setAwayTeamName('Away Team');
      setOppositionName('Opposition');
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

  const handleHalfTime = () => {
    setIsTimerRunning(false);
    setMatchPhase('half_time');
  };

  const handleStartSecondHalf = () => {
    setCurrentMinute(45);
    setCurrentSecond(0);
    setMatchPhase('second_half');
    setIsTimerRunning(true);
  };

  const handleFullTime = () => {
    setIsTimerRunning(false);
    setMatchPhase('full_time');
    setMatchState({...matchState, status: 'completed'});
  };

  const handleAddEvent = async (isUserTeam = true) => {
    const selectedPlayer = isUserTeam ? selectedUserPlayer : 'opposition-player';
    
    if (!selectedEventType || (isUserTeam && !selectedPlayer)) {
      alert('Please select event type and player');
      return;
    }

    if (matchPhase === 'full_time') {
      alert('Cannot add events after full time');
      return;
    }

    try {
      const eventData = {
        match_id: matchState.id,
        player_id: isUserTeam ? selectedPlayer : null,
        player_name: isUserTeam ? null : 'Player',
        event_type: selectedEventType,
        minute: currentMinute,
        team_type: isUserTeam ? 'user' : 'opposition'
      };

      await axios.post(`${API_BASE_URL}/api/matches/${matchState.id}/events`, eventData);
      
      const newEvent = {
        ...eventData,
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        team_name: isUserTeam ? (matchState.user_team_type === 'home' ? homeTeamName : awayTeamName) : oppositionName
      };
      
      setEvents([newEvent, ...events]);
      
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

      if (isUserTeam) {
        setSelectedUserPlayer('');
      }
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

  const formatTime = () => {
    return `${String(currentMinute).padStart(2, '0')}:${String(currentSecond).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center mb-6">
          <button 
            onClick={onBack}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-4 py-2 rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 mr-4 flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L4.414 9H17a1 1 0 110 2H4.414l5.293 5.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
            </svg>
            <span>Back</span>
          </button>
        </div>

        {/* Main Match Header */}
        <div className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-slate-700/50">
          {/* Date and League Info */}
          <div className="text-center mb-4">
            <p className="text-gray-400 text-sm">
              {new Date(matchState.date).toLocaleDateString('en-GB', { 
                weekday: 'short', 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
              })} • {matchState.match_type}
            </p>
          </div>

          {/* Teams and Score */}
          <div className="flex items-center justify-between mb-4">
            {/* Home Team */}
            <div className="flex items-center space-x-3 flex-1">
              <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">{homeTeamName.charAt(0)}</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">{homeTeamName}</h3>
              </div>
            </div>

            {/* Score and Time */}
            <div className="text-center mx-8">
              <div className="flex items-center justify-center space-x-4 mb-2">
                <span className="text-4xl font-bold text-white">{matchState.score_home}</span>
                <span className="text-4xl font-bold text-white">{matchState.score_away}</span>
              </div>
              
              {/* LCD Timer */}
              <div className="bg-black rounded-lg px-4 py-2 border-2 border-cyan-400 shadow-lg shadow-cyan-400/20 mb-2">
                <div className="font-mono text-2xl font-bold text-cyan-400 tracking-wider">
                  {formatTime()}
                </div>
              </div>
              
              <div className="text-xs text-gray-400">
                {matchPhase === 'first_half' ? 'First Half' : 
                 matchPhase === 'second_half' ? 'Second Half' : 
                 matchPhase === 'half_time' ? 'Half Time' : 'Full Time'}
              </div>
            </div>

            {/* Away Team */}
            <div className="flex items-center space-x-3 flex-1 justify-end">
              <div>
                <h3 className="text-white font-semibold text-lg text-right">{awayTeamName}</h3>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">{awayTeamName.charAt(0)}</span>
              </div>
            </div>
          </div>

          {/* Venue and Attendance */}
          <div className="text-center text-sm text-gray-400 mb-4">
            <span>Venue: {matchState.venue}</span>
          </div>

          {/* Match Controls */}
          <div className="flex justify-center space-x-3">
            {matchState.status !== 'live' ? (
              <button
                onClick={handleStartMatch}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
              >
                Start Match
              </button>
            ) : (
              <>
                <button
                  onClick={handlePauseTimer}
                  disabled={matchPhase === 'half_time' || matchPhase === 'full_time'}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    matchPhase === 'half_time' || matchPhase === 'full_time'
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : isTimerRunning 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                  } text-white`}
                >
                  {isTimerRunning ? 'Pause' : 'Resume'}
                </button>

                {matchPhase === 'first_half' && (
                  <button
                    onClick={handleHalfTime}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all"
                  >
                    Half Time
                  </button>
                )}

                {matchPhase === 'half_time' && (
                  <button
                    onClick={handleStartSecondHalf}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all"
                  >
                    Start 2nd Half
                  </button>
                )}

                {(matchPhase === 'second_half' || matchPhase === 'first_half') && (
                  <button
                    onClick={handleFullTime}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all"
                  >
                    Full Time
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Event Recording and Events List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Recording Panel */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Add Event</h3>
              
              <div className="space-y-4">
                {/* Event Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Event Type</label>
                  <select
                    value={selectedEventType}
                    onChange={(e) => setSelectedEventType(e.target.value)}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                    disabled={matchPhase === 'full_time'}
                  >
                    <option value="goal">⚽ Goal</option>
                    <option value="assist">🎯 Assist</option>
                    <option value="yellow_card">🟨 Yellow Card</option>
                    <option value="red_card">🟥 Red Card</option>
                    <option value="substitution">🔄 Substitution</option>
                  </select>
                </div>

                {/* Your Team Player */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Your Team Player</label>
                  <select
                    value={selectedUserPlayer}
                    onChange={(e) => setSelectedUserPlayer(e.target.value)}
                    className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                    disabled={matchPhase === 'full_time'}
                  >
                    <option value="">Select Player</option>
                    {userTeamPlayers.map(player => (
                      <option key={player.id} value={player.id}>
                        #{player.squad_number} {player.first_name} {player.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => handleAddEvent(true)}
                  disabled={!selectedUserPlayer || matchPhase === 'full_time'}
                  className={`w-full py-3 rounded-xl transition-all ${
                    selectedUserPlayer && matchPhase !== 'full_time'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Add Event (Your Team)
                </button>

                {/* Separator */}
                <div className="border-t border-slate-600 my-4"></div>

                {/* Opposition Event */}
                <button
                  onClick={() => handleAddEvent(false)}
                  disabled={matchPhase === 'full_time'}
                  className={`w-full py-3 rounded-xl transition-all ${
                    matchPhase !== 'full_time'
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Add Event (Opposition)
                </button>
              </div>
            </div>
          </div>

          {/* Events List */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-semibold text-white mb-4">Match Events</h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No events yet</p>
                ) : (
                  events.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border-l-4 border-cyan-400">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getEventIcon(event.event_type)}</span>
                        <div>
                          <p className="text-white font-medium">
                            {event.team_type === 'user' 
                              ? getPlayerName(event.player_id)
                              : 'Player'
                            }
                          </p>
                          <p className="text-gray-400 text-sm">
                            {event.event_type.replace('_', ' ')} • {event.team_name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-cyan-400 font-bold">{event.minute}'</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewLiveMatchInterface;