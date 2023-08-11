const rightUiToggle = document.getElementById("collapse-right-ui-button")
const rightUi = document.getElementById("right-ui")
const canvas = document.getElementById("viewportCanvas")
const settingsUiToggle = document.getElementById("settings-button")
const settingsUi = document.getElementById("settings-overlay")
const timeScaleSlider = document.getElementById("time-scale-slider");
const timeScaleValue = document.getElementById("time-scale-slider-value")

rightUiToggle.onclick = () => {
    if (rightUi.classList.contains("collapsed")) {
        rightUi.classList.remove("collapsed")
        rightUiToggle.classList.remove("collapsed")
        canvas.classList.remove("collapsed")
    } else {
        rightUi.classList.add("collapsed")
        rightUiToggle.classList.add("collapsed")
        canvas.classList.add("collapsed")
    }
}

settingsUiToggle.onclick = () => {
    if (settingsUi.classList.contains("collapsed")) {
        settingsUi.classList.remove("collapsed")
    } else {
        settingsUi.classList.add("collapsed")
    }
}

settingsUi.onclick = (event) => {
    if (event.target === settingsUi) {
        settingsUi.classList.add("collapsed")
    }
}

timeScaleSlider.addEventListener("input", (event) => {
    const percentage = ((event.target.value - 0.25) / 2.75) * 100
    timeScaleValue.innerText = `${event.target.value} x`
    timeScaleValue.style.left = `calc(${percentage}% - ${percentage / 100 * 3.5}em)`
});