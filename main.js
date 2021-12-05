import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';

import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/TransformControls.js';

let canvas = document.getElementById("viewportCanvas");
let topTime = document.getElementById("time");

let rayDirection, savedBoxes = [], scene, renderer, camera, world, timeStep = 1 / 60, orbitControls, transformControls, previousLogedTime;

function changeTimeStep(temp){
    timeStep = temp;
}

//Init Functions

function initControls(){
    orbitControls = new OrbitControls( camera, renderer.domElement );
    transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.addEventListener('change', render);
    scene.add(transformControls);
}

function initThree() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, parseInt(window.getComputedStyle(canvas).width) / parseInt(window.getComputedStyle(canvas).height), 1, 2000);
    camera.position.z = 50;
    scene.add(camera);

    renderer = new THREE.WebGLRenderer({ canvas: viewportCanvas, antialias: true});
    renderer.setClearColor( 0xffffff, 1);
    renderer.setSize(parseInt(window.getComputedStyle(canvas).width), parseInt(window.getComputedStyle(canvas).height));
}

function initCannon() {
    world = new CANNON.World();
    world.gravity.set(0, 0, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
    world.dt = timeStep;
}

//Timed Functions

function attemptPrintPerStep(){
    console.log(simulation.logPerSteps != 0, ((world.time / world.dt) % simulation.logPerSteps < world.dt || Math.abs(simulation.logPerSteps - (world.time / world.dt) % simulation.logPerSteps) < world.dt), previousLogedTime != world.time, world.time)
    // console.log(simulation.logPerSteps != 0, (world.time / world.dt) % simulation.logPerSteps, previousLogedTime != world.time);
    if (simulation.logPerSteps != 0 && ((world.time / world.dt) % simulation.logPerSteps < world.dt || Math.abs(simulation.logPerSteps - (world.time / world.dt) % simulation.logPerSteps) < world.dt) && previousLogedTime != world.time){
        console.log("succeeeded");
        printToLog();
        previousLogedTime = world.time;
    }
}

function updatePhysics() {
    world.step(world.dt);
    attemptPrintPerStep();
    simulation.boxes.forEach(element => {
        element.mesh.position.copy(element.body.position);
        element.mesh.quaternion.copy(element.body.quaternion);
    });
}

function render() {
    topTime.innerText = parseInt(world.time);
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate);
    if (!simulation.isPaused){
        updatePhysics();
    }
    render();
}

//General Functions
//To change mass you change the mass and set call the updateMassProperties() method

function generateJSON(){
    let logObj = {};
    let timeLine = {}
    simulation.boxes.forEach((item) => {
        timeLine[item.mesh.uuid] = {name: item.mesh.name, mass: item.body.mass, position: {x: item.body.position.x, y: item.body.position.y, z: item.body.position.z}, velocity: {x: item.body.velocity.x, y: item.body.velocity.y, z: item.body.velocity.z}, rotation: {x: item.mesh.rotation.x, y: item.mesh.rotation.y, z: item.mesh.rotation.z}, angularVelocity: {x: item.body.angularVelocity.x, y: item.body.angularVelocity.y, z: item.body.angularVelocity.z}, force: {x: item.body.force.x, y: item.body.force.y, z: item.body.force.z}}
    });
    logObj[parseInt(world.time)] = timeLine;
    return logObj;
}

function printToLog(){
    let log = document.getElementById("log");
    if (!simulation.savedLog){
        simulation.savedLog = generateJSON();
    } else {
        let line = generateJSON();
        for (const index in line){
            simulation.savedLog[index] = line[index];
        }
    }
    log.innerHTML += `At time ${parseFloat(world.time).toFixed(3)}:`;
    if (simulation.boxes.length){
        log.innerHTML += "<br>";
        log.innerHTML += "Name - Mass - Position - Velocity - Rotation - Angular Velocity - Force";
        log.innerHTML += "<br>";
        simulation.boxes.forEach((item) => {
            log.innerHTML += `${item.mesh.name} | ${item.body.mass} | ${item.body.position.x}, ${item.body.position.y}, ${item.body.position.z} | ${item.body.velocity.x}, ${item.body.velocity.y}, ${item.body.velocity.z} | `;
            log.innerHTML += `${item.mesh.rotation.x}, ${item.mesh.rotation.y}, ${item.mesh.rotation.z} | ${item.body.angularVelocity.x}, ${item.body.angularVelocity.y}, ${item.body.angularVelocity.z} | ${item.body.force.x}, ${item.body.force.y}, ${item.body.force.z}`;
            log.innerHTML += "<br>";
        });
        log.innerHTML += "<br>";
    } else {
        log.innerHTML += "<br>";
        log.innerHTML += "No items in scene";
        log.innerHTML += "<br>";
        log.innerHTML += "<br>";
    }
}

