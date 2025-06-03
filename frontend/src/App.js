import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Privacy Policy Modal Component
const PrivacyPolicyModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl max-h-96 overflow-y-auto m-4">
        <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>
        <div className="space-y-4 text-sm">
          <p>Last updated: June 2025</p>
          <h3 className="font-semibold">1. Information We Collect</h3>
          <p>We collect information you provide directly to us, such as team details, player information, and match data.</p>
          <h3 className="font-semibold">2. How We Use Information</h3>
          <p>We use information to provide, maintain, and improve our services, including match tracking and team management.</p>
          <h3 className="font-semibold">3. Information Sharing</h3>
          <p>We do not sell, trade, or rent your personal information to third parties.</p>
          <h3 className="font-semibold">4. Data Security</h3>
          <p>We implement appropriate security measures to protect your information against unauthorized access.</p>
        </div>
        <button 
          onClick={onClose}
          className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Terms & Conditions Modal Component
const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-4xl max-h-96 overflow-y-auto m-4">
        <h2 className="text-2xl font-bold mb-4">Terms & Conditions</h2>
        <div className="space-y-4 text-sm">
          <p>Last updated: June 2025</p>
          <h3 className="font-semibold">1. Acceptance of Terms</h3>
          <p>By using our service, you agree to these terms and conditions.</p>
          <h3 className="font-semibold">2. Service Description</h3>
          <p>Grassroots Match Tracker provides football team and match management tools.</p>
          <h3 className="font-semibold">3. User Responsibilities</h3>
          <p>Users are responsible for maintaining accurate team and player information.</p>
          <h3 className="font-semibold">4. Limitation of Liability</h3>
          <p>We are not liable for any indirect, incidental, or consequential damages.</p>
        </div>
        <button 
          onClick={onClose}
          className="mt-6 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Cookie Policy Modal Component
const CookieModal = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 z-50">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
        <p className="mb-4 md:mb-0">
          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
        </p>
        <div className="flex space-x-4">
          <button 
            onClick={onAccept}
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
          >
            Accept
          </button>
          <button 
            onClick={onClose}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
};

