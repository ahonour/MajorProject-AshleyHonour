'use strict';

// ---------------------------------------------Game Object---------------------------------------------
const game = {
  title: 'Slice and Dice', // Game title
  playerName: '', // User input name
  difficulty: 'medium', // Default difficulty
  isRunning: false, // Game state
  playerUnits: new Map(), // Player units, map used for easier reference
  alivePlayerUnits: [], // Array of alive player units
  enemyUnits: new Map(), // Enemy units, map used for easier reference
  rewardsList: [], // Array of post-fight rewards to power up the player
  currentRewards: [], // Array of 3 randomly selected rewards for the player to choose from
  fightNumber: 0, // Counter for the current fight
  turnPhase: 'playerRolling', // Phase of the turn, used to determine what the player can do
  rerollsLeft: 2, // Number of remaining rerolls left for the turn
  maxRerolls: 2, // Maximum number of rerolls allowed per turn
  enemyHpModifier: 0, // Modifier for enemy HP, used in difficulty scaling and rewards
  enemyDamageModifier: 0, // Modifier for enemy damage, used in difficulty scaling and rewards
  activePlayerUnit: null, // The player unit who's dice is currently being used
  playerActions: null, // Number of actions the player has left in the turn
  winstreak: 0, // Number of game wins in a row (not fights)

  // JQuery DOM elements
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
    game.gameReset(); // Reset game variables
    if (this.rewardsList.length === 0) {
      game.rewardSetup(); // Generate rewards if it hasn't been done yet
    }
    game.playerSetup(); // Generate player units
    game.$rerollButton.text(`Reroll (${game.rerollsLeft})`);
    game.nextFight(); // Start the first fight
  },

  // Reset game variables
  gameReset() {
    game.playerName = landing.$playerName.val();
    game.$playerName.text(game.playerName);
    game.$winstreak.text(`Winstreak: ${game.winstreak}`);
    game.$playerSection.empty();
    game.$enemySection.empty();
    game.difficulty = landing.difficultySelected;
    game.isRunning = true;
    game.playerUnits.clear();
    game.alivePlayerUnits = [];
    game.enemyUnits.clear();
    game.currentRewards = [];
    game.fightNumber = 0;
    game.turnPhase = 'playerRolling';
    game.enemyHpModifier = 0;
    game.enemyDamageModifier = 0;
    game.activePlayerUnit = null;
    game.playerActions = null;
    game.difficultySetup();
    game.rerollsLeft = game.maxRerolls;
  },

  // Randomly generate the player units from a few options
  playerSetup() {
    const damageUnit = Math.floor(Math.random() * 3);
    const shieldUnit = Math.floor(Math.random() * 3);
    const healUnit = Math.floor(Math.random() * 3);

    game.generateAttacker(damageUnit);
    game.generateDefender(shieldUnit);
    game.generateHealer(healUnit);
  },

  // Assemble the player object, on construction, calls addNewUnit()
  generateAttacker(rand) {
    switch (rand) {
      case 0:
        const p1Top1 = new DiceSide(2, 'damage');
        const p1Middle1 = new DiceSide(1, 'shield');
        const p1Left1 = new DiceSide(4, 'damage');
        const p1Right1 = new DiceSide(3, 'damage');
        const p1Bottom1 = new DiceSide(5, 'damage');
        const p1farRight1 = new DiceSide(6, 'damage');

        const p1Dice1 = new Dice(
          p1Top1,
          p1Left1,
          p1Middle1,
          p1Bottom1,
          p1Right1,
          p1farRight1
        );
        new PlayerUnit('Ashley', 10, p1Dice1);
        break;
      case 1:
        const p1Top2 = new DiceSide(2, 'damage');
        const p1Middle2 = new DiceSide(1, 'shield');
        const p1Left2 = new DiceSide(4, 'damage');
        const p1Right2 = new DiceSide(3, 'damage');
        const p1Bottom2 = new DiceSide(5, 'damage');
        const p1farRight2 = new DiceSide(6, 'damage');

        const p1Dice2 = new Dice(
          p1Top2,
          p1Left2,
          p1Middle2,
          p1Bottom2,
          p1Right2,
          p1farRight2
        );
        new PlayerUnit('Ashley', 9, p1Dice2);
        break;
      case 2:
        const p1Top3 = new DiceSide(2, 'damage');
        const p1Middle3 = new DiceSide(1, 'shield');
        const p1Left3 = new DiceSide(4, 'damage');
        const p1Right3 = new DiceSide(3, 'damage');
        const p1Bottom3 = new DiceSide(5, 'damage');
        const p1farRight3 = new DiceSide(6, 'damage');

        const p1Dice3 = new Dice(
          p1Top3,
          p1Left3,
          p1Middle3,
          p1Bottom3,
          p1Right3,
          p1farRight3
        );
        new PlayerUnit('Ashley', 8, p1Dice3);
        break;
    }
  },
  // Assemble the player object, on construction, calls addNewUnit()
  generateDefender(rand) {
    switch (rand) {
      case 0:
        const p2Top1 = new DiceSide(2, 'damage');
        const p2Middle1 = new DiceSide(1, 'shield');
        const p2Left1 = new DiceSide(4, 'damage');
        const p2Right1 = new DiceSide(3, 'damage');
        const p2Bottom1 = new DiceSide(5, 'damage');
        const p2farRight1 = new DiceSide(6, 'damage');

        const p2Dice1 = new Dice(
          p2Top1,
          p2Left1,
          p2Middle1,
          p2Bottom1,
          p2Right1,
          p2farRight1
        );
        new PlayerUnit('Jevan', 4, p2Dice1);
        break;
      case 1:
        const p2Top2 = new DiceSide(2, 'damage');
        const p2Middle2 = new DiceSide(1, 'shield');
        const p2Left2 = new DiceSide(4, 'damage');
        const p2Right2 = new DiceSide(3, 'damage');
        const p2Bottom2 = new DiceSide(5, 'damage');
        const p2farRight2 = new DiceSide(6, 'damage');

        const p2Dice2 = new Dice(
          p2Top2,
          p2Left2,
          p2Middle2,
          p2Bottom2,
          p2Right2,
          p2farRight2
        );
        new PlayerUnit('Jevan', 5, p2Dice2);
        break;
      case 2:
        const p2Top3 = new DiceSide(2, 'damage');
        const p2Middle3 = new DiceSide(1, 'shield');
        const p2Left3 = new DiceSide(4, 'damage');
        const p2Right3 = new DiceSide(3, 'damage');
        const p2Bottom3 = new DiceSide(5, 'damage');
        const p2farRight3 = new DiceSide(6, 'damage');

        const p2Dice3 = new Dice(
          p2Top3,
          p2Left3,
          p2Middle3,
          p2Bottom3,
          p2Right3,
          p2farRight3
        );
        new PlayerUnit('Jevan', 6, p2Dice3);
        break;
    }
  },
  // Assemble the player object, on construction, calls addNewUnit()
  generateHealer(rand) {
    switch (rand) {
      case 0:
        const p3Top1 = new DiceSide(2, 'heal');
        const p3Middle1 = new DiceSide(1, 'heal');
        const p3Left1 = new DiceSide(4, 'heal');
        const p3Right1 = new DiceSide(3, 'heal');
        const p3Bottom1 = new DiceSide(5, 'heal');
        const p3farRight1 = new DiceSide(6, 'heal');

        const p3Dice1 = new Dice(
          p3Top1,
          p3Left1,
          p3Middle1,
          p3Bottom1,
          p3Right1,
          p3farRight1
        );
        new PlayerUnit('Podenco', 2, p3Dice1);
        break;
      case 1:
        const p3Top2 = new DiceSide(2, 'heal');
        const p3Middle2 = new DiceSide(1, 'heal');
        const p3Left2 = new DiceSide(4, 'heal');
        const p3Right2 = new DiceSide(3, 'heal');
        const p3Bottom2 = new DiceSide(5, 'heal');
        const p3farRight2 = new DiceSide(6, 'heal');

        const p3Dice2 = new Dice(
          p3Top2,
          p3Left2,
          p3Middle2,
          p3Bottom2,
          p3Right2,
          p3farRight2
        );
        new PlayerUnit('Podenco', 3, p3Dice2);
        break;
      case 2:
        const p3Top3 = new DiceSide(2, 'heal');
        const p3Middle3 = new DiceSide(1, 'heal');
        const p3Left3 = new DiceSide(4, 'heal');
        const p3Right3 = new DiceSide(3, 'heal');
        const p3Bottom3 = new DiceSide(5, 'heal');
        const p3farRight3 = new DiceSide(6, 'heal');

        const p3Dice3 = new Dice(
          p3Top3,
          p3Left3,
          p3Middle3,
          p3Bottom3,
          p3Right3,
          p3farRight3
        );
        new PlayerUnit('Podenco', 4, p3Dice3);
        break;
    }
  },

  // Apply the chosen difficulty settings
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

  // Generate the rewards that can be chosen from after a successful fight
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
      // Check if the unit is an ally or enemy
      const playerId = `player_${newUnit.name}_${this.playerUnits.size}`; // Generate a unique id for the unit
      newUnit.id = playerId; // Assign the id to the object for later reference
      this.playerUnits.set(playerId, newUnit); // Add the unit to the playerUnits map
      this.alivePlayerUnits.push(newUnit); // Also add the unit to the alivePlayerUnits array
      const playerNum = this.playerUnits.size - 1; // Used for placing on the grid
      // Create the HTML elements for the unit
      const playerName = `<div class="unitName">${newUnit.name}</div>`;
      const playerHP = `<div class="unitHP ${newUnit.name}">❤️ ${newUnit.currentHP}/${newUnit.totalHP}</div>`;
      const playerShield = `<div class="unitShield ${newUnit.name}">🛡️ 0</div>`;
      const playerInfo = `<div class="unitInfo">${playerName}${playerHP}${playerShield}</div>`;
      const playerDice = `<div class="playerDice ${newUnit.name}" id='playerDice${playerNum}'></div>`;
      const diceInfo = `<button class= "diceInfo ${newUnit.name}">?</button>`;
      const newUnitTotal = `<div class="playerUnit ${newUnit.name}" id='${playerId}'>${playerInfo}${playerDice}${diceInfo}</div>`;

      this.$playerSection.append(newUnitTotal); // Append the unit to the player section
    } else {
      // Same as above but for enemy units
      const enemyId = `enemy_${newUnit.name}_${this.enemyUnits.size}`;
      newUnit.id = enemyId;
      this.enemyUnits.set(enemyId, newUnit);
      const enemyName = `<div class="unitName">${newUnit.name}</div>`;
      const enemyHP = `<div class="unitHP ${newUnit.name}">❤️ ${newUnit.currentHP}/${newUnit.totalHP}</div>`;
      const target = `<div class="targeting ${newUnit.name}">Targeting: </div>`;
      const enemyInfo = `<div class="unitInfo">${enemyName}${enemyHP}${target}</div>`;
      const enemyDice = `<div class="enemyDice ${newUnit.name}" id='enemyDice${enemyId}'></div>`;
      const diceInfo = `<button class= "diceInfo ${newUnit.name}">?</button>`;
      const newUnitTotal = `<div class="enemyUnit" id='${enemyId}'>${enemyInfo}${enemyDice}${diceInfo}</div>`;
      this.$enemySection.append(newUnitTotal);
    }
  },

  async enemyRolls() {
    /* For each enemy unit, select the coorisponding dice in the rolling section
       and animate them, then lock the dice, and target a player unit */
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
    // Seperate the unit map
    const unitId = unitMap[0];
    const unit = unitMap[1];
    unit.dice.isLocked = true;
    // Find the appropriate location to display the dice, depending on if it is an ally or enemy
    const unitZone = unit.ally
      ? game.$playerSection.find(`#${unitId}`).find('.playerDice')
      : game.$enemySection.find(`#${unitId}`).find('.enemyDice');
    unit.showCurrentSide(unitZone); // Display the dice
  },

  createRollingDice(unit) {
    // Generate a unique id for the dice
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

    // Create the dice element and append it to the rolling section
    const $unitRollingDice = unit.ally
      ? $(`<div class="playerDice ${unit.name}" id="${diceId}"></div>`)
      : $(`<div class="enemyDice ${unit.name}" id="${diceId}"></div>`);

    if (unit.ally) {
      this.$rollingSection.append($unitRollingDice);
    } else {
      this.$rollingSection.find('.enemyDiceArea').append($unitRollingDice);
    }

    unit.getRandomSide(); // Pick a random side for the dice
    unit.showCurrentSide($unitRollingDice); // Display the dice side
  },

  // For each player unit, animate the dice
  async playerRolls() {
    for (const unitMap of game.playerUnits) {
      const unit = unitMap[1];
      const $rollingDice = game.$rollingSection.find(`#${unitMap[0]}`);
      diceAnimate(unit, $rollingDice);
    }
  },

  async nextTurn() {
    game.$rerollButton.prop('disabled', true); // Disable the reroll button
    // Reset any shield values back to 0
    game.alivePlayerUnits.forEach((unit) => {
      unit.shield = 0;
      unit.updateShield();
    });
    // Create the enemies' dice in the rolling area
    game.enemyUnits.forEach((unit) => {
      game.createRollingDice(unit);
    });
    await game.enemyRolls(); // Roll the enemies' dice
    await sleep(500);
    // Create the players' dice for each alive unit in the rolling area
    game.alivePlayerUnits.forEach((unit) => {
      game.createRollingDice(unit);
    });
    await game.playerRolls(); // Roll the players' dice
    // Reset the rerolls for the turn
    game.rerollsLeft = game.maxRerolls;
    game.$rerollButton.text(`Reroll (${game.rerollsLeft})`);
    game.$rerollButton.prop('disabled', false);
    game.turnPhase = 'playerRolling';

    // Update the user prompt, also have it fade in if it was hidden
    game.$userPrompt.css('opacity', 1);
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
        // If the target has more shield than the damage, only the shield is damaged (shield is removed first)
      } else {
        totalDamage = damage - target.shield; // Total damage is the remaining damage after the shield is removed
      }
      target.shield = Math.max(0, target.shield - damage); // Remove the shield from the target (minimum of 0)
      console.log(`target: ${target.name} for ${damage} damage`);
      console.log(`new shield value: ${target.shield}`);
      console.log(`total damage: ${totalDamage}`);
      target.currentHP -= totalDamage;
      target.updateHP(); // Update the HP display
      target.updateShield(); // Update the shield display
      game.$enemySection.find(`#${unit.id}`).find('.enemyDice').empty(); // Clear the dice display
    });
    if (game.alivePlayerUnits.length === 0) {
      console.log('All your units are dead, Game over :( ');
      game.gameover(); // If all player units are dead, end the game
    } else {
      game.nextTurn(); // Otherwise, start the next turn
    }
  },

  // Once all player Dice are locked, prompt the player to select an action
  playerEndRolls() {
    game.$rerollButton.prop('disabled', true);
    game.turnPhase = 'playerAction';
    game.playerActions = game.alivePlayerUnits.length;
    game.playerDicePrompt();
  },

  // Select each alice unit that still has a locked (unused) dice and prompt the player to select an action
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

    // Clear the dice prompt class
    game.$playerSection
      .find(`#${playerId} .playerDice`)
      .removeClass('dicePrompt');
    // If the dice is an attack, prompt the player to select an enemy unit to attack
    if (playerUnit.dice.currentSide.type === 'damage') {
      console.log('click on an enemy unit to attack them');
      game.$enemySection.find('.enemyUnit').addClass('enemyHighlight');
      game.$userPrompt.text('Click on an enemy unit to attack them');
      game.turnPhase = 'playerAttacking';
    } else {
      // If the dice is a heal or shield, prompt the player to select an allied unit to aid
      console.log('click on an allied unit to aid them');
      Array.from(game.alivePlayerUnits.values()).forEach((unit) => {
        game.$playerSection
          .find(`.playerDice.${unit.name}`)
          .addClass('playerHighlight');
      });
      game.$userPrompt.text('Click on an allied unit to aid them');
      game.turnPhase = 'playerDefending';
    }
    game.activePlayerUnit = playerUnit; // Note the unit who's dice is being used
  },

  aidPlayerUnit(targetUnit) {
    // Get the type and value of the dice being used
    const diceType = game.activePlayerUnit.dice.currentSide.type;
    const diceValue = game.activePlayerUnit.dice.currentSide.value;

    // Apply the effect of the dice to the targeted unit
    if (diceType === 'heal') {
      targetUnit.currentHP += diceValue;
      targetUnit.updateHP();
    } else if (diceType === 'shield') {
      targetUnit.shield += diceValue;
      targetUnit.updateShield(); // TODO
    }

    // Clear the used dice display and clear the active player unit
    game.$playerSection
      .find(`.playerDice.${game.activePlayerUnit.name}`)
      .empty();
    game.activePlayerUnit.dice.currentSide = null;
    game.activePlayerUnit.dice.isLocked = false;
    game.$playerSection.find(`.playerDice`).removeClass('playerHighlight');
    game.activePlayerUnit = null;

    // Prompt the player to select another dice if they have any remaining
    game.turnPhase = 'playerAction';
    game.playerDicePrompt();

    game.playerActions--; // Decrement the number of actions the player has left
    // If the player has no actions left, prompt them to end their turn
    if (game.playerActions === 0) {
      game.$userPrompt.text('Click on the end turn button to proceed');
      game.$DOM.find('#endTurn').addClass('end-turn-prompt');
      game.turnPhase = 'enemyAttack';
      return;
    }
  },

  attackEnemyUnit(unitId) {
    const targetUnit = game.enemyUnits.get(`${unitId}`);
    const diceValue = game.activePlayerUnit.dice.currentSide.value; // Not the power of the attack

    // Apply the damage to the target unit
    targetUnit.currentHP -= diceValue;
    targetUnit.updateHP();

    // Clear the used dice display and clear the active player unit
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
    // If there are no remaining enemy units, end the fight
    // If the player has no actions left, prompt them to end their turn
    if (game.enemyUnits.size === 0) {
      console.log('All enemies dead, you won!!!!! :3 ');
      game.turnPhase = 'fightOver';
      game.fightOver();
    } else if (game.playerActions === 0) {
      console.log('player out of actions, it is now the enemy turn');
      // prompt user somehow
      game.$DOM.find('#endTurn').addClass('end-turn-prompt');
      game.turnPhase = 'enemyAttack';
      return;
    }
  },

  // Clear any unused dice and prompts and reset some variables
  fightOver() {
    const playerDice = game.$playerSection.find('.playerDice');
    playerDice.empty();
    playerDice.removeClass('dicePrompt');
    game.activePlayerUnit = null;
    game.playerActions = 0;
    game.$DOM.find('#endTurn').removeClass('end-turn-prompt');
    game.alivePlayerUnits = [];

    // Revive and heal all player units, adding them to the alivePlayerUnits array
    for (const unit of game.playerUnits.values()) {
      unit.fullHeal();
      unit.alive = true;
      unit.dice.isLocked = false;
      game.alivePlayerUnits.push(unit);
    }
    // If it was the last fight, end the game, otherwise, select the rewards and display the rewards modal
    if (game.fightNumber === 3) {
      game.isRunning = false;
      game.winstreak++;
      game.$DOM.css('display', 'none');
      winner.$DOM.css('display', 'flex');
    } else {
      game.generateRewards();
      // Force the modal to be static and not dismissable except by selecting a reward
      game.$rewardsModal.modal({
        backdrop: 'static',
        keyboard: false,
      });
      game.$rewardsModal.modal('show');
    }
  },

  // Select 3 unique rewards from the rewards list and display them in the rewards modal
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

  // Set up the next fight and start the game loop again
  nextFight() {
    game.fightNumber++;

    switch (game.fightNumber) {
      case 1:
        game.fightOne();
        break;
      case 2:
        game.fightTwo();
        break;
      case 3:
        game.fightThree();
        break;
      default:
        break;
    }
    game.nextTurn();
  },

  // Generate the enemies for the first fight from a few options
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

  // Generate the enemies for the second fight from a few options
  fightTwo() {
    generateGoblin();
    generateGoblin();
  },

  // Generate the enemies for the third fight from a few options
  fightThree() {
    generateGoblin();
    generateGoblin();
    generateBee();
  },

  // Clear some DOM elements and display the game over screen
  gameover() {
    game.isRunning = false;
    game.$playerSection.empty();
    game.$enemySection.empty();
    game.$rollingSection.find('.playerDice').remove();
    game.$rollingSection.find('.enemyDice').remove();
    game.winstreak = 0;
    game.$DOM.css('display', 'none');
    gameover.$DOM.css('display', 'flex');
  },
};

