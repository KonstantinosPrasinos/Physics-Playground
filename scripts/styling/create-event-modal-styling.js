document.getElementById("event-source-select-main").onclick = () => {
    const container = document.getElementById("event-source-select-container")

    if (container.classList.contains("extended")) {
        container.classList.remove("extended")
    } else {
        container.classList.add("extended");
    }
}

document.getElementById("event-type-select-main").onclick = () => {
    const container = document.getElementById("event-type-select-container")

    if (container.classList.contains("extended")) {
        container.classList.remove("extended")
    } else {
        container.classList.add("extended");
    }
}

document.getElementById("event-target-select-main").onclick = () => {
    const container = document.getElementById("event-target-select-container")

    if (container.classList.contains("extended")) {
        container.classList.remove("extended")
    } else {
        container.classList.add("extended");
    }
}

document.getElementById("cancel-create-event-button").onclick = () => {
    document.getElementById("event-source-select-container").classList.remove("extended");
    document.getElementById("event-type-select-container").classList.remove("extended");
    document.getElementById("event-target-select-container").classList.remove("extended");

    document.getElementById("create-event-overlay").classList.add("collapsed");
}