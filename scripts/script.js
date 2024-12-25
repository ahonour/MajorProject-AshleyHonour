'use strict';

//TODO: Fix the way enemy dice are locked to account for multiple enemies of the same type
// Use map instead of array for units?
// Or use id maybe

const game = {
  title: 'Slice and Dice',
  isRunning: false,
  playerUnits: new Map(),
  alivePlayerUnits: [],
  enemyUnits: new Map(),
  rewardsList: [],
  currentRewards: [],
  fightNumber: 0,
  turnPhase: 'enemy',
  rerollsLeft: 2,
  maxRerolls: 2,
  enemyHpModifier: 0,
  enemyDamageModifier: 0,
  activePlayerUnit: null,
  playerActions: null,
  $DOM: $('#game'),
  $playerSection: $('#playerArea'),
  $rollingSection: $('#rollingArea'),
  $enemySection: $('#enemyArea'),
  $rewardsModal: $('#rewardsModal'),

  addNewUnit(newUnit) {
    if (newUnit.ally) {
      const playerId = `player_${newUnit.name}_${this.playerUnits.size}`;
      this.playerUnits.set(playerId, newUnit);
      this.alivePlayerUnits.push(newUnit);
      // this.alivePlayerUnits.set(playerId, newUnit);
      const playerNum = this.playerUnits.size - 1;
      const playerName = `<div class="unitName">${newUnit.name}</div>`;
      const playerHP = `<div class="unitHP ${newUnit.name}">Health: ${newUnit.currentHP}/${newUnit.totalHP}</div>`;
      const playerShield = `<div class="unitShield ${newUnit.name}">Shield: 0</div>`;
      const playerInfo = `<div class="unitInfo">${playerName}${playerHP}${playerShield}</div>`;
      const playerDice = `<div class="playerDice ${newUnit.name}" id='playerDice${playerNum}'></div>`;
      const diceInfo = `<button class= "diceInfo ${newUnit.name}">?</button>`;
      const newUnitTotal = `<div class="playerUnit ${newUnit.name}" id='${playerId}'>${playerInfo}${playerDice}${diceInfo}</div>`;
      this.$playerSection.append(newUnitTotal);
      newUnit.id = playerId;
      this.createRollingDice(newUnit);
    } else {
      const enemyId = `enemy_${newUnit.name}_${this.enemyUnits.size}`;
      this.enemyUnits.set(enemyId, newUnit);
      const enemyName = `<div class="unitName">${newUnit.name}</div>`;
      const enemyHP = `<div class="unitHP ${newUnit.name}">Health: ${newUnit.currentHP}/${newUnit.totalHP}</div>`;
      const target = `<div class="targeting ${newUnit.name}">Targeting: </div>`;
      const enemyInfo = `<div class="unitInfo">${enemyName}${enemyHP}${target}</div>`;
      const enemyDice = `<div class="enemyDice ${newUnit.name}" id='enemyDice${enemyId}'></div>`;
      const diceInfo = `<button class= "diceInfo ${newUnit.name}">?</button>`;
      const newUnitTotal = `<div class="enemyUnit" id='${enemyId}'>${enemyInfo}${enemyDice}${diceInfo}</div>`;
      this.$enemySection.append(newUnitTotal);
      newUnit.id = enemyId;
      this.createRollingDice(newUnit);
    }
  },

  async enemyRolls() {
    for (const unitMap of game.enemyUnits) {
      const unit = unitMap[1];
      const $rollingDice = game.$rollingSection.find(`#${unitMap[0]}`);
      await diceAnimate(unit, $rollingDice);
      game.lockDice(unitMap);
      unit.targetPlayer();
      $rollingDice.remove();
    }
  },

  lockDice(unitMap) {
    const unitId = unitMap[0];
    const unit = unitMap[1];
    unit.dice.isLocked = true;
    const unitZone = unit.ally
      ? game.$playerSection.find(`#${unitId}`).find('.playerDice')
      : game.$enemySection.find(`#${unitId}`).find('.enemyDice');
    unit.showCurrentSide(unitZone);
  },

  createRollingDice(unit) {
    const diceId = unit.ally
      ? `${
          [...game.playerUnits.entries()].find(
            ([key, value]) => value === unit
          )[0]
        }`
      : `${
          [...game.enemyUnits.entries()].find(
            ([key, value]) => value === unit
          )[0]
        }`;

    const $unitRollingDice = unit.ally
      ? $(`<div class="playerDice ${unit.name}" id="${diceId}"></div>`)
      : $(`<div class="enemyDice ${unit.name}" id="${diceId}"></div>`);

    if (unit.ally) {
      this.$rollingSection.append($unitRollingDice);
    } else {
      this.$rollingSection.find('.enemyDiceArea').append($unitRollingDice);
    }

    unit.getRandomSide();
    unit.showCurrentSide($unitRollingDice);
  },

  async playerRolls() {
    for (const unitMap of game.playerUnits) {
      const unit = unitMap[1];
      const $rollingDice = game.$rollingSection.find(`#${unitMap[0]}`);
      await diceAnimate(unit, $rollingDice);
    }
    // const playerUnits = Array.from(game.playerUnits.values());
    // for (const unit of playerUnits) {
    //   if (!unit.dice.isLocked) {
    //     const $rollingDice = game.$rollingSection.find(`.${unit.name}`);
    //     await diceAnimate(unit, $rollingDice);
    //   }
    // }
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
    game.rerollsLeft = game.maxRerolls;
    $(`#rollCounter`).text(`Rerolls left: ${game.rerollsLeft}`);
    game.$DOM.find('#reroll').prop('disabled', false);
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
    } else {
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
    const remainingUnits = game.alivePlayerUnits.filter(
      (unit) => unit.dice.isLocked
    );
    // let alivePlayerUnits = game.playerUnits.filter((unit) => unit.alive);
    // alivePlayerUnits = alivePlayerUnits.filter((unit) => unit.isLocked);
    // console.log(`locked units are ${alivePlayerUnits}`);
    remainingUnits.forEach((unit) => {
      game.$playerSection
        .find(`.playerDice.${unit.name}`)
        .addClass('dicePrompt');
    });
  },

  usePlayerDice(playerId) {
    const playerUnit = game.playerUnits.get(playerId);
    game.$playerSection
      .find(`#${playerId} .playerDice`)
      .removeClass('dicePrompt');
    if (playerUnit.dice.currentSide.type === 'damage') {
      console.log('click on an enemy unit to attack them');
      game.$enemySection.find('.enemyUnit').addClass('enemyHighlight');
      game.turnPhase = 'playerAttacking';
    } else {
      console.log('click on an allied unit to aid them');
      Array.from(game.alivePlayerUnits.values()).forEach((unit) => {
        game.$playerSection
          .find(`.playerDice.${unit.name}`)
          .addClass('playerHighlight');
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

  attackEnemyUnit(unitId) {
    const targetUnit = game.enemyUnits.get(`${unitId}`);
    // const targetUnit = game.enemyUnits.get(unitId);

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
      game.fightOver();
    } else if (game.playerActions === 0) {
      console.log('player out of actions, it is now the enemy turn');
      // prompt user somehow
      game.$DOM.find('#endTurn').addClass('dicePrompt');
      game.turnPhase = 'enemyAttack';
      return;
    }
  },

  fightOver() {
    game.generateRewards();
    game.$rewardsModal.modal('show');
  },

  generateRewards() {
    game.currentRewards = [];
    const reward1 =
      game.rewardsList[Math.floor(Math.random() * game.rewardsList.length)];
    do {
      var reward2 =
        game.rewardsList[Math.floor(Math.random() * game.rewardsList.length)];
    } while (reward2 === reward1);
    do {
      var reward3 =
        game.rewardsList[Math.floor(Math.random() * game.rewardsList.length)];
    } while (reward3 === reward1 || reward3 === reward2);
    game.currentRewards.push(reward1, reward2, reward3);
    game.$rewardsModal.find('#reward-1-text').text(reward1.text);
    game.$rewardsModal.find('#reward-2-text').text(reward2.text);
    game.$rewardsModal.find('#reward-3-text').text(reward3.text);
  },

  nextFight() {
    game.fightNumber++;
    switch (game.fightNumber) {
      case 1:
        game.fightOne();
        break;
      case 2:
        game.fightTwo();
        break;
      default:
        break;
    }
  },

  fightOne() {
    const rand = Math.floor(Math.random() * 2);
    switch (rand) {
      case 0:
        generateGoblin();
        generateBee();
        break;
      case 1:
        generateBee();
        generateBee();
        generateBee();
        break;
      default:
        generateBee();
        break;
    }
  },

  fightTwo() {
    generateGoblin();
    generateGoblin();
  },
};

// ---------------------------------------------Classes---------------------------------------------
class PlayerUnit {
  constructor(name, health, dice) {
    this.name = name;
    this.currentHP = health;
    this.totalHP = health;
    this.dice = dice; // Make a function to randomly generate
    this.ally = true;
    this.alive = true;
    this.shield = 0;
    this.id;
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
      game.alivePlayerUnits = game.alivePlayerUnits.filter(
        (unit) => unit !== this
      );
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

  fullHeal() {
    this.currentHP = this.totalHP;
    this.updateHP();
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
    this.id;
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
    const alivePlayerUnits = Array.from(game.playerUnits.values()).filter(
      (unit) => unit.alive
    );
    const rand = Math.floor(Math.random() * game.alivePlayerUnits.length);
    this.target = alivePlayerUnits[rand];
    game.$enemySection
      .find(`#${this.id}`)
      .find(`.targeting`)
      .text(`Target: ${this.target.name}`);
  }

  updateHP() {
    const unitId = this.id;
    const $hp = game.$enemySection.find(`#${unitId}`).find('.unitHP');
    if (this.currentHP <= 0) {
      $hp.text(`Dead :'(`);

      // game.$enemySection.find(`#${this.name}`).remove();
      // game.enemyUnits.splice(
      //   game.enemyUnits.findIndex((n) => n.name === this.name),
      //   1
      // );
      const unitId = this.id;
      game.enemyUnits.delete(unitId);
      game.$enemySection.find(`#${unitId}`).remove();
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

// ---------------------------------------------Rewards---------------------------------------------

// General Rewards: +1 All healing sides, +1 All shield sides, +1 specific side, +1 reroll, +max health, -enemy max health
// Unit specific rewards: +1 all damage sides

function RewardSetup() {
  const healReward = new Reward(
    'All healing sides +1',
    Reward.prototype.modifyByType,
    ['heal', 1]
  );
  const shieldReward = new Reward(
    'All shield sides +1',
    Reward.prototype.modifyByType,
    ['shield', 1]
  );
  const rerollReward = new Reward(
    'Reroll +1',
    Reward.prototype.modifyRerolls,
    1
  );
  const playerHealthReward = new Reward(
    'Player max health +1',
    Reward.prototype.modifyTotalHP,
    ['player', 1]
  );
  const enemyHealthReward = new Reward(
    'Enemy max health -1',
    Reward.prototype.modifyTotalHP,
    ['enemy', -1]
  );
  game.rewardsList.push(
    healReward,
    shieldReward,
    rerollReward,
    playerHealthReward,
    enemyHealthReward
  );
}

class Reward {
  constructor(text, method, parameters) {
    this.text = text;
    this.method = method;
    this.parameters = parameters;
  }

  applyEffect() {
    this.method(this.parameters);
  }

  modifyByType(paramArray) {
    const type = paramArray[0];
    const bonus = paramArray[1];
    const sides = ['top', 'left', 'middle', 'bottom', 'right', 'farRight'];

    game.playerUnits.forEach((unit) => {
      sides.forEach((side) => {
        if (unit.dice[side].type === type) {
          console.log(`adding ${bonus} to ${unit.name}'s ${type} side`);
          unit.dice[side].value += bonus;
        }
      });
    });
  }

  modifyTotalHP(paramArray) {
    const unitType = paramArray[0];
    const bonus = paramArray[1];
    if (unitType === 'player') {
      game.playerUnits.forEach((unit) => {
        unit.totalHP += bonus;
        unit.currentHP += bonus;
        unit.updateHP();
      });
    } else if (unitType === 'enemy') {
      game.enemyHpModifier += bonus;
    }
  }

  modifyRerolls(paramArray) {
    const bonus = paramArray;
    game.maxRerolls += bonus;
  }
}

// ---------------------------------------------Modal Click---------------------------------------------
game.$rewardsModal.on('click', '.reward', (event) => {
  const $clickedElementId = $(event.target).attr('id');
  const rewardNum = $clickedElementId.slice(-1) - 1;
  const reward = game.currentRewards[rewardNum];
  reward.applyEffect();
  console.log(`clicked on reward ${rewardNum + 1}`);
  game.nextFight();
});

// ---------------------------------------------Game Area click---------------------------------------------
game.$playerSection.on('click', '.playerDice', (event) => {
  const $clickedElement = $(event.target);
  const unitId = $clickedElement.closest('.playerUnit').attr('id');
  const playerUnit = game.playerUnits.get(`${unitId}`);
  console.log(playerUnit);

  if (game.turnPhase === 'playerAction') {
    if (playerUnit.dice.currentSide != null) {
      game.usePlayerDice(unitId);
    }
  } else if (game.turnPhase === 'playerDefending') {
    game.aidPlayerUnit(playerUnit);
  }
});

game.$rollingSection.on('click', '.playerDice', (event) => {
  const $clickedElement = $(event.target);
  const unitName = $clickedElement.attr('id');
  const playerMap = [...game.playerUnits.entries()].find(
    ([key, value]) => key === unitName
  );
  console.log(unitName);
  const playerUnit = playerMap[1];
  if (game.turnPhase === 'playerRolling') {
    if (!playerUnit.dice.isLocked) {
      game.lockDice(playerMap);
      $clickedElement.remove();
    }
  }
  if (game.alivePlayerUnits.every((unit) => unit.dice.isLocked)) {
    game.playerEndRolls();
  }
});

game.$enemySection.on('click', '.enemyUnit', (event) => {
  const $clickedElement = $(event.target);
  const unitId = $clickedElement.closest('.enemyUnit').attr('id');
  if (game.turnPhase === 'playerAttacking') {
    game.attackEnemyUnit(unitId);
  }
});

// ---------------------------------------------Reroll Button---------------------------------------------
game.$DOM.on('click', '#reroll', async (event) => {
  const $rerollButton = $(event.target);
  $rerollButton.prop('disabled', true);

  if (game.rerollsLeft > 0) {
    console.log('rerolling');
    game.playerRolls();
    game.rerollsLeft--;
  }

  $(`#rollCounter`).text(`Rerolls left: ${game.rerollsLeft}`);
  $rerollButton.prop('disabled', false);
  if (game.rerollsLeft === 0) {
    $rerollButton.prop('disabled', true);
  }
});

game.$DOM.on('click', '#endTurn', (event) => {
  const $endTurnButton = $(event.target);
  if (game.turnPhase === 'enemyAttack') {
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
  const p3farRight = new DiceSide(1, 'shield');

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
    p1Middle,
    p1Middle,
    p1Middle,
    p1Middle,
    p1Middle,
    p3farRight
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
  const p1 = new EnemyUnit('bee1', 10 + game.enemyHpModifier, e1Dice);
  const p2 = new EnemyUnit('bee2', 4 + game.enemyHpModifier, e2Dice);
  const p3 = new EnemyUnit('bee3', 2 + game.enemyHpModifier, e3Dice);
}

function generateGoblin() {
  const gobTop = new DiceSide(4 + game.enemyDamageModifier, 'damage');
  const gobLeft = new DiceSide(4 + game.enemyDamageModifier, 'damage');
  const gobMiddle = new DiceSide(2 + game.enemyDamageModifier, 'damage');
  const gobBottom = new DiceSide(2 + game.enemyDamageModifier, 'damage');
  const gobRight = new DiceSide(1 + game.enemyDamageModifier, 'damage');
  const egobRightMost = new DiceSide(1 + game.enemyDamageModifier, 'damage');

  const gobDice = new Dice(
    gobTop,
    gobLeft,
    gobMiddle,
    gobBottom,
    gobRight,
    egobRightMost
  );
  const gob = new EnemyUnit('Goblin', 8 + game.enemyHpModifier, gobDice);
}

function generateBee() {
  const beeTop = new DiceSide(2 + game.enemyDamageModifier, 'damage');
  const beeLeft = new DiceSide(4 + game.enemyDamageModifier, 'damage');
  const beeMiddle = new DiceSide(1 + game.enemyDamageModifier, 'damage');
  const beeBottom = new DiceSide(3 + game.enemyDamageModifier, 'damage');
  const beeRight = new DiceSide(5 + game.enemyDamageModifier, 'damage');
  const beeRightMost = new DiceSide(6 + game.enemyDamageModifier, 'damage');

  const beeDice = new Dice(
    beeTop,
    beeLeft,
    beeMiddle,
    beeBottom,
    beeRight,
    beeRightMost
  );
  const bee = new EnemyUnit('Bee', 3 + game.enemyHpModifier, beeDice);
}

// ---------------------------------------------Game Start-----------------------------------------------
$(document).ready(async () => {
  const $rerollButton = $('#reroll');
  $rerollButton.prop('disabled', true);
  RewardSetup();
  console.log('enemy rolls');
  playerSetup();
  game.nextFight();
  // enemySetup();
  console.log('rerolling');
  game.enemyRolls();
  await sleep(1000);
  console.log('player rolls');
  game.playerRolls();
  $rerollButton.prop('disabled', false);
  game.turnPhase = 'playerRolling';
});
