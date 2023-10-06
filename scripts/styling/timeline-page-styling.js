import {collapseTimeline} from "./left-bar-styling.js";

document.getElementById("close-timeline-button").onclick = () => {
    collapseTimeline();
}

document.getElementById("add-event-button").onclick = () => {
    document.getElementById("create-event-overlay").classList.remove("collapsed");
}