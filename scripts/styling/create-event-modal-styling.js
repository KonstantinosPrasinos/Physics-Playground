import {simulation} from "../main.js";
import {handleInputKeyDown} from "./right-bar-styling.js";
import {events} from "../events.js";

let extendedSelectElement;

const inputsState = {source: null, type: null, target: null};

const deExtendSelectElement = () => {
    extendedSelectElement.classList.remove("extended");
    extendedSelectElement = null;
}

const handleSelectClick = (event) => {
    const selectTitle = event.target.id.split('-')[1];

    const isTarget = selectTitle === 'target';
    const secondInputIsCollision = inputsState.type === 'collision';

    if (isTarget && !secondInputIsCollision) {
        // Third input should be text and not a dropdown
        document.getElementById("event-target-select-main-input").focus();
    } else {
        // Make it so that one select is extended at once
        const container = document.getElementById(`event-${selectTitle}-select-container`);

        if (!container.classList.contains("Disabled") && !container.classList.contains("event-type-not-clickable")) {
            if (extendedSelectElement && extendedSelectElement !== container) {
                deExtendSelectElement()
            }

            if (container.classList.contains("extended")) {
                container.classList.remove("extended");
                extendedSelectElement = null;

            } else {
                container.classList.add("extended");
                extendedSelectElement = container;
            }
        }
    }
}

document.getElementById("event-source-select-main").addEventListener("click", handleSelectClick)

document.getElementById("event-type-select-main").addEventListener("click", handleSelectClick);

document.getElementById("event-target-select-main").addEventListener("click", handleSelectClick);

const hideModal = () => {
    // Collapse overlay
    document.getElementById("create-event-overlay").classList.add("collapsed");

    // Source inputs
    document.getElementById("event-source-select-main-text").innerText = "Source";
    document.getElementById("event-source-select-container").classList.remove("extended");

    // Type inputsState
    document.getElementById("event-type-select-main-text").innerText = "Event type"

    document.getElementById("event-type-select-container").classList.add("Disabled");
    document.getElementById("event-type-select-container").classList.remove("event-type-not-clickable");

    document.getElementById("event-type-select-container").classList.remove("extended");

    // Target inputs
    document.getElementById("event-target-select-container").classList.remove("extended");
    document.getElementById("event-target-select-container").classList.add("Disabled");

    document.getElementById("event-target-select-main-input").disabled = true;

    // Reset inputs
    const sourceOptionsContainer = document.getElementById("event-source-options-container");

    while (sourceOptionsContainer.children.length > 1) {
        // This is done in order to always keep the source option, keep time option
        sourceOptionsContainer.removeChild(sourceOptionsContainer.lastChild);
    }

    const targetOptionsContainer = document.getElementById("event-target-options-container");

    while (targetOptionsContainer.children.length > 1) {
        // Keep the anything option
        targetOptionsContainer.removeChild(targetOptionsContainer.lastChild);
    }

    document.getElementById("event-target-select-main-input").value = "";

    inputsState.source = null;
    inputsState.target = null;
    inputsState.type = null;
}

// Select input handling
document.getElementById("source-option-time").addEventListener("click", () => {
    document.getElementById("event-source-select-main-text").innerText = "Time";
    inputsState.source = "Time";
    inputsState.type = "reaches";
    inputsState.target = null;

    // Disable save button
    document.getElementById("save-create-event-button").disabled = true;

    deExtendSelectElement();
    initTypeOptions();
});


const handleSourceObjectClick = (object) => {
    // Set main element text to object name
    document.getElementById("event-source-select-main-text").innerText = object.mesh.name;
    // Reset type select header
    document.getElementById("event-type-select-main-text").innerText = "Event type";

    // Set state and reset other input states
    inputsState.source = `object-${object.mesh.uuid}`;
    inputsState.type = null;
    inputsState.target = null;

    // Disable save button
    document.getElementById("save-create-event-button").disabled = true;

    deExtendSelectElement();
    initTypeOptions();
}

