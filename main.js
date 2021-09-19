let canvas = document.getElementById("viewportCanvas");

const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ canvas: viewportCanvas, antialias: true});
renderer.setClearColor( 0xffffff, 1);

renderer.setSize(parseInt(window.getComputedStyle(canvas).width), parseInt(window.getComputedStyle(canvas).height));

let cameraMetrics = {
    viewHeight: 900,
    aspectRatio: parseInt(window.getComputedStyle(canvas).width) / parseInt(window.getComputedStyle(canvas).height),
    near: 0.1,
    far: 20000,
    viewAngle: 45
}

let camera = new THREE.PerspectiveCamera( cameraMetrics.viewAngle, cameraMetrics.aspectRatio, cameraMetrics.near, cameraMetrics.far);
// var winResize	= new THREEx.WindowResize(renderer, camera);
camera.position.set(0,150,400);
camera.lookAt(scene.position);

// const camera = new THREE.OrthographicCamera(-cameraMetrics.aspectRatio * cameraMetrics.viewHeight / 2, cameraMetrics.aspectRatio * cameraMetrics.viewHeight / 2, cameraMetrics.viewHeight / 2, -cameraMetrics.viewHeight / 2, -1000, 1000);

let simulation = {
    gravity: 10,
    time: 0, //in ms
    timePerTick: 1, //in ms
    items: [],
    numberOfObjects: {
        boxes: []
    },
    tickHandling: function () {
        setInterval(() => {
            this.items.forEach(item => {
                item.checkDimensions();
                item.moveX();
                item.moveY();
            })
            this.time += this.timePerTick;
        }, this.timePerTick);
    },
    deleteObject: function (index) {
        this.items[index].removeFromScene();
        this.items.splice(index, 1);
        this.refreshListOfObjects();
    },
    addObjectToList(index){
        let node = document.createElement("DIV");
        let textNode = document.createElement("input");
        let editButtonNode = document.createElement('input');
        let deleteButtonNode = document.createElement('input');
        let lockButtonNode = document.createElement('input');
        
        node.classList.add("item-list-field");
        textNode.type = 'text';
        textNode.value = this.items[index].name;
        textNode.setAttribute('required', "");
        textNode.classList.add("item-list-editable");

        editButtonNode.type = 'button';
        editButtonNode.classList.add("icon-buttons");
        editButtonNode.classList.add("item-list-field-edit-button");
        editButtonNode.classList.add("small-icon-buttons");
        editButtonNode.addEventListener('click', () =>{
            textNode.focus();
        });

        deleteButtonNode.type = 'button';
        deleteButtonNode.classList.add("item-list-field-delete-button");
        deleteButtonNode.classList.add("icon-buttons");
        deleteButtonNode.classList.add("small-icon-buttons");
        deleteButtonNode.addEventListener('click', () => {
            this.deleteObject(index);
        });


        lockButtonNode.type = 'button';
        lockButtonNode.classList.add("item-list-lock-button");
        lockButtonNode.classList.add("icon-buttons");
        lockButtonNode.classList.add("small-icon-buttons");
        lockButtonNode.addEventListener('click', () => {
            this.items[index].moveable = !this.items[index].moveable;
            console.log(this.items[index].moveable);
            if(!this.items[index].moveable) {
                lockButtonNode.style.backgroundColor = 'orange';
            } else {
                lockButtonNode.style.backgroundColor = 'var(--secondary-color)';
            }
        })

        textNode.addEventListener("blur", () => {
            if (textNode.value.length == 0) {
                textNode.focus();
            } else {
                this.items[index].name = textNode.value;
            }
        });
        node.appendChild(textNode);
        node.appendChild(deleteButtonNode);
        node.appendChild(editButtonNode);
        node.appendChild(lockButtonNode);
        document.getElementById("right-ui-item-container").appendChild(node);
    },
    refreshListOfObjects(){
        while(document.getElementById("right-ui-item-container").firstChild){
            document.getElementById("right-ui-item-container").removeChild(document.getElementById("right-ui-item-container").firstChild);
        }
        for (let index in this.items){
            this.addObjectToList(index);
        }
    },
    addCube(coordX, coordY, coordz){
        simulation.items.push(new item('box', { width: 10, height: 10, depth: 10 }, 0x000000, { x: coordX, y: coordY, z: coordz }));
        this.refreshListOfObjects();
    },
    checkCollisions(){
        let collisions = [];
        for (const index in this.items){
            for (const key in this.items) {
                if (key == 0 && index == 1) {
                    if (((this.items[index].position.x - (this.items[index].dimensions.width / 2)) <= (this.items[key].position.x + (this.items[key].dimensions.width) / 2)) && ((this.items[index].position.x + (this.items[index].dimensions.width / 2)) >= (this.items[key].position.x + (this.items[key].dimensions.width) / 2))){
                        console.log("Type 1 collision");
                    }
                    if (((this.items[index].position.x - (this.items[index].dimensions.width / 2)) <= (this.items[key].position.x - (this.items[key].dimensions.width) / 2)) && ((this.items[index].position.x + (this.items[index].dimensions.width / 2)) >= (this.items[key].position.x - (this.items[key].dimensions.width) / 2))){
                        console.log("Type 2 collision");
                    }
                }
            }
        }
    }
}

