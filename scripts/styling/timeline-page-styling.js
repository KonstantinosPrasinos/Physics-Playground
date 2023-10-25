import {collapseTimeline} from "./left-bar-styling.js";
import {simulation} from "../main.js";
import {handleSourceObjectClick} from "./create-event-modal-styling.js";

document.getElementById("close-timeline-button").addEventListener("click", () => {
    collapseTimeline();
});

document.getElementById("add-event-button").addEventListener("click", () => {
    // Add options to first select component
    for (const object of simulation.objects) {
        const option = document.createElement("DIV");

        option.className = "Clickable select-option";
        option.id = `source-option-${object.mesh.uuid}`;
        option.innerText = object.mesh.name;

        option.addEventListener("click", () => {
            handleSourceObjectClick(object);
        })

        document.getElementById("event-source-options-container").appendChild(option);
    }

    // Make modal visible
    document.getElementById("create-event-overlay").classList.remove("collapsed");
});