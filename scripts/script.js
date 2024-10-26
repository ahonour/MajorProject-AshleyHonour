'use strict';

const game = {
  title: 'Slice and Dice',
  isRunning: false,
  playerUnits: [],
  enemyUnits: [],
  DOM: document.querySelector('#game'),
  playerDOM: document.querySelector('#playerArea'),
  addNewUnit(newUnit, allgeiance) {
    if (allgeiance === 'ally') {
      this.playerUnits.push(newUnit);
      const playerNum = this.playerUnits.length - 1;
      const PlayerName = `<div class="unitName">${newUnit.name}</div>`;
      const currentHP = `<div id='playerUnitCurrentHP${
        this.playerUnits.length - 1
      }'>${newUnit.currentHP}</div>`;
      const PlayerHP = `<div class="unitName">Health: ${currentHP}/${newUnit.totalHP}</div>`;
      const PlayerInfo = `<div class="unitInfo">${PlayerName}${PlayerHP}</div>`;
      const PlayerDice = `<div class="playerDice" id='playerDice${playerNum}'></div>`;
      const newUnitTotal = `<div class="playerUnit" id='playerUnit${playerNum}'>${PlayerInfo}${PlayerDice}</div>`;
      this.playerDOM.innerHTML += newUnitTotal;
    } else {
      this.enemyUnits.push(newUnit);
    }
  },
};

class PlayerUnit {
  constructor(name, health, diceSides) {
    this.name = name;
    this.currentHP = health;
    this.totalHP = health;
    this.diceSides = diceSides; //Make a function to randomly generate
    game.addNewUnit(this, 'ally');
  }
}
