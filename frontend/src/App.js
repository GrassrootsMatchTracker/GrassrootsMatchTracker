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

  // Player selection dropdown state
  const [showPlayerDropdown, setShowPlayerDropdown] = useState(false);
  const [selectedPositionIndex, setSelectedPositionIndex] = useState(null);
  const [homeTeamPlayers, setHomeTeamPlayers] = useState([]);

  // Age group configurations
  const ageGroups = {
    'U7': { gameFormat: '5v5', minSquad: 10, maxSquad: 12, maxMatchday: 10 },
    'U8': { gameFormat: '5v5', minSquad: 10, maxSquad: 12, maxMatchday: 10 },
    'U9': { gameFormat: '7v7', minSquad: 14, maxSquad: 15, maxMatchday: 14 },
    'U10': { gameFormat: '7v7', minSquad: 14, maxSquad: 15, maxMatchday: 14 },
    'U11': { gameFormat: '9v9', minSquad: 14, maxSquad: 16, maxMatchday: 16 },
    'U12': { gameFormat: '9v9', minSquad: 14, maxSquad: 16, maxMatchday: 16 },
    'U13': { gameFormat: '11v11', minSquad: 16, maxSquad: 18, maxMatchday: 16 },
    'U14': { gameFormat: '11v11', minSquad: 16, maxSquad: 18, maxMatchday: 16 },
    'U15': { gameFormat: '11v11', minSquad: 16, maxSquad: 18, maxMatchday: 16 },
    'U16': { gameFormat: '11v11', minSquad: 16, maxSquad: 18, maxMatchday: 16 },
    'U17': { gameFormat: '11v11', minSquad: 16, maxSquad: 18, maxMatchday: 16 },
    'U18': { gameFormat: '11v11', minSquad: 16, maxSquad: 18, maxMatchday: 16 }
  };

  // Age group specific formations
  const ageGroupFormations = {
    '5v5': {
      '2-1-1': {
        name: '2-1-1',
        positions: [
          { role: 'GK', x: 50, y: 15 },
          { role: 'DEF', x: 30, y: 40 }, { role: 'DEF', x: 70, y: 40 },
          { role: 'MID', x: 50, y: 65 },
          { role: 'FWD', x: 50, y: 85 }
        ]
      },
      '1-2-1': {
        name: '1-2-1',
        positions: [
          { role: 'GK', x: 50, y: 15 },
          { role: 'DEF', x: 50, y: 40 },
          { role: 'MID', x: 30, y: 65 }, { role: 'MID', x: 70, y: 65 },
          { role: 'FWD', x: 50, y: 85 }
        ]
      }
    },
    '7v7': {
      '2-3-1': {
        name: '2-3-1',
        positions: [
          { role: 'GK', x: 50, y: 15 },
          { role: 'DEF', x: 25, y: 35 }, { role: 'DEF', x: 75, y: 35 },
          { role: 'MID', x: 25, y: 60 }, { role: 'MID', x: 50, y: 55 }, { role: 'MID', x: 75, y: 60 },
          { role: 'FWD', x: 50, y: 85 }
        ]
      },
      '3-2-1': {
        name: '3-2-1',
        positions: [
          { role: 'GK', x: 50, y: 15 },
          { role: 'DEF', x: 25, y: 35 }, { role: 'DEF', x: 50, y: 30 }, { role: 'DEF', x: 75, y: 35 },
          { role: 'MID', x: 35, y: 60 }, { role: 'MID', x: 65, y: 60 },
          { role: 'FWD', x: 50, y: 85 }
        ]
      }
    },
    '9v9': {
      '3-3-2': {
        name: '3-3-2',
        positions: [
          { role: 'GK', x: 50, y: 15 },
          { role: 'DEF', x: 25, y: 35 }, { role: 'DEF', x: 50, y: 30 }, { role: 'DEF', x: 75, y: 35 },
          { role: 'MID', x: 25, y: 60 }, { role: 'MID', x: 50, y: 55 }, { role: 'MID', x: 75, y: 60 },
          { role: 'FWD', x: 40, y: 85 }, { role: 'FWD', x: 60, y: 85 }
        ]
      },
      '3-4-1': {
        name: '3-4-1',
        positions: [
          { role: 'GK', x: 50, y: 15 },
          { role: 'DEF', x: 25, y: 35 }, { role: 'DEF', x: 50, y: 30 }, { role: 'DEF', x: 75, y: 35 },
          { role: 'MID', x: 20, y: 60 }, { role: 'MID', x: 40, y: 55 }, 
          { role: 'MID', x: 60, y: 55 }, { role: 'MID', x: 80, y: 60 },
          { role: 'FWD', x: 50, y: 85 }
        ]
      }
    },
    '11v11': formations // Use existing formations for 11v11
  };

  // Logo component using your uploaded image
  const Logo = () => (
    <div className="flex flex-col items-center">
      <div className="w-32 h-32 relative mb-4">
        <img
          src="/logo.png"
          alt="Grassroots Match Tracker Logo"
          className="w-full h-full logo-image"
          onError={(e) => {
            // Fallback to SVG if uploaded image not found
            e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCIgdmlld0JveD0iMCAwIDIwMCAyNDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjwhLS0gU2hpZWxkIE91dGxpbmUgLS0+CjxwYXRoIGQ9Ik0xMDAgMjBMMTcwIDUwVjEzMEMxNzAgMTYwIDEzNSAxODUgMTAwIDIwMEM2NSAxODUgMzAgMTYwIDMwIDEzMFY1MEwxMDAgMjBaIiBzdHJva2U9IiNEQzI2MjYiIHN0cm9rZS13aWR0aD0iNCIgZmlsbD0iIzFGMjkzNyIvPgo8IS0tIElubmVyIFNoaWVsZCAtLT4KPHA2aCBkPSJNMTAwIDMwTDE2MCA1NVYxMjVDMTYwIDE1MCAMTMwIDE3MCAxMDAgMTgwQzcwIDE3MCA0MCAxNTAgNDAgMTI1VjU1TDEwMCAzMFoiIGZpbGw9IiMzNzQxNTEiLz4KPCEtLSBGb290YmFsbCAtLT4KPGNpcmNsZSBjeD0iMTAwIiBjeT0iOTAiIHI9IjI4IiBmaWxsPSJ3aGl0ZSIgc3Ryb2tlPSIjMUYyOTM3IiBzdHJva2Utd2lkdGg9IjIiLz4KPCEtLSBGb290YmFsbCBQYXR0ZXJuIC0tPgo8cGF0aCBkPSJNMTAwIDYyTDEwOCA3OEwxMjQgNzZMMTE4IDkyTDEzMiAxMDBMMTE4IDEwOEwxMjQgMTI0TDEwOCAxMjJMMTAwIDEzOEw5MiAxMjJMNzYgMTI0TDgyIDEwOEw2OCAxMDBMODIgOTJMNzYgNzZMOTIgNzhMMTAwIDYyWiIgZmlsbD0iIzFGMjkzNyIvPgo8IS0tIFN0YXIgLS0+CjxwYXRoIGQ9Ik0xMDAgMTQwTDEwMyAxNTBIMTEzTDEwNSAxNTdMMTA4IDE2N0wxMDAgMTYwTDkyIDE2N0w5NSAxNTdMODcgMTUwSDk3TDEwMCAxNDBaIiBmaWxsPSJ3aGl0ZSIvPgo8IS0tIEVTVC4gMjAyNSAtLT4KPHA2eCB4PSI1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjREMyNjI2Ij5FU1QuIDIwMjU8L3RleHQ+CjxwYXRoIHg9IjE1MCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtd2VpZ2h0PSJib2xkIiBmaWxsPSIjREMyNjI2Ij48L3BhdGg+CjwhLS0gTWFpbiBUaXRsZSAtLT4KPHA2eCB4PSIxMDAiIHk9IjIyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0id2hpdGUiPkdSQVNTUk9PVFMgTUFUQ0ggVFJBQ0tFUjwvdGV4dD4KPCEtLSBTdWJ0aXRsZSAtLT4KPHA2eCB4PSIxMDAiIHk9IjIzNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmb250LXdlaWdodD0iYm9sZCIgZmlsbD0iI0RDMjYyNiI+Rk9SIFRIRSBQRU9QTEU8L3RleHQ+Cjwvc3ZnPgo=";
          }}
        />
      </div>
    </div>
  );