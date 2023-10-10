import {simulation} from "../main.js";

let extendedSelectElement;

const inputsState = {source: null, type: null, target: null};

const setSource = (newSource) => {
    inputsState.source = newSource;
}

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

document.getElementById("event-source-select-main").onclick = handleSelectClick;

document.getElementById("event-type-select-main").onclick = handleSelectClick;

document.getElementById("event-target-select-main").onclick = handleSelectClick;

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

    // Reset inputs
    document.getElementById("event-source-options-container").innerHTML = "<div class=\"Clickable select-option\" id=\"source-option-time\">Time</div>";
    document.getElementById("event-target-options-container").innerHTML = "";
    document.getElementById("event-target-select-main-input").value = "";
}

document.getElementById("cancel-create-event-button").onclick = hideModal;

// Select input handling
document.getElementById("source-option-time").onclick = () => {
    document.getElementById("event-source-select-main-text").innerText = "Time";
    inputsState.source = "time";
    inputsState.type = "reaches";

    deExtendSelectElement();
    initTypeOptions();
}

const initTypeOptions = () => {
    // If first option is time then it shouldn't be a dropdown
    if (document.getElementById("event-source-select-main-text").innerText === "Time") {
        // Change main container to not be clickable
        document.getElementById("event-type-select-container").classList.remove("Disabled");
        document.getElementById("event-type-select-container").classList.add("event-type-not-clickable");

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
        document.getElementById("event-target-options-container").innerHTML = "";

        const objectUuid = inputsState.source.substring(7, inputsState.source.length);

        simulation.objects.filter(object => object.mesh.uuid !== objectUuid).forEach(object => {
            const option = document.createElement("DIV");

            option.className = "Clickable select-option";
            option.id = `target-option-${object.mesh.uuid}`;
            option.innerText = object.mesh.name;

            option.onclick = () => {
                // Set main element text to object name
                document.getElementById("event-target-select-main-input").value = object.mesh.name;

                inputsState.target = `object-${object.mesh.uuid}`

                deExtendSelectElement();

                console.log(inputsState);
            }

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
    if (inputsState.type === "collision") {
        event.target.blur();
    }
}

export {deExtendSelectElement, initTypeOptions, hideModal, setSource};