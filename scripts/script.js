'use strict';

const game = {
  title: 'Slice and Dice',
  isRunning: false,
  playerUnits: [],
  enemyUnits: [],
  turnPhase: 'enemy',
  DOM: document.querySelector('#game'),
  playerDOM: document.querySelector('#playerArea'),
  enemyDOM: document.querySelector('#enemyArea'),
  addNewUnit(newUnit, allgeiance) {
    if (allgeiance === 'ally') {
      this.playerUnits.push(newUnit);
      const playerNum = this.playerUnits.length - 1;
      const playerName = `<div class="unitName">${newUnit.name}</div>`;
      const currentHP = `<div id='playerUnitCurrentHP${playerNum}'>${newUnit.currentHP}</div>`;
      const playerHP = `<div>Health: ${currentHP}/${newUnit.totalHP}</div>`;
      const playerInfo = `<div class="unitInfo">${playerName}${playerHP}</div>`;
      const playerDice = `<div class="playerDice" id='playerDice${playerNum}'></div>`;
      const newUnitTotal = `<div class="playerUnit" id='playerUnit${playerNum}'>${playerInfo}${playerDice}</div>`;
      this.playerDOM.innerHTML += newUnitTotal;
    } else {
      this.enemyUnits.push(newUnit);
      const enemyNum = this.enemyUnits.length - 1;
      const enemyName = `<div class="unitName">${newUnit.name}</div>`;
      const currentHP = `<div id='enemnyUnitCurrentHP${enemyNum}'>${newUnit.currentHP}</div>`;
      const enemyHP = `<div>Health: ${currentHP}/${newUnit.totalHP}</div>`;
      const enemyInfo = `<div class="unitInfo">${enemyName}${enemyHP}</div>`;
      const enemyDice = `<div class="enemyDice" id='enemyDice${enemyNum}'></div>`;
      const newUnitTotal = `<div class="enemyUnit" id='enemyUnit${enemyNum}'>${enemyInfo}${enemyDice}</div>`;
      this.enemyDOM.innerHTML += newUnitTotal;
    }
  },
};

class PlayerUnit {
  constructor(name, health, diceSides) {
    this.name = name;
    this.currentHP = health;
    this.totalHP = health;
    this.diceSides = diceSides; // Make a function to randomly generate
    game.addNewUnit(this, 'ally');
  }
}

class EnemyUnit {
  constructor(name, health, diceSides) {
    this.name = name;
    this.currentHP = health;
    this.totalHP = health;
    this.diceSides = diceSides; // Make a function to randomly generate
    game.addNewUnit(this, 'foe');
  }
}
