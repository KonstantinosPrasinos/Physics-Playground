let rightUIisCollapsed = false;
let storedTheme = 'dark';
let itemSelected = 'No item is Selected';
let tutorialCompleted = false;

let root = document.documentElement;
let topUI = document.getElementById("top-ui");
let rightUI = document.getElementById("right-ui");
let canvas = document.getElementById("viewportCanvas");
let collapseRightUIButton = document.getElementById("collapse-right-ui-button");
let rightFeatures = document.getElementById("right-ui-features");
let objectNameField = document.getElementById("object-name");
let rightItems = document.getElementById("right-ui-item-container");
let itemsInScene = document.getElementById("items-in-scene");
let settingsOverlay = document.getElementById("settings-overlay");
let settingsBox = document.getElementById("settings-box");

function toggleRightUI() {
    if (rightUIisCollapsed) {
        let timeline = gsap.timeline();
        gsap.to(topUI, { duration: 0.2, width: 'calc(100% - 240px)' });
        gsap.to(collapseRightUIButton, { duration: 0.2, right: '144px' });
        gsap.to(collapseRightUIButton, {duration: 0.2, rotation: 0});
        gsap.to(canvas, { duration: 0.2, width: 'calc(100% - 240px)' });
        timeline.to(rightUI, { duration: 0.2, width: '180px' })
            .to(rightFeatures, { duration: 0.2, opacity: 1 })
            .to(rightItems, { duration: 0.2, opacity: 1 }, '-=0.2')
            .to(itemsInScene, { duration: 0.2, opacity: 1 }, '-=0.2');
        rightUIisCollapsed = !rightUIisCollapsed;

    } else {
        let timeline = gsap.timeline();
        timeline.to(rightFeatures, { duration: 0.2, opacity: 0 },)
            .to(rightItems, { duration: 0.2, opacity: 0 }, '-=0.2')
            .to(itemsInScene, { duration: 0.2, opacity: 0 }, '-=0.2')
            .to(topUI, { duration: 0.2, width: 'calc(100% - 60px)' },)
            .to(rightUI, { duration: 0.2, width: '1px' }, '-=0.2')
            .to(collapseRightUIButton, { duration: 0.2, right: '8px' }, '-=0.2')
            .to(canvas, { duration: 0.2, width: 'calc(100% - 60px)' }, '-=0.2')
            .to(collapseRightUIButton, {duration: 0.2, rotation: 180}, '-=0.2');
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
                gsap.to("html", {duration: 0.2, "--primary-color": '#f1f2f6'});
                gsap.to("html", {duration: 0.2, "--secondary-color": '#1C212E'});
                localStorage.setItem("theme", "light");
                storedTheme = theme;
                document.getElementById("dark-theme-button").classList.toggle("theme-button-selected");
                document.getElementById("light-theme-button").classList.toggle("theme-button-selected");
                document.getElementById("dark-theme-button").classList.toggle("theme-button-unselected");
                document.getElementById("light-theme-button").classList.toggle("theme-button-unselected");
                break;
            case 'dark':
                gsap.to("html", {duration: 0.2, "--primary-color": '#1C212E'});
                gsap.to("html", {duration: 0.2, "--secondary-color": '#f1f2f6'});
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

function objectClicked() {

}

settingsOverlay.addEventListener('click', (event) => {
    if (event.target !== event.currentTarget) {
        event.stopPropagation();
    } else {
        toggleSettings();
    }
});

canvas.addEventListener('click', (event) => {
    let clickedOnItem = false;
    convertedPositionX = (cameraMetrics.aspectRatio * cameraMetrics.viewHeight / canvas.getBoundingClientRect().width * event.offsetX) - (cameraMetrics.aspectRatio * cameraMetrics.viewHeight / 2);
    convertedPositionY = (cameraMetrics.viewHeight / 2) - (cameraMetrics.viewHeight / canvas.getBoundingClientRect().height * event.offsetY);
    simulation.items.forEach(item => {
        if (item.position.x + (item.dimensions.width / 2) >= convertedPositionX && item.position.x - (item.dimensions.width / 2) <= convertedPositionX && item.position.y + (item.dimensions.height / 2) >= convertedPositionY && item.position.y - (item.dimensions.height / 2) <= convertedPositionY) {
            if (rightUIisCollapsed) {
                toggleRightUI();
            }
            itemSelected = item;
            clickedOnItem = true;
            objectNameField.innerText = itemSelected.name;
        }
    });
    if (!clickedOnItem) {
        itemSelected = 'No Item is Selected';
        objectNameField.innerText = itemSelected;
    }
});

canvas.addEventListener('mousemove', (event) => {
    if (rightUIisCollapsed) {
        convertedPositionX = (cameraMetrics.aspectRatio * cameraMetrics.viewHeight / canvas.getBoundingClientRect().width * event.offsetX) - (cameraMetrics.aspectRatio * cameraMetrics.viewHeight / 2);
        convertedPositionY = (cameraMetrics.viewHeight / 2) - (cameraMetrics.viewHeight / canvas.getBoundingClientRect().height * event.offsetY);
        simulation.items[0].position.x = convertedPositionX;
        simulation.items[0].position.y = convertedPositionY;
    }
});

if(!localStorage.theme) {
    localStorage.setItem("theme", "dark");
} else {
    setTheme(localStorage.getItem("theme"));
}

if(!localStorage.tutorialCompleted) {
    //Start tutorial
    localStorage.setItem("tutorialCompleted", "true");
}