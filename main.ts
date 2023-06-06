//% block="Split Screen"
//% icon="\uf030"
//% color="#bd7844"
namespace splitScreen {
    export enum Camera {
        //% block="one"
        Camera1,
        //% block="two"
        Camera2,
        //% block="three"
        Camera3,
        //% block="four"
        Camera4
    }

    export enum CameraRegion {
        //% block="left half"
        VerticalLeftHalf,
        //% block="right half"
        VerticalRightHalf,
        //% block="top half"
        HorizontalTopHalf,
        //% block="bottom half"
        HorizontalBottomHalf,
        //% block="top left"
        TopLeft,
        //% block="top right"
        TopRight,
        //% block="bottom left"
        BottomLeft,
        //% block="bottom right"
        BottomRight,
        //% block="left third"
        VerticalLeftThird,
        //% block="vertical middle third"
        VerticalMiddleThird,
        //% block="right third"
        VerticalRightThird,
        //% block="top third"
        HorizontalTopThird,
        //% block="horizontal middle third"
        HorizontalMiddleThird,
        //% block="bottom third"
        HorizontalBottomThird,
        //% block="vertical quarter 1"
        VerticalQuarter1,
        //% block="vertical quarter 2"
        VerticalQuarter2,
        //% block="vertical quarter 3"
        VerticalQuarter3,
        //% block="vertical quarter 4"
        VerticalQuarter4,
        //% block="horizontal quarter 1"
        HorizontalQuarter1,
        //% block="horizontal quarter 2"
        HorizontalQuarter2,
        //% block="horizontal quarter 3"
        HorizontalQuarter3,
        //% block="horizontal quarter 4"
        HorizontalQuarter4,
    }

    class CameraState {
        camera: scene.Camera;
        enabled: boolean;
        region: CameraRegion;
        renderWidth: number;
        renderHeight: number;
        constructor() {
            this.camera = new scene.Camera();
            this.enabled = false;
            this.renderWidth = 0;
            this.renderHeight = 0;
        }
    }

    class SplitScreenState {
        cameras: CameraState[];
        fakeScreen: ScreenImage;
        renderable: scene.Renderable;
        isRendering: boolean;
        realScreen: ScreenImage;
        realCamera: scene.Camera;
        enabled: boolean;
        borderColor: number;

        currentRenderIndex: number;

        constructor() {
            this.cameras = [
                new CameraState(),
                new CameraState(),
                new CameraState(),
                new CameraState()
            ];

            this.borderColor = 1;
            this.fakeScreen = image.create(screen.width, screen.height) as ScreenImage;
            this.isRendering = false;
            this.enabled = true;
            this.currentRenderIndex = 0;

            game.currentScene().eventContext.registerFrameHandler(scene.PRE_RENDER_UPDATE_PRIORITY, () => {
                for (const camera of this.cameras) {
                    if (camera.enabled) {
                        camera.camera.update();
                    }
                }
            });

            this.renderable = scene.createRenderable(99, () => {
                this.render();
            });
        }

        getCameraProperty(camera: Camera, property: CameraProperty) {
            const state = this.cameras[camera];

            if (!state.enabled) return 0;

            if (!state.renderHeight) this.render(true);

            const x = state.camera.sprite ? state.camera.sprite.x : state.camera.x;
            const y = state.camera.sprite ? state.camera.sprite.y : state.camera.y;
            const left = state.camera.left + Math.min(Math.max(x - state.camera.left - (state.renderWidth >> 1), 0), screen.width - state.renderWidth) | 0;
            const top = state.camera.top + Math.min(Math.max(y - state.camera.top - (state.renderHeight >> 1), 0), screen.height - state.renderHeight) | 0;


            switch (property) {
                case CameraProperty.X:
                    return left + (state.renderWidth >> 1);
                case CameraProperty.Y:
                    return top + (state.renderHeight >> 1);
                case CameraProperty.Left:
                    return left;
                case CameraProperty.Right:
                    return left + state.renderWidth;
                case CameraProperty.Top:
                    return top;
                case CameraProperty.Bottom:
                    return top + state.renderHeight;
            }
        }

