import {simulation} from "./main.js";
import {collapseRightUi, extendRightUi} from "./styling/right-bar-styling.js";
import {handlePlayClick, handleReplayClick} from "./styling/top-bar-styling.js";

const tutorial = {
    currentStep: 0,
    maxStep: 7,
    tutorialText: document.getElementById("tutorial-text"),
    stepText: document.getElementById("tutorial-step-text"),

    stepForward() {
        if (this.currentStep < this.maxStep) {
            this[`setStep${this.currentStep + 1}`]();
        } else {
            this.setStepFinal();
        }

        // Actions for if the step is skipped
        switch (this.currentStep - 1) {
            case 1:
                document.getElementById("add-cube-button").click();
                break;
            case 2:
                extendRightUi();
                break;
            case 3:
                simulation.objects[0].body.velocity.x = 1;
                document.getElementById("velocity-x-input").value = 1;
                break;
            case 4:
                document.getElementById(`radio_input_${simulation.objects[1].mesh.uuid}`).click();
                break;
            case 5:
            case 6:
                handlePlayClick();
                break;
        }
    },

    stepBackward() {
        if (this.currentStep > 1) {
            this[`setStep${this.currentStep - 1}`]();
        }

        // Actions for if the user goes back
        switch (this.currentStep) {
            case 1:
                simulation.clear();
                break;
            case 2:
                collapseRightUi();
                break;
            case 3:
                simulation.deleteObject(simulation.objects[1]);
                break;
            case 5:
                handleReplayClick();
                break;
            case 6:
                handleReplayClick();
                handlePlayClick();
                break;
        }
    },

    positionAccordingToElement(element, horizontalAdjustment = 0, nextStep) {
        const elementDimensions = element.getBoundingClientRect();
        const tutorialOverlay = document.getElementById("tutorial-overlay");
        const tutorialDimensions = tutorialOverlay.getBoundingClientRect();

        let left;
        let top;

        tutorialOverlay.classList.remove("facing-right");
        tutorialOverlay.classList.remove("facing-up");
        tutorialOverlay.classList.remove("Align-Top");

        switch (nextStep) {
            case 1:
                // Facing left
                left = elementDimensions.right;
                top = elementDimensions.top - tutorialDimensions.height / 2 + elementDimensions.height / 2;
                break;
            case 2:
                // Facing right, top aligned
                tutorialOverlay.classList.add("facing-right");
                tutorialOverlay.classList.add("Align-Top");
                left = elementDimensions.left - tutorialDimensions.width;
                top = elementDimensions.top;
                break;
            case 3:
            case 4:
                tutorialOverlay.classList.add("facing-right");
                left = elementDimensions.left - tutorialDimensions.width;
                top = elementDimensions.top - tutorialDimensions.height / 2 + elementDimensions.height / 2;

                // For some reason when transitioning from facing up to not be facing up, the transition isn't instant so the following dimensions are wrong
                if (this.currentStep === 5) {
                    left -= 54;
                    top += 54 / 2;
                }
                break;
            case 5:
            case 6:
            case 7:
                // Facing up, not aligned
                tutorialOverlay.classList.add("facing-up");
                left = elementDimensions.left + elementDimensions.width / 2 - 12; // -12 for svg width
                top = elementDimensions.bottom;
                break;
        }

        left -= horizontalAdjustment;

        tutorialOverlay.style.top = `${top}px`;
        tutorialOverlay.style.left = `${left}px`;
    },

    setTutorialOff() {
        this.currentStep = 0;
        const tutorialOverlay = document.getElementById("tutorial-overlay");

        tutorialOverlay.classList.add("collapsed");
        simulation.reset();

        localStorage.setItem("hasSeenTutorial", true);
    },

    setStep1() {
        // Prepare step
        document.getElementById("step-tutorial-left").disabled = true;
        document.getElementById("tutorial-overlay").classList.remove("collapsed");

        let horizontalAdjustment = 0;

        if (this.currentStep === 3) {
            const collapseRightUiButton = document.getElementById("collapse-right-ui-button");
            horizontalAdjustment = - parseFloat(getComputedStyle(collapseRightUiButton).fontSize) * 9.33; // amount it goes right - 1em for width
        }

        // Change tutorial text
        this.tutorialText.innerText = "Click here to add a cube to the scene";
        document.getElementById("tutorial-step-text").innerText = `1 / ${this.maxStep}`;

        // Add event listener to affected element
        document.getElementById("add-cube-button").addEventListener("click", this.setStep2.bind(this), {once: true});

        // Position the tutorial element
        this.positionAccordingToElement(document.getElementById("add-cube-button"), 0, 1);

        // Update step count
        this.currentStep = 1;
    },

    setStep2() {
        // Prepare step
        document.getElementById("step-tutorial-left").disabled = false;

        let horizontalAdjustment = 0;

        if (this.currentStep === 3) {
            const collapseRightUiButton = document.getElementById("collapse-right-ui-button");
            horizontalAdjustment = - parseFloat(getComputedStyle(collapseRightUiButton).fontSize) * 9.33; // amount it goes right - 1em for width
        }

        // Change tutorial text
        this.tutorialText.innerText = "Click here to expand or collapse the object property panel";
        document.getElementById("tutorial-step-text").innerText = `2 / ${this.maxStep}`;

        // Add event listener to affected element
        document.getElementById("collapse-right-ui-button").addEventListener("click", this.setStep3.bind(this), {once: true})

        // Position the tutorial element
        this.positionAccordingToElement(document.getElementById("collapse-right-ui-button"), horizontalAdjustment, 2);

        // Update step count
        this.currentStep = 2;
    },

    setStep3() {
        // Prepare step
        let horizontalAdjustment = 0;

        if (this.currentStep !== 4) {
            horizontalAdjustment = parseFloat(getComputedStyle(document.getElementById("right-ui")).fontSize) * 17.5;
        }

        // Change tutorial text
        this.tutorialText.innerText = "Here you can change the properties of the selected object. Change the velocity to any number you want";
        document.getElementById("tutorial-step-text").innerText = `3 / ${this.maxStep}`;

        // Add event listener to affected element
        document.getElementById("velocity-x-input").addEventListener("blur", this.setStep4.bind(this), {once: true})

        // Position the tutorial element
        this.positionAccordingToElement(document.getElementById("label-velocity-x"), horizontalAdjustment, 3);

        // Update step count
        this.currentStep = 3;
    },

    setStep4() {
        // Prepare step
        let box;

        if (simulation.objects.length === 1) {
            box = simulation.createBox()

            box.mesh.position.x = 3;
            simulation.synchronizePosition(box);

            box.mesh.material.color.set(`#00ff00`);
        } else {
            box = simulation.objects[1];
        }

        document.getElementById(`radio_input_${simulation.objects[0].mesh.uuid}`).click();

        // Change tutorial text
        this.tutorialText.innerText = "Here you can select other objects. We have added a new object for you. Select it by clicking it.";
        document.getElementById("tutorial-step-text").innerText = `4 / ${this.maxStep}`;

        // Add event listener to affected element
        document.getElementById(`radio_input_${box.mesh.uuid}`).addEventListener("change", this.setStep5.bind(this), {once: true})

        // Position the tutorial element
        this.positionAccordingToElement(document.getElementById(`radio_input_${box.mesh.uuid}`), 0, 4);

        // Update step count
        this.currentStep = 4;
    },

    setStep5() {
        // Change tutorial text
        this.tutorialText.innerText = "Press the play button to start the simulation.";
        document.getElementById("tutorial-step-text").innerText = `5 / ${this.maxStep}`;

        // Add event listener to affected element
        document.getElementById("top-play").addEventListener("click", this.setStep6.bind(this), {once: true})

        // Position the tutorial element
        this.positionAccordingToElement(document.getElementById("top-play"), 0, 5);

        // Update step count
        this.currentStep = 5;
    },

    setStep6() {
        // Change tutorial text
        this.tutorialText.innerText = "Press the pause button to pause the simulation.";
        document.getElementById("tutorial-step-text").innerText = `6 / ${this.maxStep}`;

        // Add event listener to affected element
        setTimeout(() => {
            document.getElementById("top-play").addEventListener("click", this.setStep7.bind(this), {once: true});
        }, 10); // Because this and the previous step have the same event, they trigger at the same time.

        // Position the tutorial element
        this.positionAccordingToElement(document.getElementById("top-play"), 0, 6);

        // Update step count
        this.currentStep = 6;
    },

    setStep7() {
        // Change tutorial text
        this.tutorialText.innerText = "Press the replay button to reset the simulation.";
        document.getElementById("tutorial-step-text").innerText = `7 / ${this.maxStep}`;

        // Change next icon
        document.getElementById("step-tutorial-right").innerText = "check_small"

        // Add event listener to affected element
        document.getElementById("top-replay").addEventListener("click", this.setStepFinal.bind(this), {once: true})

        // Position the tutorial element
        this.positionAccordingToElement(document.getElementById("top-replay"), 0, 7);

        // Update step count
        this.currentStep = 7;
    },

    setStepFinal() {
        // Update step count
        this.currentStep = 0;

        // Hide tutorial
        this.setTutorialOff();
    }
};

const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');

if (!hasSeenTutorial) {
    tutorial.setStep1();
}

document.getElementById("step-tutorial-right").onclick = tutorial.stepForward.bind(tutorial);
document.getElementById("step-tutorial-left").onclick = tutorial.stepBackward.bind(tutorial);
document.getElementById("close-tutorial-button").onclick = tutorial.setTutorialOff;

export {tutorial};