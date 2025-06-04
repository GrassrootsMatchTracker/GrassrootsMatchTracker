import React, { useState, useEffect } from 'react';

const PitchVisualization = ({ 
  formation, 
  selectedPlayers = {}, 
  onPositionClick, 
  teamPlayers = [], 
  isHomeTeam = true,
  showPlayerNames = true 
}) => {
  const [formationData, setFormationData] = useState(null);

  useEffect(() => {
    // In a real app, this would fetch from the API
    // For now, using the formation data structure
    const formations = {
      "4-4-2": {
        positions: [
          { id: "GK", x: 50, y: 90, label: "GK" },
          { id: "LB", x: 20, y: 70, label: "LB" },
          { id: "CB1", x: 40, y: 70, label: "CB" },
          { id: "CB2", x: 60, y: 70, label: "CB" },
          { id: "RB", x: 80, y: 70, label: "RB" },
          { id: "LM", x: 20, y: 45, label: "LM" },
          { id: "CM1", x: 40, y: 45, label: "CM" },
          { id: "CM2", x: 60, y: 45, label: "CM" },
          { id: "RM", x: 80, y: 45, label: "RM" },
          { id: "ST1", x: 40, y: 20, label: "ST" },
          { id: "ST2", x: 60, y: 20, label: "ST" }
        ]
      },
      "4-3-3": {
        positions: [
          { id: "GK", x: 50, y: 90, label: "GK" },
          { id: "LB", x: 20, y: 70, label: "LB" },
          { id: "CB1", x: 40, y: 70, label: "CB" },
          { id: "CB2", x: 60, y: 70, label: "CB" },
          { id: "RB", x: 80, y: 70, label: "RB" },
          { id: "CM1", x: 35, y: 50, label: "CM" },
          { id: "CM2", x: 50, y: 50, label: "CM" },
          { id: "CM3", x: 65, y: 50, label: "CM" },
          { id: "LW", x: 25, y: 25, label: "LW" },
          { id: "ST", x: 50, y: 20, label: "ST" },
          { id: "RW", x: 75, y: 25, label: "RW" }
        ]
      },
      "4-5-1": {
        positions: [
          { id: "GK", x: 50, y: 90, label: "GK" },
          { id: "LB", x: 20, y: 70, label: "LB" },
          { id: "CB1", x: 40, y: 70, label: "CB" },
          { id: "CB2", x: 60, y: 70, label: "CB" },
          { id: "RB", x: 80, y: 70, label: "RB" },
          { id: "LM", x: 15, y: 50, label: "LM" },
          { id: "CDM", x: 35, y: 55, label: "CDM" },
          { id: "CM", x: 50, y: 45, label: "CM" },
          { id: "CAM", x: 65, y: 35, label: "CAM" },
          { id: "RM", x: 85, y: 50, label: "RM" },
          { id: "ST", x: 50, y: 20, label: "ST" }
        ]
      }
    };

    setFormationData(formations[formation] || formations["4-4-2"]);
  }, [formation]);

  const getPlayerName = (positionId) => {
    const playerId = selectedPlayers[positionId];
    if (!playerId) return null;
    
    const player = teamPlayers.find(p => p.id === playerId);
    return player ? `${player.first_name} ${player.last_name}` : null;
  };

  const getPlayerNumber = (positionId) => {
    const playerId = selectedPlayers[positionId];
    if (!playerId) return null;
    
    const player = teamPlayers.find(p => p.id === playerId);
    return player ? player.squad_number : null;
  };

  if (!formationData) return null;

  return (
    <div className="relative">
      <div className="bg-green-600 rounded-lg p-4 relative" style={{ aspectRatio: '2/3', minHeight: '400px' }}>
        {/* Pitch markings */}
        <div className="absolute inset-0 border-2 border-white rounded-lg">
          {/* Center circle */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white rounded-full"></div>
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
          
          {/* Half line */}
          <div className="absolute left-0 right-0 top-1/2 border-t-2 border-white"></div>
          
          {/* Penalty areas */}
          <div className="absolute left-1/4 right-1/4 top-0 h-16 border-2 border-white border-t-0"></div>
          <div className="absolute left-1/4 right-1/4 bottom-0 h-16 border-2 border-white border-b-0"></div>
          
          {/* Goal areas */}
          <div className="absolute left-1/3 right-1/3 top-0 h-8 border-2 border-white border-t-0"></div>
          <div className="absolute left-1/3 right-1/3 bottom-0 h-8 border-2 border-white border-b-0"></div>
          
          {/* Goals */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-1 w-12 h-2 bg-white"></div>
          <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-1 w-12 h-2 bg-white"></div>
        </div>

        {/* Player positions */}
        {formationData.positions.map((position) => {
          const playerName = getPlayerName(position.id);
          const playerNumber = getPlayerNumber(position.id);
          const isAssigned = !!selectedPlayers[position.id];

          return (
            <div
              key={position.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 ${
                isAssigned ? 'z-20' : 'z-10'
              }`}
              style={{
                left: `${position.x}%`,
                top: `${isHomeTeam ? position.y : 100 - position.y}%`
              }}
              onClick={() => onPositionClick && onPositionClick(position.id)}
            >
              <div
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                  isAssigned
                    ? 'bg-blue-500 border-blue-300 text-white'
                    : 'bg-white border-gray-400 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {playerNumber || position.label}
              </div>
              
              {playerName && showPlayerNames && (
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                  {playerName}
                </div>
              )}
              
              {!isAssigned && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black text-xs px-2 py-1 rounded whitespace-nowrap">
                  {position.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PitchVisualization;