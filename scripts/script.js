'use strict';

const game = {
  title: 'Slice and Dice',
  isRunning: false,
  playerUnits: [],
  enemyUnits: [],
  turnPhase: 'enemy',
  $DOM: $('#game'),
  $playerSection: $('#playerArea'),
  $rollingSection: $('#rollingArea'),
  $enemySection: $('#enemyArea'),
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
      this.$playerSection.append(newUnitTotal);
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
    }
  },
};

class PlayerUnit {
  constructor(name, health, dice) {
    this.name = name;
    this.currentHP = health;
    this.totalHP = health;
    this.dice = dice; // Make a function to randomly generate
    game.addNewUnit(this, 'ally');
  }

  rollingAnimation($clickedElement) {    
    const unitSide = this.dice.randomSide();
    $clickedElement.text(`${unitSide.value} ${unitSide.type}`);
  }
}

class EnemyUnit {
  constructor(name, health, diceSides) {
    this.name = name;
    this.currentHP = health;
    this.totalHP = health;
    this.dice = diceSides; // Make a function to randomly generate
    game.addNewUnit(this, 'foe');
  }
}

class Dice {
  constructor(top, left, middle, bottom, right, farRight) {
    this.top = top;
    this.left = left; 
    this.middle = middle;
    this.bottom = bottom
    this.right = right;
    this.farRight = farRight;
  }

  randomSide() {
    const rand = Math.floor(Math.random()*6);
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
  const $clickedElement = $(event.target)
  if ($clickedElement.hasClass('p1')) {
    diceAnimate(p1, $clickedElement);
    // const p1randomSide = p1.dice.randomSide();
    // $clickedElement.text(`${p1randomSide.type} _ ${p1randomSide.value}`);
  }
});

const p1Top = new DiceSide(2, 'damage');
const p1Middle = new DiceSide(1, 'shield');
const p1Left = new DiceSide(4, 'damage');
const p1Right = new DiceSide(3, 'damage');
const p1Bottom = new DiceSide(5, 'damage');
const p1farRight = new DiceSide(6, 'damage');

const p1Dice = new Dice(p1Top, p1Left, p1Middle, p1Bottom, p1Right, p1farRight);
const p1 = new PlayerUnit('Ashley', 10, p1Dice);
const p2 = new PlayerUnit('Jevan', 4, p1Dice);
const p3 = new PlayerUnit('Podenco', 2, p1Dice);

const p1RandomSide = p1.dice.randomSide();
const p1rollingDice = `<div class="playerDice p1">${p1RandomSide.type} _ ${p1RandomSide.value}</div>`;
game.$rollingSection.append(p1rollingDice);
const $clickDice = game.$rollingSection.find('.playerDice');
const rollingHeight = Math.floor(Math.random() * game.$rollingSection.height());
const rollingWidth = Math.floor(Math.random() * game.$rollingSection.width());
$clickDice.css('top', `${rollingHeight}px`);
$clickDice.css('left', `${rollingWidth}px`);

function diceAnimate($object, $clickedElement) {
  let aCounter = 0;
  function tickTock() {
    if (aCounter < 3) {
      $object.rollingAnimation($clickedElement);
      window.setTimeout(tickTock, 1000);
    }
    aCounter ++;
  }
  tickTock();
}
