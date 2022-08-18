//% block="Split Screen"
//% icon="\uf030"
//% color="#bd7844"
namespace splitScreen {
    let rowBuff: Buffer;
    class SplitScreenState {
        fakeCamera: scene.Camera;
        fakeScreen: ScreenImage;
        renderable: scene.Renderable;
        isRendering: boolean;
        realScreen: ScreenImage;
        realCamera: scene.Camera;

        constructor() {
            this.fakeCamera = new scene.Camera();
            this.fakeScreen = image.create(screen.width, screen.height) as ScreenImage;
            this.isRendering = false;


            this.renderable = scene.createRenderable(99, () => {
                if (!this.fakeCamera.sprite) return;

                if (!this.isRendering) {
                    this.fakeCamera.update();
                    this.realScreen = screen;
                    this.realCamera = game.currentScene().camera
                    screen = this.fakeScreen
                    game.currentScene().camera = this.fakeCamera

                    this.isRendering = true;
                    // black magic
                    game.currentScene().flags &= ~(scene.Flag.IsRendering)
                    game.currentScene().render();
                    this.isRendering = false;

                    screen = this.realScreen;
                    game.currentScene().camera = this.realCamera;
                    this.realScreen.fillRect(79, 0, 2, 120, 15)
                }
                else {
                    const tm = game.currentScene().tileMap;

                    if (this.realCamera.sprite) {
                        const realOffsetX = Math.clamp(0, tm.areaWidth(), this.realCamera.sprite.x - 40);
                        shiftScreen(this.realScreen, Math.min(realOffsetX - this.realCamera.offsetX, 80));
                    }
                    else {
                        shiftScreen(this.realScreen, 40);
                    }

                    const fakeOffsetX = Math.clamp(0, tm.areaWidth(), this.fakeCamera.sprite.x - 40);

                    shiftScreen(this.fakeScreen, Math.min(fakeOffsetX - this.fakeCamera.offsetX, 80));
                    this.realScreen.drawImage(this.fakeScreen, 80, 0);
                }
            })
        }
    }

    let stateStack: SplitScreenState[];

    /**
     * Adds a splitscreen camera to a game
     */
    //% blockId="splitscreencamerafollowsprite"
    //% block="split screen camera follow $sprite"
    export function splitScreenCameraFollow(sprite: Sprite) {
        state().fakeCamera.sprite = sprite;
    }

    function init() {
        if (stateStack) return;
        stateStack = [new SplitScreenState()];
        rowBuff = control.createBuffer(screen.height);

        game.addScenePushHandler(() => {
            stateStack.push(new SplitScreenState())
        })

        game.addScenePopHandler(() => {
            stateStack.pop();
            if (stateStack.length === 0) stateStack.push(new SplitScreenState())
        })
    }

    function state() {
        init();
        return stateStack[stateStack.length - 1];
    }

    function shiftScreen(target: Image, numPixels: number) {
        for (let x = 0; x < target.width - numPixels; x++) {
            target.getRows(x + numPixels, rowBuff)
            target.setRows(x, rowBuff)
        }
    }
}