        protected render(skipDraw = false) {
            if (this.isRendering) {
                throw "cancelled";
            }
            if (!this.enabled) return;

            const toRender = this.cameras.filter(c => c.enabled);

            if (toRender.length === 1) {
                if (!skipDraw) shiftScreen(screen, screen.width >> 2);
                this.renderCameraRegion(toRender[0], CameraRegion.VerticalRightHalf, skipDraw);
            }
            if (toRender.length === 2) {
                this.renderCameraRegion(toRender[0], CameraRegion.VerticalLeftHalf, skipDraw);
                this.renderCameraRegion(toRender[1], CameraRegion.VerticalRightHalf, skipDraw);
            }
            else if (toRender.length === 3) {
                this.renderCameraRegion(toRender[0], CameraRegion.VerticalLeftThird, skipDraw);
                this.renderCameraRegion(toRender[1], CameraRegion.VerticalMiddleThird, skipDraw);
                this.renderCameraRegion(toRender[2], CameraRegion.VerticalRightThird, skipDraw);
            }
            else if (toRender.length === 4) {
                this.renderCameraRegion(toRender[0], CameraRegion.TopLeft, skipDraw);
                this.renderCameraRegion(toRender[1], CameraRegion.TopRight, skipDraw);
                this.renderCameraRegion(toRender[2], CameraRegion.BottomLeft, skipDraw);
                this.renderCameraRegion(toRender[3], CameraRegion.BottomRight, skipDraw);
            }
        }

        protected renderCameraRegion(camera: CameraState, defaultRegion: CameraRegion, skipDraw: boolean) {
            switch (camera.region == undefined ? defaultRegion : camera.region) {
                case CameraRegion.TopLeft:
                    this.renderCamera(camera, 0, 0, screen.width >> 1, screen.height >> 1, skipDraw)
                    break;
                case CameraRegion.TopRight:
                    this.renderCamera(camera, (screen.width - (screen.width >> 1)), 0, screen.width >> 1, screen.height >> 1, skipDraw)
                    break;
                case CameraRegion.BottomLeft:
                    this.renderCamera(camera, 0, screen.height - (screen.height >> 1), screen.width >> 1, screen.height >> 1, skipDraw)
                    break;
                case CameraRegion.BottomRight:
                    this.renderCamera(camera, (screen.width - (screen.width >> 1)), screen.height - (screen.height >> 1), screen.width >> 1, screen.height >> 1, skipDraw)
                    break;
                case CameraRegion.VerticalLeftHalf:
                    this.renderCamera(camera, 0, 0, screen.width >> 1, screen.height, skipDraw);
                    break;
                case CameraRegion.VerticalRightHalf:
                    this.renderCamera(camera, screen.width - (screen.width >> 1), 0, screen.width >> 1, screen.height, skipDraw);
                    break;
                case CameraRegion.VerticalLeftThird:
                    this.renderCamera(camera, 0, 0, Math.idiv(screen.width, 3), screen.height, skipDraw);
                    break;
                case CameraRegion.VerticalMiddleThird:
                    this.renderCamera(camera, Math.idiv(screen.width, 3), 0, screen.width - (Math.idiv(screen.width, 3) << 1), screen.height, skipDraw);
                    break;
                case CameraRegion.VerticalRightThird:
                    this.renderCamera(camera, screen.width - Math.idiv(screen.width, 3), 0, Math.idiv(screen.width, 3), screen.height, skipDraw);
                    break;
                case CameraRegion.VerticalQuarter1:
                    this.renderCamera(camera, 0, 0, screen.width >> 2, screen.height, skipDraw);
                    break;
                case CameraRegion.VerticalQuarter2:
                    this.renderCamera(camera, screen.width >> 2, 0, screen.width >> 2, screen.height, skipDraw);
                    break;
                case CameraRegion.VerticalQuarter3:
                    this.renderCamera(camera, screen.width >> 1, 0, screen.width >> 2, screen.height, skipDraw);
                    break;
                case CameraRegion.VerticalQuarter4:
                    this.renderCamera(camera, 3 * (screen.width >> 2), 0, screen.width - 3 * (screen.width >> 2), screen.height, skipDraw);
                    break;
                case CameraRegion.HorizontalTopHalf:
                    this.renderCamera(camera, 0, 0, screen.width, screen.height >> 1, skipDraw);
                    break;
                case CameraRegion.HorizontalBottomHalf:
                    this.renderCamera(camera, 0, screen.height >> 1, screen.width, screen.height - (screen.height >> 1), skipDraw);
                    break;
                case CameraRegion.HorizontalTopThird:
                    this.renderCamera(camera, 0, 0, screen.width, Math.idiv(screen.height, 3), skipDraw);
                    break;
                case CameraRegion.HorizontalMiddleThird:
                    this.renderCamera(camera, 0, Math.idiv(screen.height, 3), screen.width, Math.idiv(screen.height, 3), skipDraw);
                    break;
                case CameraRegion.HorizontalBottomThird:
                    this.renderCamera(camera, 0, Math.idiv(screen.height, 3) << 1, screen.width, screen.height - (Math.idiv(screen.height, 3) << 1), skipDraw);
                    break;
                case CameraRegion.HorizontalQuarter1:
                    this.renderCamera(camera, 0, 0, screen.width, screen.height >> 2, skipDraw);
                    break;
                case CameraRegion.HorizontalQuarter2:
                    this.renderCamera(camera, 0, screen.height >> 2, screen.width, screen.height >> 2, skipDraw);
                    break;
                case CameraRegion.HorizontalQuarter3:
                    this.renderCamera(camera, 0, screen.height >> 1, screen.width, screen.height >> 2, skipDraw);
                    break;
                case CameraRegion.HorizontalQuarter4:
                    this.renderCamera(camera, 0, 3 * (screen.height >> 2), screen.width, screen.height - 3 * (screen.height >> 2), skipDraw);
                    break;
            }
        }