// Statistics View Component
const StatisticsView = ({ teams, onBack }) => {
  return (
    <div className="p-8">
      <div className="flex items-center mb-8">
        <button 
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 mr-4"
        >
          ← Back
        </button>
        <h2 className="text-3xl font-bold text-gray-800">Statistics Dashboard</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              📊
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-800">Total Teams</h3>
              <p className="text-2xl font-bold text-blue-600">{teams.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              👥
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-800">Total Players</h3>
              <p className="text-2xl font-bold text-green-600">
                {teams.reduce((total, team) => total + (team.players?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              ⚽
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-800">Total Matches</h3>
              <p className="text-2xl font-bold text-yellow-600">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              🏆
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-800">Active Leagues</h3>
              <p className="text-2xl font-bold text-purple-600">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Teams by Age Group</h3>
          <div className="space-y-3">
            {['U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18'].map(ageGroup => {
              const count = teams.filter(team => team.age_group === ageGroup).length;
              return (
                <div key={ageGroup} className="flex justify-between items-center">
                  <span className="font-medium">{ageGroup}</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {count} teams
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="font-medium">System Ready</p>
                <p className="text-sm text-gray-600">Grassroots Match Tracker is operational</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Players View Component
const PlayersView = ({ teams, onBack }) => {
  const allPlayers = teams.flatMap(team => 
    (team.players || []).map(player => ({
      ...player,
      teamName: team.name,
      teamAgeGroup: team.age_group
    }))
  );

  return (
    <div className="p-8">
      <div className="flex items-center mb-8">
        <button 
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 mr-4"
        >
          ← Back
        </button>
        <h2 className="text-3xl font-bold text-gray-800">All Players</h2>
        <span className="ml-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {allPlayers.length} players
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allPlayers.map((player) => (
          <div key={player.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {player.squad_number}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {player.first_name} {player.last_name}
                  </h3>
                  <p className="text-blue-600 font-medium">{player.position}</p>
                  <p className="text-gray-500 text-sm">Age: {player.age}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">Team: {player.teamName}</p>
                <p className="text-sm text-gray-600">Age Group: {player.teamAgeGroup}</p>
              </div>
            </div>
          </div>
        ))}
        
        {allPlayers.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">👥</span>
            </div>
            <h3 className="text-lg font-medium text-gray-500 mb-2">No Players Found</h3>
            <p className="text-gray-400">Add teams and players to see them here</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Fixtures View Component  
const FixturesView = ({ onBack }) => {
  return (
    <div className="p-8">
      <div className="flex items-center mb-8">
        <button 
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 mr-4"
        >
          ← Back
        </button>
        <h2 className="text-3xl font-bold text-gray-800">Fixtures & Results</h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl">📅</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Fixtures Coming Soon</h3>
        <p className="text-gray-600 mb-6">
          Create matches to see upcoming fixtures and results here. 
          Use the Match Creation feature to schedule games between your teams.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700"
        >
          Create Your First Match
        </button>
      </div>
    </div>
  );
};

// Leagues View Component
const LeaguesView = ({ onBack }) => {
  return (
    <div className="p-8">
      <div className="flex items-center mb-8">
        <button 
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 mr-4"
        >
          ← Back
        </button>
        <h2 className="text-3xl font-bold text-gray-800">Leagues & Tournaments</h2>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-3xl">🏆</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-4">League Management Coming Soon</h3>
        <p className="text-gray-600 mb-6">
          Create and manage leagues and tournaments for your grassroots teams. 
          Track standings, manage fixtures, and celebrate victories!
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-purple-600 hover:to-purple-700"
        >
          Coming Soon
        </button>
      </div>
    </div>
  );
};

// Team View Component
const TeamView = ({ teams, onTeamSelect, onAddTeam, onViewMatches }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTeam, setNewTeam] = useState({
    name: '',
    age_group: 'U13'
  });

  const ageGroups = ['U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onAddTeam(newTeam);
    setNewTeam({ name: '', age_group: 'U13' });
    setShowAddForm(false);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Team Management</h2>
        <div className="space-x-4">
          <button 
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            ➕ Add New Team
          </button>
          <button 
            onClick={onViewMatches}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            📅 View Matches
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-xl p-6 mb-8 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Add New Team</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Team Name</label>
              <input
                type="text"
                value={newTeam.name}
                onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age Group</label>
              <select
                value={newTeam.age_group}
                onChange={(e) => setNewTeam({...newTeam, age_group: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                {ageGroups.map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>
            <div className="flex space-x-4">
              <button 
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Create Team
              </button>
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {team.name.charAt(0)}
                </div>
                <div className="ml-4">
                  <h3 className="text-xl font-semibold text-gray-800">{team.name}</h3>
                  <p className="text-green-600 font-medium">{team.age_group}</p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-gray-600">Players: {team.players?.length || 0}</p>
              </div>
              <button 
                onClick={() => onTeamSelect(team)}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2 rounded-lg hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200"
              >
                Manage Team
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Squad View Component
const SquadView = ({ team, onBack, onPlayerAdd }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    first_name: '',
    last_name: '',
    age: 16,
    position: 'MID',
    squad_number: 1,
    photo_url: ''
  });

  const positions = ['GK', 'DEF', 'MID', 'FWD'];
  const ages = Array.from({length: 98}, (_, i) => i + 3);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onPlayerAdd(newPlayer);
    setNewPlayer({
      first_name: '',
      last_name: '',
      age: 16,
      position: 'MID',
      squad_number: 1,
      photo_url: ''
    });
    setShowAddForm(false);
  };

  return (
    <div className="p-8">
      <div className="flex items-center mb-8">
        <button 
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 mr-4"
        >
          ← Back
        </button>
        <h2 className="text-3xl font-bold text-gray-800">{team.name} Squad</h2>
        <span className="ml-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
          {team.age_group}
        </span>
      </div>

      <div className="mb-8">
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
        >
          ➕ Add New Player
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white rounded-xl shadow-xl p-6 mb-8 border border-gray-200">
          <h3 className="text-xl font-semibold mb-4">Add New Player</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                value={newPlayer.first_name}
                onChange={(e) => setNewPlayer({...newPlayer, first_name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
              <input
                type="text"
                value={newPlayer.last_name}
                onChange={(e) => setNewPlayer({...newPlayer, last_name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
              <select
                value={newPlayer.age}
                onChange={(e) => setNewPlayer({...newPlayer, age: parseInt(e.target.value)})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {ages.map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
              <select
                value={newPlayer.position}
                onChange={(e) => setNewPlayer({...newPlayer, position: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Squad Number</label>
              <input
                type="number"
                min="1"
                max="99"
                value={newPlayer.squad_number}
                onChange={(e) => setNewPlayer({...newPlayer, squad_number: parseInt(e.target.value)})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Photo URL (Optional)</label>
              <input
                type="url"
                value={newPlayer.photo_url}
                onChange={(e) => setNewPlayer({...newPlayer, photo_url: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2 flex space-x-4">
              <button 
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Player
              </button>
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {team.players?.map((player) => (
          <div key={player.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {player.squad_number}
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {player.first_name} {player.last_name}
                  </h3>
                  <p className="text-blue-600 font-medium">{player.position}</p>
                  <p className="text-gray-500 text-sm">Age: {player.age}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Formation Pitch Component
const FormationPitch = ({ formation, players, selectedPlayers, onPlayerSelect, substitutes, onSubstituteSelect }) => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  
  if (!formation || !formation.positions) return null;

  const handlePositionClick = (position) => {
    setSelectedPosition(selectedPosition === position.id ? null : position.id);
  };

  const handlePlayerSelection = (playerId, positionId) => {
    onPlayerSelect(playerId, positionId);
    setSelectedPosition(null);
  };

  const getPlayerAtPosition = (positionId) => {
    return selectedPlayers.find(p => p.position === positionId);
  };

  const availablePlayers = players.filter(p => 
    !selectedPlayers.some(sp => sp.playerId === p.id) &&
    !substitutes.some(sub => sub.id === p.id)
  );

  return (
    <div className="space-y-6">
      {/* Main Pitch */}
      <div className="relative bg-gradient-to-b from-green-400 to-green-500 rounded-xl shadow-lg">
        <svg viewBox="0 0 100 100" className="w-full h-96">
          {/* Pitch markings */}
          <rect x="10" y="10" width="80" height="80" fill="none" stroke="white" strokeWidth="0.5"/>
          <line x1="10" y1="50" x2="90" y2="50" stroke="white" strokeWidth="0.3"/>
          <circle cx="50" cy="50" r="8" fill="none" stroke="white" strokeWidth="0.3"/>
          <rect x="10" y="25" width="15" height="50" fill="none" stroke="white" strokeWidth="0.3"/>
          <rect x="75" y="25" width="15" height="50" fill="none" stroke="white" strokeWidth="0.3"/>
          
          {/* Position markers */}
          {formation.positions.map((position) => {
            const assignedPlayer = getPlayerAtPosition(position.id);
            const isSelected = selectedPosition === position.id;
            
            return (
              <g key={position.id}>
                <circle
                  cx={position.x}
                  cy={position.y}
                  r="3"
                  fill={assignedPlayer ? "#3B82F6" : "#EF4444"}
                  stroke="white"
                  strokeWidth="0.5"
                  className="cursor-pointer hover:stroke-yellow-400 hover:stroke-2 transition-all"
                  onClick={() => handlePositionClick(position)}
                />
                <text
                  x={position.x}
                  y={position.y + 1}
                  textAnchor="middle"
                  fontSize="2"
                  fill="white"
                  className="pointer-events-none font-bold"
                >
                  {position.label}
                </text>
                {assignedPlayer && (
                  <text
                    x={position.x}
                    y={position.y - 4}
                    textAnchor="middle"
                    fontSize="1.5"
                    fill="white"
                    className="pointer-events-none"
                  >
                    {assignedPlayer.playerName.split(' ')[0]}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Player Selection Dropdown */}
        {selectedPosition && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 w-64 z-10">
            <h4 className="font-semibold mb-2">
              Select Player for {formation.positions.find(p => p.id === selectedPosition)?.label}
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {availablePlayers.map(player => (
                <button
                  key={player.id}
                  onClick={() => handlePlayerSelection(player.id, selectedPosition)}
                  className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center"
                >
                  <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-2">
                    {player.squad_number}
                  </span>
                  <div>
                    <div className="font-medium">{player.first_name} {player.last_name}</div>
                    <div className="text-sm text-gray-500">{player.position}</div>
                  </div>
                </button>
              ))}
              {availablePlayers.length === 0 && (
                <p className="text-gray-500 text-sm">No available players</p>
              )}
            </div>
            <button
              onClick={() => setSelectedPosition(null)}
              className="mt-2 w-full bg-gray-200 text-gray-800 py-1 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Substitutes Bench */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <span className="mr-2">🪑</span>
          Substitutes Bench ({substitutes.length}/6)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({length: 6}).map((_, index) => {
            const substitute = substitutes[index];
            return (
              <div
                key={index}
                className={`border-2 border-dashed rounded-lg p-4 h-24 flex flex-col items-center justify-center cursor-pointer transition-colors ${
                  substitute ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onClick={() => {
                  if (!substitute && availablePlayers.length > 0) {
                    // Open substitute selection
                    const player = availablePlayers[0]; // For demo, select first available
                    onSubstituteSelect(player);
                  }
                }}
              >
                {substitute ? (
                  <>
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                      {substitute.squad_number}
                    </div>
                    <div className="text-xs text-center mt-1">
                      {substitute.first_name}
                    </div>
                  </>
                ) : (
                  <div className="text-gray-400 text-xs text-center">
                    Available
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Available players for substitutes */}
        {availablePlayers.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Available Players:</h4>
            <div className="flex flex-wrap gap-2">
              {availablePlayers.slice(0, 6 - substitutes.length).map(player => (
                <button
                  key={player.id}
                  onClick={() => onSubstituteSelect(player)}
                  className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  <span className="w-5 h-5 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs mr-1">
                    {player.squad_number}
                  </span>
                  {player.first_name} {player.last_name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Match View Component
const MatchView = ({ teams, onBack }) => {
  const [step, setStep] = useState(1);
  const [matchData, setMatchData] = useState({
    home_team_id: '',
    away_team_id: '',
    date: '',
    venue: '',
    home_formation: '',
    away_formation: '',
    home_lineup: [],
    away_lineup: [],
    home_substitutes: [],
    away_substitutes: []
  });
  const [homeTeamPlayers, setHomeTeamPlayers] = useState([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState([]);
  const [selectedHomePlayers, setSelectedHomePlayers] = useState([]);
  const [selectedAwayPlayers, setSelectedAwayPlayers] = useState([]);
  const [homeSubstitutes, setHomeSubstitutes] = useState([]);
  const [awaySubstitutes, setAwaySubstitutes] = useState([]);
  const [homeTeamAgeGroup, setHomeTeamAgeGroup] = useState('');
  const [awayTeamAgeGroup, setAwayTeamAgeGroup] = useState('');
  const [availableFormations, setAvailableFormations] = useState({});

  useEffect(() => {
    const fetchFormations = async (ageGroup) => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/formations/${ageGroup}`);
        return response.data.formations;
      } catch (error) {
        console.error('Error fetching formations:', error);
        return {};
      }
    };

    if (homeTeamAgeGroup) {
      fetchFormations(homeTeamAgeGroup).then(formations => {
        setAvailableFormations(prev => ({...prev, home: formations}));
        // Set default formation
        const formationNames = Object.keys(formations);
        if (formationNames.length > 0) {
          setMatchData(prev => ({...prev, home_formation: formationNames[0]}));
        }
      });
    }

    if (awayTeamAgeGroup) {
      fetchFormations(awayTeamAgeGroup).then(formations => {
        setAvailableFormations(prev => ({...prev, away: formations}));
        // Set default formation
        const formationNames = Object.keys(formations);
        if (formationNames.length > 0) {
          setMatchData(prev => ({...prev, away_formation: formationNames[0]}));
        }
      });
    }
  }, [homeTeamAgeGroup, awayTeamAgeGroup]);

  const handleFormationChange = (team, formation) => {
    if (team === 'home') {
      setMatchData(prev => ({...prev, home_formation: formation}));
      setSelectedHomePlayers([]); // Reset player selection when formation changes
    } else {
      setMatchData(prev => ({...prev, away_formation: formation}));
      setSelectedAwayPlayers([]); // Reset player selection when formation changes
    }
  };

  const handlePlayerSelect = (playerId, positionId, team) => {
    const player = team === 'home' 
      ? homeTeamPlayers.find(p => p.id === playerId)
      : awayTeamPlayers.find(p => p.id === playerId);
    
    if (!player) return;

    const newSelection = {
      playerId: player.id,
      playerName: `${player.first_name} ${player.last_name}`,
      position: positionId,
      squad_number: player.squad_number
    };

    if (team === 'home') {
      setSelectedHomePlayers(prev => {
        const filtered = prev.filter(p => p.position !== positionId);
        return [...filtered, newSelection];
      });
    } else {
      setSelectedAwayPlayers(prev => {
        const filtered = prev.filter(p => p.position !== positionId);
        return [...filtered, newSelection];
      });
    }
  };

  const handleSubstituteSelect = (player, team) => {
    if (team === 'home') {
      if (homeSubstitutes.length < 6) {
        setHomeSubstitutes(prev => [...prev, player]);
      }
    } else {
      if (awaySubstitutes.length < 6) {
        setAwaySubstitutes(prev => [...prev, player]);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      // Fetch team players when moving to step 2
      try {
        const homeTeam = teams.find(t => t.id === matchData.home_team_id);
        const awayTeam = teams.find(t => t.id === matchData.away_team_id);
        
        setHomeTeamAgeGroup(homeTeam?.age_group || 'U13');
        setAwayTeamAgeGroup(awayTeam?.age_group || 'U13');

        const homePlayersResponse = await axios.get(`${API_BASE_URL}/api/teams/${matchData.home_team_id}/players`);
        const awayPlayersResponse = await axios.get(`${API_BASE_URL}/api/teams/${matchData.away_team_id}/players`);
        
        setHomeTeamPlayers(homePlayersResponse.data);
        setAwayTeamPlayers(awayPlayersResponse.data);
        setStep(2);
      } catch (error) {
        console.error('Error fetching team players:', error);
      }
    } else {
      // Create match
      try {
        const finalMatchData = {
          ...matchData,
          home_lineup: selectedHomePlayers.map(p => p.playerId),
          away_lineup: selectedAwayPlayers.map(p => p.playerId),
          home_substitutes: homeSubstitutes.map(p => p.id),
          away_substitutes: awaySubstitutes.map(p => p.id)
        };
        
        await axios.post(`${API_BASE_URL}/api/matches`, finalMatchData);
        alert('Match created successfully!');
        onBack();
      } catch (error) {
        console.error('Error creating match:', error);
        alert('Error creating match');
      }
    }
  };

  const canCreateMatch = () => {
    const homeFormation = availableFormations.home?.[matchData.home_formation];
    const awayFormation = availableFormations.away?.[matchData.away_formation];
    
    return selectedHomePlayers.length === (homeFormation?.positions?.length || 0) &&
           selectedAwayPlayers.length === (awayFormation?.positions?.length || 0);
  };

  return (
    <div className="p-8">
      <div className="flex items-center mb-8">
        <button 
          onClick={onBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 mr-4"
        >
          ← Back
        </button>
        <h2 className="text-3xl font-bold text-gray-800">Create Match</h2>
        <div className="ml-6 flex items-center space-x-4">
          <div className={`flex items-center ${step >= 1 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
              1
            </div>
            <span className="ml-2">Match Details</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-300"></div>
          <div className={`flex items-center ${step >= 2 ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-300'}`}>
              2
            </div>
            <span className="ml-2">Squad Selection</span>
          </div>
        </div>
      </div>

      {step === 1 && (
        <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-200">
          <h3 className="text-xl font-semibold mb-6">Match Details</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Home Team</label>
                <select
                  value={matchData.home_team_id}
                  onChange={(e) => setMatchData({...matchData, home_team_id: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Home Team</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>{team.name} ({team.age_group})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Away Team</label>
                <select
                  value={matchData.away_team_id}
                  onChange={(e) => setMatchData({...matchData, away_team_id: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Away Team</option>
                  {teams.filter(team => team.id !== matchData.home_team_id).map(team => (
                    <option key={team.id} value={team.id}>{team.name} ({team.age_group})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date & Time</label>
                <input
                  type="datetime-local"
                  value={matchData.date}
                  onChange={(e) => setMatchData({...matchData, date: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Venue</label>
                <input
                  type="text"
                  value={matchData.venue}
                  onChange={(e) => setMatchData({...matchData, venue: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <button 
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              Next: Squad Selection →
            </button>
          </form>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-8">
          <div className="bg-white rounded-xl shadow-xl p-8 border border-gray-200">
            <h3 className="text-xl font-semibold mb-6">Squad Selection & Formation</h3>
            
            {/* Formation Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div>
                <h4 className="text-lg font-medium mb-4">Home Team Formation</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(availableFormations.home || {}).map(formation => (
                    <button
                      key={formation}
                      onClick={() => handleFormationChange('home', formation)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        matchData.home_formation === formation
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {formation}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium mb-4">Away Team Formation</h4>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(availableFormations.away || {}).map(formation => (
                    <button
                      key={formation}
                      onClick={() => handleFormationChange('away', formation)}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        matchData.away_formation === formation
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {formation}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Squad Selection */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Home Team */}
              <div>
                <h4 className="text-lg font-medium mb-4 text-blue-600">
                  Home Team: {teams.find(t => t.id === matchData.home_team_id)?.name}
                  <span className="ml-2 text-sm">({selectedHomePlayers.length}/{availableFormations.home?.[matchData.home_formation]?.positions?.length || 0})</span>
                </h4>
                {availableFormations.home?.[matchData.home_formation] && (
                  <FormationPitch
                    formation={availableFormations.home[matchData.home_formation]}
                    players={homeTeamPlayers}
                    selectedPlayers={selectedHomePlayers}
                    onPlayerSelect={(playerId, positionId) => handlePlayerSelect(playerId, positionId, 'home')}
                    substitutes={homeSubstitutes}
                    onSubstituteSelect={(player) => handleSubstituteSelect(player, 'home')}
                  />
                )}
              </div>

              {/* Away Team */}
              <div>
                <h4 className="text-lg font-medium mb-4 text-red-600">
                  Away Team: {teams.find(t => t.id === matchData.away_team_id)?.name}
                  <span className="ml-2 text-sm">({selectedAwayPlayers.length}/{availableFormations.away?.[matchData.away_formation]?.positions?.length || 0})</span>
                </h4>
                {availableFormations.away?.[matchData.away_formation] && (
                  <FormationPitch
                    formation={availableFormations.away[matchData.away_formation]}
                    players={awayTeamPlayers}
                    selectedPlayers={selectedAwayPlayers}
                    onPlayerSelect={(playerId, positionId) => handlePlayerSelect(playerId, positionId, 'away')}
                    substitutes={awaySubstitutes}
                    onSubstituteSelect={(player) => handleSubstituteSelect(player, 'away')}
                  />
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-between">
              <button 
                onClick={() => setStep(1)}
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
              >
                ← Previous
              </button>
              <button 
                onClick={handleSubmit}
                disabled={!canCreateMatch()}
                className={`px-8 py-3 rounded-lg font-medium transition-all ${
                  canCreateMatch()
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transform hover:scale-105 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Create Match ⚽
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component
function App() {
  const [currentView, setCurrentView] = useState('teams');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showCookieModal, setShowCookieModal] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/teams`);
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeamAdd = async (teamData) => {
    try {
      await axios.post(`${API_BASE_URL}/api/teams`, teamData);
      fetchTeams();
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const handlePlayerAdd = async (playerData) => {
    try {
      await axios.post(`${API_BASE_URL}/api/teams/${selectedTeam.id}/players`, playerData);
      
      // Update team players
      const response = await axios.get(`${API_BASE_URL}/api/teams/${selectedTeam.id}/players`);
      setSelectedTeam({
        ...selectedTeam,
        players: response.data
      });
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Grassroots Match Tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-green-500">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/grassroots-logo.svg" 
                alt="Grassroots Match Tracker" 
                className="h-16 w-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div style={{display: 'none'}} className="h-16 w-32 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">GMT</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Grassroots Match Tracker</h1>
                <p className="text-green-600 font-medium">Football Management System</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-6">
              <button 
                onClick={() => setCurrentView('teams')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'teams' 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Team Management
              </button>
              <button 
                onClick={() => setCurrentView('matches')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'matches' 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Matches
              </button>
              <button 
                onClick={() => setCurrentView('statistics')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'statistics' 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Statistics
              </button>
              <button 
                onClick={() => setCurrentView('players')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'players' 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Players
              </button>
              <button 
                onClick={() => setCurrentView('fixtures')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'fixtures' 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Fixtures
              </button>
              <button 
                onClick={() => setCurrentView('leagues')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'leagues' 
                    ? 'bg-green-100 text-green-700' 
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                Leagues
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === 'teams' && !selectedTeam && (
          <TeamView 
            teams={teams}
            onTeamSelect={setSelectedTeam}
            onAddTeam={handleTeamAdd}
            onViewMatches={() => setCurrentView('matches')}
          />
        )}

        {selectedTeam && (
          <SquadView 
            team={selectedTeam}
            onBack={() => setSelectedTeam(null)}
            onPlayerAdd={handlePlayerAdd}
          />
        )}

        {currentView === 'matches' && (
          <MatchView 
            teams={teams}
            onBack={() => setCurrentView('teams')}
          />
        )}

        {currentView === 'statistics' && (
          <StatisticsView 
            teams={teams}
            onBack={() => setCurrentView('teams')}
          />
        )}

        {currentView === 'players' && (
          <PlayersView 
            teams={teams}
            onBack={() => setCurrentView('teams')}
          />
        )}

        {currentView === 'fixtures' && (
          <FixturesView 
            onBack={() => setCurrentView('teams')}
          />
        )}

        {currentView === 'leagues' && (
          <LeaguesView 
            onBack={() => setCurrentView('teams')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <p>&copy; 2025 Grassroots Match Tracker. All rights reserved.</p>
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <button 
                onClick={() => setShowPrivacyModal(true)}
                className="hover:text-green-400 transition-colors"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => setShowTermsModal(true)}
                className="hover:text-green-400 transition-colors"
              >
                Terms & Conditions
              </button>
              <a href="#" className="hover:text-green-400 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PrivacyPolicyModal 
        isOpen={showPrivacyModal} 
        onClose={() => setShowPrivacyModal(false)} 
      />
      <TermsModal 
        isOpen={showTermsModal} 
        onClose={() => setShowTermsModal(false)} 
      />
      <CookieModal 
        isOpen={showCookieModal} 
        onClose={() => setShowCookieModal(false)}
        onAccept={() => setShowCookieModal(false)}
      />
    </div>
  );
}

export default App;