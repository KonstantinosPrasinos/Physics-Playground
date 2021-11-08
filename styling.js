import {simulation, transformControls, orbitControls} from '/main.js'

let itemSelected = -1, tutorialCompleted = false, mode = "setup", selectedCursor = "none", ratio = null, rightUIisCollapsed = true, storedTheme = 'dark';

let topUI = document.getElementById("top-ui");
let rightUI = document.getElementById("right-ui");
let collapseRightUIButton = document.getElementById("collapse-right-ui-button");
let rightFeatures = document.getElementById("right-ui-features");
let objectNameField = document.getElementById("object-name");
let rightItems = document.getElementById("right-ui-items-list");
let settingsOverlay = document.getElementById("settings-overlay");
let settingsBox = document.getElementById("settings-box");
let widthInput = document.getElementById("right-ui-width");
let heightInput = document.getElementById("right-ui-height");
let depthInput = document.getElementById("right-ui-depth");
let xInput = document.getElementById("right-ui-x");
let yInput = document.getElementById("right-ui-y");
let zInput = document.getElementById("right-ui-z");
let rotationXInput = document.getElementById("right-rotation-x");
let rotationYInput = document.getElementById("right-rotation-y");
let rotationZInput = document.getElementById("right-rotation-z");
let colorPicker = document.getElementById("color-picker");
let togglePauseButton = document.getElementById("top-play");
let topMode = document.getElementById("top-mode");
let canvas = document.getElementById("viewportCanvas");

//Local Storage Stuff

if (!localStorage.theme) {
    localStorage.setItem("theme", "dark");
} else {
    setTheme(localStorage.getItem("theme"));
}

if (!localStorage.tutorialCompleted) {
    //Start tutorial
    localStorage.setItem("tutorialCompleted", "true");
}

//General Functions

function pauseSimulation(){
    if (!simulation.isPaused){
        togglePauseButton.classList.remove('top-pause');
        togglePauseButton.classList.add('top-play');
    }
    simulation.isPaused = true;
}

function resumeSimulation(){
    if (simulation.isPaused){
        togglePauseButton.classList.remove('top-play');
        togglePauseButton.classList.add('top-pause');
        
    }
    simulation.isPaused = false;
}

function updateRightUiName(){
    if (itemSelected == "none"){
        document.getElementById("object-name").innerText = "No item is Selected";
    } else {
        document.getElementById("object-name").innerText = itemSelected.userData.name;
    }
}

//Click Events

document.getElementById("settings-overlay").addEventListener('click', (event) => {
    if (event.target !== event.currentTarget) {
        event.stopPropagation();
    } else {
        toggleSettings();
    }
});

document.getElementById("top-select").onclick = function selectCursorMove(){
    if (selectedCursor != "translate"){
        document.getElementById("top-select").style.backgroundColor = "orange";
        document.getElementById("top-resize").style.backgroundColor = "var(--secondary-color)";
        document.getElementById("top-rotate").style.backgroundColor = "var(--secondary-color)";
        transformControls.setMode('translate');
        transformControls.enabled = true;
        orbitControls.enabled = false;
        selectedCursor = "translate";
    } else {
        transformControls.detach();
        document.getElementById("object-name").innerText = "No item is Selected";
        document.getElementById("top-select").style.backgroundColor = "var(--secondary-color)";
        transformControls.enabled = false;
        orbitControls.enabled = true;
        selectedCursor = "none";
    }
}

document.getElementById("top-resize").onclick = function selectCursorScale(){
    if (selectedCursor != "scale"){
        document.getElementById("top-resize").style.backgroundColor = "orange";
        document.getElementById("top-rotate").style.backgroundColor = "var(--secondary-color)";
        document.getElementById("top-select").style.backgroundColor = "var(--secondary-color)";
        transformControls.setMode('scale');
        transformControls.enabled = true;
        orbitControls.enabled = false;
        selectedCursor = "scale";
    } else {
        transformControls.detach();
        document.getElementById("object-name").innerText = "No item is Selected";
        document.getElementById("top-resize").style.backgroundColor = "var(--secondary-color)";
        transformControls.enabled = false;
        orbitControls.enabled = true;
        selectedCursor = "none";
    }
}

