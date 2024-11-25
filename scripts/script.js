'use strict';

const game = {
  title: 'Slice and Dice',
  isRunning: false,
  playerUnits: [],
  alivePlayerUnits: [],
  enemyUnits: [],
  turnPhase: 'enemy',
  rerollsLeft: 2,
  activePlayerUnit: null,
  playerActions: null,
  $DOM: $('#game'),
  $playerSection: $('#playerArea'),
  $rollingSection: $('#rollingArea'),
  $enemySection: $('#enemyArea'),
  addNewUnit(newUnit) {
    if (newUnit.ally) {
      this.playerUnits.push(newUnit);
      this.alivePlayerUnits.push(newUnit);
      const playerNum = this.playerUnits.length - 1;
      const playerName = `<div class="unitName">${newUnit.name}</div>`;
      const playerHP = `<div class="unitHP ${newUnit.name}">Health: ${newUnit.currentHP}/${newUnit.totalHP}</div>`;
      const playerShield = `<div class="unitShield ${newUnit.name}">Shield: 0</div>`;
      const playerInfo = `<div class="unitInfo">${playerName}${playerHP}${playerShield}</div>`;
      const playerDice = `<div class="playerDice ${newUnit.name}" id='playerDice${playerNum}'></div>`;
      const newUnitTotal = `<div class="playerUnit ${newUnit.name}" id='playerUnit${playerNum}'>${playerInfo}${playerDice}</div>`;
      this.$playerSection.append(newUnitTotal);
      this.createRollingDice(newUnit);
    } else {
      this.enemyUnits.push(newUnit);
      const enemyNum = this.enemyUnits.length - 1;
      const enemyName = `<div class="unitName">${newUnit.name}</div>`;
      //const currentHP = `<div id='enemnyUnitCurrentHP${enemyNum}'>${newUnit.currentHP}</div>`;
      const enemyHP = `<div class="unitHP ${newUnit.name}">Health: ${newUnit.currentHP}/${newUnit.currentHP}</div>`;
      const target = `<div class="targeting ${newUnit.name}">Targeting: </div>`;
      const enemyInfo = `<div class="unitInfo">${enemyName}${enemyHP}${target}</div>`;
      const enemyDice = `<div class="enemyDice ${newUnit.name}" id='enemyDice${enemyNum}'></div>`;
      const newUnitTotal = `<div class="enemyUnit" id='${newUnit.name}'>${enemyInfo}${enemyDice}</div>`;
      this.$enemySection.append(newUnitTotal);
      this.createRollingDice(newUnit);
    }
  },
  createRollingDice(unit) {
    const $unitRollingDice = unit.ally
      ? $(`<div class="playerDice ${unit.name}"></div>`)
      : $(`<div class="enemyDice ${unit.name}"></div>`);
    //const $unitRollingDice = $(`<div class="playerDice ${unit.name}"></div>`);
    this.$rollingSection.append($unitRollingDice);
    unit.getRandomSide();
    unit.showCurrentSide($unitRollingDice);
  },
  lockDice(unit) {
    unit.dice.isLocked = true;
    const unitZone = unit.ally
      ? game.$playerSection.find(`.playerDice.${unit.name}`)
      : game.$enemySection.find(`.enemyDice.${unit.name}`);
    unit.showCurrentSide(unitZone);
  },

  async enemyRolls() {
    for (const unit of game.enemyUnits) {
      const $rollingDice = game.$rollingSection.find(`.${unit.name}`);
      await diceAnimate(unit, $rollingDice);
      game.lockDice(unit);
      unit.targetPlayer();
      $rollingDice.remove();
    }
  },

  async playerRolls() {
    for (const unit of game.playerUnits) {
      if (!unit.dice.isLocked) {
        const $rollingDice = game.$rollingSection.find(`.${unit.name}`);
        await diceAnimate(unit, $rollingDice);
      }
    }
  },

  async nextTurn() {
    game.alivePlayerUnits.forEach((unit) => {
      unit.shield = 0;
      unit.updateShield();
    });
    game.enemyUnits.forEach((unit) => {
      game.createRollingDice(unit);
    });
    game.enemyRolls();
    await sleep(2000);
    //const alivePlayerUnits = game.playerUnits.filter((unit) => unit.alive);
    game.alivePlayerUnits.forEach((unit) => {
      game.createRollingDice(unit);
    });
    game.playerRolls();
    game.rerollsLeft = 2;
    game.turnPhase = 'playerRolling';
  },

  enemyAttack() {
    game.enemyUnits.forEach((unit) => {
      const target = unit.target;
      let damage = unit.dice.currentSide.value;
      let totalDamage = 0;
      if (target.shield > damage) {
      } else {
        totalDamage = damage - target.shield;
      }
      target.shield = Math.max(0, target.shield - damage);
      console.log(`target: ${target.name} for ${damage} damage`);
      console.log(`new shield value: ${target.shield}`);
      console.log(`total damage: ${totalDamage}`);
      target.currentHP -= totalDamage;
      target.updateHP();
      target.updateShield();
    });
    if (game.alivePlayerUnits.length === 0) {
      console.log('All your units are dead, Game over :( ');
    }
    else {
      game.nextTurn();
    }
  },

  playerEndRolls() {
    console.log('all units locked moving to action phase');
    //const alivePlayerUnits = game.playerUnits.filter((unit) => unit.alive);
    game.turnPhase = 'playerAction';
    game.playerActions = game.alivePlayerUnits.length;
    game.playerDicePrompt();
    // alivePlayerUnits.forEach(unit => {
    //   game.$playerSection.find(`.playerDice.${unit.name}`).addClass('dicePrompt');
    // });
  },

  playerDicePrompt() {
    const remainingUnits = game.alivePlayerUnits.filter((unit)=>unit.dice.isLocked);
    // let alivePlayerUnits = game.playerUnits.filter((unit) => unit.alive);
    // alivePlayerUnits = alivePlayerUnits.filter((unit) => unit.isLocked);
    // console.log(`locked units are ${alivePlayerUnits}`);
    remainingUnits.forEach(unit => {
      game.$playerSection.find(`.playerDice.${unit.name}`).addClass('dicePrompt');
    });
  },

  usePlayerDice(playerUnit) {
    game.$playerSection.find('.playerDice').removeClass('dicePrompt');
    if (playerUnit.dice.currentSide.type === 'damage') {
      console.log('click on an enemy unit to attack them');
      game.$enemySection.find('.enemyUnit').addClass('enemyHighlight');
      game.turnPhase = 'playerAttacking';
    } else {
      console.log('click on an allied unit to aid them');
      //const alivePlayerUnits = game.playerUnits.filter((unit) => unit.alive);
      game.alivePlayerUnits.forEach(unit => {
        game.$playerSection.find(`.playerDice.${unit.name}`).addClass('playerHighlight');
      });
      game.turnPhase = 'playerDefending';
    }
    game.activePlayerUnit = playerUnit;
  },

  aidPlayerUnit(targetUnit) {
    const diceType = game.activePlayerUnit.dice.currentSide.type;
    const diceValue = game.activePlayerUnit.dice.currentSide.value;
    if (diceType === 'heal') {
      targetUnit.currentHP += diceValue;
      targetUnit.updateHP();
    } else if (diceType === 'shield') {
      targetUnit.shield += diceValue;
      targetUnit.updateShield(); // TODO
    }
    game.$playerSection
      .find(`.playerDice.${game.activePlayerUnit.name}`)
      .empty();
    game.activePlayerUnit.dice.currentSide = null;
    game.activePlayerUnit.dice.isLocked = false;
    game.$playerSection.find(`.playerDice`).removeClass('playerHighlight');
    game.activePlayerUnit = null;
    
    game.turnPhase = 'playerAction';
    game.playerDicePrompt();

    game.playerActions--;
    if (game.playerActions === 0) {
      console.log('player out of actions, it is now the enemy turn');
      // prompt user somehow
      game.$DOM.find('#endTurn').addClass('dicePrompt');
      game.turnPhase = 'enemyAttack';      
      return;
    }
  },

  attackEnemyUnit(targetUnit) {
    const diceValue = game.activePlayerUnit.dice.currentSide.value;
    targetUnit.currentHP -= diceValue;

    targetUnit.updateHP();

    game.$playerSection
      .find(`.playerDice.${game.activePlayerUnit.name}`)
      .empty();
    game.activePlayerUnit.dice.currentSide = null;
    game.activePlayerUnit.dice.isLocked = false;
    game.activePlayerUnit = null;

    game.$enemySection.find('.enemyUnit').removeClass('enemyHighlight');
    game.playerDicePrompt();
    game.turnPhase = 'playerAction';

    game.playerActions--;
    if (game.enemyUnits.length === 0) {
      console.log('All enemies dead, you won!!!!! :3 ');
      game.turnPhase = 'fightOver';
    }
    else if (game.playerActions === 0) {
      console.log('player out of actions, it is now the enemy turn');
      // prompt user somehow      
      game.$DOM.find('#endTurn').addClass('dicePrompt');
      game.turnPhase = 'enemyAttack';   
      return;
    }
  },
};

