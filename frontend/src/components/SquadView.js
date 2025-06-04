import React, { useState } from 'react';

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

  const PlayerEditModal = ({ isOpen, onClose, player, onSave, onDelete }) => {
    const [editedPlayer, setEditedPlayer] = useState(player || {});
    const [modalLoading, setModalLoading] = useState(false);

    React.useEffect(() => {
      if (player) {
        setEditedPlayer(player);
      }
    }, [player]);

    if (!isOpen || !player) return null;

    const handlePhotoUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setEditedPlayer({...editedPlayer, photo_base64: event.target.result});
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSave = async () => {
      setModalLoading(true);
      try {
        await onSave(editedPlayer);
        onClose();
      } catch (error) {
        alert('Error updating player');
      } finally {
        setModalLoading(false);
      }
    };

    const handleDelete = async () => {
      if (window.confirm(`Are you sure you want to delete ${player.first_name} ${player.last_name}?`)) {
        setModalLoading(true);
        try {
          await onDelete(player.id);
          onClose();
        } catch (error) {
          alert('Error deleting player');
        } finally {
          setModalLoading(false);
        }
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-2xl w-full mx-4 border border-slate-700">
          <h3 className="text-2xl font-semibold mb-6 text-white">Edit Player</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
              <input
                type="text"
                value={editedPlayer.first_name || ''}
                onChange={(e) => setEditedPlayer({...editedPlayer, first_name: e.target.value})}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                disabled={modalLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
              <input
                type="text"
                value={editedPlayer.last_name || ''}
                onChange={(e) => setEditedPlayer({...editedPlayer, last_name: e.target.value})}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                disabled={modalLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
              <select
                value={editedPlayer.age || 16}
                onChange={(e) => setEditedPlayer({...editedPlayer, age: parseInt(e.target.value)})}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                disabled={modalLoading}
              >
                {ages.map(age => (
                  <option key={age} value={age}>{age}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Position</label>
              <select
                value={editedPlayer.position || 'MID'}
                onChange={(e) => setEditedPlayer({...editedPlayer, position: e.target.value})}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                disabled={modalLoading}
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
                value={editedPlayer.squad_number || 1}
                onChange={(e) => setEditedPlayer({...editedPlayer, squad_number: parseInt(e.target.value)})}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                disabled={modalLoading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Photo Upload</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white"
                disabled={modalLoading}
              />
            </div>
          </div>
          
          {editedPlayer.photo_base64 && (
            <div className="mb-6">
              <img 
                src={editedPlayer.photo_base64} 
                alt="Player photo" 
                className="w-20 h-20 rounded-full object-cover border-2 border-slate-600"
              />
            </div>
          )}
          
          <div className="flex justify-between">
            <button
              onClick={handleDelete}
              disabled={modalLoading}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-red-700 transition-all"
            >
              {modalLoading ? 'Deleting...' : 'Delete Player'}
            </button>
            
            <div className="space-x-4">
              <button
                onClick={onClose}
                disabled={modalLoading}
                className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={modalLoading}
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all"
              >
                {modalLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
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

      <PlayerEditModal
        isOpen={showPlayerModal}
        onClose={() => setShowPlayerModal(false)}
        player={selectedPlayer}
        onSave={onPlayerUpdate}
        onDelete={onPlayerDelete}
      />
    </div>
  );
};

export default SquadView;