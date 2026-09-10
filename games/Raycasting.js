/*
@title: raycaster
@author: Marcio Vinicius

Controles:
  w = andar pra frente
  s = andar pra tras
  a = girar pra esquerda
  d = girar pra direita
*/

const SCREEN_W = 10
const SCREEN_H = 8

const sky   = "c" 
const floor = "f" 
const wN    = "n" 
const wM    = "m" 
const wF    = "r" 

setLegend(
  [ sky, bitmap`
7777777777777777
7777777777777777
7777777777777777
7777777777777777
7777777777777777
7777777777777777
7777777777777777
7777777777777777
7777777777777777
7777777777777777
7777777777777777
7777777777777777
7777777777777777
7777777777777777
7777777777777777
7777777777777777` ],
  [ floor, bitmap`
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333
3333333333333333` ],
  [ wN, bitmap`
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999
9999999999999999` ],
  [ wM, bitmap`
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555
5555555555555555` ],
  [ wF, bitmap`
2222222222222222
2222222222222222
2222222222222222
2222222222222222
2222222222222222
2222222222222222
2222222222222222
2222222222222222
2222222222222222
2222222222222222
2222222222222222
2222222222222222
2222222222222222
2222222222222222
2222222222222222
2222222222222222` ],
)

setMap(map`
cccccccccc
cccccccccc
cccccccccc
cccccccccc
cccccccccc
cccccccccc
cccccccccc
cccccccccc`)


const worldMap = [
  [1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,1,0,0,1],
  [1,0,1,1,0,0,1,0,0,1],
  [1,0,1,0,0,0,0,0,0,1],
  [1,0,1,0,0,1,1,0,0,1],
  [1,0,0,0,0,1,0,0,0,1],
  [1,0,0,0,0,0,0,1,0,1],
  [1,1,1,1,1,1,1,1,1,1],
]
// 1 = parede, 0 = vazio
const mapW = worldMap[0].length
const mapH = worldMap.length

function isWall(x, y) {
  const gx = Math.floor(x)
  const gy = Math.floor(y)
  if (gx < 0 || gy < 0 || gx >= mapW || gy >= mapH) return true
  return worldMap[gy][gx] === 1
}

const player = { x: 2.5, y: 1.5, angle: 0 }
const MOVE_STEP = 0.4
const TURN_STEP = 0.35 // mais o menos 20 graus
const FOV = Math.PI / 3 // 60 graus

function castRay(angle) {
  const stepSize = 0.03
  const maxDepth = 16
  let dist = 0
  while (dist < maxDepth) {
    dist += stepSize
    const rx = player.x + Math.cos(angle) * dist
    const ry = player.y + Math.sin(angle) * dist
    if (isWall(rx, ry)) break
  }
  return dist
}

function render() {
  for (let col = 0; col < SCREEN_W; col++) {
    const rayAngle = player.angle - FOV / 2 + (col + 0.5) / SCREEN_W * FOV
    const rawDist = castRay(rayAngle)
    //tenho que adicionar isso pra corrigir o olho de peixe, mas acho que nem vai servir tanto kakaka
    const dist = rawDist * Math.cos(rayAngle - player.angle)

    let wallHeight = Math.round(SCREEN_H / (dist + 0.0001))
    wallHeight = Math.max(1, Math.min(SCREEN_H, wallHeight))

    const top = Math.floor((SCREEN_H - wallHeight) / 2)
    const bottom = top + wallHeight

    let wallTile
    if (dist < 2) wallTile = wN
    else if (dist < 4.5) wallTile = wM
    else wallTile = wF

    for (let row = 0; row < SCREEN_H; row++) {
      clearTile(col, row)
      if (row < top) addSprite(col, row, sky)
      else if (row >= bottom) addSprite(col, row, floor)
      else addSprite(col, row, wallTile)
    }
  }
}

function tryMove(dx, dy) {
  if (!isWall(player.x + dx, player.y)) player.x += dx
  if (!isWall(player.x, player.y + dy)) player.y += dy
}

onInput("w", () => {
  tryMove(Math.cos(player.angle) * MOVE_STEP, Math.sin(player.angle) * MOVE_STEP)
  render()
})

onInput("s", () => {
  tryMove(-Math.cos(player.angle) * MOVE_STEP, -Math.sin(player.angle) * MOVE_STEP)
  render()
})

onInput("a", () => {
  player.angle -= TURN_STEP
  render()
})

onInput("d", () => {
  player.angle += TURN_STEP
  render()
})

render()