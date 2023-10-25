import {changeTimeStep, setTransformControlsEnabled, simulation, transformControls} from "../main.js";
import {timeline} from "../timeline.js";

const handlePlayClick = () => {
    if (simulation.isPaused) {
        // Save object position and rotation
        if (simulation.world.time === 0) {
            for (const object of simulation.objects) {
                const savedObject = {
                    id: object.mesh.id,
                    position: {x: null, y: null, z: null},
                    quaternion: {x: null, y: null, z: null},
                    velocity: {x: null, y: null, z: null},
                    angularVelocity: {x: null, y: null, z: null}
                };

                savedObject.position.x = object.mesh.position.x;
                savedObject.position.y = object.mesh.position.y;
                savedObject.position.z = object.mesh.position.z;
                savedObject.quaternion.x = object.mesh.quaternion.x;
                savedObject.quaternion.y = object.mesh.quaternion.y;
                savedObject.quaternion.z = object.mesh.quaternion.z;

                savedObject.velocity.x = object.body.velocity.x;
                savedObject.velocity.y = object.body.velocity.y;
                savedObject.velocity.z = object.body.velocity.z;
                savedObject.angularVelocity.x = object.body.angularVelocity.x;
                savedObject.angularVelocity.y = object.body.angularVelocity.y;
                savedObject.angularVelocity.z = object.body.angularVelocity.z;

                simulation.savedState.push(savedObject);
            }

            timeline.clearEntries()
        }

        // Resume simulation
        document.getElementById("top-play").innerText = "pause";
        simulation.isPaused = false;

        // Disable inputs if object selected
        if (simulation.selectedObject) {
            simulation.setPropertiesDisabled(true);
        }

        // Disable buttons
        document.getElementById("add-cube-button").disabled = true;
        document.getElementById("add-sphere-button").disabled = true;
        document.getElementById("translate-button").disabled = true;
        document.getElementById("scale-button").disabled = true;
        document.getElementById("rotate-button").disabled = true;

        if (simulation.selectedModeElement) {
            transformControls.detach();
            setTransformControlsEnabled(false);
            simulation.selectedModeElement.classList.remove("Button-Selected");
            simulation.selectedModeElement = null;
        }
    } else {
        // Pause simulation
        simulation.pause();
    }
}

document.getElementById("top-play").addEventListener("click", handlePlayClick);

const handleReplayClick = () => {
    // Pause simulation
    document.getElementById("top-play").innerText = "play_arrow";
    simulation.isPaused = true;

    // Rewind simulation to previous state
    simulation.rewindState();
}

document.getElementById("top-replay").addEventListener("click", handleReplayClick);

// Time scale slider

const timeScaleSlider = document.getElementById("time-scale-slider");
const timeScaleValue = document.getElementById("time-scale-slider-value");

const updateTimeScaleSliderValue = (value) => {
    const percentage = ((value - 0.25) / 2.75) * 100

    timeScaleValue.innerText = `${value} x`
    timeScaleValue.style.left = `calc(${percentage}% - ${percentage / 100 * 3.5}em)`
}

timeScaleSlider.addEventListener("input", (event) => {
    updateTimeScaleSliderValue(event.target.value);
    changeTimeStep(event.target.value)
});

document.getElementById("time-scale-container").onwheel = (event) => {
    if (event.deltaY > 0) {
        timeScaleSlider.value -= 0.25;
        updateTimeScaleSliderValue(timeScaleSlider.value);
    } else if (event.deltaY < 0) {
        timeScaleSlider.value = parseFloat(timeScaleSlider.value) + 0.25;
        updateTimeScaleSliderValue(timeScaleSlider.value);
    }

    changeTimeStep(timeScaleSlider.value);
}

export {handlePlayClick, handleReplayClick};