// ---------------------------------------------Landing Screen Object---------------------------------------------
const landing = {
  $DOM: $('#landing'),
  $startForm: $('#start-form'),
  $startButton: $('#startGame'),
  $playerName: $('#playerName'),
  $easyButton: $('#easy'),
  $mediumButton: $('#medium'),
  $hardButton: $('#hard'),
  $helpButton: $('#help-button'),
  $difficultyExplanation: $('#difficultyExplanation'),
  difficultySelected: '',

  gameSetup() {
    if (this.$playerName.val() === '') {
      // Double check that the player has entered a name
      return;
    } else {
      // Set the player name and start the game
      game.playerName = this.$playerName.val();
      this.$DOM.css('display', 'none');
      game.$DOM.css('display', 'grid');
      game.isRunning = true;
      game.gameStart();
    }
  },

  // Set the difficulty and update the explanation text
  setEasy() {
    this.difficultySelected = 'easy';
    this.$difficultyExplanation.text('Easy: 3 rerolls');
  },

  // Same as above but for medium
  setMedium() {
    this.difficultySelected = 'medium';
    this.$difficultyExplanation.text('Medium: 2 reroll');
  },

  // Same as above but for hard
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

// Go to the help screen
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

// Return to the landing screen or game screen depending on if the game is running
help.$return.on('click', () => {
  if (game.isRunning) {
    help.$DOM.css('display', 'none');
    game.$DOM.css('display', 'grid');
  } else {
    help.$DOM.css('display', 'none');
    landing.$DOM.css('display', 'flex');
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
  landing.$DOM.css('display', 'flex');
  game.$userPrompt.css('opacity', 0);
});

// ---------------------------------------------Winner Screen Object---------------------------------------------

const winner = {
  $DOM: $('#winner'),
  $continue: $('#continue'),
  $finished: $('#finished'),
};

// ---------------------------------------------Winner Screen Click---------------------------------------------
winner.$continue.on('click', () => {
  winner.$DOM.css('display', 'none');
  game.$DOM.css('display', 'grid');
  game.gameStart();
});

winner.$finished.on('click', () => {
  winner.$DOM.css('display', 'none');
  landing.$DOM.css('display', 'flex');
  game.winstreak = 0;
});

// ---------------------------------------------Unit Classes---------------------------------------------
class PlayerUnit {
  constructor(name, health, dice) {
    this.name = name;
    this.currentHP = health;
    this.totalHP = health;
    this.dice = dice;
    this.ally = true;
    this.alive = true;
    this.shield = 0;
    this.id;
    game.addNewUnit(this); // Add the unit to the game object and the DOM
  }

  // Set the current side to a random side
  getRandomSide() {
    this.dice.currentSide = this.dice.randomSide();
  }

  // Display the current side of the dice
  showCurrentSide($unitDice) {
    $unitDice.text(this.dice.displaySide(this.dice.currentSide));
  }

  updateHP() {
    const $hp = game.$playerSection.find(`.unitHP.${this.name}`);
    // If the unit is dead, add a class to the unit and display 'Dead 💀'
    if (this.currentHP <= 0) {
      $hp.closest('.playerUnit').addClass('dead-unit');
      $hp.text(`Dead 💀`);
      this.alive = false;
      game.alivePlayerUnits = game.alivePlayerUnits.filter(
        (unit) => unit !== this
      );
      return;
    } else if (this.currentHP > this.totalHP) {
      // If the unit is overhealed, set the HP to the max
      this.currentHP = this.totalHP;
      $hp.text(`❤️ ${this.currentHP}/${this.totalHP}`);
    } else {
      // Otherwise, display the current HP
      $hp.text(`❤️ ${this.currentHP}/${this.totalHP}`);
    }
    $hp.closest('.playerUnit').removeClass('dead-unit'); // Remove the dead class if the unit is alive
  }

  // Update the shield display
  updateShield() {
    const $shield = game.$playerSection.find(`.unitShield.${this.name}`);
    $shield.text(`🛡️ ${this.shield}`);
  }

  // Heal the unit to full health
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
    this.dice = dice;
    this.ally = false;
    this.target = null;
    this.alive = true;
    this.id;
    game.addNewUnit(this); // Add the unit to the game object and the DOM
  }

  // Set the current side to a random side
  getRandomSide() {
    this.dice.currentSide = this.dice.randomSide();
  }

  // Display the current side of the dice
  showCurrentSide($unitDice) {
    $unitDice.text(this.dice.displaySide(this.dice.currentSide));
  }

  targetPlayer() {
    // Select a random player unit to target
    const alivePlayerUnits = Array.from(game.playerUnits.values()).filter(
      (unit) => unit.alive
    );
    const rand = Math.floor(Math.random() * game.alivePlayerUnits.length);
    this.target = alivePlayerUnits[rand];
    // Display the target in the DOM
    game.$enemySection
      .find(`#${this.id}`)
      .find(`.targeting`)
      .text(`Target: ${this.target.name}`);
  }

  // If the unit is dead, remove it from the game object and the DOM, otherwise, display the current HP
  updateHP() {
    const unitId = this.id;
    const $hp = game.$enemySection.find(`#${unitId}`).find('.unitHP');
    if (this.currentHP <= 0) {
      const unitId = this.id;
      game.enemyUnits.delete(unitId);
      game.$enemySection.find(`#${unitId}`).remove();
    } else {
      $hp.text(`❤️ ${this.currentHP}/${this.totalHP}`);
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

  // Pick a random side from the dice
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

  // Display the value and type of a side using emojis
  displaySide(side) {
    return `${side.value} ${this.typeEmoji(side.type)}`;
  }

  // Return an emoji based on the type of side
  typeEmoji(type) {
    switch (type) {
      case 'damage':
        return '🗡️';
      case 'shield':
        return '🛡️';
      case 'heal':
        return '💖';
      default:
        return '❔';
    }
  }

  // Display the value of each side in the dice modal
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

// Object for each side of a dice
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

  // Call the method stored in the reward object
  applyEffect() {
    this.method(this.parameters);
  }

  modifyByType(paramArray) {
    const type = paramArray[0]; // Type of side to modify
    const bonus = paramArray[1]; // Bonus to add to the side
    const sides = ['top', 'left', 'middle', 'bottom', 'right', 'farRight'];

    // Iterate through all player units and add the bonus to the specified side
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
    const unitType = paramArray[0]; // Player or enemy
    const bonus = paramArray[1]; // Amount to modify the total HP by
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

  // Modify the number of rerolls the player has
  modifyRerolls(paramArray) {
    const bonus = paramArray;
    game.maxRerolls += bonus;
  }
}

// ---------------------------------------------Modal Click---------------------------------------------
game.$rewardsModal.on('click', '.reward', (event) => {
  // Get the number of the reward clicked indexed at 0
  const $clickedElementId = $(event.target).attr('id');
  const rewardNum = $clickedElementId.slice(-1) - 1;
  const reward = game.currentRewards[rewardNum];

  reward.applyEffect(); // Apply the effect of the reward
  console.log(`clicked on reward ${rewardNum + 1}`);
  game.$rewardsModal.modal('hide');
  game.nextFight(); // Start the next fight
});

game.$DOM.on('click', '.diceInfo', (event) => {
  // Determine if the clicked element is a player or enemy unit
  const $clickedElement = $(event.target);
  const isPlayer =
    $clickedElement.closest('section').attr('id') === 'playerArea';
  if (isPlayer) {
    // Get the id of the unit and display the dice info modal for that unit
    const unitId = $clickedElement.closest('.playerUnit').attr('id');
    const unit = game.playerUnits.get(`${unitId}`);
    game.$diceModal.find('.modal-title').text(`${unit.name} Dice Info`);
    unit.dice.displayDice();
  } else {
    // Same as above but for enemy units
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

  // Check the current phase of the game and act accordingly
  if (game.turnPhase === 'playerAction') {
    if (playerUnit.dice.currentSide != null) {
      game.usePlayerDice(unitId); // Start the process of using the dice
    }
  } else if (game.turnPhase === 'playerDefending' && playerUnit.alive) {
    game.aidPlayerUnit(playerUnit); // Aid the selected player unit
  }
});

game.$rollingSection.on('click', '.playerDice', (event) => {
  // get the information of the clicked dice
  const $clickedElement = $(event.target);
  const unitName = $clickedElement.attr('id');
  const playerMap = [...game.playerUnits.entries()].find(
    ([key, value]) => key === unitName
  );
  const playerUnit = playerMap[1];
  // If the turn phase is player rolling and the dice is not locked, lock the dice and remove the dice from the rolling area
  if (game.turnPhase === 'playerRolling') {
    if (!playerUnit.dice.isLocked) {
      game.lockDice(playerMap);
      $clickedElement.remove();
    }
  }
  // If all player dice are locked, prompt the player to select an action
  if (game.alivePlayerUnits.every((unit) => unit.dice.isLocked)) {
    game.playerEndRolls();
  }
});

// If the player is attacking, select an enemy unit to attack it
game.$enemySection.on('click', '.enemyUnit', (event) => {
  const $clickedElement = $(event.target);
  const unitId = $clickedElement.closest('.enemyUnit').attr('id');
  if (game.turnPhase === 'playerAttacking') {
    game.attackEnemyUnit(unitId);
  }
});

// Display the help screen
$('#game-help').on('click', () => {
  game.$DOM.css('display', 'none');
  help.$DOM.css('display', 'flex');
});

// Go to the game over screen
$('#game-reset').on('click', () => {
  game.gameover();
});

// ---------------------------------------------Reroll Button---------------------------------------------

game.$rerollButton.on('click', async (event) => {
  const $rerollButton = $(event.target);
  $rerollButton.prop('disabled', true); // Temporarily disable the reroll button

  // If the player has rerolls left this turn, reroll
  if (game.rerollsLeft > 0) {
    game.playerRolls();
    await sleep(1000);
    game.rerollsLeft--;
  }

  // Update the reroll button text enable the button if the player has rerolls left
  $rerollButton.text(`Reroll (${game.rerollsLeft})`);
  game.rerollsLeft === 0
    ? $rerollButton.prop('disabled', true)
    : $rerollButton.prop('disabled', false);
});

// If the game phase is enemy attack, end the turn and start the enemy attack phase
game.$DOM.on('click', '#endTurn', (event) => {
  const $endTurnButton = $(event.target);
  if (game.turnPhase === 'enemyAttack') {
    $endTurnButton.removeClass('end-turn-prompt');
    game.enemyAttack();
  }
});

// ---------------------------------------------Animation---------------------------------------------
// Wait for a set amount of time
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simulate a dice roll animation by showing three random sides, with classes to add more dynamism
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

// Create a goblin enemy
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

// Create a bee enemy
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
// Start on the landing screen
$(document).ready(async () => {
  landing.$DOM.css('display', 'flex');
});