        protected renderCamera(camera: CameraState, left: number, top: number, width: number, height: number, skipDraw: boolean) {
            camera.renderWidth = width;
            camera.renderHeight = height;

            if (skipDraw) return;

            this.realScreen = screen;
            this.realCamera = game.currentScene().camera
            screen = this.fakeScreen
            game.currentScene().camera = camera.camera

            this.isRendering = true;
            // black magic
            game.currentScene().flags &= ~(scene.Flag.IsRendering)
            try {
                game.currentScene().render();
            }
            catch {
            }
            this.isRendering = false;

            screen = this.realScreen;
            game.currentScene().camera = this.realCamera;
            this.realScreen.fillRect(left, top, width, height, 15);

            const x = camera.camera.sprite ? camera.camera.sprite.x : camera.camera.x;
            const y = camera.camera.sprite ? camera.camera.sprite.y : camera.camera.y;

            const fakeLeft = Math.min(Math.max(x - camera.camera.left - (width >> 1), 0), screen.width - width) | 0;
            const fakeTop = Math.min(Math.max(y - camera.camera.top - (height >> 1), 0), screen.height - height) | 0;

            this.realScreen.blit(left, top, width, height, this.fakeScreen, fakeLeft, fakeTop, width, height, false, false);

            if (this.borderColor) {
                screen.drawRect(left - 1, top - 1, width + 2, height + 2, this.borderColor)
            }
        }
    }

    let stateStack: SplitScreenState[];

    /**
     * Adds a splitscreen camera to a game
     */
    //% blockId="splitscreencamerafollowsprite"
    //% block="split screen camera follow $sprite"
    //% deprecated=1
    export function splitScreenCameraFollow(sprite: Sprite) {
        cameraFollowSprite(Camera.Camera1, sprite);
    }

