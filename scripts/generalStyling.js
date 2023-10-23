import {
    orthographicCamera, perspectiveCamera, renderer, setTransformControlsEnabled,
    simulation, transformControls,
} from "./main.js";

import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import {setTooltipPosition} from "./styling/right-bar-styling.js";
import {hideModal} from "./styling/create-event-modal-styling.js";
import {tutorial} from "./tutorial.js";

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

    tutorial.handleResize();
}


document.addEventListener("click", (event) => {
    const tutorialAllowedElements = [
        tutorial.currentStepClickEventTarget,
        document.getElementById("close-tutorial-button"),
        document.getElementById("step-tutorial-left"),
        document.getElementById("step-tutorial-right")
    ];

    if (tutorial.currentStep !== 0 && !tutorialAllowedElements.includes(event.target)) {
        event.preventDefault();
        event.stopPropagation();
    } else {
        if (event.target === document.getElementById("create-event-overlay")) {
            hideModal();
        }
    }
}, true)

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

document.addEventListener("keypress", (event) => {
    if (!["BUTTON", "INPUT"].includes(document.activeElement.tagName) && event.code === "Space") {
        document.getElementById("top-play").click();
    }
})

// Wait for font icons to load before starting tutorial
document.fonts.ready.then(() => {
    if (localStorage.getItem('hasSeenTutorial') !== "true") {
        tutorial.setStep1();
    }
})

document.getElementById("close-mobile-overlay-button").onclick = () => {
    document.getElementById("mobile-overlay").classList.add("collapsed");
}