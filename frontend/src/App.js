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
