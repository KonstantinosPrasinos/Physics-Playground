import {orbitControls, setDisabledPhysical, setDisabledVisual, simulation, transformControls} from "./main.js";
import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';

/* Helper functions */
const highlightButton = (event) => {
    if (simulation.selectedModeElement) {
        // Deselect previous button
        simulation.selectedModeElement.classList.remove("Button-Selected");

        if (simulation.selectedModeElement !== event.target) {
            // If not the same button then select new button
            event.target.classList.add("Button-Selected");
            simulation.selectedModeElement = event.target;

            transformControls.mode = event.target.id.split("-")[0];
        } else {
            // If it's the same button then just detach transform controls
            transformControls.detach();
            simulation.selectedModeElement = null;
        }
    } else {
        // No button is selected, select this button
        event.target.classList.add("Button-Selected");
        simulation.selectedModeElement = event.target;

        transformControls.mode = event.target.id.split("-")[0];
    }
}

const setSize = (axis, event) => {
    if (event.target.value.length === 0 || isNaN(event.target.value)) {
        event.target.focus();
        // createNotification(notificationList.inputEmpty, true);
    } else {
        if (simulation.selectedObject?.mesh?.geometry.type === "BoxGeometry") {
            simulation.selectedObject.mesh.scale[axis] = parseFloat(event.target.value) / simulation.selectedObject.mesh.geometry.parameters.width;
            simulation.synchronizeSize(axis);
        } else if (simulation.selectedObject?.mesh?.geometry.type === "SphereGeometry") {
            simulation.selectedObject.mesh.scale[axis] = parseFloat(event.target.value) / simulation.selectedObject.mesh.geometry.parameters.radius;
            simulation.synchronizeSize(axis);
        }
    }
}

const setPosition = (axis, event) => {
    if (event.target.value.length === 0 || isNaN(event.target.value)) {
        event.target.focus();
        // createNotification(notificationList.inputEmpty, true);
    } else {
        simulation.selectedObject.mesh.position[axis] = parseFloat(event.target.value);
        simulation.synchronizePosition();
    }
}

const setRotation = (axis, event) => {
    if (event.target.value.length === 0 || isNaN(event.target.value)) {
        event.target.focus();
        // createNotification(notificationList.inputEmpty, true);
    } else {
        simulation.selectedObject.mesh.rotation[axis] = parseFloat(event.target.value);
        simulation.synchronizeRotation();
    }
}

const setVelocity = (axis, event) => {
    if (event.target.value.length === 0 || isNaN(event.target.value)) {
        event.target.focus();
        // createNotification(notificationList.inputEmpty, true);
    } else {
        simulation.selectedObject.body.velocity[axis] = parseFloat(event.target.value);
    }
}

const setAngularVelocity = (axis, event) => {
    if (event.target.value.length === 0 || isNaN(event.target.value)) {
        event.target.focus();
        // createNotification(notificationList.inputEmpty, true);
    } else {
        simulation.selectedObject.body.angularVelocity[axis] = parseFloat(event.target.value);
    }
}

/* Left ui buttons */
document.getElementById("add-cube-button").onclick = simulation.createBox.bind(simulation, 0, 0, 0, 2, 2, 2);
document.getElementById("add-sphere-button").onclick = simulation.createSphere.bind(simulation, 5, 0, 0, 1);

/* Add enter functionality to right ui inputs */
const blurElementOnEnter = (event) => {
    if (event.keyCode === 13) {
        event.target.blur();
    }
}

document.getElementById("width-input").onkeydown = blurElementOnEnter;
document.getElementById("height-input").onkeydown = blurElementOnEnter;
document.getElementById("depth-input").onkeydown = blurElementOnEnter;

document.getElementById("position-x-input").onkeydown = blurElementOnEnter;
document.getElementById("position-y-input").onkeydown = blurElementOnEnter;
document.getElementById("position-z-input").onkeydown = blurElementOnEnter;

document.getElementById("rotation-x-input").onkeydown = blurElementOnEnter;
document.getElementById("rotation-y-input").onkeydown = blurElementOnEnter;
document.getElementById("rotation-z-input").onkeydown = blurElementOnEnter;

document.getElementById("velocity-x-input").onkeydown = blurElementOnEnter;
document.getElementById("velocity-y-input").onkeydown = blurElementOnEnter;
document.getElementById("velocity-z-input").onkeydown = blurElementOnEnter;

document.getElementById("angular-velocity-x-input").onkeydown = blurElementOnEnter;
document.getElementById("angular-velocity-y-input").onkeydown = blurElementOnEnter;
document.getElementById("angular-velocity-z-input").onkeydown = blurElementOnEnter;

/* Right ui inputs */
document.getElementById("width-input").onblur = (event) => setSize("x", event);
document.getElementById("height-input").onblur = (event) => setSize("y", event);
document.getElementById("depth-input").onblur = (event) => setSize("z", event);

document.getElementById("position-x-input").onblur = (event) => setPosition("x", event);
document.getElementById("position-y-input").onblur = (event) => setPosition("y", event);
document.getElementById("position-z-input").onblur = (event) => setPosition("z", event);

document.getElementById("rotation-x-input").onblur = (event) => setRotation("x", event);
document.getElementById("rotation-y-input").onblur = (event) => setRotation("y", event);
document.getElementById("rotation-z-input").onblur = (event) => setRotation("z", event);

document.getElementById("velocity-x-input").onblur = (event) => setVelocity("x", event);
document.getElementById("velocity-y-input").onblur = (event) => setVelocity("y", event);
document.getElementById("velocity-z-input").onblur = (event) => setVelocity("z", event);

document.getElementById("angular-velocity-x-input").onblur = (event) => setAngularVelocity("x", event);
document.getElementById("angular-velocity-y-input").onblur = (event) => setAngularVelocity("y", event);
document.getElementById("angular-velocity-z-input").onblur = (event) => setAngularVelocity("z", event);

/* Selection modes inputs */
document.getElementById("translate-button").onclick = (event) => {
    highlightButton(event)
}

document.getElementById("scale-button").onclick = (event) => {
    highlightButton(event);
}

document.getElementById("rotate-button").onclick = (event) => {
    highlightButton(event);
}

const setTransformControlsEnabled = (bool) => {
    transformControls.enabled = bool;
    orbitControls.enabled = !bool;
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

document.getElementById("object-name").onblur = (event) => {
    const value = event.target.value;

    if (value.length > 0) {
        simulation.selectedObject.mesh.name = value;

        document.getElementById(`radio_label_${simulation.selectedObject.mesh.uuid}`).innerHTML = value;
    } else {
        event.target.focus();
    }
}

document.getElementById("object-name").onkeydown = blurElementOnEnter;