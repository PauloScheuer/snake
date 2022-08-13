const leftKey = 37;
const topKey = 38;
const rightKey = 39;
const downKey = 40;

const leftDirection = 3;
const topDirection = 4;
const rightDirection = 1;
const downDirection = 2;

const size = 10;
const time = 100;

const wallW = 500;
const wallH = 300;

let x1 = 0;
let y1 = 0;
let x2 = 0;
let y2 = 0;

let playerBody;
let newDirection;

const btnStart = document.getElementById("btnStart");
btnStart.addEventListener('click', () => {
  btnStart.style.visibility = 'hidden';

  let points = 0;
  let appleState = true;

  const body = document.querySelector("body");
  const wall = document.getElementById("wall");
  const apple = document.getElementById("apple");
  const allPoints = document.getElementById("points");
  const data = document.getElementById("data");

  drawWall(wall);

  data.style.visibility = 'visible';

  let posToAdd = {x:x1+size*5, y:y1+size*5}

  //inicialize playerbody with its elements array and the general direction
  playerBody = {
    direction:rightDirection,
    items:[
      posToAdd,
    ]
  };
  
  newDirection = playerBody.direction;

  //render playerbody as HTML
  renderPlayerHTML(playerBody.items, wall);

  //draw playerbody and apple
  drawPlayer(playerBody.items);
  drawApple(apple);

  //starts to receive direction changing commands
  body.addEventListener('keydown', keyDownFunction);

  //main loop
  const interval = setInterval(() => {
    //move playerbody
    posToAdd = {...playerBody.items[playerBody.items.length-1]};
    autoMove(playerBody);

    //test if it should die
    if (testTouchPlayer(playerBody.items) || testLimitArea(playerBody.items[0])) {
      alert("You died!");
      clearInterval(interval);
      window.location.reload();
      return;
    };

    //test collision with apple
    appleState = testEatApple(playerBody.items[0], apple);
    if (!appleState) {
      points = increasePoints(points, allPoints);
      playerBody.items.push(posToAdd);
      renderPlayerHTML(playerBody.items,wall);
      drawPlayer(playerBody.items);
      drawApple(apple);
    }else{
      renderPlayerHTML(playerBody.items,wall);
      drawPlayer(playerBody.items);
    }
    playerBody.direction = newDirection;
  }, time);
});

const keyDownFunction = (event) => {
  newDirection = changeDirection(event, playerBody);
}

const changeDirection = (event, playerBody) => {
  const key = event.keyCode;
  let newDirection = playerBody.direction;
  switch (key) {
    case leftKey:
      newDirection = leftDirection;
      break;
    case topKey:
      newDirection = topDirection;
      break;
    case downKey:
      newDirection = downDirection;
      break;
    default:
      newDirection = rightDirection;
      break;
  }
  //if the new direction is the oposite of the current one, do not change (except if the player body contains only one item)
  if (playerBody.items.length > 1 &&
    ((playerBody.direction === leftDirection && newDirection === rightDirection) ||
    (playerBody.direction === rightDirection && newDirection === leftDirection) ||
    (playerBody.direction === topDirection && newDirection === downDirection) ||
    (playerBody.direction === downDirection && newDirection === topDirection))
  ) {
    return playerBody.direction;
  }
  return newDirection;
}

const renderPlayerHTML = (items,wall) => {
  let playersHTML = '';
  items.forEach((player, index) => {
    const playerHTML = `
    <span id="player${index}" class="player"></span>`;
    playersHTML += playerHTML;
  });
  wall.innerHTML = playersHTML;
}

//Collision functions
const testEatApple = (player, apple) => {
  if (player.x + 'px' === apple.style.left && player.y + 'px' === apple.style.top) {
    return 0;
  } else {
    return 1;
  }
}

