const rightUiToggle = document.getElementById("collapse-right-ui-button")
const rightUi = document.getElementById("right-ui")
const canvas = document.getElementById("viewportCanvas")
const settingsUiToggle = document.getElementById("settings-button")
const settingsUi = document.getElementById("settings-box")
const timeScaleSlider = document.getElementById("time-scale-slider");
const timeScaleValue = document.getElementById("time-scale-slider-value");
const closeSettingsButton = document.getElementById("close-settings-button");
const leftRoundedCorner = document.getElementById("rounded-corner-left");
const rightRoundedCorner = document.getElementById("rounded-corner-right")
const lightThemeRadio = document.getElementById("light-theme-radio");
const darkThemeRadio = document.getElementById("dark-theme-radio");
const midnightThemeRadio = document.getElementById("midnight-theme-radio");
const cameraFovSlider = document.getElementById("camera-fov-slider");
const cameraFovValue = document.getElementById("camera-fov-slider-value");
const timelineUi = document.getElementById("timeline-box");
const timelineUiToggle = document.getElementById("timeline-button");
const closeTimelineButton = document.getElementById("close-timeline-button");

rightUiToggle.onclick = () => {
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

const collapseSettings = () => {
    settingsUi.classList.add("collapsed")
    leftRoundedCorner.classList.remove("extended");
    document.onclick = undefined;
    settingsUi.ontransitionend = undefined;
}

settingsUiToggle.onclick = () => {
    if (!timelineUi.classList.contains("collapsed")) {
        collapseTimeline();
    }
    if (settingsUi.classList.contains("collapsed")) {
        settingsUi.classList.remove("collapsed");
        leftRoundedCorner.classList.add("extended");
    } else {
        collapseSettings();
    }
}

closeSettingsButton.onclick = () => {
    collapseSettings();
}

const collapseTimeline = () => {
    timelineUi.classList.add("collapsed");
    leftRoundedCorner.classList.remove("double-extended");
    document.onclick = undefined;
    timelineUi.ontransitionend = undefined;
}

timelineUiToggle.onclick = () => {
    if (!settingsUi.classList.contains("collapsed")) {
        collapseSettings();
    }
    if (timelineUi.classList.contains("collapsed")) {
        timelineUi.classList.remove("collapsed");
        leftRoundedCorner.classList.add("double-extended");
    } else {
        collapseTimeline();
    }
}

closeTimelineButton.onclick = () => {
    collapseTimeline();
}

timeScaleSlider.addEventListener("input", (event) => {
    const percentage = ((event.target.value - 0.25) / 2.75) * 100

    timeScaleValue.innerText = `${event.target.value} x`
    timeScaleValue.style.left = `calc(${percentage}% - ${percentage / 100 * 3.5}em)`
});

lightThemeRadio.onchange = () => {
    if (document.body.className !== "light-theme") {
        document.body.className = "light-theme";
    }
}

darkThemeRadio.onchange = () => {
    if (document.body.className !== "dark-theme") {
        document.body.className = "dark-theme";
    }
}

midnightThemeRadio.onchange = () => {
    if (document.body.className !== "midnight-theme") {
        document.body.className = "midnight-theme";
    }
}

cameraFovSlider.addEventListener("input", (event) => {
    const percentage = ((event.target.value - 20) / 90) * 100

    cameraFovValue.innerText = `${event.target.value}`
    cameraFovValue.style.left = `calc(${percentage}% - ${percentage / 100 * 3.5}em)`
});