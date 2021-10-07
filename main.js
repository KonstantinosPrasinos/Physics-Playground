let canvas = document.getElementById("viewportCanvas");
let topTime = document.getElementById("time");

let scene, renderer, camera, world, timeStep = 1 / 60;

let savedBoxes = [];

function isObject(item){
    return (typeof item === "object" && !Array.isArray(item) && item !== null);
}

function initThree() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, parseInt(window.getComputedStyle(canvas).width) / parseInt(window.getComputedStyle(canvas).height), 1, 2000);
    camera.position.z = 100;
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
}

function updatePhysics() {
    world.step(timeStep);
    topTime.innerText = parseInt(world.time);

    simulation.boxes.forEach(element => {
        element.mesh.position.copy(element.body.position);
        element.mesh.quaternion.copy(element.body.quaternion);
    });

}

function render() {
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate);
    if (!simulation.isPaused){
        updatePhysics();
    }
    render();
}

async function copyBoxes(){
    
    for (let i = 0; i < simulation.boxes.length; i++){
        let copyBody = {}, copyMesh, copyName;
        //Deep copy of the cannonjs body
        for (key in simulation.boxes[i].body){
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
        //Copy of the name of the object
        copyName = simulation.boxes[i].name;

        //Assigning all of the above to an object ... object and adding it to the copied boxes array
        let box = {
            body: copyBody,
            mesh: copyMesh,
            name: copyName
        }
        savedBoxes.push(box);
    }
    
}

let simulation = {
    boxes: [],
    isPaused: true,
    createBox(x, y, z, width, height, depth){
        let shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
        let tempBody = new CANNON.Body({
            mass: 1
        });
        tempBody.addShape(shape);
        tempBody.position.set(x, y, z);
        // tempBody.angularVelocity.set(0, 10, 0);
        // tempBody.angularDamping = 0.5;
        world.addBody(tempBody);

        let geometry = new THREE.BoxGeometry( width, height, depth);
        let material = new THREE.MeshBasicMaterial( {color: 0xff0000, wireframe: true} );
        let tempMesh = new THREE.Mesh(geometry, material);
        tempMesh.position.set(x, y, z);
        scene.add(tempMesh);

        let i = 0;
        if (this.boxes.length){
            for (i; i < this.boxes.length; ) {
                for (const box of this.boxes) {
                    if (box.name.includes('-')){
                        let tempString = box.name.split('-');
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
        let box = {
            body: tempBody,
            mesh: tempMesh,
            name: `Box-${i}`
        }
        this.boxes.push(box);
    },
    checkForObject(event){
        let mouseVector = new THREE.Vector2();
        let rayCaster = new THREE.Raycaster();
    
        mouseVector.x = (event.offsetX /  parseInt(window.getComputedStyle(canvas).width)) * 2 - 1;
        mouseVector.y = -(event.offsetY /  parseInt(window.getComputedStyle(canvas).height)) * 2 + 1;
    
        rayCaster.setFromCamera(mouseVector, camera);
        const intersectedObjects = rayCaster.intersectObjects(scene.children);
    
        return intersectedObjects;
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
        console.log(world.bodies.length);
        for (let i = 0; i < this.boxes.length; i++){
            scene.add(this.boxes[i].mesh);
            world.addBody(this.boxes[i].body);
        }
    }
}

initThree();
initCannon();
animate();