'use strict';

// ---------------------------------------------Game Object---------------------------------------------
const game = {
  title: 'Slice and Dice',
  playerName: '',
  difficulty: 'medium',
  isRunning: false,
  playerUnits: new Map(),
  alivePlayerUnits: [],
  enemyUnits: new Map(),
  rewardsList: [],
  currentRewards: [],
  fightNumber: 0,
  turnPhase: 'playerRolling',
  rerollsLeft: 2,
  maxRerolls: 2,
  enemyHpModifier: 0,
  enemyDamageModifier: 0,
  activePlayerUnit: null,
  playerActions: null,
  winstreak: 0,
  $DOM: $('#game'),
  $playerName: $('#player-name'),
  $winstreak: $('#winstreak'),
  $playerSection: $('#playerArea'),
  $rollingSection: $('#rollingArea'),
  $enemySection: $('#enemyArea'),
  $rewardsModal: $('#rewardsModal'),
  $diceModal: $('#diceModal'),
  $rerollButton: $('#reroll'),
  $userPrompt: $('#user-prompt'),

  async gameStart() {
    game.playerName = landing.$playerName.val();
    game.$playerName.text(game.playerName);
    game.$winstreak.text(`Winstreak: ${game.winstreak}`);
    game.difficulty = landing.difficultySelected;
    game.isRunning = true;
    game.playerUnits.clear();
    game.alivePlayerUnits = [];
    game.enemyUnits.clear();
    game.rewardsList = [];
    game.currentRewards = [];
    game.fightNumber = 0;
    game.turnPhase = 'playerRolling';
    game.enemyHpModifier = 0;
    game.enemyDamageModifier = 0;
    game.activePlayerUnit = null;
    game.playerActions = null;

    game.difficultySetup();
    game.rerollsLeft = game.maxRerolls;
    game.rewardSetup();
    playerSetup();
    game.$rerollButton.text(`Reroll (${game.rerollsLeft})`);
    game.nextFight();
  },

  difficultySetup() {
    switch (game.difficulty) {
      case 'easy':
        game.maxRerolls = 3;
        break;
      case 'medium':
        game.maxRerolls = 2;
        break;
      case 'hard':
        game.maxRerolls = 1;
        break;
      default:
        game.maxRerolls = 2;
        break;
    }
  },

  rewardSetup() {
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
  },

  addNewUnit(newUnit) {
    if (newUnit.ally) {
      const playerId = `player_${newUnit.name}_${this.playerUnits.size}`;
      this.playerUnits.set(playerId, newUnit);
      this.alivePlayerUnits.push(newUnit);
      const playerNum = this.playerUnits.size - 1;
      const playerName = `<div class="unitName">${newUnit.name}</div>`;
      const playerHP = `<div class="unitHP ${newUnit.name}">💖 ${newUnit.currentHP}/${newUnit.totalHP}</div>`;
      const playerShield = `<div class="unitShield ${newUnit.name}">🛡️ 0</div>`;
      const playerInfo = `<div class="unitInfo">${playerName}${playerHP}${playerShield}</div>`;
      const playerDice = `<div class="playerDice ${newUnit.name}" id='playerDice${playerNum}'></div>`;
      const diceInfo = `<button class= "diceInfo ${newUnit.name}">?</button>`;
      const newUnitTotal = `<div class="playerUnit ${newUnit.name}" id='${playerId}'>${playerInfo}${playerDice}${diceInfo}</div>`;
      this.$playerSection.append(newUnitTotal);
      newUnit.id = playerId;
      // this.createRollingDice(newUnit);
    } else {
      const enemyId = `enemy_${newUnit.name}_${this.enemyUnits.size}`;
      this.enemyUnits.set(enemyId, newUnit);
      const enemyName = `<div class="unitName">${newUnit.name}</div>`;
      const enemyHP = `<div class="unitHP ${newUnit.name}">💖 ${newUnit.currentHP}/${newUnit.totalHP}</div>`;
      const target = `<div class="targeting ${newUnit.name}">Targeting: </div>`;
      const enemyInfo = `<div class="unitInfo">${enemyName}${enemyHP}${target}</div>`;
      const enemyDice = `<div class="enemyDice ${newUnit.name}" id='enemyDice${enemyId}'></div>`;
      const diceInfo = `<button class= "diceInfo ${newUnit.name}">?</button>`;
      const newUnitTotal = `<div class="enemyUnit" id='${enemyId}'>${enemyInfo}${enemyDice}${diceInfo}</div>`;
      this.$enemySection.append(newUnitTotal);
      newUnit.id = enemyId;
      // this.createRollingDice(newUnit);
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
      diceAnimate(unit, $rollingDice);
    }
  },

  async nextTurn() {
    game.$rerollButton.prop('disabled', true);
    game.alivePlayerUnits.forEach((unit) => {
      unit.shield = 0;
      unit.updateShield();
    });
    game.enemyUnits.forEach((unit) => {
      game.createRollingDice(unit);
    });
    await game.enemyRolls();
    await sleep(500);
    //const alivePlayerUnits = game.playerUnits.filter((unit) => unit.alive);
    game.alivePlayerUnits.forEach((unit) => {
      game.createRollingDice(unit);
    });
    await game.playerRolls();
    game.rerollsLeft = game.maxRerolls;
    game.$rerollButton.text(`Reroll (${game.rerollsLeft})`);
    game.$rerollButton.prop('disabled', false);
    game.turnPhase = 'playerRolling';
    game.$userPrompt.text(
      'Roll your dice and click on them to lock your selection'
    );
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
      game.$enemySection.find(`#${unit.id}`).find('.enemyDice').empty();
    });
    if (game.alivePlayerUnits.length === 0) {
      console.log('All your units are dead, Game over :( ');
    } else {
      game.nextTurn();
    }
  },

  playerEndRolls() {
    console.log('all units locked moving to action phase');
    game.turnPhase = 'playerAction';
    game.playerActions = game.alivePlayerUnits.length;
    game.playerDicePrompt();
  },

  playerDicePrompt() {
    const remainingUnits = game.alivePlayerUnits.filter(
      (unit) => unit.dice.isLocked
    );
    remainingUnits.forEach((unit) => {
      game.$playerSection
        .find(`.playerDice.${unit.name}`)
        .addClass('dicePrompt');
    });
    game.$userPrompt.text('Click on one of your dice to select it');
  },

  usePlayerDice(playerId) {
    const playerUnit = game.playerUnits.get(playerId);
    game.$playerSection
      .find(`#${playerId} .playerDice`)
      .removeClass('dicePrompt');
    if (playerUnit.dice.currentSide.type === 'damage') {
      console.log('click on an enemy unit to attack them');
      game.$enemySection.find('.enemyUnit').addClass('enemyHighlight');
      game.$userPrompt.text('Click on an enemy unit to attack them');
      game.turnPhase = 'playerAttacking';
    } else {
      console.log('click on an allied unit to aid them');
      Array.from(game.alivePlayerUnits.values()).forEach((unit) => {
        game.$playerSection
          .find(`.playerDice.${unit.name}`)
          .addClass('playerHighlight');
      });
      game.$userPrompt.text('Click on an allied unit to aid them');
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
      game.$userPrompt.text('Click on the end turn button to proceed');
      game.$DOM.find('#endTurn').addClass('dicePrompt');
      game.turnPhase = 'enemyAttack';
      return;
    }
  },

  attackEnemyUnit(unitId) {
    const targetUnit = game.enemyUnits.get(`${unitId}`);
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
    if (game.enemyUnits.size === 0) {
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
    const playerDice = game.$playerSection.find('.playerDice');
    playerDice.empty();
    playerDice.removeClass('dicePrompt');
    game.activePlayerUnit = null;
    game.playerActions = 0;
    game.$DOM.find('#endTurn').removeClass('dicePrompt');
    game.alivePlayerUnits = [];
    for (const unit of game.playerUnits.values()) {
      unit.fullHeal();
      unit.alive = true;
      unit.dice.isLocked = false;
      game.alivePlayerUnits.push(unit);
    }
    if (game.fightNumber === 3) {
      game.winstreak++;
    } else {
      game.generateRewards();
      game.$rewardsModal.modal({
        backdrop: 'static',
        keyboard: false,
      });
      game.$rewardsModal.modal('show');
    }
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
    game.nextTurn();
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

  // fightThree() {}

  gameover() {
    game.isRunning = false;
    game.$playerSection.empty();
    game.$enemySection.empty();
    game.$rollingSection.empty();
    game.winstreak = 0;
    game.$DOM.css('display', 'none');
    gameover.$DOM.css('display', 'flex');
  },
};

// ---------------------------------------------Landing Screen Object---------------------------------------------
const landing = {
  $DOM: $('#landing'),
  $startForm: $('#startForm'),
  $startButton: $('#startGame'),
  $playerName: $('#playerName'),
  $easyButton: $('#easy'),
  $mediumButton: $('#medium'),
  $hardButton: $('#hard'),
  $helpButton: $('#helpButton'),
  $difficultyExplanation: $('#difficultyExplanation'),
  difficultySelected: '',

  gameSetup() {
    console.log('setting up landing screen');
    if (this.$playerName.val() === '') {
      return;
    } else {
      game.playerName = this.$playerName.val();
      this.$DOM.css('display', 'none');
      game.$DOM.css('display', 'grid');
      game.isRunning = true;
      game.gameStart();
    }
  },

  setEasy() {
    this.difficultySelected = 'easy';
    this.$difficultyExplanation.text('Easy: 3 rerolls');
  },

  setMedium() {
    this.difficultySelected = 'medium';
    this.$difficultyExplanation.text('Medium: 2 reroll');
  },

  setHard() {
    this.difficultySelected = 'hard';
    this.$difficultyExplanation.text('Hard: 1 reroll');
  },
};

// ---------------------------------------------Landing Screen Click---------------------------------------------
landing.$startButton.on('click', () => {
  landing.gameSetup();
});

landing.$easyButton.on('click', () => {
  landing.setEasy();
});

landing.$mediumButton.on('click', () => {
  landing.setMedium();
});

landing.$hardButton.on('click', () => {
  landing.setHard();
});

landing.$startForm.on('submit', (event) => {
  event.preventDefault();
});

landing.$helpButton.on('click', () => {
  landing.$DOM.css('display', 'none');
  help.$DOM.css('display', 'flex');
});

// ---------------------------------------------Help Screen Object---------------------------------------------

const help = {
  $DOM: $('#help'),
  $return: $('#help-return'),
};

// ---------------------------------------------Help Screen Click---------------------------------------------

help.$return.on('click', () => {
  if (game.isRunning) {
    help.$DOM.css('display', 'none');
    game.$DOM.css('display', 'grid');
  } else {
    help.$DOM.css('display', 'none');
    landing.$DOM.css('display', 'block');
  }
});

// ---------------------------------------------Game Over Screen Object---------------------------------------------
const gameover = {
  $DOM: $('#gameover'),
  $restart: $('#restart'),
};

// ---------------------------------------------Game Over Screen Click---------------------------------------------
gameover.$restart.on('click', () => {
  gameover.$DOM.css('display', 'none');
  landing.$DOM.css('display', 'block');
});

// ---------------------------------------------Winner Screen Object---------------------------------------------

const winner = {
  $DOM: $('#winner'),
  $continue: $('#continue'),
  $finished: $('#finished'),
};

// ---------------------------------------------Unit Classes---------------------------------------------
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
    $unitDice.text(this.dice.displaySide(this.dice.currentSide));
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
      $hp.text(`💖 ${this.currentHP}/${this.totalHP}`);
    } else {
      $hp.text(`💖 ${this.currentHP}/${this.totalHP}`);
    }
  }

  updateShield() {
    const $shield = game.$playerSection.find(`.unitShield.${this.name}`);
    $shield.text(`🛡️ ${this.shield}`);
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
    // $unitDice.text(
    //   `${this.dice.currentSide.value} ${this.dice.currentSide.type}`
    // );
    $unitDice.text(this.dice.displaySide(this.dice.currentSide));
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
      const unitId = this.id;
      game.enemyUnits.delete(unitId);
      game.$enemySection.find(`#${unitId}`).remove();
    } else {
      $hp.text(`💖 ${this.currentHP}/${this.totalHP}`);
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

  displaySide(side) {
    return `${side.value} ${this.typeEmoji(side.type)}`;
  }

  typeEmoji(type) {
    switch (type) {
      case 'damage':
        return '🗡️';
      case 'shield':
        return '🛡️';
      case 'heal':
        return '❤️';
      default:
        return '❔';
    }
  }

  displayDice() {
    const $diceModal = game.$diceModal;
    $diceModal.find('#topSide').text(this.displaySide(this.top));
    $diceModal.find('#leftSide').text(this.displaySide(this.left));
    $diceModal.find('#middleSide').text(this.displaySide(this.middle));
    $diceModal.find('#bottomSide').text(this.displaySide(this.bottom));
    $diceModal.find('#rightSide').text(this.displaySide(this.right));
    $diceModal.find('#rightMostSide').text(this.displaySide(this.farRight));
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
  game.$rewardsModal.modal('hide');
  game.nextFight();
});