const initTypeOptions = () => {
    // If first option is time then it shouldn't be a dropdown
    if (document.getElementById("event-source-select-main-text").innerText === "Time") {
        const typeContainer = document.getElementById("event-type-select-container");

        // Change main container to not be clickable
        typeContainer.classList.remove("Disabled");
        typeContainer.classList.add("event-type-not-clickable");

        document.getElementById("event-type-select-main-text").innerText = "reaches";

        initTargetOptions();
    } else {
        // Disable target input
        document.getElementById("event-target-select-container").classList.add("Disabled");

        // Enable type input
        document.getElementById("event-type-select-container").classList.remove("event-type-not-clickable");
        document.getElementById("event-type-select-container").classList.remove("Disabled");

        // Add or remove collision option
        if (simulation.objects.length > 1) {
            document.getElementById("type-option-collision").style.display = "inline-block";
        } else {
            document.getElementById("type-option-collision").style.display = "none";
        }

        // Extend type input
        const container = document.getElementById("event-type-select-container");

        container.classList.add("extended");
        extendedSelectElement = container;
    }
}

const initTargetOptions = () => {
    // Enable target input
    document.getElementById("event-target-select-container").classList.remove("Disabled");
    document.getElementById("event-target-select-main-input").disabled = false;

    if (inputsState.type === "collision") {
        // Set target input to be drop down
        document.getElementById("event-target-icon").innerText = "expand_more";

        // Make the input seem like a normal div
        document.getElementById("event-target-select-main-input").classList.add("not-editable");

        // Remove old options and add new options to select component
        const targetOptionsContainer = document.getElementById("event-target-options-container");

        while (targetOptionsContainer.children.length > 1) {
            // Keep the anything option
            targetOptionsContainer.removeChild(targetOptionsContainer.lastChild);
        }

        const objectUuid = inputsState.source.substring(7, inputsState.source.length);

        simulation.objects.filter(object => object.mesh.uuid !== objectUuid).forEach(object => {
            const option = document.createElement("DIV");

            option.className = "Clickable select-option";
            option.id = `target-option-${object.mesh.uuid}`;
            option.innerText = object.mesh.name;

            option.addEventListener("click", () => {
                // Set main element text to object name
                document.getElementById("event-target-select-main-input").value = object.mesh.name;

                inputsState.target = `object-${object.mesh.uuid}`

                deExtendSelectElement();

                // Enable save button
                document.getElementById("save-create-event-button").disabled = false;
            });

            document.getElementById("event-target-options-container").appendChild(option);
        });

        // Extend select component
        const container = document.getElementById("event-target-select-container");

        container.classList.add("extended");
        extendedSelectElement = container;
    } else {
        // Set icon to edit, make it look editable and focus the input
        const inputElement = document.getElementById("event-target-select-main-input");

        document.getElementById("event-target-icon").innerText = "edit";
        inputElement.classList.remove("not-editable");
        inputElement.focus();
        inputElement.value = "";
    }
}

// Type input
const handleTypeInput = (event) => {
    const clickedElement = event.target;
    inputsState.type = clickedElement.id.substring(12, clickedElement.id.length);
    inputsState.target = null;

    // Disable save button
    document.getElementById("save-create-event-button").disabled = true;

    document.getElementById("event-type-select-main-text").innerText = clickedElement.innerText;

    deExtendSelectElement();
    initTargetOptions();
}

// Get the container element by its ID
const typeOptionsContainer = document.getElementById('type-options-container');

// Add the click event listener to all child elements with class "select-option"
const selectOptions = typeOptionsContainer.querySelectorAll('.select-option');

selectOptions.forEach((element) => {
    element.addEventListener('click', handleTypeInput);
});

// Target input
document.getElementById("event-target-select-main-input").onfocus = (event) => {
    // So that text input is not triggered on collision event, in order to only have select
    if (inputsState.type === "collision") {
        event.target.blur();
    }
}

document.getElementById("target-option-anything").addEventListener("click", () => {
    // Set main element text to object name
    document.getElementById("event-target-select-main-input").value = "Anything";

    inputsState.target = `anything`

    deExtendSelectElement();

    // Enable save button
    document.getElementById("save-create-event-button").disabled = false;
});

document.getElementById("event-target-select-main-input").addEventListener("keyup", (event) => {
    // Enable or disable save button
    if (event.target.value.length > 0) {
        document.getElementById("save-create-event-button").disabled = false;
        inputsState.target = `number-${parseFloat(event.target.value)}`;
    } else {
        document.getElementById("save-create-event-button").disabled = true;
        inputsState.target = null;
    }
});

document.getElementById("event-target-select-main-input").addEventListener("keydown", handleInputKeyDown);

// Bottom buttons
document.getElementById("save-create-event-button").addEventListener("click", () => {
    // Save event and hide the Modal
    events.addEvent(inputsState);
    hideModal();
});

document.getElementById("cancel-create-event-button").addEventListener("click", hideModal);

export {deExtendSelectElement, initTypeOptions, hideModal, handleSourceObjectClick};