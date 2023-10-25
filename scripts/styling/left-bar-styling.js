import {simulation, transformControls} from "../main.js";

const settingsUi = document.getElementById("settings-box");

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

const collapseSettings = () => {
    settingsUi.classList.add("collapsed")
    leftRoundedCorner.classList.remove("extended");
}

document.getElementById("settings-button").addEventListener("click", () => {
    if (!timelineUi.classList.contains("collapsed")) {
        collapseTimeline();
    }
    if (!document.getElementById("bookmarks-box").classList.contains("collapsed")) {
        collapseBookmarks();
    }
    if (settingsUi.classList.contains("collapsed")) {
        settingsUi.classList.remove("collapsed");
        leftRoundedCorner.classList.add("extended");
    } else {
        collapseSettings();
    }
});

const timelineUi = document.getElementById("timeline-box");
const leftRoundedCorner = document.getElementById("rounded-corner-left");

const collapseTimeline = () => {
    timelineUi.classList.add("collapsed");
    leftRoundedCorner.classList.remove("double-extended");
}

document.getElementById("timeline-button").addEventListener("click", () => {
    if (!document.getElementById("settings-box").classList.contains("collapsed")) {
        collapseSettings();
    }
    if (!document.getElementById("bookmarks-box").classList.contains("collapsed")) {
        collapseBookmarks();
    }
    if (timelineUi.classList.contains("collapsed")) {
        timelineUi.classList.remove("collapsed");
        leftRoundedCorner.classList.add("double-extended");
    } else {
        collapseTimeline();
    }
});

const bookmarksUi = document.getElementById("bookmarks-box");

const collapseBookmarks = () => {
    bookmarksUi.classList.add("collapsed");
    leftRoundedCorner.classList.remove("extended");
}

document.getElementById("bookmarks-button").addEventListener("click", () => {
    if (!document.getElementById("settings-box").classList.contains("collapsed")) {
        collapseSettings();
    }
    if (!timelineUi.classList.contains("collapsed")) {
        collapseTimeline();
    }
    if (bookmarksUi.classList.contains("collapsed")) {
        bookmarksUi.classList.remove("collapsed");
        leftRoundedCorner.classList.add("extended");
    } else {
        collapseBookmarks();
    }
});

/* Selection modes buttons */
document.getElementById("translate-button").addEventListener("click", (event) => {
    highlightButton(event)
});

document.getElementById("scale-button").addEventListener("click", (event) => {
    highlightButton(event);
});

document.getElementById("rotate-button").addEventListener("click", (event) => {
    highlightButton(event);
});

/* Create object buttons */
document.getElementById("add-cube-button").addEventListener("click", simulation.createBox.bind(simulation))
document.getElementById("add-sphere-button").addEventListener("click", simulation.createSphere.bind(simulation));


export {collapseSettings, collapseTimeline, collapseBookmarks};