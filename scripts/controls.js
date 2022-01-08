import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';

class flyControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.movingSpeed = 1;
        this.domElement = domElement;

        // let scope = this;
        // let canvas = document.getElementById("viewportCanvas");

        // function handleKeyDown(event){
        //     let cameraDirection = new THREE.Vector3();
        //     console.log(event.key)
            
        //     camera.getWorldDirection(cameraDirection);
        //     let rotatedVector = new THREE.Vector3(cameraDirection.z, cameraDirection.x, cameraDirection.y);
        //     let doubleRotated = new THREE.Vector3(cameraDirection.x, cameraDirection.z, cameraDirection.y);
        //     // switch (event.key) {
        //     //     case 'w':
        //     //         camera.position.add(cameraDirection.multiplyScalar(scope.movingSpeed));
        //     //         break;
        //     //     case 's':
        //     //         camera.position.sub(cameraDirection.multiplyScalar(scope.movingSpeed));
        //     //         break;
        //     //     case 'a':
        //     //         camera.position.add(rotatedVector.multiplyScalar(scope.movingSpeed));
        //     //         break;
        //     //     case 'd':
        //     //         camera.position.sub(rotatedVector.multiplyScalar(scope.movingSpeed));
        //     //         break;
        //     //     case ' ':
        //     //         camera.position.sub(doubleRotated.multiplyScalar(scope.movingSpeed));
        //     //         break;
        //     //     case 'c':
        //     //         camera.position.add(doubleRotated.multiplyScalar(scope.movingSpeed));
        //     //         break;
        //     //     case 'q':
        //     //         camera.rotation.y += Math.PI / 128;
        //     //         break;
        //     //     case 'e':
        //     //         camera.rotation.y -= Math.PI / 128;
        //     //     default:
        //     //         break;
        //     // }
        // }

        // function handleMouseMove(event){
        //     // let mouseVector = new THREE.Vector2();
        //     // let rayCaster = new THREE.Raycaster();

        //     // mouseVector.x = (event.offsetX / parseInt(window.getComputedStyle(canvas).width)) * 2 - 1;
        //     // mouseVector.y = -(event.offsetY / parseInt(window.getComputedStyle(canvas).height)) * 2 + 1;

        //     // rayCaster.setFromCamera(mouseVector, camera);
        //     // console.log(rayCaster.ray.direction)
        //     // camera.lookAt(rayCaster.ray.direction.multiplyScalar(100));
        // }

        // function initEvents(){
        //     scope.domElement.ownerDocument.addEventListener('keydown', handleKeyDown);
        //     scope.domElement.ownerDocument.addEventListener("mousemove", handleMouseMove);
        // }

        // initEvents();
    }
}
export {flyControls}