function updateName(itemSelected){

}

function addItemToList(index){
    let node = document.createElement("DIV");
    let textNode = document.createElement("input");
    let editButtonNode = document.createElement('input');
    let deleteButtonNode = document.createElement('input');
    let lockButtonNode = document.createElement('input');

    node.classList.add("item-list-field");
    textNode.type = 'text';
    textNode.value = simulation.boxes[index].mesh.name;
    textNode.setAttribute('required', "");
    textNode.classList.add("item-list-editable");

    editButtonNode.type = 'button';
    editButtonNode.classList.add("icon-buttons");
    editButtonNode.classList.add("item-list-field-edit-button");
    editButtonNode.classList.add("small-icon-buttons");
    editButtonNode.addEventListener('click', () => {
        textNode.focus();
    });

    deleteButtonNode.type = 'button';
    deleteButtonNode.classList.add("item-list-field-delete-button");
    deleteButtonNode.classList.add("icon-buttons");
    deleteButtonNode.classList.add("small-icon-buttons");
    deleteButtonNode.addEventListener('click', () => {
        deleteObjectFromList(index);
    });


    lockButtonNode.type = 'button';
    lockButtonNode.classList.add("item-list-lock-button");
    lockButtonNode.classList.add("icon-buttons");
    lockButtonNode.classList.add("small-icon-buttons");
    lockButtonNode.addEventListener('click', () => {
        simulation.boxes[index].mesh.userData.moveable = !simulation.boxes[index].mesh.userData.moveable;
        if (!simulation.boxes[index].mesh.userData.moveable) {
            lockButtonNode.style.backgroundColor = 'orange';
        } else {
            lockButtonNode.style.backgroundColor = 'var(--secondary-color)';
        }
    })

    textNode.addEventListener("blur", () => {
        if (textNode.value.length == 0) {
            textNode.focus();
        } else {
            simulation.boxes[index].mesh.name = textNode.value;
            document.getElementById("object-name").innerText = simulation.boxes[index].mesh.name;
        }
    });
    textNode.addEventListener("keydown", (event) => {
        if (event.key === 'Enter' && document.activeElement.value.length != 0){
            document.activeElement.blur();
        }
    });
    node.appendChild(textNode);
    node.appendChild(deleteButtonNode);
    node.appendChild(editButtonNode);
    node.appendChild(lockButtonNode);
    document.getElementById("right-ui-item-container").appendChild(node);
}

function deleteObjectFromList(index) {
    scene.remove(simulation.boxes[index].mesh);
    world.remove(simulation.boxes[index].body);
    simulation.boxes.splice(index, 1);
    refreshListOfObjects();
}

function refreshListOfObjects(){
    while(document.getElementById("right-ui-item-container").firstChild){
        document.getElementById("right-ui-item-container").removeChild(document.getElementById("right-ui-item-container").firstChild);
    }
    for (let index in simulation.boxes){
        addItemToList(index);
    }
}

function processArtificialGravity(){
    // simulation.boxes[0].body.mass = 10**12;
    // simulation.boxes[0].body.updateMassProperties();
    // simulation.boxes[1].body.mass = 10**12;
    // simulation.boxes[1].body.updateMassProperties();
    const zero = new CANNON.Vec3(0, 0, 0);
    for (const index in simulation.boxes){
        simulation.boxes[index].body.force = zero;
    }
    
    for (let i = 0; i < simulation.boxes.length - 1; i++){
        for (let j = i + 1; j < simulation.boxes.length; j ++ ){
            calculateGravity(simulation.boxes[0], simulation.boxes[1]);
        }
    }
    
}

