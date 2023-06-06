// tests go here; this will not be compiled when this package is used as an extension.

let list = [tilemap`level1`, tilemap`level3`, tilemap`level4`]
tiles.setCurrentTilemap(list[0])

const s1 = sprites.create(img`5 5 5`)

const s2 = sprites.create(img`3 3 3`)

const s3 = sprites.create(img`2 2 2`)

const s4 = sprites.create(img`a a a`)

const all = [s1, s2, s3, s4];

splitScreen.setCameraSprite(splitScreen.Camera.Camera1, s1)
splitScreen.setCameraSprite(splitScreen.Camera.Camera2, s2)
splitScreen.setCameraSprite(splitScreen.Camera.Camera3, s3)
// splitScreen.setCameraSprite(splitScreen.Camera.Camera4, s4)

let controllingIndex = 3;

updateControl();

controller.A.onEvent(ControllerButtonEvent.Pressed, () => {
    updateControl();
})


function updateControl() {
    controller.moveSprite(all[controllingIndex], 0, 0);
    controllingIndex = (controllingIndex + 1) % 4;
    controller.moveSprite(all[controllingIndex], 50, 50);
}