class item {
    constructor(type, dimensions, color, position) {
        this.type = type;
        this.moveable = true;
        this.itemNode;

        if (type == 'box') {
            simulation.numberOfObjects.boxes++;
            this.name = `Box${simulation.numberOfObjects.boxes}`;
            this.geometry = new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth);
            this.material = new THREE.MeshBasicMaterial();
            this.material.color.set(color);
            this.object = new THREE.Mesh(this.geometry, this.material);
            this.dimensions = dimensions;
            this.position = position;
            scene.add(this.object);
        }

        this.velocity = {
            x: 0,
            y: 0,
            z: 0
        }

        this.acceleration = {
            x: 0,
            y: 0,
            z: 0
        }

        this.removeFromScene = function () {
            scene.remove(this.object);
        }

        this.moveX = function () {
            this.position.x += (this.velocity.x * simulation.timePerTick) + (0.5 * this.acceleration.x * Math.pow(simulation.timePerTick / 1000, 2));
            this.velocity.x += this.acceleration.x * simulation.timePerTick;
            this.object.position.x = this.position.x;
        }

        this.moveY = function () {
            this.position.y += (this.velocity.y * simulation.timePerTick) + (0.5 * this.acceleration.y * Math.pow(simulation.timePerTick / 1000, 2));
            this.velocity.y += this.acceleration.y * simulation.timePerTick;
            this.object.position.y = this.position.y;
        }

        this.moveZ = function () {
            this.position.z += (this.velocity.z * simulation.timePerTick) + (0.5 * this.acceleration.z * Math.pow(simulation.timePerTick / 1000, 2));
            this.velocity.z += this.acceleration.z * simulation.timePerTick;
            this.object.position.z = this.position.z;
        }

        this.checkDimensions = function () {
            this.dimensions.width = this.geometry.parameters.width * this.object.scale.x;
            this.dimensions.height = this.geometry.parameters.height * this.object.scale.y;
            this.dimensions.depth = this.geometry.parameters.depth * this.object.scale.z;
        }
    }
}

// simulation.items.push(new item('box', { width: 10, height: 300, depth: 100 }, 0x000000, { x: 500, y: 100, z: 0 }));
// simulation.items.push(new item('box', { width: 100, height: 300, depth: 100 }, 0x000000, { x: -670, y: 0, z: 0 }));
// simulation.addCube();
const animate = function () {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};

animate();

simulation.tickHandling();
simulation.refreshListOfObjects();

// var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);

function checkForObject(event){
    let mouseVector = new THREE.Vector2();
    let rayCaster = new THREE.Raycaster();

    mouseVector.x = (event.offsetX /  parseInt(window.getComputedStyle(canvas).width)) * 2 - 1;
    mouseVector.y = -(event.offsetY /  parseInt(window.getComputedStyle(canvas).height)) * 2 + 1;

    rayCaster.setFromCamera(mouseVector, camera);
    const intersectedObjects = rayCaster.intersectObjects(scene.children);

    return intersectedObjects;
}