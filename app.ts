let char_x = 100
let char_y = 400
let movement_x = 0
let movement_y = 0
let jump_time = 0
let jumping = false
let hitbox = new Hitbox(char_x, char_y, 100, 100)

function updateCharacter(x: number, y: number, hitbox: Hitbox) {
    rectangle(x, y, 100, 100)
    hitbox.x = x
    hitbox.y = y
    hitbox.drawOutline("red")
}

function jump() {
    if (jumping && char_y <= 400) {
        jump_time += deltaTime
        return -10 + 10 * jump_time / 1000
    } else if (char_y > 400) {
        jumping = false
        char_y = 400
        jump_time = 0
        return 0
    }
    return 0
}

function walk() {
    if (keyboard.a && !jumping) {
        return -5
    } else if (keyboard.d && !jumping) {
        return 5
    } else if (jumping) {
        return movement_x
    } else if (movement_x < -0.1) {
        return movement_x + 0.2
    } else if (movement_x > 0.1) {
        return movement_x - 0.2
    } else {
        return 0
    }
}

function updatePosition() {
    char_x += movement_x
    char_y += movement_y
}

update = () => {
    clear()
    movement_x = walk()
    movement_y = jump()
    if (keyboard.space) {
        jumping = true
    }

    updatePosition()
    updateCharacter(char_x, char_y, hitbox)
}