    /**
     * Anchors a splitscreen camera on a sprite
     */
    //% blockId=splitscreensetcanerasprite
    //% block="camera $camera follow $sprite"
    //% camera.shadow=splitscreen_camerashadow
    //% sprite.shadow=variables_get
    //% sprite.defl=mySprite
    //% weight=100
    export function cameraFollowSprite(camera: number, sprite: Sprite) {
        state().cameras[camera].camera.sprite = sprite;
        state().cameras[camera].enabled = true;
    }

    /**
     * Sets a splitscreen camera's position
     */
    //% blockId=splitscreencentercameraat
    //% block="center camera $camera at x $x y $y"
    //% camera.shadow=splitscreen_camerashadow
    //% weight=90
    export function centerCameraAt(camera: number, x: number, y: number) {
        const cameraState = state().cameras[camera];
        cameraState.camera.sprite = undefined;
        cameraState.camera.offsetX = x - (screen.width >> 1);
        cameraState.camera.offsetY = y - (screen.height >> 1);
        cameraState.enabled = true;
    }

     /**
     * Applies screenshake to a splitscreen camera
     */
    //% blockId=splitscreencamerashake
    //% block="camera $camera shake by $amplitude pixels for $duration ms"
    //% amplitude.min=1
    //% amplitude.max=8
    //% amplitude.defl=4
    //% duration.shadow=timePicker
    //% duration.defl=500
    //% camera.shadow=splitscreen_camerashadow
    //% weight=80
    export function cameraShake(camera: number, amplitude: number = 4, duration: number = 500) {
        const cameraState = state().cameras[camera];
        cameraState.camera.shake(amplitude, duration);
        cameraState.enabled = true;
    }

    /**
     * Sets the region of the screen this camera should be drawn to
     */
    //% blockId=splitscreensetcameraregion
    //% block="set camera $camera region to $region"
    //% camera.shadow=splitscreen_camerashadow
    //% region.shadow=splitscreen_cameraregionshadow
    //% weight=70
    export function setCameraRegion(camera: number, region: number) {
        state().cameras[camera].region = region;
    }

    /**
     * Turns the splitscreen camera rendering on and off
     */
    //% blockId=splitscreencamerasetenabled
    //% block="set split screen enabled $enabled"
    //% weight=60
    export function setSplitScreenEnabled(enabled: boolean) {
        state().enabled = enabled;
    }

    /**
     * Sets the border color that is drawn around each camera. If set to
     * transparency, no border will be rendered.
     */
    //% blockId=splitscreensetBorderColor
    //% block="set border color $color"
    //% color.shadow=colorindexpicker
    //% weight=50
    export function setBorderColor(color: number) {
        state().borderColor = color;
    }

    //% blockId=splitscreen_camerashadow
    //% block="$camera"
    //% shim=TD_ID
    //% weight=10
    export function _cameraShadow(camera: Camera) {
        return camera;
    }

    //% blockId=splitscreen_cameraregionshadow
    //% block="$region"
    //% shim=TD_ID
    //% weight=5
    export function _cameraRegionShadow(region: CameraRegion) {
        return region;
    }

    function init() {
        if (stateStack) return;
        stateStack = [new SplitScreenState()];

        game.addScenePushHandler(() => {
            stateStack.push(new SplitScreenState());
        });

        game.addScenePopHandler(() => {
            stateStack.pop();
            if (stateStack.length === 0) stateStack.push(new SplitScreenState());
        });
    }

    function state() {
        init();
        return stateStack[stateStack.length - 1];
    }

    let rowBuff: Buffer;
    function shiftScreen(target: Image, numPixels: number) {
        if (!rowBuff) rowBuff = control.createBuffer(screen.height);
        for (let x = 0; x < target.width - numPixels; x++) {
            target.getRows(x + numPixels, rowBuff);
            target.setRows(x, rowBuff);
        }
    }
}
