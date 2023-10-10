import {collapseTimeline} from "./left-bar-styling.js";
import {simulation} from "../main.js";
import {deExtendSelectElement, initTypeOptions, setSource} from "./create-event-modal-styling.js";

document.getElementById("close-timeline-button").onclick = () => {
    collapseTimeline();
}

document.getElementById("add-event-button").onclick = () => {
    // Add options to first select component
    for (const object of simulation.objects) {
        const option = document.createElement("DIV");

        option.className = "Clickable select-option";
        option.id = `source-option-${object.mesh.uuid}`;
        option.innerText = object.mesh.name;

        option.onclick = () => {
            // Set main element text to object name
            document.getElementById("event-source-select-main-text").innerText = object.mesh.name;

            setSource(`object-${object.mesh.uuid}`);

            deExtendSelectElement();
            initTypeOptions();
        }

        document.getElementById("event-source-options-container").appendChild(option);
    }

    // Make modal visible
    document.getElementById("create-event-overlay").classList.remove("collapsed");
}