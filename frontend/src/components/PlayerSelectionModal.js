import React, { useState } from 'react';

const PlayerSelectionModal = ({ 
  isOpen, 
  onClose, 
  players = [], 
  onPlayerSelect, 
  position,
  excludePlayers = [],
  title = "Select Player"
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const availablePlayers = players.filter(player => 
    !excludePlayers.includes(player.id) &&
    (player.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     player.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     player.squad_number.toString().includes(searchTerm))
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 max-w-2xl w-full mx-4 border border-slate-700 max-h-96 overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-white">
            {title} {position && `- ${position}`}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400"
          />
        </div>

        {/* Player list */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-3">
            {availablePlayers.map((player) => (
              <button
                key={player.id}
                onClick={() => onPlayerSelect(player)}
                className="flex items-center p-4 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl transition-all text-left"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  {player.squad_number}
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold">
                    {player.first_name} {player.last_name}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {player.position} • Age {player.age}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {availablePlayers.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              {searchTerm ? 'No players found matching your search.' : 'No available players.'}
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerSelectionModal;