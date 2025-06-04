import React, { useState, useEffect } from 'react';

const EnhancedPitchVisualization = ({ 
  formation, 
  matchFormat,
  selectedPlayers = {}, 
  onPositionClick, 
  teamPlayers = [], 
  isHomeTeam = true,
  showPlayerNames = true,
  substitutes = [],
  onSubstituteClick
}) => {
  const [formationData, setFormationData] = useState(null);

  const getPlayersForFormat = (format) => {
    const formatMap = {
      '5v5': 5,
      '6v6': 6,
      '7v7': 7,
      '8v8': 8,
      '9v9': 9,
      '10v10': 10,
      '11v11': 11
    };
    return formatMap[format] || 11;
  };

  const getFormationsForFormat = (format, formation) => {
    const playerCount = getPlayersForFormat(format);
    
    // Formation configurations for different player counts
    const formations = {
      5: { // 5v5 formations
        "2-1-1": {
          positions: [
            { id: "GK", x: 50, y: 85, label: "GK" },
            { id: "LB", x: 30, y: 65, label: "LB" },
            { id: "RB", x: 70, y: 65, label: "RB" },
            { id: "CM", x: 50, y: 45, label: "CM" },
            { id: "ST", x: 50, y: 25, label: "ST" }
          ]
        },
        "1-2-1": {
          positions: [
            { id: "GK", x: 50, y: 85, label: "GK" },
            { id: "CB", x: 50, y: 65, label: "CB" },
            { id: "LM", x: 30, y: 45, label: "LM" },
            { id: "RM", x: 70, y: 45, label: "RM" },
            { id: "ST", x: 50, y: 25, label: "ST" }
          ]
        }
      },
      6: { // 6v6 formations
        "2-2-1": {
          positions: [
            { id: "GK", x: 50, y: 85, label: "GK" },
            { id: "LB", x: 30, y: 65, label: "LB" },
            { id: "RB", x: 70, y: 65, label: "RB" },
            { id: "LM", x: 30, y: 45, label: "LM" },
            { id: "RM", x: 70, y: 45, label: "RM" },
            { id: "ST", x: 50, y: 25, label: "ST" }
          ]
        },
        "1-3-1": {
          positions: [
            { id: "GK", x: 50, y: 85, label: "GK" },
            { id: "CB", x: 50, y: 65, label: "CB" },
            { id: "LM", x: 25, y: 45, label: "LM" },
            { id: "CM", x: 50, y: 45, label: "CM" },
            { id: "RM", x: 75, y: 45, label: "RM" },
            { id: "ST", x: 50, y: 25, label: "ST" }
          ]
        }
      },
      7: { // 7v7 formations
        "2-3-1": {
          positions: [
            { id: "GK", x: 50, y: 85, label: "GK" },
            { id: "LB", x: 30, y: 70, label: "LB" },
            { id: "RB", x: 70, y: 70, label: "RB" },
            { id: "LM", x: 25, y: 45, label: "LM" },
            { id: "CM", x: 50, y: 50, label: "CM" },
            { id: "RM", x: 75, y: 45, label: "RM" },
            { id: "ST", x: 50, y: 25, label: "ST" }
          ]
        },
        "3-2-1": {
          positions: [
            { id: "GK", x: 50, y: 85, label: "GK" },
            { id: "LB", x: 30, y: 70, label: "LB" },
            { id: "CB", x: 50, y: 70, label: "CB" },
            { id: "RB", x: 70, y: 70, label: "RB" },
            { id: "LM", x: 35, y: 45, label: "LM" },
            { id: "RM", x: 65, y: 45, label: "RM" },
            { id: "ST", x: 50, y: 25, label: "ST" }
          ]
        }
      },
      8: { // 8v8 formations
        "3-3-1": {
          positions: [
            { id: "GK", x: 50, y: 85, label: "GK" },
            { id: "LB", x: 25, y: 70, label: "LB" },
            { id: "CB", x: 50, y: 70, label: "CB" },
            { id: "RB", x: 75, y: 70, label: "RB" },
            { id: "LM", x: 25, y: 45, label: "LM" },
            { id: "CM", x: 50, y: 45, label: "CM" },
            { id: "RM", x: 75, y: 45, label: "RM" },
            { id: "ST", x: 50, y: 25, label: "ST" }
          ]
        },
        "2-4-1": {
          positions: [
            { id: "GK", x: 50, y: 85, label: "GK" },
            { id: "LB", x: 30, y: 70, label: "LB" },
            { id: "RB", x: 70, y: 70, label: "RB" },
            { id: "LM", x: 20, y: 45, label: "LM" },
            { id: "LCM", x: 40, y: 45, label: "CM" },
            { id: "RCM", x: 60, y: 45, label: "CM" },
            { id: "RM", x: 80, y: 45, label: "RM" },
            { id: "ST", x: 50, y: 25, label: "ST" }
          ]
        }
      },
      10: { // 10v10 formations
        "3-4-2": {
          positions: [
            { id: "GK", x: 50, y: 85, label: "GK" },
            { id: "LB", x: 25, y: 70, label: "LB" },
            { id: "CB", x: 50, y: 70, label: "CB" },
            { id: "RB", x: 75, y: 70, label: "RB" },
            { id: "LM", x: 20, y: 45, label: "LM" },
            { id: "LCM", x: 40, y: 50, label: "CM" },
            { id: "RCM", x: 60, y: 50, label: "CM" },
            { id: "RM", x: 80, y: 45, label: "RM" },
            { id: "LST", x: 40, y: 25, label: "ST" },
            { id: "RST", x: 60, y: 25, label: "ST" }
          ]
        },
        "4-3-2": {
          positions: [
            { id: "GK", x: 50, y: 85, label: "GK" },
            { id: "LB", x: 20, y: 70, label: "LB" },
            { id: "CB1", x: 40, y: 70, label: "CB" },
            { id: "CB2", x: 60, y: 70, label: "CB" },
            { id: "RB", x: 80, y: 70, label: "RB" },
            { id: "LCM", x: 35, y: 50, label: "CM" },
            { id: "CM", x: 50, y: 45, label: "CM" },
            { id: "RCM", x: 65, y: 50, label: "CM" },
            { id: "LST", x: 40, y: 25, label: "ST" },
            { id: "RST", x: 60, y: 25, label: "ST" }
          ]
        }
      },
        "2-3-1": {
          positions: [
            { id: "GK", x: 50, y: 85, label: "GK" },
            { id: "LB", x: 30, y: 70, label: "LB" },
            { id: "RB", x: 70, y: 70, label: "RB" },
            { id: "LM", x: 25, y: 45, label: "LM" },
            { id: "CM", x: 50, y: 50, label: "CM" },
            { id: "RM", x: 75, y: 45, label: "RM" },
            { id: "ST", x: 50, y: 25, label: "ST" }
          ]
        },
        "3-2-1": {
          positions: [
            { id: "GK", x: 50, y: 85, label: "GK" },
            { id: "LB", x: 30, y: 70, label: "LB" },
            { id: "CB", x: 50, y: 70, label: "CB" },
            { id: "RB", x: 70, y: 70, label: "RB" },
            { id: "LM", x: 35, y: 45, label: "LM" },
            { id: "RM", x: 65, y: 45, label: "RM" },
            { id: "ST", x: 50, y: 25, label: "ST" }
          ]
        }
      },
      9: { // 9v9 formations
        "3-4-1": {
          positions: [
            { id: "GK", x: 50, y: 85, label: "GK" },
            { id: "LB", x: 25, y: 70, label: "LB" },
            { id: "CB", x: 50, y: 70, label: "CB" },
            { id: "RB", x: 75, y: 70, label: "RB" },
            { id: "LM", x: 20, y: 45, label: "LM" },
            { id: "LCM", x: 40, y: 50, label: "LCM" },
            { id: "RCM", x: 60, y: 50, label: "RCM" },
            { id: "RM", x: 80, y: 45, label: "RM" },
            { id: "ST", x: 50, y: 25, label: "ST" }
          ]
        },
        "3-3-2": {
          positions: [
            { id: "GK", x: 50, y: 85, label: "GK" },
            { id: "LB", x: 25, y: 70, label: "LB" },
            { id: "CB", x: 50, y: 70, label: "CB" },
            { id: "RB", x: 75, y: 70, label: "RB" },
            { id: "LM", x: 30, y: 45, label: "LM" },
            { id: "CM", x: 50, y: 50, label: "CM" },
            { id: "RM", x: 70, y: 45, label: "RM" },
            { id: "LST", x: 40, y: 25, label: "ST" },
            { id: "RST", x: 60, y: 25, label: "ST" }
          ]
        }
      },
      11: { // 11v11 formations
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
        "3-5-2": {
          positions: [
            { id: "GK", x: 50, y: 90, label: "GK" },
            { id: "LCB", x: 30, y: 70, label: "CB" },
            { id: "CB", x: 50, y: 70, label: "CB" },
            { id: "RCB", x: 70, y: 70, label: "CB" },
            { id: "LWB", x: 15, y: 45, label: "LWB" },
            { id: "LCM", x: 35, y: 50, label: "CM" },
            { id: "CM", x: 50, y: 45, label: "CM" },
            { id: "RCM", x: 65, y: 50, label: "CM" },
            { id: "RWB", x: 85, y: 45, label: "RWB" },
            { id: "ST1", x: 40, y: 25, label: "ST" },
            { id: "ST2", x: 60, y: 25, label: "ST" }
          ]
        },
        "5-3-2": {
          positions: [
            { id: "GK", x: 50, y: 90, label: "GK" },
            { id: "LWB", x: 15, y: 70, label: "LWB" },
            { id: "LCB", x: 35, y: 75, label: "CB" },
            { id: "CB", x: 50, y: 75, label: "CB" },
            { id: "RCB", x: 65, y: 75, label: "CB" },
            { id: "RWB", x: 85, y: 70, label: "RWB" },
            { id: "LCM", x: 35, y: 45, label: "CM" },
            { id: "CM", x: 50, y: 45, label: "CM" },
            { id: "RCM", x: 65, y: 45, label: "CM" },
            { id: "ST1", x: 40, y: 25, label: "ST" },
            { id: "ST2", x: 60, y: 25, label: "ST" }
          ]
        },
        "4-2-3-1": {
          positions: [
            { id: "GK", x: 50, y: 90, label: "GK" },
            { id: "LB", x: 20, y: 70, label: "LB" },
            { id: "CB1", x: 40, y: 70, label: "CB" },
            { id: "CB2", x: 60, y: 70, label: "CB" },
            { id: "RB", x: 80, y: 70, label: "RB" },
            { id: "CDM1", x: 40, y: 55, label: "CDM" },
            { id: "CDM2", x: 60, y: 55, label: "CDM" },
            { id: "LAM", x: 25, y: 35, label: "LAM" },
            { id: "CAM", x: 50, y: 35, label: "CAM" },
            { id: "RAM", x: 75, y: 35, label: "RAM" },
            { id: "ST", x: 50, y: 20, label: "ST" }
          ]
        },
        "4-1-4-1": {
          positions: [
            { id: "GK", x: 50, y: 90, label: "GK" },
            { id: "LB", x: 20, y: 70, label: "LB" },
            { id: "CB1", x: 40, y: 70, label: "CB" },
            { id: "CB2", x: 60, y: 70, label: "CB" },
            { id: "RB", x: 80, y: 70, label: "RB" },
            { id: "CDM", x: 50, y: 55, label: "CDM" },
            { id: "LM", x: 20, y: 40, label: "LM" },
            { id: "LCM", x: 40, y: 40, label: "CM" },
            { id: "RCM", x: 60, y: 40, label: "CM" },
            { id: "RM", x: 80, y: 40, label: "RM" },
            { id: "ST", x: 50, y: 20, label: "ST" }
          ]
        },
        "3-4-3": {
          positions: [
            { id: "GK", x: 50, y: 90, label: "GK" },
            { id: "LCB", x: 30, y: 70, label: "CB" },
            { id: "CB", x: 50, y: 70, label: "CB" },
            { id: "RCB", x: 70, y: 70, label: "CB" },
            { id: "LM", x: 20, y: 45, label: "LM" },
            { id: "LCM", x: 40, y: 50, label: "CM" },
            { id: "RCM", x: 60, y: 50, label: "CM" },
            { id: "RM", x: 80, y: 45, label: "RM" },
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
            { id: "LCM", x: 35, y: 50, label: "CM" },
            { id: "CM", x: 50, y: 45, label: "CM" },
            { id: "RCM", x: 65, y: 50, label: "CM" },
            { id: "RM", x: 85, y: 50, label: "RM" },
            { id: "ST", x: 50, y: 20, label: "ST" }
          ]
        }
      }
    };

    // Get formations for the specific player count
    const formatFormations = formations[playerCount];
    if (!formatFormations) return formations[11]["4-4-2"]; // Default to 11v11 4-4-2
    
    return formatFormations[formation] || Object.values(formatFormations)[0];
  };

  useEffect(() => {
    const formationConfig = getFormationsForFormat(matchFormat, formation);
    setFormationData(formationConfig);
  }, [formation, matchFormat]);

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
    <div className="flex space-x-4">
      {/* Pitch */}
      <div className="flex-1">
        <div className="bg-green-600 rounded-lg p-3 relative" style={{ aspectRatio: '2/3', height: '300px' }}>
          {/* Pitch markings */}
          <div className="absolute inset-0 border-2 border-white rounded-lg">
            {/* Center circle */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white rounded-full"></div>
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full"></div>
            
            {/* Half line */}
            <div className="absolute left-0 right-0 top-1/2 border-t-2 border-white"></div>
            
            {/* Penalty areas */}
            <div className="absolute left-1/4 right-1/4 top-0 h-12 border-2 border-white border-t-0"></div>
            <div className="absolute left-1/4 right-1/4 bottom-0 h-12 border-2 border-white border-b-0"></div>
            
            {/* Goal areas */}
            <div className="absolute left-1/3 right-1/3 top-0 h-6 border-2 border-white border-t-0"></div>
            <div className="absolute left-1/3 right-1/3 bottom-0 h-6 border-2 border-white border-b-0"></div>
            
            {/* Goals */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-1 w-8 h-1 bg-white"></div>
            <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-1 w-8 h-1 bg-white"></div>
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
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs ${
                    isAssigned
                      ? isHomeTeam 
                        ? 'bg-blue-500 border-blue-300 text-white'
                        : 'bg-red-500 border-red-300 text-white'
                      : 'bg-white border-gray-400 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {playerNumber || position.label}
                </div>
                
                {playerName && showPlayerNames && (
                  <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded whitespace-nowrap">
                    {playerName}
                  </div>
                )}
                
                {!isAssigned && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black text-xs px-1 py-0.5 rounded whitespace-nowrap">
                    {position.label}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Substitutes */}
      <div className="w-20">
        <h4 className="text-sm font-semibold text-white mb-2">Subs</h4>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((subNumber) => {
            const playerId = substitutes[subNumber - 1];
            const player = teamPlayers.find(p => p.id === playerId);
            const isAssigned = !!playerId;

            return (
              <div
                key={subNumber}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs cursor-pointer transition-all hover:scale-110 ${
                  isAssigned
                    ? isHomeTeam 
                      ? 'bg-blue-500 border-blue-300 text-white'
                      : 'bg-red-500 border-red-300 text-white'
                    : 'bg-white border-gray-400 text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => onSubstituteClick && onSubstituteClick(subNumber - 1)}
                title={player ? `${player.first_name} ${player.last_name}` : `Sub ${subNumber}`}
              >
                {player ? player.squad_number : subNumber}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EnhancedPitchVisualization;