function updateVectors(object) {
    let F, V, direction, length, origin = object.mesh.position;;
    for (const index in object.mesh.children) {
        switch (object.mesh.children[index].name) {
            case "resultantForceVector":
                F = Math.sqrt(object.body.force.x ** 2 + object.body.force.y ** 2 + object.body.force.z ** 2);
                direction = ((new THREE.Vector3(object.body.force.x, object.body.force.y, object.body.force.z)).add(origin)).normalize();
                length = F / 10;
                object.mesh.children[index].setDirection(direction);
                object.mesh.children[index].setLength(length);
                break;
            case "forceVectorX":
                direction = ((new THREE.Vector3(object.body.force.x, origin.y, origin.z)).add(origin)).normalize();
                length = object.body.force.x / 10;
                object.mesh.children[index].setDirection(direction);
                object.mesh.children[index].setLength(length);
                break;
            case "forceVectorY":
                direction = ((new THREE.Vector3(origin.x, object.body.force.y, origin.z)).add(origin)).normalize();
                length = object.body.force.y / 10;
                object.mesh.children[index].setDirection(direction);
                object.mesh.children[index].setLength(length);
                break;
            case "forceVectorZ":
                direction = ((new THREE.Vector3(origin.x, origin.y, object.body.force.z)).add(origin)).normalize();
                length = object.body.force.z / 10;
                object.mesh.children[index].setDirection(direction);
                object.mesh.children[index].setLength(length);
                break;
            case "resultantVelocityVector":
                V = Math.sqrt(object.body.velocity.x ** 2 + object.body.velocity.y ** 2 + object.body.velocity.z ** 2);
                direction = ((new THREE.Vector3(object.body.velocity.x, object.body.velocity.y, object.body.velocity.z)).add(origin)).normalize();
                length = V / 10;
                object.mesh.children[index].setDirection(direction);
                object.mesh.children[index].setLength(length);
                break;
            case "velocityVectorX":
                direction = ((new THREE.Vector3(object.body.velocity.x, origin.y, origin.z)).add(origin)).normalize();
                length = object.body.velocity.x / 10;
                object.mesh.children[index].setDirection(direction);
                object.mesh.children[index].setLength(length);
                break;
            case "velocityVectorY":
                direction = ((new THREE.Vector3(origin.x, object.body.velocity.y, origin.z)).add(origin)).normalize();
                length = object.body.velocity.y / 10;
                object.mesh.children[index].setDirection(direction);
                object.mesh.children[index].setLength(length);
                break;
            case "velocityVectorZ":
                direction = ((new THREE.Vector3(origin.x, origin.y, object.body.velocity.z)).add(origin)).normalize();
                length = object.body.velocity.z / 10;
                object.mesh.children[index].setDirection(direction);
                object.mesh.children[index].setLength(length);
                break;
            default:
                break;
        }
    }
}

function toggleResultantForceVector(object){
    for (const index in object.mesh.children){
        if (object.mesh.children[index].name == "resultantForceVector"){
            object.mesh.remove(object.mesh.children[index]);
            return true;
        }
    }
    const F = Math.sqrt(object.body.force.x ** 2 + object.body.force.y ** 2 + object.body.force.z ** 2);
    if (F != 0){
        const origin = object.mesh.position;
        const direction = ((new THREE.Vector3(object.body.force.x, object.body.force.y, object.body.force.z)).add(origin)).normalize();
        const length = F / 10;
        const hex = 0xffff00;
        const arrowHelper = new THREE.ArrowHelper(direction, origin, length, hex);
        arrowHelper.name = "resultantForceVector";
        object.mesh.add(arrowHelper);
    }
}

function toggleComponentForcesVectors(object){
    let vectorsFound = false;
    for (const index in object.mesh.children){
        switch (object.mesh.children[index].name) {
            case "forceVectorX":
            case "forceVectorY":
            case "forceVectorZ":
                vectorsFound = true;
                object.mesh.remove(object.mesh.children[index]);
                break;
            default:
                break;
        }
    }
    if (vectorsFound == false){
        const origin = object.mesh.position;
        if (object.body.force.x != 0){
            const directionX = ((new THREE.Vector3(object.body.force.x, origin.y, origin.z)).add(origin)).normalize();
            const lengthX = object.body.force.x / 10;
            const hexX = 0x00cdcd;
            const arrowHelperX = new THREE.ArrowHelper(directionX, origin, lengthX, hexX);
            arrowHelperX.name = "forceVectorX";
            object.mesh.add(arrowHelperX);
        }
        if (object.body.force.y != 0){
            const directionY = ((new THREE.Vector3(origin.x, object.body.force.y, origin.z)).add(origin)).normalize();
            const lengthY = object.body.force.y / 10;
            const hexY = 0xcd00cd;
            const arrowHelperY = new THREE.ArrowHelper(directionY, origin, lengthY, hexY);
            arrowHelperY.name = "forceVectorY";
            object.mesh.add(arrowHelperY);
        }
        if (object.body.force.z != 0){
            const directionZ = ((new THREE.Vector3(origin.x, origin.y, object.body.force.y)).add(origin)).normalize();
            const lengthZ = object.body.force.z / 10;
            const hexZ = 0xcd00cd;
            const arrowHelperZ = new THREE.ArrowHelper(directionZ, origin, lengthZ, hexZ);
            arrowHelperZ.name = "forceVectorZ";
            object.mesh.add(arrowHelperZ);
        }
    }
}

