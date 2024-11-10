'use strict';

const game = {
  title: 'Slice and Dice',
  isRunning: false,
  playerUnits: [],
  enemyUnits: [],
  turnPhase: 'enemy',
  rerollsLeft: 2,
  $DOM: $('#game'),
  $playerSection: $('#playerArea'),
  $rollingSection: $('#rollingArea'),
  $enemySection: $('#enemyArea'),
  addNewUnit(newUnit) {
    if (newUnit.ally) {
      this.playerUnits.push(newUnit);
      const playerNum = this.playerUnits.length - 1;
      const playerName = `<div class="unitName">${newUnit.name}</div>`;
      const currentHP = `<div id='playerUnitCurrentHP${playerNum}'>${newUnit.currentHP}</div>`;
      const playerHP = `<div>Health: ${currentHP}/${newUnit.totalHP}</div>`;
      const playerInfo = `<div class="unitInfo">${playerName}${playerHP}</div>`;
      const playerDice = `<div class="playerDice ${newUnit.name}" id='playerDice${playerNum}'></div>`;
      const newUnitTotal = `<div class="playerUnit" id='playerUnit${playerNum}'>${playerInfo}${playerDice}</div>`;
      this.$playerSection.append(newUnitTotal);
      this.createRollingDice(newUnit);
    } else {
      this.enemyUnits.push(newUnit);
      const enemyNum = this.enemyUnits.length - 1;
      const enemyName = `<div class="unitName">${newUnit.name}</div>`;
      const currentHP = `<div id='enemnyUnitCurrentHP${enemyNum}'>${newUnit.currentHP}</div>`;
      const enemyHP = `<div>Health: ${currentHP}/${newUnit.totalHP}</div>`;
      const enemyInfo = `<div class="unitInfo">${enemyName}${enemyHP}</div>`;
      const enemyDice = `<div class="enemyDice" id='enemyDice${enemyNum}'></div>`;
      const newUnitTotal = `<div class="enemyUnit" id='enemyUnit${enemyNum}'>${enemyInfo}${enemyDice}</div>`;
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
    console.log(`Locked dice for ${unit.name}!`);
    const lockedZone = game.$playerSection.find(`.playerDice.${unit.name}`);
    unit.showCurrentSide(lockedZone);
  },
};

class PlayerUnit {
  constructor(name, health, dice) {
    this.name = name;
    this.currentHP = health;
    this.totalHP = health;
    this.dice = dice; // Make a function to randomly generate
    this.ally = true;
    game.addNewUnit(this, true);
  }

  getRandomSide() {
    this.dice.currentSide = this.dice.randomSide();
  }

  showCurrentSide($unitDice) {
    $unitDice.text(
      `${this.dice.currentSide.value} ${this.dice.currentSide.type}`
    );
  }
}

class EnemyUnit {
  constructor(name, health, diceSides) {
    this.name = name;
    this.currentHP = health;
    this.totalHP = health;
    this.dice = diceSides; // Make a function to randomly generate
    this.ally = false;
    game.addNewUnit(this, false);
  }

  getRandomSide() {
    this.dice.currentSide = this.dice.randomSide();
  }

  showCurrentSide($unitDice) {
    $unitDice.text(
      `${this.dice.currentSide.value} ${this.dice.currentSide.type}`
    );
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

game.$playerSection.on('click', '.playerDice', (event) => {
  const $clickedElement = $(event.target);
  const name = $clickedElement.prev().children().first().first().text();
  const otherName = $clickedElement.parent().find('.unitName').text();
  console.log(otherName);
});

game.$rollingSection.on('click', '.playerDice', (event) => {
  const $clickedElement = $(event.target);
  game.playerUnits.forEach((unit) => {
    if ($clickedElement.hasClass(unit.name)) {
      game.lockDice(unit);
      $clickedElement.remove();
    }
  });
  if (game.playerUnits.every((unit) => unit.dice.isLocked)) {
    console.log('all units locked');
    game.turnPhase = 'playerAction';
  }
});

game.$DOM.on('click', '#reroll', async (event) => {
  const $rerollButton = $(event.target);
  $rerollButton.prop('disabled', true);

  if (game.rerollsLeft == 0) {
    console.log('no more rolls left');
    game.playerUnits.forEach((unit) => {
      if (!unit.dice.isLocked) {
        const $lockDice = game.$rollingSection.find(`.${unit.name}`);
        console.log($lockDice);
        game.lockDice(unit);
        $lockDice.remove();
      }
    });
  }

  if (game.rerollsLeft > 0) {
    console.log('rerolling');
    for (const unit of game.playerUnits) {
      if (!unit.dice.isLocked) {
        const $rollingDice = game.$rollingSection.find(`.${unit.name}`);
        await diceAnimate(unit, $rollingDice);
      }
    }
    game.rerollsLeft--;
  }

  $(`#rollCounter`).text(`Rerolls left: ${game.rerollsLeft}`);
  $rerollButton.prop('disabled', false);
});

// function diceAnimate($unit, $clickedElement) {
//   let aCounter = 0;
//   function tickTock() {
//     if (aCounter < 3) {
//       console.log(`roll ${aCounter}`);
//       $unit.getRandomSide();
//       $unit.showCurrentSide($clickedElement);
//       window.setTimeout(tickTock, 500);
//     }
//     aCounter++;
//   }
//   tickTock();
// }

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function diceAnimate($unit, $clickedElement) {
  for (let aCounter = 0; aCounter < 3; aCounter++) {
    console.log(`roll ${aCounter}`);
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
  const p1 = new EnemyUnit('bee 1', 10, p1Dice);
  const p2 = new EnemyUnit('bee 2', 4, p2Dice);
  const p3 = new EnemyUnit('bee 3', 2, p3Dice);
}

$(document).ready(() => {
  enemySetup();
  playerSetup();
  game.playerUnits.forEach((unit) => {
    if (!unit.dice.isLocked) {
      const $rollingDice = game.$rollingSection.find(`.${unit.name}`);
      diceAnimate(unit, $rollingDice);
    }
  });
});