document.getElementById("top-rotate").onclick = function selectCursorRotate(){
    if (selectedCursor != "rotate"){
        document.getElementById("top-rotate").style.backgroundColor = "orange";
        document.getElementById("top-resize").style.backgroundColor = "var(--secondary-color)";
        document.getElementById("top-select").style.backgroundColor = "var(--secondary-color)";
        transformControls.setMode('rotate');
        transformControls.enabled = true;
        orbitControls.enabled = false;
        selectedCursor = "rotate";
    } else {
        transformControls.detach();
        document.getElementById("object-name").innerText = "No item is Selected";
        document.getElementById("top-rotate").style.backgroundColor = "var(--secondary-color)";
        transformControls.enabled = false;
        orbitControls.enabled = true;
        selectedCursor = "none";
    }
}

document.getElementById("collapse-right-ui-button").onclick = function toggleRightUI() {
    if (rightUIisCollapsed) {
        let timeline = gsap.timeline();
        rightUI.style.visibility = 'visible';
        gsap.to(collapseRightUIButton, { duration: 0.2, right: '144px' });
        gsap.to(collapseRightUIButton, { duration: 0.2, rotation: 0 });
        timeline.to(rightUI, { duration: 0.2, width: '180px' })
            .to(rightFeatures, { duration: 0.2, opacity: 1 })
            .to(rightItems, { duration: 0.2, opacity: 1 }, '-=0.2')
            .to(objectNameField, {duration: 0.2, opacity: 1}, '-=0.2');
        rightUIisCollapsed = !rightUIisCollapsed;

    } else {
        let timeline = gsap.timeline();
        timeline.to(rightFeatures, { duration: 0.2, opacity: 0 })
            .to(rightItems, { duration: 0.2, opacity: 0 }, '-=0.2')
            .to(rightUI, { duration: 0.2, width: '0px' })
            .to(collapseRightUIButton, { duration: 0.2, right: '8px' }, '-=0.2')
            .to(collapseRightUIButton, { duration: 0.2, rotation: 180, onComplete: function () { rightUI.style.visibility = 'hidden'; } }, '-=0.2');
        rightUIisCollapsed = !rightUIisCollapsed;
    }
}

document.getElementById("settings-button").onclick = document.getElementById("close-settings").onclick = function toggleSettings() {
    function toggleVisibility() { settingsOverlay.style.visibility = 'hidden'; }
    if (window.getComputedStyle(settingsOverlay).visibility == 'hidden') {
        let timeline = gsap.timeline();
        settingsOverlay.style.visibility = 'visible';
        timeline.to(settingsOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)', duration: 0.15 })
            .to(settingsBox, { opacity: 1, duration: 0.15 }, '-=0.16');
    } else {
        let timeline = gsap.timeline();
        timeline.to(settingsOverlay, { backgroundColor: 'rgba(0, 0, 0, 0)', duration: 0.15, onComplete: toggleVisibility })
            .to(settingsBox, { opacity: 0, duration: 0.15 }, '-=0.15');;
    }
}



function setTheme(theme) {
    if (theme != storedTheme) {
        switch (theme) {
            case 'light':
                gsap.to("html", { duration: 0.2, "--primary-color": '#f1f2f6' });
                gsap.to("html", { duration: 0.2, "--secondary-color": '#1C212E' });
                localStorage.setItem("theme", "light");
                storedTheme = theme;
                document.getElementById("dark-theme-button").classList.toggle("theme-button-selected");
                document.getElementById("light-theme-button").classList.toggle("theme-button-selected");
                document.getElementById("dark-theme-button").classList.toggle("theme-button-unselected");
                document.getElementById("light-theme-button").classList.toggle("theme-button-unselected");
                break;
            case 'dark':
                gsap.to("html", { duration: 0.2, "--primary-color": '#1C212E' });
                gsap.to("html", { duration: 0.2, "--secondary-color": '#f1f2f6' });
                localStorage.setItem("theme", "dark");
                storedTheme = theme;
                document.getElementById("dark-theme-button").classList.toggle("theme-button-selected");
                document.getElementById("light-theme-button").classList.toggle("theme-button-selected");
                document.getElementById("dark-theme-button").classList.toggle("theme-button-unselected");
                document.getElementById("light-theme-button").classList.toggle("theme-button-unselected");
                break;
            default:
                break;
        }

    }
}