// ---------------------------------------------Unit classes---------------------------------------------
class PlayerUnit {
  constructor(name, health, dice) {
    this.name = name;
    this.currentHP = health;
    this.totalHP = health;
    this.dice = dice; // Make a function to randomly generate
    this.ally = true;
    this.alive = true;
    this.shield = 0;
    game.addNewUnit(this);
  }

  getRandomSide() {
    this.dice.currentSide = this.dice.randomSide();
  }

  showCurrentSide($unitDice) {
    $unitDice.text(
      `${this.dice.currentSide.value} ${this.dice.currentSide.type}`
    );
  }

  updateHP() {
    const $hp = game.$playerSection.find(`.unitHP.${this.name}`);
    if (this.currentHP <= 0) {
      $hp.text(`Dead :'(`);
      this.alive = false;
      game.alivePlayerUnits = game.alivePlayerUnits.filter(unit => unit !== this);
    } else if (this.currentHP > this.totalHP) {
      this.currentHP = this.totalHP;
      $hp.text(`Health: ${this.currentHP}/${this.totalHP}`);
    } else {
      $hp.text(`Health: ${this.currentHP}/${this.totalHP}`);
    }
  }

  updateShield() {
    const $shield = game.$playerSection.find(`.unitShield.${this.name}`);
    $shield.text(`Shield: ${this.shield}`);
  }
}

