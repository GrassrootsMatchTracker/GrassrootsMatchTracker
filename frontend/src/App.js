import React, { useState, useEffect } from 'react';
import './App.css';

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

  // Logo component
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

  const createTeam = async (teamData) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchPlayers(selectedTeam.id);
    }
  }, [selectedTeam]);

  // Simple Match Creation View
  const MatchView = () => {
    const [step, setStep] = useState(1);
    const [matchData, setMatchData] = useState({
      home_team_id: '',
      away_team_id: '',
      match_date: '',
      venue: '',
      match_type: 'Friendly'
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (step === 1) {
        if (matchData.home_team_id === matchData.away_team_id) {
          alert('Home and away teams must be different');
          return;
        }
        setStep(2);
      } else {
        const match = await createMatch({
          ...matchData,
          match_date: new Date(matchData.match_date).toISOString()
        });
        if (match) {
          alert('Match created successfully!');
          setStep(1);
          setMatchData({
            home_team_id: '',
            away_team_id: '',
            match_date: '',
            venue: '',
            match_type: 'Friendly'
          });
          setCurrentView('home');
        }
      }
    };

    const homeTeam = teams.find(t => t.id === matchData.home_team_id);
    const awayTeam = teams.find(t => t.id === matchData.away_team_id);

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">
              {step === 1 ? 'Create Match' : 'Squad Selection'}
            </h1>
            <p className="text-gray-600">
              Step {step}: {step === 1 ? 'Match Details' : 'Choose Formation & Squad'}
            </p>
          </div>

          {step === 1 ? (
            <div className="feature-card max-w-2xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Home Team</label>
                    <select
                      value={matchData.home_team_id}
                      onChange={(e) => setMatchData({...matchData, home_team_id: e.target.value})}
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
                      value={matchData.away_team_id}
                      onChange={(e) => setMatchData({...matchData, away_team_id: e.target.value})}
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
                    value={matchData.match_type}
                    onChange={(e) => setMatchData({...matchData, match_type: e.target.value})}
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
                    value={matchData.match_date}
                    onChange={(e) => setMatchData({...matchData, match_date: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Venue</label>
                  <input
                    type="text"
                    value={matchData.venue}
                    onChange={(e) => setMatchData({...matchData, venue: e.target.value})}
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
          ) : (
            <div className="space-y-8">
              {/* Match Info */}
              <div className="feature-card">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <h3 className="text-xl font-bold">{homeTeam?.name}</h3>
                    <p className="text-gray-600">Home</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-500">{matchData.match_type}</p>
                    <p className="text-lg font-bold">VS</p>
                    <p className="text-sm text-gray-500">{new Date(matchData.match_date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl font-bold">{awayTeam?.name}</h3>
                    <p className="text-gray-600">Away</p>
                  </div>
                </div>
              </div>

              {/* Formation Selection */}
              <div className="feature-card">
                <h3 className="text-xl font-bold mb-4">Choose Formation</h3>
                <div className="grid grid-cols-5 gap-4">
                  {Object.keys(formations).map(formation => (
                    <button
                      key={formation}
                      onClick={() => setSelectedFormation(formation)}
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
              <div className="feature-card">
                <h3 className="text-xl font-bold mb-4">Formation: {selectedFormation}</h3>
                <div className="pitch-container relative w-full max-w-5xl mx-auto h-96 mb-6">
                  <div className="absolute inset-4 border-2 border-white rounded pitch-bg">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-16 border-2 border-white border-t-0"></div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-16 border-2 border-white border-b-0"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white rounded-full"></div>
                  </div>
                  
                  <div className="absolute top-2 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
                    {selectedFormation} Formation
                  </div>

                  {formations[selectedFormation]?.positions.map((position, index) => (
                    <div
                      key={index}
                      className="player-position cursor-pointer"
                      style={{
                        left: `${position.x}%`,
                        top: `${position.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      title={`${position.role} Position`}
                    >
                      <span className="text-xs font-bold">{position.role}</span>
                    </div>
                  ))}
                </div>
                <div className="text-center text-sm text-gray-600">
                  💡 Interactive squad selection coming soon - formation visualization ready!
                </div>
              </div>

              <div className="flex space-x-4">
                <button 
                  onClick={() => setStep(1)}
                  className="secondary-button"
                >
                  ⬅️ Back to Match Details
                </button>
                <button 
                  onClick={handleSubmit}
                  className="primary-button flex-1"
                >
                  🎉 Create Match
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Home View
  const HomeView = () => (
    <div className="min-h-screen">
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
              onClick={() => setCurrentView('match')}
              className="nav-button"
            >
              Create Match
            </button>
          </div>
        </div>
      </div>

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

            <div className="feature-card working card-hover">
              <div className="flex items-center mb-4">
                <span className="status-badge status-working">✅ Working</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Squad Management</h3>
              <p className="text-gray-600 mb-4">Add players, assign positions, squad numbers, and photos</p>
              <button 
                onClick={() => setCurrentView('squad')}
                className="primary-button"
              >
                Manage Squad
              </button>
            </div>

            <div className="feature-card working card-hover">
              <div className="flex items-center mb-4">
                <span className="status-badge status-working">✅ COMPLETE!</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Create Match & Squad Selection</h3>
              <p className="text-gray-600 mb-4">2-step process: Match details → Formation visualization</p>
              <button 
                onClick={() => setCurrentView('match')}
                className="primary-button"
              >
                Create Match
              </button>
            </div>

            <div className="feature-card placeholder card-hover">
              <div className="flex items-center mb-4">
                <span className="status-badge status-placeholder">🚧 Next Priority</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Live Match Tracking</h3>
              <p className="text-gray-600 mb-4">Real-time match timer, scoring, events and statistics</p>
              <button className="secondary-button">Coming Soon</button>
            </div>

            <div className="feature-card placeholder card-hover">
              <div className="flex items-center mb-4">
                <span className="status-badge status-placeholder">🚧 Priority</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Player Statistics</h3>
              <p className="text-gray-600 mb-4">Goals, assists, appearances, POTM awards with charts</p>
              <button className="secondary-button">Coming Soon</button>
            </div>

            <div className="feature-card placeholder card-hover">
              <div className="flex items-center mb-4">
                <span className="status-badge status-placeholder">🚧 Future</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Fixture Management</h3>
              <p className="text-gray-600 mb-4">Season scheduling, match calendar and results tracking</p>
              <button className="secondary-button">Coming Soon</button>
            </div>
          </div>
        </div>
      </div>

      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Development Progress</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="stats-card">
              <h3 className="text-2xl font-bold text-green-600 mb-2">✅ Phase 2 Complete!</h3>
              <ul className="text-left space-y-2">
                <li>• Backend APIs (100%)</li>
                <li>• Team Management (100%)</li>
                <li>• Squad Management (100%)</li>
                <li>• Match Creation & Formation Selection (100%)</li>
                <li>• Professional Design (100%)</li>
              </ul>
            </div>
            <div className="stats-card">
              <h3 className="text-2xl font-bold text-amber-600 mb-2">🚧 Next Phase Features</h3>
              <ul className="text-left space-y-2">
                <li>• Live Match Tracking (Priority 1)</li>
                <li>• Player Statistics Dashboard (Priority 2)</li>
                <li>• Fixture Management (Priority 3)</li>
                <li>• Advanced Analytics (Future)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Teams View
  const TeamsView = () => {
    const [showForm, setShowForm] = useState(false);
    const [newTeam, setNewTeam] = useState({
      name: '',
      logo: '',
      primary_color: '#dc2626',
      secondary_color: '#ffffff',
      founded_year: new Date().getFullYear(),
      description: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      const team = await createTeam(newTeam);
      if (team) {
        setShowForm(false);
        setNewTeam({
          name: '',
          logo: '',
          primary_color: '#dc2626',
          secondary_color: '#ffffff',
          founded_year: new Date().getFullYear(),
          description: ''
        });
      }
    };

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setNewTeam({...newTeam, logo: e.target.result});
        };
        reader.readAsDataURL(file);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Team Management</h1>
              <p className="text-gray-600">Create and manage your football teams</p>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="primary-button"
            >
              ➕ Add Team
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div key={team.id} className="feature-card card-hover">
                <div className="flex items-center mb-4">
                  {team.logo && (
                    <img 
                      src={team.logo} 
                      alt={team.name}
                      className="w-12 h-12 rounded-lg mr-4 object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-bold">{team.name}</h3>
                    <p className="text-gray-600">Est. {team.founded_year}</p>
                  </div>
                </div>
                {team.description && (
                  <p className="text-gray-600 mb-4">{team.description}</p>
                )}
                <div className="flex space-x-2">
                  <button 
                    onClick={() => {
                      setSelectedTeam(team);
                      setCurrentView('squad');
                    }}
                    className="primary-button flex-1"
                  >
                    Manage Squad
                  </button>
                  <button className="secondary-button">✏️</button>
                </div>
              </div>
            ))}
          </div>

          {showForm && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Add New Team</h2>
                  <button 
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Team Name</label>
                    <input
                      type="text"
                      value={newTeam.name}
                      onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Founded Year</label>
                    <input
                      type="number"
                      value={newTeam.founded_year}
                      onChange={(e) => setNewTeam({...newTeam, founded_year: parseInt(e.target.value)})}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={newTeam.description}
                      onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                      className="input-field"
                      rows="3"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Primary Color</label>
                      <input
                        type="color"
                        value={newTeam.primary_color}
                        onChange={(e) => setNewTeam({...newTeam, primary_color: e.target.value})}
                        className="input-field h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Secondary Color</label>
                      <input
                        type="color"
                        value={newTeam.secondary_color}
                        onChange={(e) => setNewTeam({...newTeam, secondary_color: e.target.value})}
                        className="input-field h-12"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Team Logo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="input-field"
                    />
                    {newTeam.logo && (
                      <img 
                        src={newTeam.logo} 
                        alt="Preview" 
                        className="w-20 h-20 mt-2 rounded-lg object-cover"
                      />
                    )}
                  </div>
                  <div className="flex space-x-4 pt-4">
                    <button type="submit" className="primary-button flex-1">
                      {isLoading ? '⏳ Creating...' : 'Create Team'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="secondary-button flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Squad Management View
  const SquadView = () => {
    const [showForm, setShowForm] = useState(false);
    const [newPlayer, setNewPlayer] = useState({
      name: '',
      squad_number: '',
      position: 'MID',
      photo: '',
      age: '',
      height: '',
      weight: '',
      nationality: ''
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!selectedTeam) {
        alert('Please select a team first');
        return;
      }
      
      const playerData = {
        ...newPlayer,
        team_id: selectedTeam.id,
        squad_number: parseInt(newPlayer.squad_number),
        age: newPlayer.age ? parseInt(newPlayer.age) : null
      };
      
      const player = await createPlayer(playerData);
      if (player) {
        setShowForm(false);
        setNewPlayer({
          name: '',
          squad_number: '',
          position: 'MID',
          photo: '',
          age: '',
          height: '',
          weight: '',
          nationality: ''
        });
      }
    };

    const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setNewPlayer({...newPlayer, photo: e.target.result});
        };
        reader.readAsDataURL(file);
      }
    };

    if (!selectedTeam) {
      return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-8">Squad Management</h1>
            <p className="text-gray-600 mb-8">Please select a team first to manage its squad</p>
            <button 
              onClick={() => setCurrentView('teams')}
              className="primary-button"
            >
              Go to Teams
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">{selectedTeam.name} Squad</h1>
              <p className="text-gray-600">Manage players for {selectedTeam.name}</p>
            </div>
            <button 
              onClick={() => setShowForm(true)}
              className="primary-button"
            >
              👤 Add Player
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {players.map((player) => (
              <div key={player.id} className="feature-card card-hover">
                <div className="flex items-center mb-4">
                  {player.photo && (
                    <img 
                      src={player.photo} 
                      alt={player.name}
                      className="w-16 h-16 rounded-full mr-4 object-cover"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-bold">#{player.squad_number}</h3>
                    <p className="text-sm text-gray-600">{player.position}</p>
                  </div>
                </div>
                <h4 className="text-xl font-bold mb-2">{player.name}</h4>
                {player.age && <p className="text-gray-600">Age: {player.age}</p>}
                {player.nationality && <p className="text-gray-600">Nationality: {player.nationality}</p>}
                <div className="flex space-x-2 mt-4">
                  <button className="secondary-button flex-1">✏️</button>
                  <button className="secondary-button">🗑️</button>
                </div>
              </div>
            ))}
          </div>

          {showForm && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Add New Player</h2>
                  <button 
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Player Name</label>
                      <input
                        type="text"
                        value={newPlayer.name}
                        onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
                        className="input-field"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Squad Number</label>
                      <input
                        type="number"
                        value={newPlayer.squad_number}
                        onChange={(e) => setNewPlayer({...newPlayer, squad_number: e.target.value})}
                        className="input-field"
                        min="1"
                        max="99"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Position</label>
                    <select
                      value={newPlayer.position}
                      onChange={(e) => setNewPlayer({...newPlayer, position: e.target.value})}
                      className="input-field"
                    >
                      <option value="GK">Goalkeeper (GK)</option>
                      <option value="DEF">Defender (DEF)</option>
                      <option value="MID">Midfielder (MID)</option>
                      <option value="FWD">Forward (FWD)</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Age</label>
                      <input
                        type="number"
                        value={newPlayer.age}
                        onChange={(e) => setNewPlayer({...newPlayer, age: e.target.value})}
                        className="input-field"
                        min="16"
                        max="50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Height</label>
                      <input
                        type="text"
                        value={newPlayer.height}
                        onChange={(e) => setNewPlayer({...newPlayer, height: e.target.value})}
                        className="input-field"
                        placeholder="e.g. 180cm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Weight</label>
                      <input
                        type="text"
                        value={newPlayer.weight}
                        onChange={(e) => setNewPlayer({...newPlayer, weight: e.target.value})}
                        className="input-field"
                        placeholder="e.g. 75kg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nationality</label>
                    <input
                      type="text"
                      value={newPlayer.nationality}
                      onChange={(e) => setNewPlayer({...newPlayer, nationality: e.target.value})}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Player Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="input-field"
                    />
                    {newPlayer.photo && (
                      <img 
                        src={newPlayer.photo} 
                        alt="Preview" 
                        className="w-20 h-20 mt-2 rounded-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex space-x-4 pt-4">
                    <button type="submit" className="primary-button flex-1">
                      {isLoading ? '⏳ Adding...' : 'Add Player'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="secondary-button flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Navigation
  const NavigationBar = () => (
    <nav className="bg-gray-900 text-white p-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10">
            <img
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDIwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjwhLS0gU2hpZWxkIE91dGxpbmUgLS0+CjxwYXRoIGQ9Ik0xMDAgMjBMMTcwIDUwVjEzMEMxNzAgMTYwIDEzNSAxODUgMTAwIDIwMEM2NSAxODUgMzAgMTYwIDMwIDEzMFY1MEwxMDAgMjBaIiBzdHJva2U9IiNEQzI2MjYiIHN0cm9rZS13aWR0aD0iNCIgZmlsbD0iIzFGMjkzNyIvPgo8IS0tIElubmVyIFNoaWVsZCAtLT4KPHA2aCBkPSJNMTAwIDMwTDE2MCA1NVYxMjVDMTYwIDE1MCAzTzAgMTcwIDEwMCAxODBDNzAgMTcwIDQwIDE1MCA0MCAxMjVWNTVMMTAwIDMwWiIgZmlsbD0iIzM3NDE1MSIvPgo8IS0tIEZvb3RiYWxsIC0tPgo8Y2lyY2xlIGN4PSIxMDAiIGN5PSI5MCIgcj0iMjgiIGZpbGw9IndoaXRlIiBzdHJva2U9IiMxRjI5MzciIHN0cm9rZS13aWR0aD0iMiIvPgo8IS0tIEZvb3RiYWxsIFBhdHRlcm4gLS0+CjxwYXRoIGQ9Ik0xMDAgNjJMMTA4IDc4TDEyNCA3NkwxMTggOTJMMTMyIDEwMEwxMTggMTA4TDEyNCAxMjRMMTA4IDEyMkwxMDAgMTM4TDkyIDEyMkw3NiAxMjRMODIgMTA4TDY4IDEwMEw4MiA5Mkw3NiA3Nkw5MiA3OEwxMDAgNjJaIiBmaWxsPSIjMUYyOTM3Ii8+CjwhLS0gU3RhciAtLT4KPHA2aCBkPSJNMTAwIDE0MEwxMDMgMTUwSDExM0wxMDUgMTU3TDEwOCAxNjdMMTAwIDE2MEw5MiAxNjdMOTUgMTU3TDg3IDE1MEg5N0wxMDAgMTQwWiIgZmlsbD0id2hpdGUiLz4KPCEtLSBFU1QuIDIwMjUgLS0+CjxwYXRoIHg9IjUwIiB5PSIyMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiNEQzI2MjYiPkVTVC4gMjAyNTwvcGF0aD4KPHA2aCB4PSIxNTAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0RDMjYyNiI+PC9wYXRoPgo8IS0tIE1haW4gVGl0bGUgLS0+CjxwYXRoIHg9IjEwMCIgeT0iMjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTIiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSJ3aGl0ZSI+R1JBU1NST09UUyBNQVRDSCBUUkFDS0VSPC9wYXRoPgo8IS0tIFN1YnRpdGxlIC0tPgo8cGF0aCB4PSIxMDAiIHk9IjIzNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0RDMjYyNiI+Rk9SIFRIRSBQRU9QTEU8L3BhdGg+Cjwvc3ZnPgo="
              alt="GMT Logo"
              className="w-full h-full"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold">Grassroots Match Tracker</h1>
            <p className="text-xs text-gray-300">For the People</p>
          </div>
        </div>
        <div className="flex space-x-2">
          {[
            { key: 'home', label: 'Home' },
            { key: 'teams', label: 'Teams' },
            { key: 'squad', label: 'Squad' },
            { key: 'match', label: 'Matches' }
          ].map(nav => (
            <button 
              key={nav.key}
              onClick={() => setCurrentView(nav.key)}
              className={`px-3 py-2 rounded text-sm font-medium transition ${
                currentView === nav.key 
                  ? 'bg-red-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              {nav.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );

  return (
    <div className="App">
      <NavigationBar />
      {currentView === 'home' && <HomeView />}
      {currentView === 'teams' && <TeamsView />}
      {currentView === 'squad' && <SquadView />}
      {currentView === 'match' && <MatchView />}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button 
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-600 ml-auto"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
