import {INITIAL_ROTATION} from "../constants/SKEL.js";

export class Interact {
    constructor(elem, setRotation, onSelect, camera, scene) {
        this.camera = camera;
        this.scene = scene;
        this.setRotation = setRotation;
        this.onSelect = onSelect;
        this.elem = elem;
        this.mouse = new THREE.Vector2(0, 0);
        this.touch = new THREE.Vector2(0, 0);
        this.deltaMouse = new THREE.Vector2(0, 0);
        this.deltaTouch = new THREE.Vector2(0, 0);
        this.totalDeltaMouse = 0;
        this.totalDeltaTouch = 0;
        this.mouseDown = false;
        this.touchDown = false;
        this.theta = INITIAL_ROTATION;
        this.deltaTheta = 0;
        this.target = new THREE.Vector3(0, 0, 0);
        this.radius = 300;
        this.rotateSpeed = {mouse: 3, touch: 1.5};

        this.elem.addEventListener('mousedown', this.onMouseDown, false);
        this.elem.addEventListener('touchstart', this.onTouchStart, false);
    }

    onMouseDown = (event) => {
        this.mouseDown = true;
        this.totalDeltaMouse = 0;

        this.elem.addEventListener('mousemove', this.onMouseMove, false);
        this.elem.addEventListener('mouseup', this.onMouseUp, false);
        this.elem.addEventListener('mouseout', this.onMouseOut, false);
        this.mouse.x = event.clientX;
        this.mouse.y = event.clientY;

    };

    onTouchStart = (event) => {
            this.touchDown = true;
            this.totalDeltaTouch = 0;

            this.touch.x = event.touches[0].clientX;
            this.touch.y = event.touches[0].clientY;

            this.elem.addEventListener('touchmove', this.onTouchMove, false);
            this.elem.addEventListener('touchend', this.onTouchEnd, false);
            this.elem.addEventListener('touchcancel', this.onTouchCancel, false);
    };

    onMouseMove = (event) => {
        if (this.mouseDown) {
            this.deltaMouse.x = event.clientX - this.mouse.x;
            this.deltaMouse.y = event.clientY - this.mouse.y;

            this.totalDeltaMouse += this.deltaMouse.length();

            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;

            this.deltaTheta = this.deltaMouse.x / this.radius;

            this.theta -= this.deltaTheta * this.rotateSpeed.mouse;
            this.setRotation(this.theta);
        }
    };

    onTouchMove = (event) => {
        if (this.touchDown) {
            this.deltaTouch.x = event.touches[0].clientX - this.touch.x;
            this.deltaTouch.y = event.touches[0].clientY - this.touch.y;

            this.totalDeltaTouch += this.deltaTouch.length();

            this.touch.x = event.touches[0].clientX;
            this.touch.y = event.touches[0].clientY;

            this.deltaTheta = this.deltaTouch.x / this.radius;

            this.theta -= this.deltaTheta * this.rotateSpeed.touch;
            this.setRotation(this.theta);
        }
    };

    onMouseUp = (event) => {
        let mousePosition = new THREE.Vector2();
        const offsetLeft = event.target.offsetLeft + event.target.offsetParent.offsetLeft;
        const offsetTop = event.target.offsetTop + event.target.offsetParent.offsetTop;
        mousePosition.x = ((event.clientX - offsetLeft) / this.elem.clientWidth) * 2 - 1;
        mousePosition.y = -((event.clientY - offsetTop) / this.elem.clientHeight) * 2 + 1;
        let rayCaster = new THREE.Raycaster();
        rayCaster.setFromCamera(mousePosition, this.camera);
        let intersects = rayCaster.intersectObjects([this.scene.getObjectByName('wall')]);

        if (this.totalDeltaMouse < 10 && intersects.length > 0 && 0.05 <= intersects[0].uv.x && intersects[0].uv.x <= 0.25) {
            const y = intersects[0].uv.y;
            //Choose which skeleton to select
            if (y < 0.25) {
                this.onSelect(3);
            } else if (y < 0.5) {
                this.onSelect(2);
            } else if (y < 0.75) {
                this.onSelect(1);
            } else {
                this.onSelect(0);
            }
        }
        this.disposeListeners(event);
    };

    onTouchEnd = (event) => {
        let mousePosition = new THREE.Vector2();
        const offsetLeft = event.target.offsetLeft + event.target.offsetParent.offsetLeft;
        const offsetTop = event.target.offsetTop + event.target.offsetParent.offsetTop;
        mousePosition.x = ((event.clientX - offsetLeft) / this.elem.clientWidth) * 2 - 1;
        mousePosition.y = -((event.clientY - offsetTop) / this.elem.clientHeight) * 2 + 1;
        let rayCaster = new THREE.Raycaster();
        rayCaster.setFromCamera(mousePosition, this.camera);
        let intersects = rayCaster.intersectObjects([this.scene.getObjectByName('wall')]);

        if (this.totalDeltaTouch < 10 && intersects.length > 0 && 0.05 <= intersects[0].uv.x && intersects[0].uv.x <= 0.25) {
            const y = intersects[0].uv.y;
            //Choose which skeleton to select
            if (y < 0.25) {
                this.onSelect(3);
            } else if (y < 0.5) {
                this.onSelect(2);
            } else if (y < 0.75) {
                this.onSelect(1);
            } else {
                this.onSelect(0);
            }
        }
        this.disposeListeners(event);
    };

    onMouseOut = () => {
        this.disposeListeners();
    };

    onTouchCancel = (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.disposeListeners();
    };

    disposeListeners() {
        this.mouseDown = false;
        this.touchDown = false;
        this.deltaTheta = 0;

        this.elem.removeEventListener('mousemove', this.onMouseMove, false);
        this.elem.removeEventListener('mouseup', this.onMouseUp, false);
        this.elem.removeEventListener('mouseout', this.onMouseOut, false);
        this.elem.removeEventListener('touchmove', this.onTouchMove, false);
        this.elem.removeEventListener('touchend', this.onTouchEnd, false);
        this.elem.removeEventListener('touchcancel', this.onTouchCancel, false);
    }
}
