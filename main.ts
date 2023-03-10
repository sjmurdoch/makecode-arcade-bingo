// Numbers shown will be in the range 1 to maxNum (inclusive)
// Note that display routines assume that maxNum <= 90
const maxNum: number = 90

// Sequence of numbers to be shown
let seq: number[] = []

// Flag indicating whether each number has been shown
// Note that this array is indexed by the number itself minus 1
// not its position in the sequence
let shown: boolean[] = []

// Initialize seq with all numbers in the range in ascending
// order and shown set to false
for (let i = 0; i < maxNum; i++) {
    seq.push(i + 1)
    shown.push(false)
}

// Perform a Fisher-Yates shuffle on seq so we have a random permutation
for (let i = 0; i < (seq.length - 1); i++) {
    let rnd = Math.randomRange(i, seq.length - 1)
    let tmp = seq[rnd]
    seq[rnd] = seq[i]
    seq[i] = tmp
}

// Set up fonts
let bigFont = image.scaledFont(image.font8, 4)
let medFont = image.scaledFont(image.font8, 2)

// Whether we are in the show-all numbers screen
// We keep track of this because when someone presses A while in the show-all state
// we don't want to generate a new number but just switch screens
let showingAll: boolean = false

// Background image for showing all numbers
let allNumbers: Image = image.create(scene.screenWidth(), scene.screenHeight())

// Enter the show-all numbers screen
function showAll() {
    showingAll = true // Update UI state
    allNumbers.fill(6) // Clear the screen

    // Loop over all numbers in range 0 to maxNum - 1
    for (let i = 0; i < maxNum; i++) {
        // Find the row and column to print this number
        let col = ~~(i / 10)
        let row = i % 10

        // If number has been shown, print it
        if (shown[i]) {
            // shown[] is indexed by number minus 1 so we add 1 back
            let tn = convertToText(i + 1)
            // Numbers are right-aligned so add a space if less than 10
            if (i + 1 < 10)
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
let lastN = 0
// Index of the current number in seq[]
let current = 0

// Background image for showing current and last numbers
let background: Image = image.create(scene.screenWidth(), scene.screenHeight())

// When A is pressed, show the next number
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    // If there are no more numbers to show and now showing all, play a sound
    if (current == maxNum) {
        if (!showingAll)
            music.magicWand.play()
        //showAll()
        //return
    }

    // If we are not showing all and there are more numbers, show the next number
    // (if we are showing all or are done, just switch screen without generating a new number)
    if (!showingAll && current < maxNum) {
        music.baDing.play()

        // Keep the last three numbers in last
        if (lastN != 0) {
            last.push(lastN)
            if (last.length > 3)
                last.shift()
        }

        // Get the next number in the sequence
        lastN = seq[current++]
        // Set that this number has been shown
        // note that shown is index by number minus 1
        shown[lastN - 1] = true
    }

    // Display current and last number(s)
    background.fill(4)
    // Display current number
    if (lastN != 0)
        background.printCenter(convertToText(lastN), 5, 9, bigFont)

    // Display last numbers
    background.printCenter(last.join(", "), 60, 1, medFont)

    // Show current and last numbers on screen
    scene.setBackgroundImage(background)

    // Update UI state
    showingAll = false
})

// When B is pushed, and we've generated at least one number, switch to show-all screen
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (lastN != 0) {
        showingAll = true
        showAll()
    }
})

// Create and show start screen
scene.setBackgroundImage(background)
background.fill(4)
background.printCenter("BINGO", (scene.screenHeight() - 8 * 4) / 2, 1, bigFont)
background.printCenter("Press A to start", (scene.screenHeight() - 16), 1, image.font8)