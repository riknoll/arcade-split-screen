// tests go here; this will not be compiled when this package is used as an extension.
console.log("test")
let list = [tilemap`level1`, tilemap`level3`, tilemap`level4`]
tiles.setCurrentTilemap(list[0])

console.log("test")

const s1 = sprites.create(img`5 5 5`)

const s2 = sprites.create(img`3 3 3`)

const s3 = sprites.create(img`2 2 2`)

const s4 = sprites.create(img`a a a`)

const all = [s1, s2, s3, s4];

scene.cameraFollowSprite(s2)

splitScreen.cameraFollowSprite(splitScreen.Camera.Camera1, s1)
// splitScreen.cameraFollowSprite(splitScreen.Camera.Camera2, s2)
// splitScreen.cameraFollowSprite(splitScreen.Camera.Camera3, s3)
// splitScreen.cameraFollowSprite(splitScreen.Camera.Camera4, s4)

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

// const bg = sprites.create(image.create(160, 120), SpriteKind.Food)
// bg.image.fill(1)

// splitScreen.setRenderSize(80, 60);
// splitScreen.getSprite().left = 40;
// splitScreen.getSprite().top = 30;



const cameraView = splitScreen.createCameraView(10, 10);
cameraView.left = 120;
cameraView.top = 90;

cameraView.z = 100;

cameraView.sx = 2;
cameraView.sy = 2

splitScreen.cameraViewFollow(cameraView, s1);