import {simulation} from "./main.js";

const tutorial = {
    currentStep: 0,
    maxStep: 3,
    tutorialText: document.getElementById("tutorial-text"),
    stepText: document.getElementById("tutorial-step-text"),

    stepForward() {
        if (this.currentStep < this.maxStep) {
            this[`setStep${this.currentStep + 1}`]();
        }

        switch (this.currentStep) {
            case 2:
                document.getElementById("add-cube-button").click();
                break;
        }
    },

    stepBackward() {
        if (this.currentStep > 1) {
            this[`setStep${this.currentStep - 1}`]();
        }

        switch (this.currentStep) {
            case 1:
                simulation.clear();
                break;
        }
    },

    positionAccordingToElement(element, horizontalAdjustment = 0) {
        const totalWidth = window.innerWidth;

        const elementDimensions = element.getBoundingClientRect();
        const tutorialOverlay = document.getElementById("tutorial-overlay");

        let top = elementDimensions.top - tutorialOverlay.getBoundingClientRect().height / 2 + elementDimensions.height / 2;
        let left;

        // If it goes over the top make the pointer be on the top
        if (top < 10) {
            top += tutorialOverlay.getBoundingClientRect().height / 2 - elementDimensions.height / 2;
            tutorialOverlay.classList.add("align-top")
        } else {
            tutorialOverlay.classList.remove("align-top")
        }

        if (elementDimensions.left > totalWidth / 2) {
            // Position on the left of element
            left = elementDimensions.left - elementDimensions.width / 2 - tutorialOverlay.getBoundingClientRect().width;
            left -= horizontalAdjustment

            // Make the pointer be on the right side of the text element
            tutorialOverlay.classList.add("facing-right");
        } else {
            // Position on the right of element
            left = elementDimensions.left + elementDimensions.width + horizontalAdjustment;

            // Make the pointer be on the right side of the text element
            tutorialOverlay.classList.remove("facing-right");
        }

        tutorialOverlay.style.top = `${top}px`;
        tutorialOverlay.style.left = `${left}px`;
    },

    setTutorialOff() {
        this.currentStep = 0;
        const tutorialOverlay = document.getElementById("tutorial-overlay");

        tutorialOverlay.classList = ["collapsed"]
    },

    setStep1() {
        this.tutorialText.innerText = "Click here to add a cube to the scene";

        // Disable the left button
        document.getElementById("step-tutorial-left").disabled = true;

        // Add event listener to add button
        document.getElementById("add-cube-button").addEventListener("click", this.setStep2.bind(this), {once: true});

        this.positionAccordingToElement(document.getElementById("add-cube-button"));
        this.currentStep = 1;
        document.getElementById("tutorial-step-text").innerText = `1 / ${this.maxStep}`;
    },

    setStep2() {
        this.tutorialText.innerText = "Click here to expand or collapse the object property panel";

        // Enable the left button
        document.getElementById("step-tutorial-left").disabled = false;

        // Add event listener to collapse right ui button
        document.getElementById("collapse-right-ui-button").addEventListener("click", this.setStep3.bind(this), {once: true});

        this.positionAccordingToElement(document.getElementById("collapse-right-ui-button"));
        this.currentStep = 2;
        document.getElementById("tutorial-step-text").innerText = `2 / ${this.maxStep}`;
    },

    setStep3() {
        this.tutorialText.innerText = "Here you can change the properties of the selected object. Change the velocity to any number you want";

        // Add event listener to velocity x input


        const horizontalAdjustment = parseFloat(getComputedStyle(document.getElementById("right-ui")).fontSize) * 19.5;

        this.positionAccordingToElement(document.getElementById("label-velocity-x"), horizontalAdjustment);
        this.currentStep = 3;
        document.getElementById("tutorial-step-text").innerText = `3 / ${this.maxStep}`;
    }
};

tutorial.setStep1();

document.getElementById("step-tutorial-right").onclick = tutorial.stepForward.bind(tutorial);
document.getElementById("step-tutorial-left").onclick = tutorial.stepBackward.bind(tutorial);
document.getElementById("skip-tutorial-button").onclick = tutorial.setTutorialOff;