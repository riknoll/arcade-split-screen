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
        camera: SplitScreenCamera;
        enabled: boolean;
        region: CameraRegion;
        renderWidth: number;
        renderHeight: number;
        renderLeft: number;
        renderTop: number;
        constructor() {
            this.camera = new SplitScreenCamera();
            this.enabled = false;
            this.renderWidth = 0;
            this.renderHeight = 0;
            this.renderLeft = 0;
            this.renderTop = 0;
        }
    }

    class SplitScreenSprite extends sprites.ExtendableSprite {
        cameras: CameraState[];
        enabled: boolean;
        borderColor: number;

        splitScreenZIndex: number;
        defaultCamera: CameraState;

        constructor() {
            super(img`.`);
            this.cameras = [
                new CameraState(),
                new CameraState(),
                new CameraState(),
                new CameraState()
            ];

            this.borderColor = 1;
            this.setDimensions(screen.width, screen.height);
            this.left = 0;
            this.top = 0;
            this.z = 99;
            this.splitScreenZIndex = 99;

            this.flags |= SpriteFlag.Ghost | SpriteFlag.RelativeToCamera;
        }

        setRenderSize(width: number, height: number) {
            this.setDimensions(width, height);
            this.render(0, 0, true);
        }

        update(deltaTimeMillis: number): void {
            for (const camera of this.cameras) {
                if (camera.enabled) {
                    camera.camera.update();
                }
            }
        }

        draw(drawLeft: number, drawTop: number) {
            if (SplitScreenCamera.currentRenderIsCamera) {
                return;
            }
            this.render(drawLeft, drawTop);
        }

        getCameraProperty(camera: number, property: CameraProperty) {
            const state = this.cameras[camera];

            if (!state.enabled) return 0;
            if (!state.renderHeight) this.render(0, 0, true);

            return state.camera.getProperty(property);
        }

        protected render(left: number, top: number, skipDraw = false) {
            if (!this.enabled) return;

            const toRender = this.cameras.filter(c => c.enabled);

            if (toRender.length === 1) {
                if (!this.defaultCamera) {
                    this.defaultCamera = new CameraState();
                }
                const sceneCamera = game.currentScene().camera;
                this.defaultCamera.camera.sprite = sceneCamera.sprite;
                if ((sceneCamera as any).shakeStartTime !== undefined) {
                    this.defaultCamera.camera.shake(
                        (sceneCamera as any).shakeAmplitude,
                        (sceneCamera as any).shakeDuration
                    )
                }

                this.defaultCamera.camera.update();
                toRender.unshift(this.defaultCamera);

                this.renderCameraRegion(toRender[0], CameraRegion.VerticalLeftHalf, left, top, skipDraw);
                this.renderCameraRegion(toRender[1], CameraRegion.VerticalRightHalf, left, top, skipDraw);
            }
            else if (toRender.length === 2) {
                this.renderCameraRegion(toRender[0], CameraRegion.VerticalLeftHalf, left, top, skipDraw);
                this.renderCameraRegion(toRender[1], CameraRegion.VerticalRightHalf, left, top, skipDraw);
            }
            else if (toRender.length === 3) {
                this.renderCameraRegion(toRender[0], CameraRegion.VerticalLeftThird, left, top, skipDraw);
                this.renderCameraRegion(toRender[1], CameraRegion.VerticalMiddleThird, left, top, skipDraw);
                this.renderCameraRegion(toRender[2], CameraRegion.VerticalRightThird, left, top, skipDraw);
            }
            else if (toRender.length === 4) {
                this.renderCameraRegion(toRender[0], CameraRegion.TopLeft, left, top, skipDraw);
                this.renderCameraRegion(toRender[1], CameraRegion.TopRight, left, top, skipDraw);
                this.renderCameraRegion(toRender[2], CameraRegion.BottomLeft, left, top, skipDraw);
                this.renderCameraRegion(toRender[3], CameraRegion.BottomRight, left, top, skipDraw);
            }

            if (!skipDraw) {
                for (const camera of toRender) {
                    this.drawCamera(camera);
                }
            }
        }

        protected renderCameraRegion(camera: CameraState, defaultRegion: CameraRegion, drawLeft: number, drawTop: number, skipDraw: boolean) {
            switch (camera.region == undefined ? defaultRegion : camera.region) {
                case CameraRegion.TopLeft:
                    this.renderCamera(camera, drawLeft, drawTop, this.width >> 1, this.height >> 1, skipDraw)
                    break;
                case CameraRegion.TopRight:
                    this.renderCamera(camera, drawLeft + (this.width - (this.width >> 1)), drawTop, this.width >> 1, this.height >> 1, skipDraw)
                    break;
                case CameraRegion.BottomLeft:
                    this.renderCamera(camera, drawLeft, drawTop + (this.height - (this.height >> 1)), this.width >> 1, this.height >> 1, skipDraw)
                    break;
                case CameraRegion.BottomRight:
                    this.renderCamera(camera, drawLeft + (this.width - (this.width >> 1)), drawTop + (this.height - (this.height >> 1)), this.width >> 1, this.height >> 1, skipDraw)
                    break;
                case CameraRegion.VerticalLeftHalf:
                    this.renderCamera(camera, drawLeft, drawTop, this.width >> 1, this.height, skipDraw);
                    break;
                case CameraRegion.VerticalRightHalf:
                    this.renderCamera(camera, drawLeft + this.width - (this.width >> 1), drawTop, this.width >> 1, this.height, skipDraw);
                    break;
                case CameraRegion.VerticalLeftThird:
                    this.renderCamera(camera, drawLeft, drawTop, Math.idiv(this.width, 3), this.height, skipDraw);
                    break;
                case CameraRegion.VerticalMiddleThird:
                    this.renderCamera(camera, drawLeft + Math.idiv(this.width, 3), drawTop, this.width - (Math.idiv(this.width, 3) << 1), this.height, skipDraw);
                    break;
                case CameraRegion.VerticalRightThird:
                    this.renderCamera(camera, drawLeft + this.width - Math.idiv(this.width, 3), drawTop, Math.idiv(this.width, 3), this.height, skipDraw);
                    break;
                case CameraRegion.VerticalQuarter1:
                    this.renderCamera(camera, drawLeft, drawTop, this.width >> 2, this.height, skipDraw);
                    break;
                case CameraRegion.VerticalQuarter2:
                    this.renderCamera(camera, drawLeft + (this.width >> 2), drawTop, this.width >> 2, this.height, skipDraw);
                    break;
                case CameraRegion.VerticalQuarter3:
                    this.renderCamera(camera, drawLeft + (this.width >> 1), drawTop, this.width >> 2, this.height, skipDraw);
                    break;
                case CameraRegion.VerticalQuarter4:
                    this.renderCamera(camera, drawLeft + 3 * (this.width >> 2), drawTop, this.width - 3 * (this.width >> 2), this.height, skipDraw);
                    break;
                case CameraRegion.HorizontalTopHalf:
                    this.renderCamera(camera, drawLeft, drawTop, this.width, this.height >> 1, skipDraw);
                    break;
                case CameraRegion.HorizontalBottomHalf:
                    this.renderCamera(camera, drawLeft, drawTop + (this.height >> 1), this.width, this.height - (this.height >> 1), skipDraw);
                    break;
                case CameraRegion.HorizontalTopThird:
                    this.renderCamera(camera, drawLeft, drawTop, this.width, Math.idiv(this.height, 3), skipDraw);
                    break;
                case CameraRegion.HorizontalMiddleThird:
                    this.renderCamera(camera, drawLeft, drawTop + Math.idiv(this.height, 3), this.width, Math.idiv(this.height, 3), skipDraw);
                    break;
                case CameraRegion.HorizontalBottomThird:
                    this.renderCamera(camera, drawLeft, drawTop + (Math.idiv(this.height, 3) << 1), this.width, this.height - (Math.idiv(this.height, 3) << 1), skipDraw);
                    break;
                case CameraRegion.HorizontalQuarter1:
                    this.renderCamera(camera, drawLeft, drawTop, this.width, this.height >> 2, skipDraw);
                    break;
                case CameraRegion.HorizontalQuarter2:
                    this.renderCamera(camera, drawLeft, drawTop + (this.height >> 2), this.width, this.height >> 2, skipDraw);
                    break;
                case CameraRegion.HorizontalQuarter3:
                    this.renderCamera(camera, drawLeft, drawTop + (this.height >> 1), this.width, this.height >> 2, skipDraw);
                    break;
                case CameraRegion.HorizontalQuarter4:
                    this.renderCamera(camera, drawLeft, drawTop + 3 * (this.height >> 2), this.width, this.height - 3 * (this.height >> 2), skipDraw);
                    break;
            }
        }

        protected renderCamera(camera: CameraState, left: number, top: number, width: number, height: number, skipDraw: boolean) {
            camera.renderWidth = width;
            camera.renderHeight = height;
            camera.renderLeft = left;
            camera.renderTop = top;
            camera.camera.setDimensions(width, height);

            if (skipDraw) return;

            camera.camera.renderAtZIndex(this.splitScreenZIndex);
        }

        drawCamera(camera: CameraState) {
            screen.drawImage(camera.camera.image, camera.renderLeft, camera.renderTop)

            if (this.borderColor) {
                screen.drawRect(camera.renderLeft - 1, camera.renderTop - 1, camera.renderWidth + 2, camera.renderHeight + 2, this.borderColor)
            }
        }

        destroy(effect?: effects.ParticleEffect, duration?: number): void {
            super.destroy(effect, duration);
            for (const camera of this.cameras) {
                camera.camera.destroy();
            }
            if (this.defaultCamera) {
                this.defaultCamera.camera.destroy();
            }
        }
    }

    class CameraViewSprite extends sprites.ExtendableSprite {
        protected camera: SplitScreenCamera;
        cameraZIndex: number;
        borderColor = 1;

        constructor(width: number, height: number) {
            super(img`.`);
            // make sure the global screen is saved
            state();
            this.cameraZIndex = 99;
            this.camera = new SplitScreenCamera();
            this.camera.setDimensions(width, height);
            this.setImage(this.camera.image);
            this.x = screen.width >> 1;
            this.y = screen.height >> 1;
        }

        cameraFollowSprite(sprite: Sprite) {
            this.camera.sprite = sprite;
            this.camera.update();
        }

        cameraCenterAt(x: number, y: number) {
            this.camera.sprite = undefined;
            this.camera.centerAt(x, y);
            this.camera.update();
        }

        cameraShake(amplitude: number, duration: number) {
            this.camera.shake(amplitude, duration);
        }

        getCameraProperty(property: CameraProperty) {
            return this.camera.getProperty(property);
        }

        update(deltaTimeMillis: number): void {
            this.camera.update();
        }

        draw(drawLeft: number, drawTop: number) {
            if (SplitScreenCamera.currentRenderIsCamera) {
                return;
            }

            this.camera.renderAtZIndex(this.cameraZIndex);

            screen.fillRect(drawLeft, drawTop, this.width, this.height, 0);
            super.draw(drawLeft, drawTop);
            if (this.borderColor) {
                screen.drawRect(drawLeft - 1, drawTop - 1, this.width + 2, this.height + 2, this.borderColor)
            }
        }

        destroy(effect?: effects.ParticleEffect, duration?: number): void {
            super.destroy(effect, duration);
            this.camera.destroy();
        }
    }

    class SplitScreenCamera extends scene.Camera {
        image: Image;
        renderable: scene.Renderable;
        isRendering: boolean;

        static currentRenderIsCamera = false;

        constructor() {
            super();
            this.image = screen;

            this.renderable = scene.createRenderable(0, () => {
                this.render()
            })
        }

        setOffsetX(v: number) {
            const scene = game.currentScene();
            if (scene.tileMap && scene.tileMap.enabled) {
                this._offsetX = Math.floor(
                    Math.clamp(0, Math.max(scene.tileMap.areaWidth() - this.image.width, 0), v)
                );
            } else {
                this._offsetX = Math.floor(v);
            }
        }
        setOffsetY(v: number) {
            const scene = game.currentScene();
            if (scene.tileMap && scene.tileMap.enabled) {
                this._offsetY = Math.floor(
                    Math.clamp(0, Math.max(scene.tileMap.areaHeight() - this.image.height, 0), v)
                );
            } else {
                this._offsetY = Math.floor(v);
            }
        }

        get x() {
            return this.offsetX + (this.image.width >> 1);
        }
        get y() {
            return this.offsetY + (this.image.height >> 1);
        }
        get right() {
            return this.offsetX + this.image.width;
        }
        get bottom() {
            return this.offsetY + this.image.height;
        }

        centerAt(x: number, y: number) {
            this.sprite = undefined;
            this.setOffsetX(x - (this.image.width >> 1));
            this.setOffsetY(y - (this.image.height >> 1));
        }

        update() {
            // if sprite, follow sprite
            if (this.sprite) {
                this._lastUpdatedSpriteX = this.sprite.x;
                this._lastUpdatedSpriteY = this.sprite.y;
                this.setOffsetX(this.sprite.left + (this.sprite.width >> 1) - (this.image.width >> 1));
                this.setOffsetY(this.sprite.top + (this.sprite.height >> 1) - (this.image.height >> 1));
            }
            else {
                this.setOffsetX(this._offsetX);
                this.setOffsetY(this._offsetY);
            }

            this.drawOffsetX = this._offsetX;
            this.drawOffsetY = this._offsetY;

            // apply shake if needed
            if (this.shakeStartTime !== undefined) {
                const elapsed = control.millis() - this.shakeStartTime;
                if (elapsed >= this.shakeDuration) {
                    // we are done!
                    this.shakeStartTime = undefined;
                } else {
                    // compute new shake
                    const percentComplete = elapsed / this.shakeDuration;
                    const dampStart = 0.75;
                    let damp = 1;
                    if (percentComplete >= dampStart)
                        damp = Math.max(0, 1 - percentComplete);
                    const f = this.shakeAmplitude * damp;
                    const x = (Math.random() * f) >> 0;
                    const y = (Math.random() * f) >> 0;
                    // apply to offset
                    this.drawOffsetX += x;
                    this.drawOffsetY += y;
                }
            }
        }

        setDimensions(width: number, height: number) {
            if (this.image === screen || this.image.width !== width || this.image.height !== height) {
                const centerX = this.x;
                const centerY = this.y;
                this.image = image.create(width, height);
                if (!this.sprite) {
                    this.centerAt(centerX, centerY);
                }

                this.update()
            }
        }

        renderAtZIndex(z: number) {
            this.image.fill(0);
            this.renderable.z = z;

            this.update();

            const currentScene = game.currentScene();
            currentScene.allSprites.removeElement(this.renderable);

            let didInsert = false;
            for (let i = 0; i < currentScene.allSprites.length; i++) {
                const s = currentScene.allSprites[i];
                if (s.z >= z) {
                    currentScene.allSprites.insertAt(i, this.renderable);
                    didInsert = true;
                    break;
                }
            }
            if (!didInsert) {
                currentScene.allSprites.push(this.renderable);
            }

            const realScreen = screen;
            const realCamera = currentScene.camera;

            screen = this.image as ScreenImage;
            currentScene.camera = this;

            this.isRendering = true;
            SplitScreenCamera.currentRenderIsCamera = true;
            // black magic
            currentScene.flags &= ~(scene.Flag.IsRendering)
            try {
                currentScene.render();
            }
            catch (e) {
                if (e !== "cancelled") throw e;
            }
            finally {
                this.isRendering = false;
                SplitScreenCamera.currentRenderIsCamera = false;

                screen = realScreen;
                currentScene.camera = realCamera;
            }
        }

        getProperty(property: CameraProperty) {
            const x = this.sprite ? this.sprite.x : this.offsetX + (this.image.width >> 1);
            const y = this.sprite ? this.sprite.y : this.offsetY + (this.image.height >> 1);

            switch (property) {
                case CameraProperty.X:
                    return x;
                case CameraProperty.Y:
                    return y;
                case CameraProperty.Left:
                    return this.offsetX;
                case CameraProperty.Right:
                    return this.offsetX + this.image.width;
                case CameraProperty.Top:
                    return this.offsetY;
                case CameraProperty.Bottom:
                    return this.offsetY + this.image.height;
            }
        }

        destroy() {
            this.renderable.destroy();
            this.renderable = undefined;
        }

        protected render() {
            if (this.isRendering) {
                throw "cancelled";
            }
        }
    }

    class SplitScreenState {
        instance: SplitScreenSprite;

        constructor() {
            this.instance = new SplitScreenSprite();
        }
    }

    function _createState() {
        return new SplitScreenState();
    }

    function state() {
        return __util.getState(_createState);
    }

    /**
     * Adds a splitscreen camera to a game
     */
    //% blockId="splitscreencamerafollowsprite"
    //% block="split screen camera follow $sprite"
    //% deprecated=1
    export function splitScreenCameraFollow(sprite: Sprite) {
        initGlobalInstance();
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
    //% group="Global"
    export function cameraFollowSprite(camera: number, sprite: Sprite) {
        initGlobalInstance();
        state().instance.cameras[camera].camera.sprite = sprite;
        state().instance.cameras[camera].enabled = true;
        state().instance.cameras[camera].camera.update();
    }

    /**
     * Sets a splitscreen camera's position
     */
    //% blockId=splitscreencentercameraat
    //% block="center camera $camera at x $x y $y"
    //% camera.shadow=splitscreen_camerashadow
    //% weight=90
    //% group="Global"
    export function centerCameraAt(camera: number, x: number, y: number) {
        initGlobalInstance();
        const cameraState = state().instance.cameras[camera];
        (cameraState.camera as SplitScreenCamera).centerAt(x, y);
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
    //% group="Global"
    export function cameraShake(camera: number, amplitude: number = 4, duration: number = 500) {
        initGlobalInstance();
        const cameraState = state().instance.cameras[camera];
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
    //% group="Global"
    export function setCameraRegion(camera: number, region: number) {
        initGlobalInstance();
        state().instance.cameras[camera].region = region;
    }

    /**
     * Turns the splitscreen camera rendering on and off
     */
    //% blockId=splitscreencamerasetenabled
    //% block="set split screen enabled $enabled"
    //% weight=60
    //% group="Global"
    export function setSplitScreenEnabled(enabled: boolean) {
        initGlobalInstance();
        state().instance.enabled = enabled;
    }

    /**
     * Sets the border color that is drawn around each camera. If set to
     * transparency, no border will be rendered.
     */
    //% blockId=splitscreensetBorderColor
    //% block="set border color $color"
    //% color.shadow=colorindexpicker
    //% weight=50
    //% group="Global"
    export function setBorderColor(color: number) {
        initGlobalInstance();
        state().instance.borderColor = color;
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

    //% blockId=splitscreen_setSplitScreenZIndex
    //% block="set split screen to capture everything below z $z"
    //% z.defl=99
    //% weight=40
    //% group="Global"
    export function setSplitScreenZIndex(z: number) {
        initGlobalInstance();
        state().instance.splitScreenZIndex = z;
    }

    //% blockId=splitscreen_getSprite
    //% block="split screen sprite"
    //% weight=30
    //% group="Global"
    export function getSprite(): Sprite {
        initGlobalInstance();
        return state().instance;
    }

    //% blockId=splitscreen_getCameraProperty
    //% block="camera $camera $property"
    //% camera.shadow=splitscreen_camerashadow
    //% weight=20
    //% group="Global"
    export function getCameraProperty(camera: number, property: CameraProperty) {
        initGlobalInstance();
        return state().instance.getCameraProperty(camera, property);
    }

    //% blockId=splitscreen_setRenderSize
    //% block="set split screen render size width $width height $height"
    //% width.defl=160
    //% height.defl=120
    //% weight=10
    //% group="Global"
    export function setRenderSize(width: number, height: number) {
        initGlobalInstance();
        state().instance.setRenderSize(width, height);
    }

    //% blockId=splitscreen_createCameraView
    //% block="create camera view sprite width $width height $height"
    //% blockSetVariable=myCameraView
    //% width.defl=160
    //% height.defl=120
    //% weight=100
    //% group="Camera View"
    export function createCameraView(width: number, height: number): Sprite {
        return new CameraViewSprite(width, height);
    }

    //% blockId=splitscreen_cameraViewFollow
    //% block="camera view $cameraView follow sprite $sprite"
    //% cameraView.shadow=variables_get
    //% cameraView.defl=myCameraView
    //% sprite.shadow=variables_get
    //% sprite.defl=mySprite
    //% weight=90
    //% group="Camera View"
    export function cameraViewFollow(cameraView: Sprite, sprite: Sprite) {
        assertCameraViewSprite(cameraView);
        (cameraView as CameraViewSprite).cameraFollowSprite(sprite);
    }

    //% blockId=splitscreen_centerCameraViewAt
    //% block="center camera view $cameraView at x $x y $y"
    //% cameraView.shadow=variables_get
    //% cameraView.defl=myCameraView
    //% weight=80
    //% group="Camera View"
    export function centerCameraViewAt(cameraView: Sprite, x: number, y: number) {
        assertCameraViewSprite(cameraView);
        (cameraView as CameraViewSprite).cameraCenterAt(x, y);
    }

    //% blockId=splitscreen_cameraViewShake
    //% block="camera view $cameraView shake by $amplitude pixels for $duration ms"
    //% cameraView.shadow=variables_get
    //% cameraView.defl=myCameraView
    //% amplitude.min=1
    //% amplitude.max=8
    //% amplitude.defl=4
    //% duration.shadow=timePicker
    //% duration.defl=500
    //% weight=70
    //% group="Camera View"
    export function shakeCameraView(cameraView: Sprite, amplitude: number = 4, duration: number = 500) {
        assertCameraViewSprite(cameraView);
        (cameraView as CameraViewSprite).cameraShake(amplitude, duration);
    }

    //% blockId=splitscreen_cameraViewSetZIndex
    //% block="set camera view $cameraView to capture everything below z $z"
    //% cameraView.shadow=variables_get
    //% cameraView.defl=myCameraView
    //% z.defl=99
    //% weight=60
    //% group="Camera View"
    export function cameraViewSetZIndex(cameraView: Sprite, z: number) {
        assertCameraViewSprite(cameraView);
        (cameraView as CameraViewSprite).cameraZIndex = z;
    }

    //% blockId=splitscreen_getCameraViewProperty
    //% block="$cameraView camera $property"
    //% cameraView.shadow=variables_get
    //% cameraView.defl=myCameraView
    //% weight=50
    //% group="Camera View"
    export function getCameraViewProperty(cameraView: Sprite, property: CameraProperty) {
        assertCameraViewSprite(cameraView);
        return (cameraView as CameraViewSprite).getCameraProperty(property);
    }

    //% blockId=splitscreen_setCameraViewBorderColor
    //% block="set $cameraView border color $color"
    //% cameraView.shadow=variables_get
    //% cameraView.defl=myCameraView
    //% color.shadow=colorindexpicker
    //% weight=40
    //% group="Camera View"
    export function setCameraViewBorderColor(cameraView: Sprite, color: number) {
        assertCameraViewSprite(cameraView);
        (cameraView as CameraViewSprite).borderColor = color;
    }

    function assertCameraViewSprite(sprite: Sprite) {
        if (!(sprite instanceof CameraViewSprite)) {
            throw "sprite must be a camera view sprite";
        }
    }

    function initGlobalInstance() {
        const instance = state().instance;
        if (instance && instance.enabled === undefined) {
            instance.enabled = true;
        }
    }
}