game.$DOM.on('click', '.diceInfo', (event) => {
  const $clickedElement = $(event.target);
  const isPlayer =
    $clickedElement.closest('section').attr('id') === 'playerArea';
  if (isPlayer) {
    const unitId = $clickedElement.closest('.playerUnit').attr('id');
    const unit = game.playerUnits.get(`${unitId}`);
    game.$diceModal.find('.modal-title').text(`${unit.name} Dice Info`);
    unit.dice.displayDice();
  } else {
    const unitId = $clickedElement.closest('.enemyUnit').attr('id');
    const unit = game.enemyUnits.get(`${unitId}`);
    game.$diceModal.find('.modal-title').text(`${unit.name} Dice Info`);
    unit.dice.displayDice();
  }

  game.$diceModal.modal('show');
});

// ---------------------------------------------Game Area click---------------------------------------------
game.$playerSection.on('click', '.playerDice', (event) => {
  const $clickedElement = $(event.target);
  const unitId = $clickedElement.closest('.playerUnit').attr('id');
  const playerUnit = game.playerUnits.get(`${unitId}`);

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

$('#game-help').on('click', () => {
  game.$DOM.css('display', 'none');
  help.$DOM.css('display', 'flex');
});

$('#game-reset').on('click', () => {
  game.gameover();
});

// ---------------------------------------------Reroll Button---------------------------------------------
game.$rerollButton.on('click', async (event) => {
  const $rerollButton = $(event.target);
  $rerollButton.prop('disabled', true);

  if (game.rerollsLeft > 0) {
    console.log('rerolling');
    game.playerRolls();
    await sleep(1000);
    game.rerollsLeft--;
  }

  $rerollButton.text(`Reroll (${game.rerollsLeft})`);
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
    $clickedElement.removeClass(`dice-spin-${aCounter - 1}`);
    $unit.getRandomSide();
    $clickedElement.addClass(`dice-spin-${aCounter}`);
    $unit.showCurrentSide($clickedElement);
    await sleep(200);
  }
  $clickedElement.removeClass('dice-spin-2');
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

function generateGoblin() {
  const gobTop = new DiceSide(4 + game.enemyDamageModifier, 'damage');
  const gobLeft = new DiceSide(4 + game.enemyDamageModifier, 'damage');
  const gobMiddle = new DiceSide(2 + game.enemyDamageModifier, 'damage');
  const gobBottom = new DiceSide(2 + game.enemyDamageModifier, 'damage');
  const gobRight = new DiceSide(1 + game.enemyDamageModifier, 'damage');
  const gobRightMost = new DiceSide(1 + game.enemyDamageModifier, 'damage');

  const gobDice = new Dice(
    gobTop,
    gobLeft,
    gobMiddle,
    gobBottom,
    gobRight,
    gobRightMost
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
  landing.$DOM.css('display', 'block');
});
