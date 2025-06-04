// Enhanced Squad View Component with Fixed Player Management
const SquadView = ({ team, onBack, onPlayerAdd, onPlayerUpdate, onPlayerDelete }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [newPlayer, setNewPlayer] = useState({
    first_name: '',
    last_name: '',
    age: 16,
    position: 'MID',
    squad_number: 1,
    photo_base64: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const positions = ['GK', 'DEF', 'MID', 'FWD'];
  const ages = Array.from({length: 98}, (_, i) => i + 3);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNewPlayer({...newPlayer, photo_base64: event.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onPlayerAdd(newPlayer);
      setNewPlayer({
        first_name: '',
        last_name: '',
        age: 16,
        position: 'MID',
        squad_number: 1,
        photo_base64: ''
      });
      setShowAddForm(false);
      alert('Player added successfully!');
    } catch (error) {
      console.error('Error adding player:', error);
      alert('Error adding player. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
  };

  const handlePlayerUpdate = async (updatedPlayer) => {
    await onPlayerUpdate(updatedPlayer);
    setShowPlayerModal(false);
  };

  const handlePlayerDelete = async (playerId) => {
    await onPlayerDelete(playerId);
    setShowPlayerModal(false);
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
        <h2 className="text-4xl font-bold text-white">{team.name} Squad</h2>
        <span className="ml-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium">
          {team.age_group}
        </span>
      </div>

      <div className="mb-8">
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-lg font-medium"
        >
          ➕ Add New Player
        </button>
      </div>

      {showAddForm && (
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-slate-700/50">
          <h3 className="text-2xl font-semibold mb-6 text-white">Add New Player</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
              <input
                type="text"
                value={newPlayer.first_name}
                onChange={(e) => setNewPlayer({...newPlayer, first_name: e.target.value})}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
              <input
                type="text"
                value={newPlayer.last_name}
                onChange={(e) => setNewPlayer({...newPlayer, last_name: e.target.value})}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-gray-400"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
              <select
                value={newPlayer.age}
                onChange={(e) => setNewPlayer({...newPlayer, age: parseInt(e.target.value)})}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                disabled={isLoading}
              >
                {ages.map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
              <select
                value={newPlayer.position}
                onChange={(e) => setNewPlayer({...newPlayer, position: e.target.value})}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                disabled={isLoading}
              >
                {positions.map(pos => (
                  <option key={pos} value={pos}>{pos}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Squad Number</label>
              <input
                type="number"
                min="1"
                max="99"
                value={newPlayer.squad_number}
                onChange={(e) => setNewPlayer({...newPlayer, squad_number: parseInt(e.target.value)})}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Photo Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full p-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white"
                disabled={isLoading}
              />
            </div>
            
            {newPlayer.photo_base64 && (
              <div className="col-span-2">
                <img 
                  src={newPlayer.photo_base64} 
                  alt="Player preview" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-slate-600"
                />
              </div>
            )}
            
            <div className="col-span-2 flex space-x-4">
              <button 
                type="submit"
                disabled={isLoading}
                className={`px-8 py-3 rounded-xl font-medium transition-all ${
                  isLoading 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                }`}
              >
                {isLoading ? 'Adding...' : 'Add Player'}
              </button>
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                disabled={isLoading}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-8 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {team.players && team.players.map((player) => (
          <div 
            key={player.id} 
            onClick={() => handlePlayerClick(player)}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 cursor-pointer group"
          >
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {player.squad_number}
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {player.first_name} {player.last_name}
                </h3>
                <p className="text-blue-400 font-medium">{player.position}</p>
                <p className="text-gray-400 text-sm">Age {player.age}</p>
              </div>
            </div>
            
            {player.photo_base64 && (
              <div className="mb-4">
                <img 
                  src={player.photo_base64} 
                  alt={`${player.first_name} ${player.last_name}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="text-sm text-gray-300">
              <p>Goals: {player.stats?.goals || 0}</p>
              <p>Assists: {player.stats?.assists || 0}</p>
              <p>Appearances: {player.stats?.appearances || 0}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedPlayer && (
        <PlayerEditModal
          isOpen={showPlayerModal}
          onClose={() => setShowPlayerModal(false)}
          player={selectedPlayer}
          onSave={handlePlayerUpdate}
          onDelete={handlePlayerDelete}
        />
      )}
    </div>
  );
};

// Enhanced Match Creation View with Formation Selection and Pitch Visualization
const MatchView = ({ teams, onBack }) => {
  const [matchData, setMatchData] = useState({
    home_team_id: '',
    away_team_id: '',
    date: '',
    venue: '',
    home_formation: '4-4-2',
    away_formation: '4-4-2',
    home_positions: {},
    away_positions: {},
    home_substitutes: [],
    away_substitutes: []
  });
  const [availableFormations, setAvailableFormations] = useState([]);
  const [homeTeamPlayers, setHomeTeamPlayers] = useState([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState([]);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedTeamType, setSelectedTeamType] = useState('home'); // 'home' or 'away'
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
    const positionKey = selectedTeamType === 'home' ? 'home_positions' : 'away_positions';
    setMatchData({
      ...matchData,
      [positionKey]: {
        ...matchData[positionKey],
        [selectedPosition]: player.id
      }
    });
    setShowPlayerModal(false);
  };

  const getExcludedPlayers = () => {
    const positionKey = selectedTeamType === 'home' ? 'home_positions' : 'away_positions';
    const substituteKey = selectedTeamType === 'home' ? 'home_substitutes' : 'away_substitutes';
    
    return [
      ...Object.values(matchData[positionKey]),
      ...matchData[substituteKey]
    ].filter(Boolean);
  };

  const handleSubstituteSelect = (player) => {
    const substituteKey = selectedTeamType === 'home' ? 'home_substitutes' : 'away_substitutes';
    const currentSubs = matchData[substituteKey];
    
    if (currentSubs.length < 5) {
      setMatchData({
        ...matchData,
        [substituteKey]: [...currentSubs, player.id]
      });
    }
    setShowPlayerModal(false);
  };

  const removeSubstitute = (playerId, teamType) => {
    const substituteKey = teamType === 'home' ? 'home_substitutes' : 'away_substitutes';
    setMatchData({
      ...matchData,
      [substituteKey]: matchData[substituteKey].filter(id => id !== playerId)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/matches`, matchData);
      console.log('Match created:', response.data);
      setCreatedMatch(response.data);
      alert('Match created successfully!');
    } catch (error) {
      console.error('Error creating match:', error);
      alert('Error creating match. Please try again.');
    }
  };

  const getPlayerName = (playerId, teamType) => {
    const players = teamType === 'home' ? homeTeamPlayers : awayTeamPlayers;
    const player = players.find(p => p.id === playerId);
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

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Home Formation</label>
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

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Away Formation</label>
                  <select
                    value={matchData.away_formation}
                    onChange={(e) => setMatchData({...matchData, away_formation: e.target.value})}
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

          {/* Substitute Benches */}
          {(matchData.home_team_id || matchData.away_team_id) && (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
              <h3 className="text-xl font-semibold mb-4 text-white">Substitute Benches</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Home Substitutes */}
                {matchData.home_team_id && (
                  <div>
                    <h4 className="text-lg font-medium text-blue-400 mb-3">Home Substitutes</h4>
                    <div className="space-y-2 mb-3">
                      {matchData.home_substitutes.map((playerId, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                          <span className="text-white">{getPlayerName(playerId, 'home')}</span>
                          <button
                            onClick={() => removeSubstitute(playerId, 'home')}
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
                          setSelectedTeamType('home');
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

                {/* Away Substitutes */}
                {matchData.away_team_id && (
                  <div>
                    <h4 className="text-lg font-medium text-red-400 mb-3">Away Substitutes</h4>
                    <div className="space-y-2 mb-3">
                      {matchData.away_substitutes.map((playerId, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                          <span className="text-white">{getPlayerName(playerId, 'away')}</span>
                          <button
                            onClick={() => removeSubstitute(playerId, 'away')}
                            className="text-red-400 hover:text-red-300"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    {matchData.away_substitutes.length < 5 && (
                      <button
                        onClick={() => {
                          setSelectedTeamType('away');
                          setSelectedPosition('substitute');
                          setShowPlayerModal(true);
                        }}
                        className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all"
                      >
                        Add Substitute ({matchData.away_substitutes.length}/5)
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Pitch Visualization */}
        <div className="space-y-6">
          {/* Home Team Pitch */}
          {matchData.home_team_id && (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-blue-400">Home Team Formation</h3>
                <button
                  onClick={() => setSelectedTeamType('home')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedTeamType === 'home' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                  }`}
                >
                  Select Players
                </button>
              </div>
              <PitchVisualization
                formation={matchData.home_formation}
                selectedPlayers={matchData.home_positions}
                onPositionClick={selectedTeamType === 'home' ? handlePositionClick : null}
                teamPlayers={homeTeamPlayers}
                isHomeTeam={true}
              />
            </div>
          )}

          {/* Away Team Pitch */}
          {matchData.away_team_id && (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-lg rounded-2xl p-6 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-red-400">Away Team Formation</h3>
                <button
                  onClick={() => setSelectedTeamType('away')}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedTeamType === 'away' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-slate-600 text-gray-300 hover:bg-slate-500'
                  }`}
                >
                  Select Players
                </button>
              </div>
              <PitchVisualization
                formation={matchData.away_formation}
                selectedPlayers={matchData.away_positions}
                onPositionClick={selectedTeamType === 'away' ? handlePositionClick : null}
                teamPlayers={awayTeamPlayers}
                isHomeTeam={false}
              />
            </div>
          )}
        </div>
      </div>

      {/* Player Selection Modal */}
      <PlayerSelectionModal
        isOpen={showPlayerModal}
        onClose={() => setShowPlayerModal(false)}
        players={selectedTeamType === 'home' ? homeTeamPlayers : awayTeamPlayers}
        onPlayerSelect={selectedPosition === 'substitute' ? handleSubstituteSelect : handlePlayerSelect}
        position={selectedPosition}
        excludePlayers={getExcludedPlayers()}
        title={selectedPosition === 'substitute' ? 'Select Substitute' : `Select Player for ${selectedPosition}`}
      />
    </div>
  );
};