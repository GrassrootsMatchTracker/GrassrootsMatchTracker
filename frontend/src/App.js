import React, { useState, useEffect } from 'react';
import './App.css';

// API configuration
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [matches, setMatches] = useState([]);
  const [formations, setFormations] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState('');
  
  // Match creation state
  const [matchStep, setMatchStep] = useState(1);
  const [newMatch, setNewMatch] = useState({
    home_team_id: '',
    away_team_id: '',
    match_date: '',
    venue: '',
    match_type: 'Friendly'
  });
  const [selectedFormation, setSelectedFormation] = useState('4-4-2');
  const [selectedPlayers, setSelectedPlayers] = useState({
    starting: [],
    substitutes: []
  });

  // Logo component using your exact design
  const Logo = () => (
    <div className="flex flex-col items-center">
      <div className="w-32 h-32 relative mb-4">
        <img
          src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDIwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjwhLS0gU2hpZWxkIE91dGxpbmUgLS0+CjxwYXRoIGQ9Ik0xMDAgMjBMMTcwIDUwVjEzMEMxNzAgMTYwIDEzNSAxODUgMTAwIDIwMEM2NSAxODUgMzAgMTYwIDMwIDEzMFY1MEwxMDAgMjBaIiBzdHJva2U9IiNEQzI2MjYiIHN0cm9rZS13aWR0aD0iNCIgZmlsbD0iIzFGMjkzNyIvPgo8IS0tIElubmVyIFNoaWVsZCAtLT4KPHA2aCBkPSJNMTAwIDMwTDE2MCA1NVYxMjVDMTYwIDE1MCAMTMwIDE3MCAxMDAgMTgwQzcwIDE3MCA0MCAxNTAgNDAgMTI1VjU1TDEwMCAzMFoiIGZpbGw9IiMzNzQxNTEiLz4KPCEtLSBGb290YmFsbCAtLT4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iOTAiIHI9IjI4IiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjMUYyOTM3IiBzdHJva2Utd2lkdGg9IjIiLz4KPCEtLSBGb290YmFsbCBQYXR0ZXJuIC0tPgo8cGF0aCBkPSJNMTAwIDYyTDEwOCA3OEwxMjQgNzZMMTE4IDkyTDEzMiAxMDBMMTE4IDEwOEwxMjQgMTI0TDEwOCAxMjJMMTAwIDEzOEw5MiAxMjJMNzYgMTI0TDgyIDEwOEw2OCAxMDBMODIgOTJMNzYgNzZMOTIgNzhMMTAwIDYyWiIgZmlsbD0iIzFGMjkzNyIvPgo8IS0tIFN0YXIgLS0+CjxwYXRoIGQ9Ik0xMDAgMTQwTDEwMyAxNTBIMTEzTDEwNSAxNTdMMTA4IDE2N0wxMDAgMTYwTDkyIDE2N0w5NSAxNTdMODcgMTUwSDk3TDEwMCAxNDBaIiBmaWxsPSJ3aGl0ZSIvPgo8IS0tIEVTVC4gMjAyNSAtLT4KPHA2eCB4PSI1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjREMyNjI2Ij5FU1QuIDIwMjU8L3RleHQ+CjxwYXRoIHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjREMyNjI2Ij48L3BhdGg+CjwhLS0gTWFpbiBUaXRsZSAtLT4KPHA2eCB4PSIxMDAiIHk9IjIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiPkdSQVNTUk9PVFMgTUFUQ0ggVFJBQ0tFUjwvdGV4dD4KPCEtLSBTdWJ0aXRsZSAtLT4KPHA2eCB4PSIxMDAiIHk9IjIzNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0RDMjYyNiI+Rk9SIFRIRSBQRU9QTEU8L3RleHQ+Cjwvc3ZnPgo="
          alt="Grassroots Match Tracker Logo"
          className="w-full h-full logo-image"
        />
      </div>
    </div>
  );

  // API functions
  const fetchTeams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teams`);
      const data = await response.json();
      setTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const fetchPlayers = async (teamId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/players`);
      const data = await response.json();
      setPlayers(data);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const fetchFormations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/formations`);
      const data = await response.json();
      setFormations(data);
    } catch (error) {
      console.error('Error fetching formations:', error);
    }
  };

  const fetchMatches = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/matches`);
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  };

  const createTeam = async (teamData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamData),
      });
      const newTeam = await response.json();
      setTeams([...teams, newTeam]);
      return newTeam;
    } catch (error) {
      console.error('Error creating team:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createPlayer = async (playerData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(playerData),
      });
      const newPlayer = await response.json();
      setPlayers([...players, newPlayer]);
      return newPlayer;
    } catch (error) {
      console.error('Error creating player:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createMatch = async (matchData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/matches`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(matchData),
      });
      const newMatch = await response.json();
      setMatches([...matches, newMatch]);
      return newMatch;
    } catch (error) {
      console.error('Error creating match:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    fetchFormations();
    fetchMatches();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchPlayers(selectedTeam.id);
    }
  }, [selectedTeam]);

  // Formation Pitch Component
  const FormationPitch = ({ formation, players, onPlayerSelect, selectedPlayers, homeTeam }) => {
    const formationData = formations[formation];
    if (!formationData) return null;

    const handlePositionClick = (positionIndex) => {
      onPlayerSelect(positionIndex);
    };

    const getPlayerForPosition = (positionIndex) => {
      return selectedPlayers.starting.find(p => p.positionIndex === positionIndex);
    };

    return (
      <div className="pitch-container relative w-full max-w-5xl mx-auto h-96 mb-6">
        {/* Pitch markings */}
        <div className="absolute inset-4 border-2 border-white rounded">
          {/* Goal areas */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-16 border-2 border-white border-t-0"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-16 border-2 border-white border-b-0"></div>
          
          {/* Penalty areas */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-24 border-2 border-white border-t-0"></div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-40 h-24 border-2 border-white border-b-0"></div>
          
          {/* Center line and circle */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
        </div>

        {/* Formation name overlay */}
        <div className="absolute top-2 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
          {formation} Formation
        </div>

        {/* Team name overlay */}
        <div className="absolute top-2 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
          {homeTeam?.name || 'Home Team'}
        </div>

        {/* Player positions */}
        {formationData.positions.map((position, index) => {
          const assignedPlayer = getPlayerForPosition(index);
          const isEmpty = !assignedPlayer;
          
          return (
            <div
              key={index}
              className={`player-position cursor-pointer transition-all duration-200 ${
                isEmpty ? 'hover:scale-110' : 'hover:scale-105'
              }`}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                backgroundColor: isEmpty ? '#dc2626' : '#10b981',
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => handlePositionClick(index)}
              title={isEmpty ? `Click to assign ${position.role}` : `${assignedPlayer.name} (#${assignedPlayer.squad_number})`}
            >
              {isEmpty ? (
                <span className="text-xs font-bold">{position.role}</span>
              ) : (
                <span className="text-xs font-bold">{assignedPlayer.squad_number}</span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // Player Selection Modal
  const PlayerSelectionModal = ({ 
    isOpen, 
    onClose, 
    availablePlayers, 
    positionIndex, 
    formationPosition, 
    onPlayerAssign,
    assignedPlayers 
  }) => {
    if (!isOpen) return null;

    const handlePlayerSelect = (player) => {
      onPlayerAssign(player, positionIndex);
      onClose();
    };

    const isPlayerAssigned = (playerId) => {
      return assignedPlayers.starting.some(p => p.id === playerId);
    };

    const getRecommendedPlayers = () => {
      const positionRole = formationPosition?.role;
      const positionMap = {
        'GK': 'GK',
        'RB': 'DEF', 'CB': 'DEF', 'LB': 'DEF',
        'RWB': 'DEF', 'LWB': 'DEF',
        'CDM': 'MID', 'CM': 'MID', 'CAM': 'MID',
        'RM': 'MID', 'LM': 'MID', 'RAM': 'MID', 'LAM': 'MID',
        'RW': 'FWD', 'LW': 'FWD', 'ST': 'FWD'
      };
      
      const preferredPosition = positionMap[positionRole] || 'MID';
      return availablePlayers.filter(p => p.position === preferredPosition);
    };

    const recommendedPlayers = getRecommendedPlayers();
    const otherPlayers = availablePlayers.filter(p => !recommendedPlayers.includes(p));

    return (
      <div className="modal-overlay">
        <div className="modal-content max-w-4xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              Select Player for {formationPosition?.role} Position
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {recommendedPlayers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 text-green-600">
                ✅ Recommended Players ({formationPosition?.role})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {recommendedPlayers.map(player => (
                  <button
                    key={player.id}
                    onClick={() => handlePlayerSelect(player)}
                    disabled={isPlayerAssigned(player.id)}
                    className={`p-3 rounded-lg border-2 text-left transition ${
                      isPlayerAssigned(player.id)
                        ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'border-green-300 hover:border-green-500 hover:bg-green-50'
                    }`}
                  >
                    <div className="font-bold">#{player.squad_number}</div>
                    <div className="text-sm">{player.name}</div>
                    <div className="text-xs text-gray-600">{player.position}</div>
                    {isPlayerAssigned(player.id) && (
                      <div className="text-xs text-red-600 mt-1">Already selected</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {otherPlayers.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-amber-600">
                ⚠️ Other Available Players
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {otherPlayers.map(player => (
                  <button
                    key={player.id}
                    onClick={() => handlePlayerSelect(player)}
                    disabled={isPlayerAssigned(player.id)}
                    className={`p-3 rounded-lg border-2 text-left transition ${
                      isPlayerAssigned(player.id)
                        ? 'border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'border-amber-300 hover:border-amber-500 hover:bg-amber-50'
                    }`}
                  >
                    <div className="font-bold">#{player.squad_number}</div>
                    <div className="text-sm">{player.name}</div>
                    <div className="text-xs text-gray-600">{player.position}</div>
                    {isPlayerAssigned(player.id) && (
                      <div className="text-xs text-red-600 mt-1">Already selected</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {availablePlayers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No players available for this team.</p>
              <p className="text-sm">Please add players to the squad first.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Home View
  const HomeView = () => (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Logo />
          <h1 className="text-5xl font-bold mb-6">Grassroots Match Tracker</h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Complete football management system for grassroots teams. Track players, manage squads, 
            organize matches, and analyze performance - all in one professional platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => setCurrentView('teams')}
              className="nav-button"
            >
              Get Started
            </button>
            <button 
              onClick={() => setCurrentView('live')}
              className="nav-button"
            >
              Live Match
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Complete Football Management</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="feature-card working card-hover">
              <div className="flex items-center mb-4">
                <span className="status-badge status-working">✅ Working</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Team Setup</h3>
              <p className="text-gray-600 mb-4">Create teams, add logos, set colors and manage team information</p>
              <button 
                onClick={() => setCurrentView('teams')}
                className="primary-button"
              >
                Manage Teams
              </button>
            </div>

            <div className="feature-card placeholder card-hover">
              <div className="flex items-center mb-4">
                <span className="status-badge status-placeholder">🚧 Next Priority</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Create Match & Squad Selection</h3>
              <p className="text-gray-600 mb-4">2-step process: Match details → Formation & squad selection</p>
              <button className="secondary-button">Coming Soon</button>
            </div>

            <div className="feature-card placeholder card-hover">
              <div className="flex items-center mb-4">
                <span className="status-badge status-placeholder">🚧 Priority</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Live Match Tracking</h3>
              <p className="text-gray-600 mb-4">Real-time match timer, scoring, events and statistics</p>
              <button className="secondary-button">Coming Soon</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Simple Teams View
  const TeamsView = () => {
    const [showForm, setShowForm] = useState(false);
    const [newTeam, setNewTeam] = useState({
      name: '',
      primary_color: '#dc2626',
      secondary_color: '#ffffff',
      founded_year: new Date().getFullYear()
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      const team = await createTeam(newTeam);
      if (team) {
        setShowForm(false);
        setNewTeam({
          name: '',
          primary_color: '#dc2626',
          secondary_color: '#ffffff',
          founded_year: new Date().getFullYear()
        });
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Team Management</h1>
            <button 
              onClick={() => setShowForm(true)}
              className="primary-button"
            >
              Add Team
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div key={team.id} className="feature-card card-hover">
                <h3 className="text-xl font-bold mb-2">{team.name}</h3>
                <p className="text-gray-600">Est. {team.founded_year}</p>
              </div>
            ))}
          </div>

          {showForm && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2 className="text-2xl font-bold mb-6">Add New Team</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Team Name"
                    value={newTeam.name}
                    onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                    className="input-field"
                    required
                  />
                  <button type="submit" className="primary-button w-full">
                    Create Team
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="secondary-button w-full"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Match Creation View - 2-Step Process
  const MatchView = () => {
    const [showPlayerModal, setShowPlayerModal] = useState(false);
    const [selectedPositionIndex, setSelectedPositionIndex] = useState(null);
    const [homeTeamPlayers, setHomeTeamPlayers] = useState([]);

    const resetMatch = () => {
      setMatchStep(1);
      setNewMatch({
        home_team_id: '',
        away_team_id: '',
        match_date: '',
        venue: '',
        match_type: 'Friendly'
      });
      setSelectedFormation('4-4-2');
      setSelectedPlayers({ starting: [], substitutes: [] });
      setHomeTeamPlayers([]);
    };

    const handleMatchDetailsSubmit = async (e) => {
      e.preventDefault();
      if (newMatch.home_team_id === newMatch.away_team_id) {
        alert('Home and away teams must be different');
        return;
      }
      
      // Fetch players for the home team
      try {
        const response = await fetch(`${API_BASE_URL}/api/teams/${newMatch.home_team_id}/players`);
        const players = await response.json();
        setHomeTeamPlayers(players);
        setMatchStep(2);
      } catch (error) {
        console.error('Error fetching team players:', error);
        alert('Error loading team players. Please try again.');
      }
    };

    const handlePlayerSelect = (positionIndex) => {
      setSelectedPositionIndex(positionIndex);
      setShowPlayerModal(true);
    };

    const handlePlayerAssign = (player, positionIndex) => {
      const formationData = formations[selectedFormation];
      if (!formationData) return;

      // Remove player from any existing position
      const updatedStarting = selectedPlayers.starting.filter(p => p.id !== player.id);
      
      // Add player to new position
      const playerWithPosition = {
        ...player,
        positionIndex: positionIndex,
        formationRole: formationData.positions[positionIndex].role
      };
      
      updatedStarting.push(playerWithPosition);
      
      setSelectedPlayers({
        ...selectedPlayers,
        starting: updatedStarting
      });
    };

    const handleRemovePlayer = (playerId) => {
      const updatedStarting = selectedPlayers.starting.filter(p => p.id !== playerId);
      setSelectedPlayers({
        ...selectedPlayers,
        starting: updatedStarting
      });
    };

    const getValidationErrors = () => {
      const errors = [];
      const formationData = formations[selectedFormation];
      
      if (!formationData) {
        errors.push('Invalid formation selected');
        return errors;
      }

      const requiredPositions = formationData.positions.length;
      const selectedCount = selectedPlayers.starting.length;
      
      if (selectedCount === 0) {
        errors.push('No players selected');
      } else if (selectedCount < 11) {
        errors.push(`Select ${11 - selectedCount} more players (${selectedCount}/11)`);
      } else if (selectedCount > 11) {
        errors.push(`Too many players selected (${selectedCount}/11)`);
      }

      // Check for goalkeeper
      const hasGoalkeeper = selectedPlayers.starting.some(p => 
        p.formationRole === 'GK' || p.position === 'GK'
      );
      
      if (selectedCount > 0 && !hasGoalkeeper) {
        errors.push('Must select a goalkeeper');
      }

      return errors;
    };

    const handleMatchCreate = async () => {
      const errors = getValidationErrors();
      
      if (errors.length > 0) {
        alert('Please fix the following issues:\n' + errors.join('\n'));
        return;
      }

      const matchData = {
        ...newMatch,
        match_date: new Date(newMatch.match_date).toISOString(),
        home_formation: selectedFormation,
        home_lineup: selectedPlayers.starting.map(p => p.id),
        home_substitutes: selectedPlayers.substitutes.map(p => p.id),
        status: 'scheduled'
      };
      
      const match = await createMatch(matchData);
      if (match) {
        alert('🎉 Match created successfully!');
        resetMatch();
        setCurrentView('home');
      }
    };

    if (matchStep === 1) {
      return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Create Match</h1>
              <p className="text-gray-600">Step 1: Match Details</p>
              <div className="flex justify-center mt-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <span className="ml-2 font-medium">Match Details</span>
                  </div>
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center">2</div>
                    <span className="ml-2 text-gray-500">Squad Selection</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-card max-w-2xl mx-auto">
              <form onSubmit={handleMatchDetailsSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Home Team</label>
                    <select
                      value={newMatch.home_team_id}
                      onChange={(e) => setNewMatch({...newMatch, home_team_id: e.target.value})}
                      className="input-field"
                      required
                    >
                      <option value="">Select Home Team</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Away Team</label>
                    <select
                      value={newMatch.away_team_id}
                      onChange={(e) => setNewMatch({...newMatch, away_team_id: e.target.value})}
                      className="input-field"
                      required
                    >
                      <option value="">Select Away Team</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Match Type</label>
                  <select
                    value={newMatch.match_type}
                    onChange={(e) => setNewMatch({...newMatch, match_type: e.target.value})}
                    className="input-field"
                  >
                    <option value="Friendly">Friendly</option>
                    <option value="League">League</option>
                    <option value="Cup">Cup</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Match Date & Time</label>
                  <input
                    type="datetime-local"
                    value={newMatch.match_date}
                    onChange={(e) => setNewMatch({...newMatch, match_date: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Venue</label>
                  <input
                    type="text"
                    value={newMatch.venue}
                    onChange={(e) => setNewMatch({...newMatch, venue: e.target.value})}
                    className="input-field"
                    placeholder="Stadium or ground name"
                    required
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <button type="submit" className="primary-button flex-1">
                    Next: Squad Selection ➡️
                  </button>
                  <button 
                    type="button"
                    onClick={() => setCurrentView('home')}
                    className="secondary-button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      );
    }

    // Step 2: Squad Selection
    const homeTeam = teams.find(t => t.id === newMatch.home_team_id);
    const awayTeam = teams.find(t => t.id === newMatch.away_team_id);
    const formationData = formations[selectedFormation];
    const validationErrors = getValidationErrors();

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Squad Selection</h1>
            <p className="text-gray-600">Step 2: Choose formation and select your starting XI</p>
            <div className="flex justify-center mt-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center">✓</div>
                  <span className="ml-2 text-gray-500">Match Details</span>
                </div>
                <div className="w-8 h-0.5 bg-gray-300"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <span className="ml-2 font-medium">Squad Selection</span>
                </div>
              </div>
            </div>
          </div>

          {/* Match Info */}
          <div className="feature-card mb-8">
            <div className="flex items-center justify-between">
              <div className="text-center">
                <h3 className="text-xl font-bold">{homeTeam?.name}</h3>
                <p className="text-gray-600">Home</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">{newMatch.match_type}</p>
                <p className="text-lg font-bold">VS</p>
                <p className="text-sm text-gray-500">
                  {new Date(newMatch.match_date).toLocaleDateString()} at{' '}
                  {new Date(newMatch.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-xs text-gray-400">{newMatch.venue}</p>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold">{awayTeam?.name}</h3>
                <p className="text-gray-600">Away</p>
              </div>
            </div>
          </div>

          {/* Formation Selection */}
          <div className="feature-card mb-8">
            <h3 className="text-xl font-bold mb-4">Choose Formation</h3>
            <div className="grid grid-cols-5 gap-4">
              {Object.keys(formations).map(formation => (
                <button
                  key={formation}
                  onClick={() => {
                    setSelectedFormation(formation);
                    setSelectedPlayers({ starting: [], substitutes: [] });
                  }}
                  className={`p-4 rounded-lg border-2 transition ${
                    selectedFormation === formation 
                      ? 'border-red-600 bg-red-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-lg font-bold">{formation}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Formation Pitch */}
          <div className="feature-card mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Formation: {selectedFormation}</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Selected: {selectedPlayers.starting.length}/11 players
                </span>
                {validationErrors.length > 0 && (
                  <div className="text-sm text-red-600">
                    ⚠️ {validationErrors[0]}
                  </div>
                )}
              </div>
            </div>
            <FormationPitch 
              formation={selectedFormation}
              players={homeTeamPlayers}
              onPlayerSelect={handlePlayerSelect}
              selectedPlayers={selectedPlayers}
              homeTeam={homeTeam}
            />
            <div className="text-center text-sm text-gray-600 mt-4">
              <p>💡 Click on any position to assign a player</p>
            </div>
          </div>

          {/* Selected Players Summary */}
          {selectedPlayers.starting.length > 0 && (
            <div className="feature-card mb-8">
              <h3 className="text-xl font-bold mb-4">Selected Starting XI</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedPlayers.starting.map(player => (
                  <div key={`${player.id}-${player.positionIndex}`} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold">#{player.squad_number}</div>
                        <div className="text-sm">{player.name}</div>
                        <div className="text-xs text-gray-600">{player.formationRole} ({player.position})</div>
                      </div>
                      <button
                        onClick={() => handleRemovePlayer(player.id)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Players */}
          <div className="feature-card mb-8">
            <h3 className="text-xl font-bold mb-4">
              Available Players ({homeTeamPlayers.length} total)
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {homeTeamPlayers.map(player => {
                const isSelected = selectedPlayers.starting.some(p => p.id === player.id);
                return (
                  <div 
                    key={player.id} 
                    className={`border-2 rounded-lg p-3 text-center transition ${
                      isSelected 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-bold">#{player.squad_number}</div>
                    <div className="text-sm">{player.name}</div>
                    <div className="text-xs text-gray-600">{player.position}</div>
                    {isSelected && (
                      <div className="text-xs text-green-600 mt-1">✓ Selected</div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {homeTeamPlayers.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No players found for this team.</p>
                <button 
                  onClick={() => {
                    setSelectedTeam(homeTeam);
                    setCurrentView('squad');
                  }}
                  className="primary-button mt-4"
                >
                  Add Players to Squad
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button 
              onClick={() => setMatchStep(1)}
              className="secondary-button"
            >
              ⬅️ Back to Match Details
            </button>
            <button 
              onClick={handleMatchCreate}
              disabled={validationErrors.length > 0}
              className={`flex-1 ${
                validationErrors.length > 0 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'primary-button'
              }`}
            >
              {validationErrors.length > 0 
                ? `Fix Issues: ${validationErrors[0]}` 
                : '🎉 Create Match'
              }
            </button>
          </div>

          {/* Player Selection Modal */}
          <PlayerSelectionModal
            isOpen={showPlayerModal}
            onClose={() => setShowPlayerModal(false)}
            availablePlayers={homeTeamPlayers}
            positionIndex={selectedPositionIndex}
            formationPosition={formationData?.positions[selectedPositionIndex]}
            onPlayerAssign={handlePlayerAssign}
            assignedPlayers={selectedPlayers}
          />
        </div>
      </div>
    );
  };

  // Navigation
  const NavigationBar = () => (
    <nav className="bg-gray-900 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold">Grassroots Match Tracker</h1>
        </div>
        <div className="flex space-x-4">
          <button 
            onClick={() => setCurrentView('home')}
            className={`px-4 py-2 rounded ${currentView === 'home' ? 'bg-red-600' : 'hover:bg-gray-700'}`}
          >
            Home
          </button>
          <button 
            onClick={() => setCurrentView('teams')}
            className={`px-4 py-2 rounded ${currentView === 'teams' ? 'bg-red-600' : 'hover:bg-gray-700'}`}
          >
            Teams
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="App">
      <NavigationBar />
      {currentView === 'home' && <HomeView />}
      {currentView === 'teams' && <TeamsView />}
    </div>
  );
};

export default App;
