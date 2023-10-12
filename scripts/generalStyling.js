import {
    orthographicCamera, perspectiveCamera, renderer, setTransformControlsEnabled,
    simulation, transformControls,
} from "./main.js";

import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import {setTooltipPosition} from "./styling/right-bar-styling.js";
import {hideModal} from "./styling/create-event-modal-styling.js";

window.onresize = () => {
    const emSize = parseInt(getComputedStyle(document.getElementById("viewportCanvas")).fontSize);

    renderer.setSize(window.innerWidth - 3 * emSize, window.innerHeight - 3 * emSize);

    const aspectRatio = parseInt(window.innerWidth - 3 * emSize) / parseInt(window.innerHeight - 3 * emSize);

    orthographicCamera.left = 40 * aspectRatio / -2;
    orthographicCamera.right = 40 * aspectRatio / 2;
    orthographicCamera.top = 40 / 2;
    orthographicCamera.bottom = 40 / -2;

    perspectiveCamera.aspect = aspectRatio;

    orthographicCamera.updateProjectionMatrix();
    perspectiveCamera.updateProjectionMatrix();

    setTooltipPosition();
}

window.onclick = (event) => {
    const overlay = document.getElementById("create-event-overlay")

    if (event.target === overlay) {
        hideModal();
    }
}

document.getElementById("viewportCanvas").onclick = (event) => {
    if (simulation.selectedModeElement) {
        // Get intercepted objects
        const xPos = (event.offsetX / parseInt(window.getComputedStyle(event.target).width)) * 2 - 1;
        const yPos = -(event.offsetY / parseInt(window.getComputedStyle(event.target).height)) * 2 + 1;

        const mouseVector = new THREE.Vector2(xPos, yPos);
        const rayCaster = new THREE.Raycaster();

        rayCaster.setFromCamera(mouseVector, simulation.camera);

        const intersectedObjectInScene = rayCaster.intersectObjects(simulation.scene.children)[0]?.object;

        if (intersectedObjectInScene) {
            const intersectedObject = simulation.objects.find(object => object.mesh.id === intersectedObjectInScene?.id);

            if (simulation.selectedObject !== intersectedObject) {
                simulation.selectObject(intersectedObject);
            }

            transformControls.attach(intersectedObject.mesh);
            setTransformControlsEnabled(true);
        }
    }
}