const testTouchPlayer = (player) => {
  let res = false;
  let i = 1;//starts by the second item
  const px = player[0].x;//x coordinate of players head
  const py = player[0].y;//y coordinate of players head
  while (i < player.length) {
    if (player[i].x === px && player[i].y === py) {
      res = true;
      break;
    }
    i++;
  }
  return res;
}

const testLimitArea = (player) => {
  const leftP = player.x;
  const topP = player.y;
  
  if (Number(leftP) + Number(size) >= x2) {
    return true;
  } else if (leftP - size < x1) {
    return true;
  } else if (topP - size < y1) {
    return true;
  } else if (Number(topP) + Number(size) >= y2) {
    return true;
  } else {
    return false;
  }
}

//Draw functions
const drawApple = (apple) => {
  let applePosX, applePosY
  do{
    applePosX = random(x1, x2);
    applePosY = random(y1, y2);
  }while(posAbovePlayer(applePosX,applePosY));

  apple.style.fontSize = size + 'px';
  apple.style.left = `${applePosX}px`;
  apple.style.top = `${applePosY}px`;
  apple.style.width = size + 'px';
  apple.style.height = size + 'px';
}

const drawWall = (wall) => {
  wall.style.visibility = 'visible';

  wall.style.minWidth = wallW+'px';
  wall.style.minHeight = wallH+'px';
  x1 = (window.innerWidth + wallW)/2 - wallW;
  y1 = 120;
  x2 = x1+wallW;
  y2 = y1+wallH;
  wall.style.left = x1+'px';
  wall.style.top  = y1+'px';
}
const drawPlayer = (items) => {
  items.forEach((item, index) => {
    const player = document.getElementById('player' + index);
    player.style.fontSize = size + 'px';
    player.style.left = `${item.x}px`;
    player.style.top = `${item.y}px`;
    player.style.width = size + 'px';
    player.style.height = size + 'px';
  })

}

//Movement functions
const autoMove = (playerBody) => {
  const index = playerBody.items.length-1;

  const playerItem = document.getElementById('player' + index);
  const playerHead = document.getElementById('player0');
  
  const direction = playerBody.direction;

  let signal = 1;
  let axis = 'h';
  if (direction===leftDirection||direction===topDirection){
    signal = -1;
  }
  if (direction===downDirection||direction===topDirection){
    axis = 'v';
  }
  setPositionHTML(playerItem, playerHead, signal, axis);
  setPositionStruct(playerBody, signal, axis);
}

const setPositionHTML = (playerItem, playerHead, signal, axis) => {
  //copy to moving item the head's position
  playerItem.style.left = playerHead.style.left;
  playerItem.style.top = playerHead.style.top;

  //change considering axis and direction
  if (axis === 'h') {
    const newX = Number(playerItem.style.left.split('px')[0])+size*signal;
    playerItem.style.left = newX + 'px';
  } else if (axis === 'v') {
    const newY = Number(playerItem.style.top.split('px')[0])+size*signal;
    playerItem.style.top = newY + 'px';
  }
}

const setPositionStruct = (playerBody, signal, axis) => {
  //copy to moving item the head's position
  let playerItem = playerBody.items[playerBody.items.length-1];
  let playerHead = playerBody.items[0];

  playerItem.x = playerHead.x;
  playerItem.y = playerHead.y;

  //change considering axis and direction
  if (axis === 'h') {
    playerItem.x += size*signal;
  } else if (axis === 'v') {
    playerItem.y += size*signal;
  }

  playerBody.items.pop(playerBody.items.length-1);
  playerBody.items.unshift(playerItem);
}

//Auxiliary functions
const random = (min, max) => {
  const dif = max - min;
  return ((Math.floor((Math.floor(Math.random() * (dif - 2 * size)) + size) / size)) * size) + min;
}

const increasePoints = (points, allPoints) => {
  points += 50;
  allPoints.textContent = points;
  return points;
}

const posAbovePlayer = (x, y) => {
  let res = false;
  playerBody.items.some(item=>{
    res = (item.x==x) && (item.y==y);
    return res;
  })
  return res
}