function toggleResultantVelocityVector(object){
    for (const index in object.mesh.children){
        if (object.mesh.children[index].name == "resultantVelocityVector"){
            object.mesh.remove(object.mesh.children[index]);
            return true;
        }
    }
    const V = Math.sqrt(object.body.velocity.x ** 2 + object.body.velocity.y ** 2 + object.body.velocity.z ** 2);
    if (V != 0){
        const origin = object.mesh.position;
        const direction = ((new THREE.Vector3(object.body.velocity.x, object.body.velocity.y, object.body.velocity.z)).add(origin)).normalize();
        const length = V / 10;
        const hex = 0x00ffff;
        const arrowHelper = new THREE.ArrowHelper(direction, origin, length, hex);
        arrowHelper.name = "resultantVelocityVector";
        object.mesh.add(arrowHelper);
    }
}

function toggleComponentVelocityVectors(object){
    let vectorsFound = false;
    for (const index in object.mesh.children){
        switch (object.mesh.children[index].name) {
            case "velocityVectorX":
            case "velocityVectorY":
            case "velocityVectorZ":
                vectorsFound = true;
                object.mesh.remove(object.mesh.children[index]);
                break;
            default:
                break;
        }
    }
    if (vectorsFound == false){
        const origin = object.mesh.position;
        if (object.body.velocity.x != 0){
            const directionX = ((new THREE.Vector3(object.body.velocity.x, origin.y, origin.z)).add(origin)).normalize();
            const lengthX = object.body.velocity.x / 10;
            const hexX = 0x007878;
            const arrowHelperX = new THREE.ArrowHelper(directionX, origin, lengthX, hexX);
            arrowHelperX.name = "velocityVectorX";
            object.mesh.add(arrowHelperX);
        }
        if (object.body.velocity.y != 0){
            const directionY = ((new THREE.Vector3(origin.x, object.body.velocity.y, origin.z)).add(origin)).normalize();
            const lengthY = object.body.velocity.y / 10;
            const hexY = 0x780078;
            const arrowHelperY = new THREE.ArrowHelper(directionY, origin, lengthY, hexY);
            arrowHelperY.name = "velocityVectorY";
            object.mesh.add(arrowHelperY);
        }
        if (object.body.velocity.z != 0){
            const directionZ = ((new THREE.Vector3(origin.x, origin.y, object.body.velocity.y)).add(origin)).normalize();
            const lengthZ = object.body.velocity.z / 10;
            const hexZ = 0x787800;
            const arrowHelperZ = new THREE.ArrowHelper(directionZ, origin, lengthZ, hexZ);
            arrowHelperZ.name = "velocityVectorZ";
            object.mesh.add(arrowHelperZ);
        }
    }
}



function calculateGravity(object1, object2){
    const G = 6.67408 * 10 **(-11);

    const distance = object1.body.position.distanceTo(object2.body.position);

    //We calculate the total force of gravity between each body is causing to the other
    let Fg = G * (object1.body.mass  * object2.body.mass) / (distance ** 2);

    //We calculate the components of the force vector
    let c = Fg / (Math.sqrt((object2.body.position.x - object1.body.position.x)**2 + (object2.body.position.y - object1.body.position.y)**2) + (object2.body.position.z - object1.body.position.z)**2);

    let Fx = c * (object2.body.position.x - object1.body.position.x);
    let Fy = c * (object2.body.position.y - object1.body.position.y);
    let Fz = c * (object2.body.position.z - object1.body.position.z);

    //We add to each body the force calculated for each axis
    if (object1.mesh.userData.affectedByGravity && object2.mesh.userData.createsGravity){
        const F1 = new CANNON.Vec3(object1.body.force.x + Fx, object1.body.force.y + Fy, object1.body.force.z + Fz);
        object1.body.force = F1;
    }

    if (object2.mesh.userData.affectedByGravity && object1.mesh.userData.createsGravity){
        const F2 = new CANNON.Vec3(object2.body.force.x - Fx, object2.body.force.y - Fy, object2.body.force.z - Fz);
        object2.body.force = F2;
    }
}