class EnemyUnit {
  constructor(name, health, dice) {
    this.name = name;
    this.currentHP = health;
    this.totalHP = health;
    this.dice = dice; // Make a function to randomly generate
    this.ally = false;
    this.target = null;
    this.alive = true;
    game.addNewUnit(this);
  }

  getRandomSide() {
    this.dice.currentSide = this.dice.randomSide();
  }

  showCurrentSide($unitDice) {
    $unitDice.text(
      `${this.dice.currentSide.value} ${this.dice.currentSide.type}`
    );
  }

  targetPlayer() {
    const alivePlayerUnits = game.playerUnits.filter((unit) => unit.alive);
    const rand = Math.floor(Math.random() * alivePlayerUnits.length);
    this.target = alivePlayerUnits[rand];
    game.$enemySection
      .find(`.targeting.${this.name}`)
      .text(`Target: ${this.target.name}`);
  }

  updateHP() {
    const $hp = game.$enemySection.find(`.unitHP.${this.name}`);
    if (this.currentHP <= 0) {
      $hp.text(`Dead :'(`);
      // Kill the unit
      game.$enemySection.find(`#${this.name}`).remove();
      game.enemyUnits.splice((game.enemyUnits.findIndex((n) => n.name === this.name)), 1);

    } else {
      $hp.text(`Health: ${this.currentHP}/${this.totalHP}`);
    }
  }
}

class Dice {
  constructor(top, left, middle, bottom, right, farRight) {
    this.top = top;
    this.left = left;
    this.middle = middle;
    this.bottom = bottom;
    this.right = right;
    this.farRight = farRight;
    this.isLocked = false;
    this.currentSide = null;
  }

  randomSide() {
    const rand = Math.floor(Math.random() * 6);
    let side;
    switch (rand) {
      case 0:
        side = this.top;
        break;
      case 1:
        side = this.left;
        break;
      case 2:
        side = this.middle;
        break;
      case 3:
        side = this.bottom;
        break;
      case 4:
        side = this.right;
        break;
      case 5:
        side = this.farRight;
        break;
      default:
        side = this.bottom;
        break;
    }
    return side;
  }
}

class DiceSide {
  constructor(value, type) {
    this.value = value;
    this.type = type;
  }
}

// ---------------------------------------------Game Area click---------------------------------------------
game.$playerSection.on('click', '.playerDice', (event) => {
  const $clickedElement = $(event.target);
  const unitName = $clickedElement.parent().find('.unitName').text();
  const playerUnit =
    game.playerUnits[game.playerUnits.findIndex((n) => n.name === unitName)];
  if (game.turnPhase === 'playerAction') {
    if (playerUnit.dice.currentSide != null) {
      console.log(`using ${unitName}'s dice`);
      game.usePlayerDice(playerUnit);
    }
  } else if (game.turnPhase === 'playerDefending') {
    game.aidPlayerUnit(playerUnit);
  }
});

game.$rollingSection.on('click', '.playerDice', (event) => {
  const $clickedElement = $(event.target);
  game.playerUnits.forEach((unit) => {
    if ($clickedElement.hasClass(unit.name)) {
      game.lockDice(unit);
      $clickedElement.remove();
    }
  });
  if (game.alivePlayerUnits.every((unit) => unit.dice.isLocked)) {
    game.playerEndRolls();
  }
});

game.$enemySection.on('click', '.enemyUnit', (event) => {
  const $clickedElement = $(event.target);
  const unitName = $clickedElement
    .closest('.enemyUnit')
    .find('.unitName')
    .text();
  const enemyUnit =
    game.enemyUnits[game.enemyUnits.findIndex((n) => n.name === unitName)];
  if (game.turnPhase === 'playerAttacking') {
    console.log(`enemy unit is ${unitName}\n------------------`);
    console.log(`attacking ${enemyUnit.name}`);
    game.attackEnemyUnit(enemyUnit);
  }
});

