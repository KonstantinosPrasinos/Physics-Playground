let canvas = document.getElementById("viewportCanvas");
let topTime = document.getElementById("time");

let rayDirection, collisionPoint;

let scene, renderer, camera, world, timeStep = 1 / 60;

let savedBoxes = [];

let rightUIisCollapsed = true, storedTheme = 'dark', itemSelected = -1, tutorialCompleted = false, mode = "setup", setupHistory, selectedCursor = "position";

let ratio = null, differences = [], intersectedObject = null, typeOfArrow = null;

function isObject(item){
    return (typeof item === "object" && !Array.isArray(item) && item !== null);
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
}

function updatePhysics() {
    world.step(timeStep);

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
    shapesForChanges: [],
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
    makeArrows(index, type){
        let mesh = simulation.boxes[index].mesh;
        const materialX = new THREE.MeshBasicMaterial( {color: 0xff0000});
        const materialY = new THREE.MeshBasicMaterial( {color: 0x00ff00});
        const materialZ = new THREE.MeshBasicMaterial( {color: 0x0000ff});
        const height = (mesh.geometry.parameters.width >= mesh.geometry.parameters.depth && mesh.geometry.parameters.width >= mesh.geometry.parameters.height) ? mesh.geometry.parameters.width  * 2: (mesh.geometry.parameters.height >= mesh.geometry.parameters.depth ? mesh.geometry.parameters.height * 2: mesh.geometry.parameters.depth * 2);
        const radius = height / 20;
        

        function makeCylinders(type){
            const cylinderGeometry = new THREE.CylinderGeometry(radius, radius, height, 20);

            const cylinderX = new THREE.Mesh( cylinderGeometry, materialX );
            cylinderX.position.set(mesh.position.x + mesh.geometry.parameters.width, mesh.position.y, mesh.position.z);
            cylinderX.rotateZ(Math.PI / 2);
            cylinderX.userData.type = type;
            cylinderX.userData.direction = "x";
            scene.add(cylinderX);
            simulation.shapesForChanges.push(cylinderX);

            const cylinderY = new THREE.Mesh( cylinderGeometry, materialY);
            cylinderY.position.set(mesh.position.x, mesh.position.y + mesh.geometry.parameters.height, mesh.position.z);
            cylinderY.userData.type = type;
            cylinderY.userData.direction = "y";
            scene.add(cylinderY);
            simulation.shapesForChanges.push(cylinderY);

            const cylinderZ = new THREE.Mesh( cylinderGeometry, materialZ);
            cylinderZ.position.set(mesh.position.x, mesh.position.y, mesh.position.y + mesh.geometry.parameters.depth);
            cylinderZ.rotateX(Math.PI / 2);
            cylinderZ.userData.type = type;
            cylinderZ.userData.direction = "z";
            scene.add(cylinderZ);
            simulation.shapesForChanges.push(cylinderZ);
        }

        switch (type) {
            case "position":
                makeCylinders(type);
                let headGeometry = new THREE.ConeGeometry(radius * 2, height / 2, 20);

                const headX = new THREE.Mesh( headGeometry, materialX );
                headX.position.set(mesh.position.x + mesh.geometry.parameters.width * 2, mesh.position.y, mesh.position.z)
                headX.rotateZ(3 * Math.PI / 2);
                headX.userData.type = type;
                headX.userData.direction = "x";
                scene.add(headX);
                simulation.shapesForChanges.push(headX);

                const headY = new THREE.Mesh( headGeometry, materialY );
                headY.position.set(mesh.position.x, mesh.position.y + mesh.geometry.parameters.height * 2, mesh.position.z);
                headY.userData.type = type;
                headY.userData.direction = "y";
                scene.add(headY);
                simulation.shapesForChanges.push(headY);

                const headZ = new THREE.Mesh( headGeometry, materialZ );
                headZ.position.set(mesh.position.x, mesh.position.y, mesh.position.z + mesh.geometry.parameters.depth * 2);
                headZ.userData.type = type;
                headZ.userData.direction = "z";
                headZ.rotateX(Math.PI / 2)
                scene.add(headZ);
                simulation.shapesForChanges.push(headZ);
                break;
            case "scale":
                makeCylinders();
                let headGeometryScale = new THREE.BoxGeometry(radius * 4, radius * 4, radius * 4);

                const scaleX = new THREE.Mesh( headGeometryScale, materialX );
                scaleX.position.set(mesh.position.x + mesh.geometry.parameters.width * 2, mesh.position.y, mesh.position.z)
                scaleX.rotateZ(3 * Math.PI / 2);
                scaleX.userData.type = type;
                scaleX.userData.direction = "x";
                scene.add(scaleX);
                simulation.shapesForChanges.push(scaleX);

                const scaleY = new THREE.Mesh( headGeometryScale, materialY );
                scaleY.position.set(mesh.position.x, mesh.position.y + mesh.geometry.parameters.height * 2, mesh.position.z);
                scaleY.userData.type = type;
                scaleY.userData.direction = "y";
                scene.add(scaleY);
                simulation.shapesForChanges.push(scaleY);

                const scaleZ = new THREE.Mesh( headGeometryScale, materialZ );
                scaleZ.position.set(mesh.position.x, mesh.position.y, mesh.position.z + mesh.geometry.parameters.depth * 2);
                scaleZ.rotateX(Math.PI / 2);
                scaleZ.userData.type = type;
                scaleZ.userData.direction = "z";
                scene.add(scaleZ);
                simulation.shapesForChanges.push(scaleZ);
                break;
            case "rotation":
                let torusGeometry = new THREE.TorusGeometry(height * 0.75, height / 20, 4, 50);

                const rotateX = new THREE.Mesh( torusGeometry, materialX );
                rotateX.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
                rotateX.rotateY(Math.PI / 2);
                rotateX.userData.type = type;
                rotateX.userData.direction = "x";
                scene.add(rotateX);
                simulation.shapesForChanges.push(rotateX);

                const rotateY = new THREE.Mesh( torusGeometry, materialY );
                rotateY.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
                rotateY.rotateX(Math.PI / 2);
                rotateY.userData.type = type;
                rotateY.userData.direction = "y";
                scene.add(rotateY);
                simulation.shapesForChanges.push(rotateY);

                const rotateZ = new THREE.Mesh( torusGeometry, materialZ );
                rotateZ.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
                rotateZ.rotateZ(Math.PI / 2);
                rotateZ.userData.type = type;
                rotateZ.userData.direction = "z";
                scene.add(rotateZ);
                simulation.shapesForChanges.push(rotateZ);
            default:
                break;
        }
    },
    removeAllArrows(){
        while(simulation.shapesForChanges.length){
            scene.remove(simulation.shapesForChanges[0]);
            simulation.shapesForChanges.shift();
        }
    }
}

initThree();
initCannon();
animate();