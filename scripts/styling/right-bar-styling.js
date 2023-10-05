import {simulation} from "../main.js";

const rightUiToggle = document.getElementById("collapse-right-ui-button")
const rightUi = document.getElementById("right-ui");
const rightRoundedCorner = document.getElementById("rounded-corner-right");

document.getElementById("collapse-right-ui-button").onclick = () => {
    if (rightUi.classList.contains("collapsed")) {
        rightUi.classList.remove("collapsed")
        rightUiToggle.classList.remove("collapsed")
        rightRoundedCorner.classList.remove("collapsed")
    } else {
        rightUi.classList.add("collapsed")
        rightUiToggle.classList.add("collapsed")
        rightRoundedCorner.classList.add("collapsed")
    }
}

document.getElementById("clear-scene-button").onclick = simulation.clear.bind(simulation);

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

document.getElementById("object-name").onkeydown = blurElementOnEnter;

/* Right ui inputs */
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

document.getElementById("mass-input").onblur = (event) => {
    if (event.target.value.length === 0 || isNaN(event.target.value)) {
        event.target.focus();
        // createNotification(notificationList.inputEmpty, true);
    } else {
        simulation.selectedObject.body.mass = parseFloat(event.target.value);
        simulation.selectedObject.body.updateMassProperties();
    }
}

document.getElementById("item-color-picker").onclick = (event) => {
    simulation.selectedObject.mesh.material.color.set(`${event.target.value}`);
}

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

document.getElementById("object-name").onblur = (event) => {
    const value = event.target.value;

    if (value.length > 0) {
        simulation.selectedObject.mesh.name = value;

        document.getElementById(`radio_label_${simulation.selectedObject.mesh.uuid}`).innerHTML = value;
    } else {
        event.target.focus();
    }
}

// Tooltips
let selectedTooltipElement;

const setTooltipPosition = () => {
    if (selectedTooltipElement) {
        const sourceElement = document.getElementById(selectedTooltipElement.id.split("-")[0] + "-info-button");

        const fontSize = parseInt(getComputedStyle(sourceElement).fontSize);

        const posX = sourceElement.getBoundingClientRect().left;
        const posY = sourceElement.getBoundingClientRect().top;

        const sourceWidth = sourceElement.getBoundingClientRect().width;
        const targetWidth = selectedTooltipElement.getBoundingClientRect().width * (1 / 0.9); // 1 / 0.9 because 0.9 is the original scale
        const targetHeight = selectedTooltipElement.getBoundingClientRect().height * (1 / 0.9);

        let left = posX - 0.5 * targetWidth + 0.5 * sourceWidth;

        if (left + targetWidth +  0.5 * fontSize > window.innerWidth) {
            left = window.innerWidth - fontSize - targetWidth;
        }

        selectedTooltipElement.style.left = `${left}px`;
        selectedTooltipElement.style.top = `${posY - targetHeight - 0.5 * fontSize}px`;
    }
}
const setTooltipVisibility = (tooltip) => {
    if (selectedTooltipElement) {
        selectedTooltipElement.classList.add("Collapsed");
    }

    if (tooltip.classList.contains("Collapsed")) {
        selectedTooltipElement = tooltip;
        setTooltipPosition(tooltip);
        
        tooltip.classList.remove("Collapsed");
    } else {
        tooltip.classList.add("Collapsed");
        selectedTooltipElement = null;
    }
}

document.getElementById("mass-info-button").onclick = () => {
    const tooltip = document.getElementById("mass-tooltip");

    setTooltipVisibility(tooltip);
}

document.getElementById("mass-tooltip-close-button").onclick = () => {
    document.getElementById("mass-tooltip").classList.add("Collapsed");
}

document.getElementById("dimensions-info-button").onclick = (event) => {
    const tooltip = document.getElementById("dimensions-tooltip");

    setTooltipVisibility(tooltip, event);
}

document.getElementById("dimensions-tooltip-close-button").onclick = () => {
    document.getElementById("dimensions-tooltip").classList.add("Collapsed");
}

export {setTooltipPosition};