// Numbers shown will be in the range minNum to maxNum (inclusive)
// Note that all number display shows only 1 to 90 inclusive
const minNum: number = 0
const maxNum: number = 100

const lastN_to_show = 5

// Sequence of numbers to be shown
let seq: number[] = []

// Flag indicating whether each number has been shown
// Note that this array is indexed by the number
// not its position in the sequence
// shown[i] represents minNum+i
let shown: boolean[] = []

// Initialize seq with all numbers in the range in ascending
// order and shown set to false
for (let i = minNum; i <= maxNum; i++) {
    seq.push(i)
    shown.push(false)
}

// Perform a Fisher-Yates shuffle on seq so we have a random permutation
for (let i = 0; i < (seq.length - 1); i++) {
    let rnd = Math.randomRange(i, seq.length - 1)
    let tmp = seq[rnd]
    seq[rnd] = seq[i]
    seq[i] = tmp
}

// Whether we are in the show-all numbers screen
// We keep track of this because when someone presses A while in the show-all state
// we don't want to generate a new number but just switch screens
let showingAll: boolean = false

// Background image for showing all numbers
let allNumbers: Image = image.create(scene.screenWidth(), scene.screenHeight())

// Print text in the center (horizontally)
function printCenter(target: Image, text: string, y: number,
    font: fancyText.BaseFont, color: number, scale: number) {
    let textWidth = fancyText.getTextWidth(font, text)
    let textHeight = font.lineHeight
    let imgBuf = image.create(textWidth, textHeight)
    fancyText.draw(text, imgBuf, 0, 0, undefined, color, font)
    target.blit((scene.screenWidth() - textWidth*scale) / 2, y,
        textWidth*scale, textHeight*scale,
        imgBuf, 0, 0, textWidth, textHeight, true, false)
}

// Enter the show-all numbers screen
function showAll() {
    showingAll = true // Update UI state
    allNumbers.fill(6) // Clear the screen

    // Loop over all numbers in range minNum to maxNum
    for (let i = minNum; i <= maxNum; i++) {
        // On the show-all screen we only do 1 to 90 inclusive
        if (i < 1 || i > 90)
            continue

        // Find the row and column to print this number
        let col = ~~((i-1) / 10)
        let row = (i-1) % 10

        // If number has been shown, print it
        if (shown[i - minNum]) {
            let tn = convertToText(i)
            // Numbers are right-aligned so add a space if less than 10
            if (i < 10)
                tn = " " + tn

            // Draw the number at the right position
            allNumbers.print(tn, 10 + col * 16, 5 + row * 11, 9, image.font8)
        }
    }

    // Set the background to the all-numbers screen
    scene.setBackgroundImage(allNumbers)
}

// Last three numbers shown
let last: number[] = []

// Last number shown
let lastN: number = null
// Index of the current number in seq[]
let current = 0

// Background image for showing current and last numbers
let background: Image = image.create(scene.screenWidth(), scene.screenHeight())

// When A is pressed, show the next number
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    // Stop background music
    music.stopAllSounds()

    // If there are no more numbers to show and now showing all, play a sound
    if (current >= seq.length) {
        if (!showingAll)
            music.magicWand.play()
        //showAll()
        //return
    }

    // If we are not showing all and there are more numbers, show the next number
    // (if we are showing all or are done, just switch screen without generating a new number)
    if (!showingAll && current < seq.length) {
        music.baDing.play()

        // Keep the last three numbers in last
        if (lastN != null) {
            last.push(lastN)
            if (last.length > lastN_to_show)
                last.shift()
        }

        // Get the next number in the sequence
        lastN = seq[current++]
        // Set that this number has been shown
        shown[lastN - minNum] = true
    }

    // Display current and last number(s)
    background.fill(4)
    // Display current number
    if (lastN != null)
        printCenter(background, convertToText(lastN), 5, fancyText.outline_two_tone_12, 9, 3)

    // Display last numbers
    printCenter(background, last.join(", "), 75, fancyText.outline_two_tone_12, 1, 1)

    // Show current and last numbers on screen
    scene.setBackgroundImage(background)

    // Update UI state
    showingAll = false

    //control.heapSnapshot()
})

// When B is pushed, and we've generated at least one number, switch to show-all screen
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (lastN != null) {
        showingAll = true
        showAll()
    }
    //control.heapSnapshot()
})

// Create and show start screen
scene.setBackgroundImage(background)
background.fill(4)
printCenter(background, "BINGO",
    (scene.screenHeight() - 21 * 2) / 2, fancyText.rounded_large, 1, 2)
background.printCenter("Press A to start", (scene.screenHeight() - 16), 1, image.font8)
music.play(music.createSong(assets.song`mySong`), music.PlaybackMode.LoopingInBackground)