// ---------------------------------------------Reroll Button---------------------------------------------
game.$DOM.on('click', '#reroll', async (event) => {
  const $rerollButton = $(event.target);
  $rerollButton.prop('disabled', true);

  if (game.rerollsLeft == 0) {
    console.log('no more rolls left');
    game.playerUnits.forEach((unit) => {
      if (!unit.dice.isLocked) {
        const $lockDice = game.$rollingSection.find(`.${unit.name}`);
        game.lockDice(unit);
        $lockDice.remove();
      }
    });
    game.playerEndRolls();
  }

  if (game.rerollsLeft > 0) {
    console.log('rerolling');
    game.playerRolls();
    game.rerollsLeft--;
  }

  $(`#rollCounter`).text(`Rerolls left: ${game.rerollsLeft}`);
  $rerollButton.prop('disabled', false);
});

game.$DOM.on('click', '#endTurn', (event) => {
  const $endTurnButton = $(event.target);
  if(game.turnPhase === 'enemyAttack') {
    $endTurnButton.removeClass('dicePrompt');
    game.enemyAttack();    
  }
});

// ---------------------------------------------Animation---------------------------------------------
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function diceAnimate($unit, $clickedElement) {
  for (let aCounter = 0; aCounter < 3; aCounter++) {
    $unit.getRandomSide();
    $unit.showCurrentSide($clickedElement);
    await sleep(200);
  }
}

function randomSpot($dice) {
  const rollingHeight = Math.floor(
    Math.random() * game.$rollingSection.height() - $dice.height()
  );
  const rollingWidth =
    Math.floor(Math.random() * game.$rollingSection.width()) - $dice.width();
  $dice.css('top', `${rollingHeight}px`);
  $dice.css('left', `${rollingWidth}px`);
}

// ---------------------------------------------Set up units---------------------------------------------
function playerSetup() {
  const p1Top = new DiceSide(2, 'damage');
  const p1Middle = new DiceSide(1, 'shield');
  const p1Left = new DiceSide(4, 'damage');
  const p1Right = new DiceSide(3, 'damage');
  const p1Bottom = new DiceSide(5, 'damage');
  const p1farRight = new DiceSide(6, 'damage');

  const p1Dice = new Dice(
    p1Top,
    p1Left,
    p1Middle,
    p1Bottom,
    p1Right,
    p1farRight
  );
  const p2Dice = new Dice(
    p1Top,
    p1Left,
    p1Middle,
    p1Bottom,
    p1Right,
    p1farRight
  );
  const p3Dice = new Dice(
    p1Top,
    p1Left,
    p1Middle,
    p1Bottom,
    p1Right,
    p1farRight
  );
  const p1 = new PlayerUnit('Ashley', 10, p1Dice);
  const p2 = new PlayerUnit('Jevan', 4, p2Dice);
  const p3 = new PlayerUnit('Podenco', 2, p3Dice);
}

function enemySetup() {
  const p1Top = new DiceSide(2, 'damage');
  const p1Middle = new DiceSide(1, 'shield');
  const p1Left = new DiceSide(4, 'damage');
  const p1Right = new DiceSide(3, 'damage');
  const p1Bottom = new DiceSide(5, 'damage');
  const p1farRight = new DiceSide(6, 'damage');

  const e1Dice = new Dice(
    p1Top,
    p1Left,
    p1Middle,
    p1Bottom,
    p1Right,
    p1farRight
  );
  const e2Dice = new Dice(
    p1Top,
    p1Left,
    p1Middle,
    p1Bottom,
    p1Right,
    p1farRight
  );
  const e3Dice = new Dice(
    p1Top,
    p1Left,
    p1Middle,
    p1Bottom,
    p1Right,
    p1farRight
  );
  const p1 = new EnemyUnit('bee1', 10, e1Dice);
  const p2 = new EnemyUnit('bee2', 4, e2Dice);
  const p3 = new EnemyUnit('bee3', 2, e3Dice);
}

// ---------------------------------------------Game Start-----------------------------------------------
$(document).ready(async () => {
  const $rerollButton = $('#reroll');
  $rerollButton.prop('disabled', true);
  console.log('enemy rolls');
  playerSetup();
  enemySetup();
  console.log('rerolling');
  game.enemyRolls();
  await sleep(1000);
  console.log('player rolls');
  game.playerUnits.forEach((unit) => {
    const $rollingDice = game.$rollingSection.find(`.${unit.name}`);
    diceAnimate(unit, $rollingDice);
  });
  $rerollButton.prop('disabled', false);
  game.turnPhase = 'playerRolling';
});
