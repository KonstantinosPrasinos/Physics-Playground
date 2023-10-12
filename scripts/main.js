import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';

import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/TransformControls.js';
import {Simulation} from "./simulation.js";
import {events} from "./events.js";

let canvas = document.getElementById("viewportCanvas");
let topTime = document.getElementById("time");

let scene, renderer, camera, orthographicCamera, perspectiveCamera, world, timeStep = 1 / 60, orbitControls, transformControls, frustumSize = 40;
let aspect = parseInt(window.getComputedStyle(canvas).width) / parseInt(window.getComputedStyle(canvas).height);

let simulation;

function changeTimeStep(scalar) {
    world.dt = timeStep * scalar;
}

const setTransformControlsEnabled = (bool) => {
    transformControls.enabled = bool;
    orbitControls.enabled = !bool;
}

const setBackgroundWithTheme = () =>{
    const colorRGB = getComputedStyle(canvas).getPropertyValue("background-color");

    const rgbArray = colorRGB.match(/\d+/g);
    const r = parseInt(rgbArray[0]);
    const g = parseInt(rgbArray[1]);
    const b = parseInt(rgbArray[2]);
    const hexColor = `${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;

    renderer.setClearColor(parseInt(`0x${hexColor}`), 1);
}

const setCameraPerspective = () => {
    perspectiveCamera.position.set(camera.position.x, camera.position.y, camera.position.z);
    perspectiveCamera.rotation.set(camera.rotation.x, camera.rotation.y, camera.rotation.z);

    perspectiveCamera.following = camera.following;
    
    camera = perspectiveCamera;
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();

    orbitControls.object = camera;
}

const setCameraOrthographic = () => {
    orthographicCamera.position.set(camera.position.x, camera.position.y, camera.position.z);
    orthographicCamera.rotation.set(camera.rotation.x, camera.rotation.y, camera.rotation.z);

    orthographicCamera.following = camera.following;

    camera = orthographicCamera;
    camera.updateMatrixWorld();
    camera.updateProjectionMatrix();

    orbitControls.object = camera;
}

const setCameraFov = (value) => {
    if (camera.type === "PerspectiveCamera") {
        camera.fov = parseInt(value)
        camera.updateProjectionMatrix();
    }
}

//Init Functions
function initControls() {
    orbitControls = new OrbitControls(camera, renderer.domElement);
    transformControls = new TransformControls(camera, renderer.domElement);

    transformControls.addEventListener('objectChange', (event) => {
        if (simulation?.selectedObject) {
            if (transformControls.mode === "scale" && simulation.selectedObject.mesh.geometry.type === "SphereGeometry") {
                // Make sphere have the same x, y, z scales
                const sourceAxis = event.target.axis.charAt(0).toLowerCase();

                simulation.selectedObject.mesh.scale.x = simulation.selectedObject.mesh.scale[sourceAxis];
                simulation.selectedObject.mesh.scale.y = simulation.selectedObject.mesh.scale[sourceAxis];
                simulation.selectedObject.mesh.scale.z = simulation.selectedObject.mesh.scale[sourceAxis];
            }

            simulation.addDataToFields(simulation.selectedObject.body, simulation.selectedObject.mesh);
        }
    });

    transformControls.addEventListener('mouseUp', (event) => {
        // After transforming is done, synchronize the required property
        switch (event.target.mode) {
            case 'translate':
                simulation.synchronizePosition();
                break;
            case 'rotate':
                simulation.synchronizeRotation();
                break;
            case 'scale':
                simulation.synchronizeSize('x');
        }
    })

    orbitControls.addEventListener("start", () => {
        // If camera is following object, unfollow it
        if (camera.following) {
            camera.following.button.innerHTML = "videocam";
            camera.following = null;
        }
    })

    transformControls.enabled = false;
    scene.add(transformControls);
}

function initThree() {
    scene = new THREE.Scene();

    orthographicCamera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000);
    perspectiveCamera = new THREE.PerspectiveCamera(45, parseInt(window.getComputedStyle(canvas).width) / parseInt(window.getComputedStyle(canvas).height), 1, 2000);

    orthographicCamera.position.z = 50;
    perspectiveCamera.position.z = 50;

    scene.add(orthographicCamera);
    scene.add(perspectiveCamera);

    camera = orthographicCamera

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });

    setBackgroundWithTheme();

    // Get em size
    const emSize = parseInt(getComputedStyle(canvas).fontSize);

    renderer.setSize(window.innerWidth - 3 * emSize, window.innerHeight - 3 * emSize);
}

function initCannon() {
    world = new CANNON.World();
    world.gravity.set(0, 0, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
    world.dt = timeStep * 2;

    const physicsMaterial = new CANNON.Material("bouncyMaterial");

    physicsMaterial.restitution = 1.0;
    physicsMaterial.friction = 0.0;

    const physicsContactMaterial = new CANNON.ContactMaterial(physicsMaterial,
        physicsMaterial,
        {
            friction: 0.0,
            restitution: 1.0,
            contactEquationRelaxation: 1000
        }
    );

    // We must add the contact materials to the world
    world.addContactMaterial(physicsContactMaterial);
    world.defaultContactMaterial = physicsContactMaterial;
    world.defaultMaterial = physicsMaterial;
}

const updatePhysics = () => {
    world.step(world.dt);

    // Update rendered time
    topTime.innerText = parseFloat(world.time / 2).toFixed(3);

    // Apply force if acceleration is set
    for (const object of simulation.objects) {
        const impulse = object.body.acceleration.clone().scale(2 * timeStep * object.body.mass);

        object.body.applyLocalImpulse(impulse, new CANNON.Vec3(0, 0, 0));
    }

    // Copy simulated position and rotation to scene
    simulation.objects.forEach(element => {
        element.mesh.position.copy(element.body.position);
        element.mesh.quaternion.copy(element.body.quaternion);
    });
    
    // Update values for selected object
    if (simulation.selectedObject) {
        document.getElementById("position-x-input").value = simulation.selectedObject.mesh.position.x.toFixed(3);
        document.getElementById("position-y-input").value = simulation.selectedObject.mesh.position.y.toFixed(3);
        document.getElementById("position-z-input").value = simulation.selectedObject.mesh.position.z.toFixed(3);

        document.getElementById("rotation-x-input").value = simulation.selectedObject.mesh.rotation.x.toFixed(3);
        document.getElementById("rotation-y-input").value = simulation.selectedObject.mesh.rotation.y.toFixed(3);
        document.getElementById("rotation-z-input").value = simulation.selectedObject.mesh.rotation.z.toFixed(3);

        document.getElementById("velocity-x-input").value = simulation.selectedObject.body.velocity.x.toFixed(3);
        document.getElementById("velocity-y-input").value = simulation.selectedObject.body.velocity.y.toFixed(3);
        document.getElementById("velocity-z-input").value = simulation.selectedObject.body.velocity.z.toFixed(3);

        document.getElementById("angular-velocity-x-input").value = simulation.selectedObject.body.angularVelocity.x.toFixed(3);
        document.getElementById("angular-velocity-y-input").value = simulation.selectedObject.body.angularVelocity.y.toFixed(3);
        document.getElementById("angular-velocity-z-input").value = simulation.selectedObject.body.angularVelocity.z.toFixed(3);
    }

    events.checkEvents();
}

function animate() {
    requestAnimationFrame(animate);

    // Run physics
    if (!simulation.isPaused) {
        updatePhysics();
    }

    // Follow object
    if (camera.following) {
        const cameraOffset = new THREE.Vector3(0.0, 0.0, 50.0);
        const newObjectPosition = camera.following.mesh.position;

        camera.position.copy(newObjectPosition).add(cameraOffset);
    }

    // Do rendering
    renderer.render(scene, camera);
}

initThree();
initCannon();
initControls();

simulation = new Simulation(scene, world, camera, orbitControls, transformControls);

animate();

export { setCameraFov, perspectiveCamera, setTransformControlsEnabled, orthographicCamera, simulation, camera, transformControls, orbitControls, renderer, changeTimeStep, setBackgroundWithTheme, setCameraOrthographic, setCameraPerspective };