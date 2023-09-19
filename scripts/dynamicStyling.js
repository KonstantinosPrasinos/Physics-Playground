import {simulation} from "./main.js";

/* Helper functions */
const synchronizeSize = (axis) => {
    switch (simulation.selectedObject.mesh.geometry.type) {
        case "BoxGeometry":
            //Changes the size of the box
            const newWidth = simulation.selectedObject.mesh.geometry.parameters.width * simulation.selectedObject.mesh.scale.x / 2;
            const newHeight = simulation.selectedObject.mesh.geometry.parameters.height * simulation.selectedObject.mesh.scale.y / 2;
            const newDepth = simulation.selectedObject.mesh.geometry.parameters.depth * simulation.selectedObject.mesh.scale.z / 2;

            simulation.selectedObject.body.shapes[0].halfExtents.set(newWidth, newHeight, newDepth);
            break;
        case "SphereGeometry":
            //Synchronizes the scales of the three dimensions so that they match and become the "radius"
            simulation.selectedObject.mesh.scale.x = simulation.selectedObject.mesh.scale[axis];
            simulation.selectedObject.mesh.scale.y = simulation.selectedObject.mesh.scale[axis];
            simulation.selectedObject.mesh.scale.z = simulation.selectedObject.mesh.scale[axis];

            //Changes the radius of the sphere
            simulation.selectedObject.body.shapes[0].radius = simulation.selectedObject.mesh.geometry.parameters.radius * simulation.selectedObject.mesh.scale.x;

            //Updating of width and height segments when size changes so that if the sphere becomes bigger, it looks like a sphere
            simulation.selectedObject.mesh.geometry.parameters.widthSegments = Math.ceil(simulation.selectedObject.body.shapes[0].radius / 10) * 16;
            simulation.selectedObject.mesh.geometry.parameters.heightSegments = Math.ceil(simulation.selectedObject.body.shapes[0].radius / 10) * 8;
            break;
        default:
            break;
    }
    //Updates the size of the object
    simulation.selectedObject.body.shapes[0].updateBoundingSphereRadius();
    simulation.selectedObject.body.updateBoundingRadius();
    simulation.selectedObject.body.updateMassProperties();
}

const setSize = (axis, event) => {
    if (event.target.value.length === 0 || isNaN(event.target.value)) {
        event.target.focus();
        // createNotification(notificationList.inputEmpty, true);
    } else {
        if (simulation.selectedObject?.mesh?.geometry.type === "BoxGeometry") {
            simulation.selectedObject.mesh.scale[axis] = parseFloat(event.target.value) / simulation.selectedObject.mesh.geometry.parameters.width;
            synchronizeSize(axis);
        } else if (simulation.selectedObject?.mesh?.geometry.type === "SphereGeometry") {
            simulation.selectedObject.mesh.scale[axis] = parseFloat(event.target.value) / simulation.selectedObject.mesh.geometry.parameters.radius;
            synchronizeSize(axis);
        }
    }
}

const synchronizePositions = () => {
    simulation.selectedObject.body.position.x = simulation.selectedObject.mesh.position.x;
    simulation.selectedObject.body.position.y = simulation.selectedObject.mesh.position.y;
    simulation.selectedObject.body.position.z = simulation.selectedObject.mesh.position.z;
    // updateVectors(simulation.selectedObject);
}

const setPosition = (axis, event) => {
    if (event.target.value.length === 0 || isNaN(event.target.value)) {
        event.target.focus();
        // createNotification(notificationList.inputEmpty, true);
    } else {
        simulation.selectedObject.mesh.position[axis] = parseFloat(event.target.value);
        synchronizePositions();
    }
}

const synchronizeRotation = () => {
    simulation.selectedObject.body.quaternion.x = simulation.selectedObject.mesh.quaternion.x;
    simulation.selectedObject.body.quaternion.y = simulation.selectedObject.mesh.quaternion.y;
    simulation.selectedObject.body.quaternion.z = simulation.selectedObject.mesh.quaternion.z;
}

const setRotation = (axis, event) => {
    if (event.target.value.length === 0 || isNaN(event.target.value)) {
        event.target.focus();
        // createNotification(notificationList.inputEmpty, true);
    } else {
        simulation.selectedObject.mesh.rotation[axis] = parseFloat(event.target.value);
        synchronizeRotation();
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