document.getElementById("light-theme-button").onclick = setTheme.bind('light');
document.getElementById("dark-theme-button").onclick = setTheme.bind('dark');

document.getElementById("top-play").onclick = function togglePause(){
    if (mode == "setup"){
        copyBoxes();
        mode = "simulation";
        topMode.innerHTML = "<b>Mode:</b> Simulation";
        if (simulation.shapesForChanges.length > 0){
            simulation.removeAllArrows();
        }
        simulation.boxes.forEach(element => {
            element.body.position.copy(element.mesh.position);
            element.body.quaternion.copy(element.mesh.quaternion);
        });
    }
    if (simulation.isPaused){
        resumeSimulation();
    } else {
        pauseSimulation();
    }
}

document.getElementById("top-replay").onclick = async function toggleMode(){
    if (mode == "simulation"){
        pauseSimulation();
        mode = "setup";

        simulation.removeAllObjects();
        
        // simulation.addAllObjects();
        
        simulation.boxes = savedBoxes;
        savedBoxes = [];
        simulation.addAllObjects();
        topMode.innerHTML = "<b>Mode:</b> Setup";
    }
}

//Other Event Listeners

canvas.addEventListener("mousedown", (event) => {
    let intersectedObjects = simulation.checkForObject(event);
    if (intersectedObjects.length > 0){
        transformControls.attach(intersectedObjects[0].object);
        itemSelected = intersectedObjects[0].object;
        updateRightUiName();
    } else {
        if (transformControls.object && !transformControls.dragging){
            transformControls.detach();
            itemSelected = "none";
            updateRightUiName();
            
        }
    }
});


window.addEventListener('resize', () => {
    camera.aspect = parseInt(window.getComputedStyle(topUI).width) / parseInt(window.getComputedStyle(rightUI).height);
    camera.updateProjectionMatrix();

    renderer.setSize(parseInt(window.getComputedStyle(topUI).width), parseInt(window.getComputedStyle(rightUI).height));

});

widthInput.addEventListener("blur", () => {
    if ((widthInput.value.length == 0 || isNaN(widthInput.value)) && itemSelected > -1) {
        widthInput.focus();
    } else {
        simulation.items[itemSelected].dimensions.width = widthInput.value;
    }
});

heightInput.addEventListener("blur", () => {
    if ((heightInput.value.length == 0 || isNaN(widthInput.value)) && itemSelected > -1) {
        heightInput.focus();
    } else {
        simulation.items[itemSelected].dimensions.height = heightInput.value;
    }
});

depthInput.addEventListener("blur", () => {
    if ((depthInput.value.length == 0 || isNaN(widthInput.value)) && itemSelected > -1) {
        depthInput.focus();
    } else {
        simulation.items[itemSelected].dimensions.depth = depthInput.value;
    }
});

xInput.addEventListener("blur", () => {
    if ((xInput.value.length == 0 || isNaN(widthInput.value)) && itemSelected > -1) {
        xInput.focus();
    } else {
        simulation.items[itemSelected].dimensions.x = xInput.value;
    }
});

yInput.addEventListener("blur", () => {
    if ((yInput.value.length == 0 || isNaN(widthInput.value)) && itemSelected > -1) {
        yInput.focus();
    } else {
        simulation.items[itemSelected].dimensions.y = yInput.value;
    }
});

zInput.addEventListener("blur", () => {
    if ((zInput.value.length == 0 || isNaN(widthInput.value)) && itemSelected > -1) {
        zInput.focus();
    } else {
        simulation.items[itemSelected].dimensions.z = zInput.value;
    }
});

colorPicker.addEventListener("change", (event) => {
    if (itemSelected > -1) {
        simulation.boxes[itemSelected].mesh.material.color.set(`${event.target.value}`);
    }
});

//Temp
document.getElementById("add-cube-button").onclick = simulation.createBox.bind(simulation, 10, 1, 1, 2, 2, 2);