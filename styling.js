let rightUIisCollapsed = false;
let topUI = document.getElementById("top-ui");
let rightUI = document.getElementById("right-ui");
let canvas = document.getElementById("viewportCanvas");
let collapseRightUIButton = document.getElementById("collapse-right-ui");
let rightFeatures = document.getElementById("right-ui-features");
let objectNameField = document.getElementById("object-name");

let itemSelected = 'No item is Selected';

function toggleRightUI(){
    if (rightUIisCollapsed){
        let timeline = gsap.timeline();
        gsap.to(topUI, {duration: 0.2, width: '84%'});
        gsap.to(collapseRightUIButton, {duration: 0.2, right: '10%'});
        gsap.to(canvas, {duration: 0.2, width: '84%'});
        timeline.to(rightUI, {duration: 0.2, width: '12%'})
        .to(rightFeatures, {duration: 0.2, opacity: 1});
        collapseRightUIButton.style.backgroundImage = 'url(/assets/collapse-right-white.png)';
        rightUIisCollapsed = !rightUIisCollapsed;

    } else {
        let timeline = gsap.timeline();
        timeline.to(rightFeatures, {duration: 0.2, opacity: 0}, )
        .to(topUI, {duration: 0.2, width: '96%'}, )
        .to(rightUI, {duration: 0.2, width: '1%'}, '-=0.2')
        .to(collapseRightUIButton, {duration: 0.2, right: '0.5%'}, '-=0.2')
        .to(canvas, {duration: 0.2, width: '96%'}, '-=0.2');
        collapseRightUIButton.style.backgroundImage = 'url(/assets/collapse-left-white.png)';
        rightUIisCollapsed = !rightUIisCollapsed;
    }
}

function objectClicked(){

}


document.addEventListener('click', (event) => {
    if (event.clientX > canvas.getBoundingClientRect().left && event.clientX < (canvas.getBoundingClientRect().left + canvas.getBoundingClientRect().width)){
        if (event.clientY > canvas.getBoundingClientRect().top && event.clientY < (canvas.getBoundingClientRect().top + canvas.getBoundingClientRect().height)){
            let clickedOnItem = false;
            convertedPositionX = (cameraMetrics.aspectRatio * cameraMetrics.viewHeight / canvas.getBoundingClientRect().width * event.offsetX) - (cameraMetrics.aspectRatio * cameraMetrics.viewHeight / 2);
            convertedPositionY = (cameraMetrics.viewHeight / 2) - (cameraMetrics.viewHeight / canvas.getBoundingClientRect().height * event.offsetY);
            simulation.items.forEach(item => {
                // console.log(item.name, item.position.y - (item.dimensions.height / 2) <= convertedPositionX);
                if (item.position.x + (item.dimensions.width / 2) >= convertedPositionX && item.position.x - (item.dimensions.width / 2) <= convertedPositionX && item.position.y + (item.dimensions.height / 2) >= convertedPositionY && item.position.y - (item.dimensions.height / 2) <= convertedPositionY){
                    itemSelected = item;
                    clickedOnItem = true;
                    objectNameField.innerText = itemSelected.name;
                }
            });
            if (!clickedOnItem) {
                itemSelected = 'No Item is Selected';
                objectNameField.innerText = itemSelected;
            }
        }
    }
})