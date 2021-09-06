let rightUIisCollapsed = false;
let topUI = document.getElementById("top-ui");
let rightUI = document.getElementById("right-ui");
let canvas = document.getElementById("viewportCanvas");
let collapseRightUIButton = document.getElementById("collapse-right-ui");
let rightFeatures = document.getElementById("right-ui-features");
let objectNameField = document.getElementById("object-name");
let rightItems = document.getElementById("right-ui-item-container");
let itemsInScene = document.getElementById("items-in-scene");
let settingsOverlay = document.getElementById("settings-overlay");
let settingsBox = document.getElementById("settings-box");

let itemSelected = 'No item is Selected';

function toggleRightUI() {
    if (rightUIisCollapsed) {
        let timeline = gsap.timeline();
        gsap.to(topUI, { duration: 0.2, width: '84%' });
        gsap.to(collapseRightUIButton, { duration: 0.2, right: '10%' });
        gsap.to(canvas, { duration: 0.2, width: '84%' });
        timeline.to(rightUI, { duration: 0.2, width: '12%' })
            .to(rightFeatures, { duration: 0.2, opacity: 1 })
            .to(rightItems, { duration: 0.2, opacity: 1 }, '-=0.2')
            .to(itemsInScene, { duration: 0.2, opacity: 1 }, '-=0.2');
        collapseRightUIButton.style.backgroundImage = 'url(/assets/collapse-right-white.png)';
        rightUIisCollapsed = !rightUIisCollapsed;

    } else {
        let timeline = gsap.timeline();
        timeline.to(rightFeatures, { duration: 0.2, opacity: 0 },)
            .to(rightItems, { duration: 0.2, opacity: 0 }, '-=0.2')
            .to(itemsInScene, { duration: 0.2, opacity: 0 }, '-=0.2')
            .to(topUI, { duration: 0.2, width: '96%' },)
            .to(rightUI, { duration: 0.2, width: '1%' }, '-=0.2')
            .to(collapseRightUIButton, { duration: 0.2, right: '0.5%' }, '-=0.2')
            .to(canvas, { duration: 0.2, width: '96%' }, '-=0.2');
        collapseRightUIButton.style.backgroundImage = 'url(/assets/collapse-left-white.png)';
        rightUIisCollapsed = !rightUIisCollapsed;
    }
}

function toggleSettings() {
    function toggleVisibility() { settingsOverlay.style.visibility = 'hidden'; }
    if (window.getComputedStyle(settingsOverlay).visibility == 'hidden') {
        let timeline = gsap.timeline();
        settingsOverlay.style.visibility = 'visible';
        timeline.to(settingsOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)', duration: 0.15 })
            .to(settingsBox, { backgroundColor: 'rgba(28, 33, 46, 1)', duration: 0.15 }, '-=0.16');
    } else {
        let timeline = gsap.timeline();
        timeline.to(settingsOverlay, { backgroundColor: 'rgba(0, 0, 0, 0)', duration: 0.15, onComplete: toggleVisibility })
            .to(settingsBox, { backgroundColor: 'rgba(28, 33, 46, 0)', duration: 0.15 }, '-=0.15');;
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
})