function isObject(item){
    return (typeof item === "object" && !Array.isArray(item) && item !== null);
}

async function copyBoxes(){
    for (let i = 0; i < simulation.boxes.length; i++){
        let copyBody = {}, copyMesh, copyName;
        //Deep copy of the cannonjs body
        for (const key in simulation.boxes[i].body){
            if (simulation.boxes[i].body){
                if (isObject(simulation.boxes[i].body[key])){
                    if (key === "world"){
                        copyBody[key] = world;
                    } else if (key === "invInertiaWorld"){
                        copyBody[key] = simulation.boxes[i].body[key];
                    } else if (key === "invInertiaWorldSolve"){
                        copyBody[key] = simulation.boxes[i].body[key];
                    } else {
                        copyBody[key] = simulation.boxes[i].body[key].clone();
                    }
                } else {
                    copyBody[key] = simulation.boxes[i].body[key];
                }
            }
        }
        //Deep copy of the threejs mesh
        copyMesh = simulation.boxes[i].mesh.clone();

        //Assigning all of the above to an object ... object and adding it to the copied boxes array
        let box = {
            body: copyBody,
            mesh: copyMesh
        }
        savedBoxes.push(box);
    }
    
}

//Simulation Object

let simulation = {
    boxes: [],
    shapesForChanges: [],
    isPaused: true,
    logPerSteps: 0,
    savedLog: null,
    createBox(x, y, z, width, height, depth){
        let shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
        let tempBody = new CANNON.Body({
            mass: 4
        });
        tempBody.addShape(shape);
        tempBody.position.set(x, y, z);
        world.addBody(tempBody);

        let geometry = new THREE.BoxGeometry( width, height, depth);
        let material = new THREE.MeshBasicMaterial( {color: 0xff0000, wireframe: true} );
        let tempMesh = new THREE.Mesh(geometry, material);
        tempMesh.position.set(x, y, z);
        tempMesh.userData.createsGravity = true;
        tempMesh.userData.affectedByGravity = true;
        tempMesh.userData.moveable = true;
        scene.add(tempMesh);

        let i = 0;
        if (this.boxes.length){
            for (i; i < this.boxes.length; ) {
                for (const box of this.boxes) {
                    if (box.mesh.name.includes('-')){
                        let tempString = box.mesh.name.split('-');
                        if (tempString[0] == 'Box' && (parseInt(tempString[1]).toString().length == tempString[1].length)){
                            let number = parseInt(tempString[1]);
                            if (number == i){
                                i++;
                                break;
                            }
                        }
                    }
                }
            }
        }
        tempMesh.name = `Box-${i}`;
        let box = {
            body: tempBody,
            mesh: tempMesh
        }
        this.boxes.push(box);
        addItemToList(this.boxes.length - 1);
    },
    checkForObject(event){
        let mouseVector = new THREE.Vector2();
        let rayCaster = new THREE.Raycaster();
    
        mouseVector.x = (event.offsetX /  parseInt(window.getComputedStyle(canvas).width)) * 2 - 1;
        mouseVector.y = -(event.offsetY /  parseInt(window.getComputedStyle(canvas).height)) * 2 + 1;
    
        rayCaster.setFromCamera(mouseVector, camera);
        rayDirection = rayCaster.ray.direction;

        return rayCaster.intersectObjects(scene.children);
    },
    removeAllObjects(){
        world.time = 0;
        //Remove all Meshes from scene
        for (let i = 0; i < scene.children.length; i++){
            if(scene.children[i].type === "Mesh"){
                scene.remove(scene.children[i]);
                i--;
            }
        }
        //Remove all Bodies from world
        while (world.bodies.length > 0){
            world.removeBody(world.bodies[0]);
        }
    },
    addAllObjects(){
        //Adds all Bodies to the world and Meshes to the scene
        for (let i = 0; i < this.boxes.length; i++){
            scene.add(this.boxes[i].mesh);
            world.addBody(this.boxes[i].body);
        }
    },
    
}

//Function Call and Export

initThree();
initCannon();
initControls();

animate();
export {simulation, camera, transformControls, orbitControls, copyBoxes, renderer, updateVectors, world, changeTimeStep, printToLog, generateJSON};