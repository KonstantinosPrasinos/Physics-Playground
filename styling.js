let rightUIisCollapsed = true;
let storedTheme = 'dark';
let itemSelected = -1;
let tutorialCompleted = false;
// let colorPicker 

let root = document.documentElement;
let topUI = document.getElementById("top-ui");
let rightUI = document.getElementById("right-ui");
let collapseRightUIButton = document.getElementById("collapse-right-ui-button");
let rightFeatures = document.getElementById("right-ui-features");
let objectNameField = document.getElementById("object-name");
let rightItems = document.getElementById("right-ui-items-list");
let itemsInScene = document.getElementById("items-in-scene");
let settingsOverlay = document.getElementById("settings-overlay");
let settingsBox = document.getElementById("settings-box");
let widthInput = document.getElementById("right-ui-width");
let heightInput = document.getElementById("right-ui-height");
let depthInput = document.getElementById("right-ui-depth");
let xInput = document.getElementById("right-ui-x");
let yInput = document.getElementById("right-ui-y");
let zInput = document.getElementById("right-ui-z");
let colorPicker = document.getElementById("color-picker");

if (!localStorage.theme) {
    localStorage.setItem("theme", "dark");
} else {
    setTheme(localStorage.getItem("theme"));
}

if (!localStorage.tutorialCompleted) {
    //Start tutorial
    localStorage.setItem("tutorialCompleted", "true");
}

function toggleRightUI() {
    if (rightUIisCollapsed) {
        let timeline = gsap.timeline();
        rightUI.style.visibility = 'visible';
        gsap.to(collapseRightUIButton, { duration: 0.2, right: '144px' });
        gsap.to(collapseRightUIButton, { duration: 0.2, rotation: 0 });
        timeline.to(rightUI, { duration: 0.2, width: '180px' })
            .to(rightFeatures, { duration: 0.2, opacity: 1 })
            .to(rightItems, { duration: 0.2, opacity: 1 }, '-=0.2')
            .to(itemsInScene, { duration: 0.2, opacity: 1 }, '-=0.2');
        rightUIisCollapsed = !rightUIisCollapsed;

    } else {
        let timeline = gsap.timeline();
        timeline.to(rightFeatures, { duration: 0.2, opacity: 0 })
            .to(rightItems, { duration: 0.2, opacity: 0 }, '-=0.2')
            .to(itemsInScene, { duration: 0.2, opacity: 0 }, '-=0.2')
            .to(rightUI, { duration: 0.2, width: '0px' })
            .to(collapseRightUIButton, { duration: 0.2, right: '8px' }, '-=0.2')
            .to(collapseRightUIButton, { duration: 0.2, rotation: 180, onComplete: function () { rightUI.style.visibility = 'hidden'; } }, '-=0.2');
        rightUIisCollapsed = !rightUIisCollapsed;
    }
}

function toggleSettings() {
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

function setInputObjectParameters() {
    if (itemSelected >= 0) {
        widthInput.value = simulation.items[itemSelected].dimensions.width;
        heightInput.value = simulation.items[itemSelected].dimensions.height;
        depthInput.value = simulation.items[itemSelected].dimensions.depth;
        xInput.value = simulation.items[itemSelected].position.x;
        yInput.value = simulation.items[itemSelected].position.y;
        zInput.value = simulation.items[itemSelected].position.z;
    } else {
        widthInput.value = '';
        heightInput.value = '';
        depthInput.value = '';
        xInput.value = '';
        yInput.value = '';
        zInput.value = '';
    }
}

settingsOverlay.addEventListener('click', (event) => {
    if (event.target !== event.currentTarget) {
        event.stopPropagation();
    } else {
        toggleSettings();
    }
});

canvas.addEventListener('mousedown', (event) => {
    if (document.activeElement !== colorPicker) {
        let intersectedObjects = checkForObject(event);
        if (intersectedObjects.length > 0) {
            for (let i = 0; i < simulation.items.length; i++) {
                if (simulation.items[i].uuid == intersectedObjects[0].uuid) {
                    objectNameField.innerText = simulation.items[i].name;
                    itemSelected = i;
                    setInputObjectParameters();
                    colorPicker.value = simulation.items[itemSelected].object.material.color;
                    // colorPicker.style.initialValue = simulation.items[itemSelected].object.material.color;
                    break;
                } else {
                    itemSelected = -1;
                    setInputObjectParameters();
                    objectNameField.innerText = 'No Item is Selected';
                }
            }
        } else {
            itemSelected = -1;
            setInputObjectParameters();
            objectNameField.innerText = 'No Item is Selected';
        }
    }
}, false);

window.addEventListener('resize', () => {
    console.log("hello");
    console.log(camera.aspect);
    camera.aspect = parseInt(window.getComputedStyle(topUI).width) / parseInt(window.getComputedStyle(rightUI).height);
    camera.updateProjectionMatrix();

    renderer.setSize(parseInt(window.getComputedStyle(topUI).width), parseInt(window.getComputedStyle(rightUI).height));

});

widthInput.addEventListener("blur", () => {
    console.log(itemSelected);
    if (widthInput.value.length == 0 || isNaN(widthInput.value) || itemSelected < 0) {
        widthInput.focus();
    } else {
        simulation.items[itemSelected].dimensions.width = widthInput.value;
    }
});

heightInput.addEventListener("blur", () => {
    if (heightInput.value.length == 0 || isNaN(heightInput.value) || itemSelected < 0) {
        heightInput.focus();
    } else {
        simulation.items[itemSelected].dimensions.height = heightInput.value;
    }
});

depthInput.addEventListener("blur", () => {
    if (depthInput.value.length == 0 || isNaN(depthInput.value) || itemSelected < 0) {
        depthInput.focus();
    } else {
        simulation.items[itemSelected].dimensions.depth = depthInput.value;
    }
});

xInput.addEventListener("blur", () => {
    if (xInput.value.length == 0 || isNaN(xInput.value) || itemSelected < 0) {
        xInput.focus();
    } else {
        simulation.items[itemSelected].dimensions.x = xInput.value;
    }
});

yInput.addEventListener("blur", () => {
    if (yInput.value.length == 0 || isNaN(yInput.value) || itemSelected < 0) {
        yInput.focus();
    } else {
        simulation.items[itemSelected].dimensions.y = yInput.value;
    }
});

zInput.addEventListener("blur", () => {
    console.log(simulation.items[itemSelected]);
    if (zInput.value.length == 0 || isNaN(zInput.value) || itemSelected < 0) {
        zInput.focus();
    } else {
        simulation.items[itemSelected].dimensions.z = zInput.value;
    }
});

colorPicker.addEventListener("change", (event) => {
    console.log("hello2", itemSelected);
    if (itemSelected > -1) {
        simulation.items[itemSelected].object.material.color.set(`${event.target.value}`);
    }
})