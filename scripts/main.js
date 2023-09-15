import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';

import { OrbitControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js';
import { TransformControls } from 'https://unpkg.com/three@0.126.1/examples/jsm/controls/TransformControls.js';
import Stats from 'https://unpkg.com/three@0.126.1/examples/jsm/libs/stats.module.js';
import {flyControls} from './controls.js';
import {Simulation} from "./simulation.js";

let canvas = document.getElementById("viewportCanvas");
let topTime = document.getElementById("time");

let rayDirection, savedobjects = [], scene, renderer, camera, orthographicCamera, perspectiveCamera, world, timeStep = 1 / 60, orbitControls, transformControls, previousLogedTime, frustumSize = 40, statsOn = false, stats, currentlyCheckedBox;
let aspect = parseInt(window.getComputedStyle(canvas).width) / parseInt(window.getComputedStyle(canvas).height);

function changeTimeStep(temp) {
    timeStep = temp;
}

function setCamera(cameraType) {
    if (camera.type != cameraType) {
        switch (cameraType) {
            case "PerspectiveCamera":
                camera = perspectiveCamera;
                orbitControls.object = camera;
                orbitControls.reset();
                camera.updateMatrixWorld();
                camera.updateProjectionMatrix();
                break;
            case "OrthographicCamera":
                camera = orthographicCamera;
                orbitControls.object = camera;
                orbitControls.reset();
                camera.updateMatrixWorld();
                camera.updateProjectionMatrix();
                break;
            default:
                break;
        }
    }
}

const canvasHandlerParams = {
    canClickCanvas: true
}

function switchControls(controlsType) {
    if (controlsType == 'transform') {
        if (simulation.itemSelected > -1) {
            orbitControls.enabled = false;
            transformControls.enabled = true;
            transformControls.attach(simulation.objects[simulation.itemSelected].mesh);
        }
    } else {
        transformControls.detach();
        transformControls.enabled = false;
        orbitControls.enabled = true;
    }
}

function setDisabledPhysical(bool) {
    document.getElementById("width-input").disabled = bool;
    document.getElementById("height-input").disabled = bool;
    document.getElementById("depth-input").disabled = bool;
    document.getElementById("position.x-input").disabled = bool;
    document.getElementById("position.y-input").disabled = bool;
    document.getElementById("position.z-input").disabled = bool;
    document.getElementById("rotation.x-input").disabled = bool;
    document.getElementById("rotation.y-input").disabled = bool;
    document.getElementById("rotation.z-input").disabled = bool;
    document.getElementById("velocity.x-input").disabled = bool;
    document.getElementById("velocity.y-input").disabled = bool;
    document.getElementById("velocity.z-input").disabled = bool;
    document.getElementById("angularVelocity.x-input").disabled = bool;
    document.getElementById("angularVelocity.y-input").disabled = bool;
    document.getElementById("angularVelocity.z-input").disabled = bool;
    document.getElementById("force.x-input").disabled = bool;
    document.getElementById("force.y-input").disabled = bool;
    document.getElementById("force.z-input").disabled = bool;
    document.getElementById("mass-input").disabled = bool;
    document.getElementById("collisionResponse-toggle").disabled = bool;
}

function setDisabledVisual(bool) {
    document.getElementById("item-color-picker").disabled = bool;
    document.getElementById("wireframe-toggle").disabled = bool;
    document.getElementById("force-vectors-all").disabled = bool;
    document.getElementById("force-vectors-single").disabled = bool;
    document.getElementById("velocity-vectors-all").disabled = bool;
    document.getElementById("velocity-vectors-single").disabled = bool;
}

function updateStaticValues(bool) {
    if (bool) {
        if (simulation.itemSelected > -1) {
            document.getElementById("item-color-picker").value = `#${simulation.objects[simulation.itemSelected].mesh.material.color.getHexString()}`;
            switch (simulation.objects[simulation.itemSelected].mesh.geometry.type) {
                case "SphereGeometry":
                    document.getElementById("width-input").value = simulation.objects[simulation.itemSelected].mesh.geometry.parameters.radius * simulation.objects[simulation.itemSelected].mesh.scale.x;
                    break;
                case "BoxGeometry":
                    document.getElementById("width-input").value = simulation.objects[simulation.itemSelected].mesh.geometry.parameters.width * simulation.objects[simulation.itemSelected].mesh.scale.x;
                    document.getElementById("height-input").value = simulation.objects[simulation.itemSelected].mesh.geometry.parameters.height * simulation.objects[simulation.itemSelected].mesh.scale.y;
                    document.getElementById("depth-input").value = simulation.objects[simulation.itemSelected].mesh.geometry.parameters.depth * simulation.objects[simulation.itemSelected].mesh.scale.z;
                    break;
                case "CylinderGeometry":
                    document.getElementById("width-input").value = simulation.objects[simulation.itemSelected].mesh.geometry.parameters.radiusTop * simulation.objects[simulation.itemSelected].mesh.scale.x;
                    document.getElementById("height-input").value = simulation.objects[simulation.itemSelected].mesh.geometry.parameters.height * simulation.objects[simulation.itemSelected].mesh.scale.y;
                    break;
            }
            document.getElementById("wireframe-toggle").checked = simulation.objects[simulation.itemSelected].mesh.material.wireframe;
            document.getElementById("collisionResponse-toggle").checked = simulation.objects[simulation.itemSelected].body.collisionResponse;
            document.getElementById("object-name").innerText = simulation.objects[simulation.itemSelected].mesh.name;
            document.getElementById("mass-input").value = simulation.objects[simulation.itemSelected].body.mass;
            if (simulation.objects[simulation.itemSelected].mesh.userData.hasVectors) {
                for (let i in simulation.objects[simulation.itemSelected].mesh.children) {
                    switch (simulation.objects[simulation.itemSelected].mesh.children[i].name) {
                        case "resultantForceVector":
                            document.getElementById("force-vectors-single").checked = true;
                            break;
                        case "forceVectorX":
                        case "forceVectorY":
                        case "forceVectorX":
                            document.getElementById("force-vectors-all").checked = true;
                            break;
                        case "resultantVelocityVector":
                            document.getElementById("velocity-vectors-single").checked = true;
                            break;
                        case "velocityVectorX":
                        case "velocityVectorY":
                        case "velocityVectorX":
                            document.getElementById("velocity-vectors-all").checked = true;
                            break;
                        default:
                            break;
                    }
                }
            }
        }

    } else {
        document.getElementById("item-color-picker").value = "#000000";
        document.getElementById("width-input").value = '';
        document.getElementById("height-input").value = '';
        document.getElementById("depth-input").value = '';
        document.getElementById("mass-input").value = '';
        document.getElementById("force-vectors-single").checked = false;
        document.getElementById("force-vectors-all").checked = false;
        document.getElementById("velocity-vectors-single").checked = false;
        document.getElementById("velocity-vectors-all").checked = false;
        document.getElementById("wireframe-toggle").checked = false;
        document.getElementById("collisionResponse-toggle").checked = false;
        document.getElementById("object-name").innerText = false;
    }

}

function updateVarValues(bool) {
    if (bool) {
        if (simulation.itemSelected > -1) {
            document.getElementById("position.x-input").value = simulation.objects[simulation.itemSelected].mesh.position.x;
            document.getElementById("position.y-input").value = simulation.objects[simulation.itemSelected].mesh.position.y;
            document.getElementById("position.z-input").value = simulation.objects[simulation.itemSelected].mesh.position.z;
            document.getElementById("rotation.x-input").value = simulation.objects[simulation.itemSelected].mesh.rotation.x;
            document.getElementById("rotation.y-input").value = simulation.objects[simulation.itemSelected].mesh.rotation.y;
            document.getElementById("rotation.z-input").value = simulation.objects[simulation.itemSelected].mesh.rotation.z;
            document.getElementById("velocity.x-input").value = simulation.objects[simulation.itemSelected].body.velocity.x;
            document.getElementById("velocity.y-input").value = simulation.objects[simulation.itemSelected].body.velocity.y;
            document.getElementById("velocity.z-input").value = simulation.objects[simulation.itemSelected].body.velocity.z;
            document.getElementById("angularVelocity.x-input").value = simulation.objects[simulation.itemSelected].body.angularVelocity.x;
            document.getElementById("angularVelocity.y-input").value = simulation.objects[simulation.itemSelected].body.angularVelocity.y;
            document.getElementById("angularVelocity.z-input").value = simulation.objects[simulation.itemSelected].body.angularVelocity.z;
            document.getElementById("force.x-input").value = simulation.objects[simulation.itemSelected].body.force.x;
            document.getElementById("force.y-input").value = simulation.objects[simulation.itemSelected].body.force.y;
            document.getElementById("force.z-input").value = simulation.objects[simulation.itemSelected].body.force.z;
        }
    } else {
        document.getElementById("position.x-input").value = "";
        document.getElementById("position.y-input").value = "";
        document.getElementById("position.z-input").value = "";
        document.getElementById("rotation.x-input").value = "";
        document.getElementById("rotation.y-input").value = "";
        document.getElementById("rotation.z-input").value = "";
        document.getElementById("velocity.x-input").value = "";
        document.getElementById("velocity.y-input").value = "";
        document.getElementById("velocity.z-input").value = "";
        document.getElementById("angularVelocity.x-input").value = "";
        document.getElementById("angularVelocity.y-input").value = "";
        document.getElementById("angularVelocity.z-input").value = "";
        document.getElementById("force.x-input").value = "";
        document.getElementById("force.y-input").value = "";
        document.getElementById("force.z-input").value = "";
    }
}

function setSizesForShape() {
    if (simulation.itemSelected > -1) {
        switch (simulation.objects[simulation.itemSelected].mesh.geometry.type) {
            case "SphereGeometry":
                document.getElementById("width-text").innerText = "R:";
                document.getElementById("height-container").style.visibility = "hidden";
                document.getElementById("depth-container").style.visibility = "hidden";
                break;
            case "CylinderGeometry":
                document.getElementById("width-text").innerText = "R:";
                document.getElementById("height-container").style.visibility = "inherit";
                document.getElementById("depth-container").style.visibility = "hidden";
                break;
            default:
                document.getElementById("width-text").innerText = "W:";
                document.getElementById("height-container").style.visibility = "inherit";
                document.getElementById("depth-container").style.visibility = "inherit";
                break;
        }
    }
}

function toggleValues(bool) {
    updateStaticValues(bool);
    updateVarValues(bool);
    setSizesForShape();
}

function updateValuesWhileRunning(bool) {
    updateVarValues(bool);
}

//Init Functions

function initControls() {
    orbitControls = new OrbitControls(camera, renderer.domElement);
    transformControls = new TransformControls(camera, renderer.domElement);
    let temp = new flyControls(perspectiveCamera, renderer.domElement);
    // transformControls.addEventListener('change', render);
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

    // Get background color depending on theme
    const colorRGB = getComputedStyle(canvas).getPropertyValue("background-color");

    const rgbArray = colorRGB.match(/\d+/g);
    const r = parseInt(rgbArray[0]);
    const g = parseInt(rgbArray[1]);
    const b = parseInt(rgbArray[2]);
    const hexColor = `${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;

    renderer.setClearColor(parseInt(`0x${hexColor}`), 1);

    renderer.setSize(parseInt(window.getComputedStyle(canvas).width), parseInt(window.getComputedStyle(canvas).height));
    stats = Stats();
}

function initCannon() {
    world = new CANNON.World();
    world.gravity.set(0, 0, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
    world.dt = timeStep / 2;
}

//Timed Functions

function attemptPrintPerStep() {
    if (simulation.logPerSteps != 0 && ((world.time / world.dt) % simulation.logPerSteps < world.dt || Math.abs(simulation.logPerSteps - (world.time / world.dt) % simulation.logPerSteps) < world.dt) && previousLogedTime != world.time) {
        printToLog();
        previousLogedTime = world.time;
    }
}

function updatePhysics() {
    world.step(world.dt);
    attemptPrintPerStep();
    simulation.objects.forEach(element => {
        element.mesh.position.copy(element.body.position);
        element.mesh.quaternion.copy(element.body.quaternion);
    });
    updateVarValues(true);
}

function render() {
    topTime.innerText = parseFloat(world.time).toFixed(3);
    renderer.render(scene, camera);
}

function animate() {
    requestAnimationFrame(animate);
    if (!simulation.isPaused) {
        updatePhysics();
    }
    render();

    if (statsOn) {
        stats.update();
    }
    for (let i in simulation.objects) {
        if (simulation.objects[i].mesh.userData.hasVectors) {
            updateVectors(simulation.objects[i]);
        }
    }
}

//General Functions

function toggleStats(bool) {
    if (bool) {
        document.body.appendChild(stats.dom);
    } else {
        document.body.removeChild(stats.dom);
    }
    statsOn = bool;
}


function rewindobjects() {
    simulation.removeAllObjects();
    simulation.objects = savedobjects;
    savedobjects = [];
    simulation.addAllObjects();
    refreshListOfObjects();
}

function generateJSON() {
    let logObj = {};
    let timeLine = {}
    simulation.objects.forEach((item) => {
        timeLine[item.mesh.uuid] = { name: item.mesh.name, mass: item.body.mass, position: { x: item.body.position.x, y: item.body.position.y, z: item.body.position.z }, velocity: { x: item.body.velocity.x, y: item.body.velocity.y, z: item.body.velocity.z }, rotation: { x: item.mesh.rotation.x, y: item.mesh.rotation.y, z: item.mesh.rotation.z }, angularVelocity: { x: item.body.angularVelocity.x, y: item.body.angularVelocity.y, z: item.body.angularVelocity.z }, force: { x: item.body.force.x, y: item.body.force.y, z: item.body.force.z } };
        switch (item.mesh.geometry.type) {
            case "SphereGeometry":
                timeLine[item.mesh.uuid].dimensions = { radius: item.mesh.geometry.parameters.radius * item.mesh.scale.x };
                timeLine[item.mesh.uuid].geometryType = "SphereGeometry";
                break;
            case "BoxGeometry":
                timeLine[item.mesh.uuid].dimensions = { x: item.mesh.geometry.parameters.width * item.mesh.scale.x, y: item.mesh.geometry.parameters.height * item.mesh.scale.y, z: item.mesh.geometry.parameters.depth * item.mesh.scale.z };
                timeLine[item.mesh.uuid].geometryType = "BoxGeometry";
                break;
            case "CylinderGeometry":
                timeLine[item.mesh.uuid].dimensions = { radius: item.mesh.geometry.parameters.radiusTop * item.mesh.scale.x, height: item.mesh.geometry.parameters.height * item.mesh.scale.y };
                timeLine[item.mesh.uuid].geometryType = "CylinderGeometry";
                break;
        }
    });
    logObj[parseInt(world.time)] = timeLine;
    return logObj;
}

function printToLog() {
    let log = document.getElementById("log");
    if (!simulation.savedLog) {
        simulation.savedLog = generateJSON();
    } else {
        let line = generateJSON();
        for (const index in line) {
            simulation.savedLog[index] = line[index];
        }
    }
    log.innerHTML += `At time ${parseFloat(world.time).toFixed(3)}:`;
    if (simulation.objects.length) {
        log.innerHTML += "<br>";
        log.innerHTML += "Name - Mass - Position - Velocity - Rotation - Angular Velocity - Force";
        log.innerHTML += "<br>";
        simulation.objects.forEach((item) => {
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

function addItemToList(index) {
    // let node = document.createElement("DIV");
    // let selectButtonNode = document.createElement('input');
    // let textNode = document.createElement("input");
    // let editButtonNode = document.createElement('input');
    // let deleteButtonNode = document.createElement('input');
    // let lockButtonNode = document.createElement('input');
    //
    // node.classList.add("item-list-field");
    // node.setAttribute("id", simulation.objects[index].mesh.uuid)
    //
    // selectButtonNode.type = 'checkbox';
    // selectButtonNode.classList.add("simple-checkmark");
    // selectButtonNode.classList.add("small-inline-checkmark");
    // selectButtonNode.addEventListener('click', (event) => {
    //     if (event.target.checked) {
    //         if (currentlyCheckedBox) {
    //             currentlyCheckedBox.checked = false;
    //         }
    //         simulation.itemSelected = index;
    //         document.getElementById("object-name").innerText = simulation.objects[simulation.itemSelected].mesh.name;
    //         switch (simulation.objects[simulation.itemSelected].mesh.geometry.type) {
    //             case "SphereGeometry":
    //                 document.getElementById("width-text").innerText = "R:";
    //                 document.getElementById("height-container").style.visibility = "hidden";
    //                 document.getElementById("depth-container").style.visibility = "hidden";
    //                 break;
    //             case "CylinderGeometry":
    //                 document.getElementById("width-text").innerText = "R:";
    //                 document.getElementById("height-container").style.visibility = "inherit";
    //                 document.getElementById("depth-container").style.visibility = "hidden";
    //                 break;
    //             default:
    //                 document.getElementById("width-text").innerText = "W:";
    //                 document.getElementById("height-container").style.visibility = "inherit";
    //                 document.getElementById("depth-container").style.visibility = "inherit";
    //                 break;
    //         }
    //         toggleValues(true);
    //         setDisabledVisual(false);
    //         if (!simulation.isRunning){
    //             switchControls('transform');
    //             setDisabledPhysical(false);
    //         }
    //         currentlyCheckedBox = event.target;
    //     } else {
    //         switchControls('orbit')
    //         toggleValues(false);
    //         setDisabledPhysical(true);
    //         setDisabledVisual(true);
    //         simulation.itemSelected = -1;
    //         currentlyCheckedBox = null;
    //     }
    // })
    //
    // textNode.type = 'text';
    // textNode.value = simulation.objects[index].mesh.name;
    // textNode.setAttribute('required', "");
    // textNode.classList.add("item-list-editable");
    //
    // editButtonNode.type = 'button';
    // editButtonNode.classList.add("icon-buttons");
    // editButtonNode.classList.add("item-list-field-edit-button");
    // editButtonNode.classList.add("small-icon-buttons");
    // editButtonNode.addEventListener('click', () => {
    //     textNode.focus();
    // });
    //
    // deleteButtonNode.type = 'button';
    // deleteButtonNode.classList.add("item-list-field-delete-button");
    // deleteButtonNode.classList.add("icon-buttons");
    // deleteButtonNode.classList.add("small-icon-buttons");
    // deleteButtonNode.addEventListener('click', () => {
    //     deleteObjectFromList(index);
    // });
    //
    //
    // lockButtonNode.type = 'button';
    // lockButtonNode.classList.add("item-list-lock-button");
    // lockButtonNode.classList.add("icon-buttons");
    // lockButtonNode.classList.add("small-icon-buttons");
    // lockButtonNode.addEventListener('click', () => {
    //     simulation.objects[index].mesh.userData.selectable = !simulation.objects[index].mesh.userData.selectable;
    //     if (!simulation.objects[index].mesh.userData.selectable) {
    //         lockButtonNode.style.backgroundColor = 'orange';
    //         if (index == simulation.itemSelected) {
    //             canvas.click();
    //         }
    //     } else {
    //         lockButtonNode.style.backgroundColor = 'var(--secondary-color)';
    //     }
    // })
    //
    // textNode.addEventListener("blur", () => {
    //     if (textNode.value.length == 0) {
    //         textNode.focus();
    //     } else {
    //         simulation.objects[index].mesh.name = textNode.value;
    //         document.getElementById("object-name").innerText = simulation.objects[index].mesh.name;
    //     }
    // });
    // textNode.addEventListener("keydown", (event) => {
    //     if (event.key === 'Enter' && document.activeElement.value.length != 0) {
    //         document.activeElement.blur();
    //     }
    // });
    // node.appendChild(selectButtonNode);
    // node.appendChild(textNode);
    // node.appendChild(deleteButtonNode);
    // node.appendChild(editButtonNode);
    // node.appendChild(lockButtonNode);
    // document.getElementById("right-ui-item-container").appendChild(node);
}

function refreshListOfObjects() {
    while (document.getElementById("right-ui-item-container").firstChild) {
        document.getElementById("right-ui-item-container").removeChild(document.getElementById("right-ui-item-container").firstChild);
    }
    for (let index in simulation.objects) {
        addItemToList(index);
    }
}

function updateVectors(object) {
    let F, V, direction, length, origin = object.mesh.position;
    for (const index in object.mesh.children) {
        switch (object.mesh.children[index].name) {
            case "resultantForceVector":
                F = Math.sqrt(object.body.force.x ** 2 + object.body.force.y ** 2 + object.body.force.z ** 2);
                if (F != 0) {
                    object.mesh.children[index].visible = true;
                    direction = (new THREE.Vector3(object.body.force.x, object.body.force.y, object.body.force.z)).normalize();
                    length = F;
                    object.mesh.children[index].setDirection(direction);
                    object.mesh.children[index].setLength(length);
                } else {
                    object.mesh.children[index].visible = false;
                }
                break;
            case "forceVectorX":
                if (object.body.force.x != 0) {
                    object.mesh.children[index].visible = true;
                    direction = new THREE.Vector3(object.body.force.x, 0, 0);
                    length = object.body.force.x;
                    object.mesh.children[index].setDirection(direction);
                    object.mesh.children[index].setLength(length);
                } else {
                    object.mesh.children[index].visible = false;
                }
                break;
            case "forceVectorY":
                if (object.body.force.y != 0) {
                    object.mesh.children[index].visible = true;
                    direction = new THREE.Vector3(0, object.body.force.y, 0);
                    length = object.body.force.y;
                    object.mesh.children[index].setDirection(direction);
                    object.mesh.children[index].setLength(length);
                } else {
                    object.mesh.children[index].visible = false;
                }
                break;
            case "forceVectorZ":
                if (object.body.force.z != 0) {
                    object.mesh.children[index].visible = true;
                    direction = new THREE.Vector3(0, 0, object.body.force.z);
                    length = object.body.force.z;
                    object.mesh.children[index].setDirection(direction);
                    object.mesh.children[index].setLength(length);
                } else {
                    object.mesh.children[index].visible = false;
                }
                break;
            case "resultantVelocityVector":
                V = Math.sqrt(object.body.velocity.x ** 2 + object.body.velocity.y ** 2 + object.body.velocity.z ** 2);
                if (V != 0) {
                    object.mesh.children[index].visible = true;
                    direction = (new THREE.Vector3(object.body.velocity.x, object.body.velocity.y, object.body.velocity.z)).normalize();

                    length = V;
                    object.mesh.children[index].setDirection(direction);
                    object.mesh.children[index].setLength(length);
                } else {
                    object.mesh.children[index].visible = false;
                }
                break;
            case "velocityVectorX":
                if (object.body.velocity.x != 0) {
                    object.mesh.children[index].visible = true;
                    direction = new THREE.Vector3(object.body.velocity.x, 0, 0);
                    length = object.body.velocity.x;
                    object.mesh.children[index].setDirection(direction);
                    object.mesh.children[index].setLength(length);
                } else {
                    object.mesh.children[index].visible = false;
                }
                break;
            case "velocityVectorY":
                if (object.body.velocity.y != 0) {
                    object.mesh.children[index].visible = true;
                    direction = new THREE.Vector3(0, object.body.velocity.y, 0);
                    length = object.body.velocity.y;
                    object.mesh.children[index].setDirection(direction);
                    object.mesh.children[index].setLength(length);
                } else {
                    object.mesh.children[index].visible = false;
                }
                break;
            case "velocityVectorZ":
                if (object.body.velocity.z != 0) {
                    object.mesh.children[index].visible = true;
                    direction = new THREE.Vector3(0, 0, object.body.velocity.z);
                    length = object.body.velocity.z;
                    object.mesh.children[index].setDirection(direction);
                    object.mesh.children[index].setLength(length);
                } else {
                    object.mesh.children[index].visible = false;
                }
                break;
            default:
                break;
        }
    }
}

function toggleResultantForceVector(object) {
    for (const index in object.mesh.children) {
        if (object.mesh.children[index].name == "resultantForceVector") {
            object.mesh.remove(object.mesh.children[index]);
            object.mesh.userData.hasVectors = false;
            return true;
        }
    }
    object.mesh.userData.hasVectors = true;
    const V = Math.sqrt(object.body.force.x ** 2 + object.body.force.y ** 2 + object.body.force.z ** 2);
    const origin = object.mesh.position;
    const direction = ((new THREE.Vector3(object.body.force.x, object.body.force.y, object.body.force.z)).add(origin)).normalize();
    let length;
    const hex = 0xff0000;
    let visible = true;
    if (V != 0) {
        length = V;
    } else {
        length = 10;
        visible = false;
    }
    const arrowHelper = new THREE.ArrowHelper(direction, origin, length, hex);
    arrowHelper.visible = visible;
    arrowHelper.name = "resultantForceVector";
    arrowHelper.line.material.depthTest = false;
    arrowHelper.line.renderOrder = Infinity;
    arrowHelper.cone.material.depthTest = false;
    arrowHelper.cone.renderOrder = Infinity;
    object.mesh.add(arrowHelper);
}

function toggleComponentForcesVectors(object) {
    let vectorsFound = false;
    for (let index = 0; index < object.mesh.children.length; index++) {
        switch (object.mesh.children[index].name) {
            case "forceVectorX":
            case "forceVectorY":
            case "forceVectorZ":
                vectorsFound = true;
                object.mesh.userData.hasVectors = false;
                object.mesh.remove(object.mesh.children[index]);
                break;
            default:
                break;
        }
    }
    if (!vectorsFound) {
        let visible, length, direction, color;
        const origin = object.mesh.position;

        object.mesh.userData.hasVectors = true;

        visible = true;
        direction = ((new THREE.Vector3(object.body.force.x, 0, 0)).add(origin)).normalize();
        if (object.body.force.x != 0) {
            length = object.body.force.x;
        } else {
            length = 10;
            visible = false;
        }
        color = 0xff4500;
        const arrowHelperX = new THREE.ArrowHelper(direction, origin, length, color);
        arrowHelperX.visible = visible;
        arrowHelperX.name = "forceVectorX";
        arrowHelperX.line.material.depthTest = false;
        arrowHelperX.line.renderOrder = Infinity;
        arrowHelperX.cone.material.depthTest = false;
        arrowHelperX.cone.renderOrder = Infinity;
        object.mesh.add(arrowHelperX);

        visible = true;
        direction = ((new THREE.Vector3(0, object.body.force.y, 0)).add(origin)).normalize();
        if (object.body.force.x != 0) {
            length = object.body.force.x;
        } else {
            length = 10;
            visible = false;
        }
        color = 0xffff00;
        const arrowHelperY = new THREE.ArrowHelper(direction, origin, length, color);
        arrowHelperY.visible = visible;
        arrowHelperY.name = "forceVectorY";
        arrowHelperY.line.material.depthTest = false;
        arrowHelperY.line.renderOrder = Infinity;
        arrowHelperY.cone.material.depthTest = false;
        arrowHelperY.cone.renderOrder = Infinity;
        object.mesh.add(arrowHelperY);

        visible = true;
        direction = ((new THREE.Vector3(0, 0, object.body.force.z)).add(origin)).normalize();
        if (object.body.force.x != 0) {
            length = object.body.force.x;
        } else {
            length = 10;
            visible = false;
        }
        color = 0x00ff00;
        const arrowHelperZ = new THREE.ArrowHelper(direction, origin, length, color);
        arrowHelperZ.visible = visible;
        arrowHelperZ.name = "forceVectorZ";
        arrowHelperZ.line.material.depthTest = false;
        arrowHelperZ.line.renderOrder = Infinity;
        arrowHelperZ.cone.material.depthTest = false;
        arrowHelperZ.cone.renderOrder = Infinity;
        object.mesh.add(arrowHelperZ);
    }
}

function toggleResultantVelocityVector(object) {
    for (const index in object.mesh.children) {
        if (object.mesh.children[index].name == "resultantVelocityVector") {
            object.mesh.remove(object.mesh.children[index]);
            object.mesh.userData.hasVectors = false;
            return true;
        }
    }
    object.mesh.userData.hasVectors = true;
    const V = Math.sqrt(object.body.velocity.x ** 2 + object.body.velocity.y ** 2 + object.body.velocity.z ** 2);
    const origin = object.mesh.position;
    const direction = ((new THREE.Vector3(object.body.velocity.x, object.body.velocity.y, object.body.velocity.z)).add(origin)).normalize();
    let length;
    const hex = 0x0000ff;
    let visible = true;
    if (V != 0) {
        length = V;
    } else {
        length = 10;
        visible = false;
    }
    const arrowHelper = new THREE.ArrowHelper(direction, origin, length, hex);
    arrowHelper.visible = visible;
    arrowHelper.name = "resultantVelocityVector";
    arrowHelper.line.material.depthTest = false;
    arrowHelper.line.renderOrder = Infinity;
    arrowHelper.cone.material.depthTest = false;
    arrowHelper.cone.renderOrder = Infinity;
    object.mesh.add(arrowHelper);
}

function toggleComponentVelocityVectors(object) {
    let vectorsFound = false;
    for (let index = 0; index < object.mesh.children.length; index++) {
        switch (object.mesh.children[index].name) {
            case "velocityVectorX":
            case "velocityVectorY":
            case "velocityVectorZ":
                vectorsFound = true;
                object.mesh.userData.hasVectors = false;
                object.mesh.remove(object.mesh.children[index]);
                index--;
                break;
            default:
                break;
        }
    }
    if (!vectorsFound) {
        let visible, length, direction, color;
        const origin = object.mesh.position;

        object.mesh.userData.hasVectors = true;

        visible = true;
        if (object.body.velocity.x != 0) {
            direction = ((new THREE.Vector3(object.body.velocity.x, 0, 0)).add(origin)).normalize();
            length = object.body.velocity.x;
        } else {
            length = 10;
            visible = false;
            direction = new THREE.Vector3(0.1, 0, 0);
        }
        color = 0x4b0082;
        const arrowHelperX = new THREE.ArrowHelper(direction, origin, length, color);
        arrowHelperX.visible = visible;
        arrowHelperX.name = "velocityVectorX";
        arrowHelperX.line.material.depthTest = false;
        arrowHelperX.line.renderOrder = Infinity;
        arrowHelperX.cone.material.depthTest = false;
        arrowHelperX.cone.renderOrder = Infinity;
        object.mesh.add(arrowHelperX);

        visible = true;
        if (object.body.velocity.y != 0) {
            direction = ((new THREE.Vector3(0, object.body.velocity.y, 0)).add(origin)).normalize();
            length = object.body.velocity.y;
        } else {
            length = 10;
            visible = false;
            direction = new THREE.Vector3(0, 0.1, 0);
        }
        color = 0x8f00ff;
        const arrowHelperY = new THREE.ArrowHelper(direction, origin, length, color);
        arrowHelperY.visible = visible;
        arrowHelperY.name = "velocityVectorY";
        arrowHelperY.line.material.depthTest = false;
        arrowHelperY.line.renderOrder = Infinity;
        arrowHelperY.cone.material.depthTest = false;
        arrowHelperY.cone.renderOrder = Infinity;
        object.mesh.add(arrowHelperY);

        visible = true;
        if (object.body.velocity.z != 0) {
            direction = ((new THREE.Vector3(0, 0, object.body.velocity.z)).add(origin)).normalize();
            length = object.body.velocity.z;
        } else {
            length = 10;
            visible = false;
            direction = new THREE.Vector3(0, 0, 0.1);
        }
        color = 0xffc0cb;
        const arrowHelperZ = new THREE.ArrowHelper(direction, origin, length, color);
        arrowHelperZ.visible = visible;
        arrowHelperZ.name = "velocityVectorZ";
        arrowHelperZ.line.material.depthTest = false;
        arrowHelperZ.line.renderOrder = Infinity;
        arrowHelperZ.cone.material.depthTest = false;
        arrowHelperZ.cone.renderOrder = Infinity;
        object.mesh.add(arrowHelperZ);
    }
}

function isObject(item) {
    return (typeof item === "object" && !Array.isArray(item) && item !== null);
}

async function copyobjects() {
    for (let i = 0; i < simulation.objects.length; i++) {
        let copyBody = {}, copyMesh, copyName;
        //Deep copy of the cannonjs body
        for (const key in simulation.objects[i].body) {
            if (simulation.objects[i].body) {
                if (isObject(simulation.objects[i].body[key])) {
                    if (key === "world") {
                        copyBody[key] = world;
                    } else if (key === "invInertiaWorld") {
                        copyBody[key] = simulation.objects[i].body[key];
                    } else if (key === "invInertiaWorldSolve") {
                        copyBody[key] = simulation.objects[i].body[key];
                    } else {
                        copyBody[key] = simulation.objects[i].body[key].clone();
                    }
                } else {
                    copyBody[key] = simulation.objects[i].body[key];
                }
            }
        }
        //Deep copy of the threejs mesh
        copyMesh = simulation.objects[i].mesh.clone();

        //Assigning all of the above to an object ... object and adding it to the copied objects array
        let box = {
            body: copyBody,
            mesh: copyMesh
        }
        savedobjects.push(box);
    }

}

function generateName(type) {
    let count = -1;
    for (let index in simulation.objects) {
        if (simulation.objects[index].mesh.name.length >= type.length + 2 && simulation.objects[index].mesh.name.substring(0, type.length + 1) == type + '-') {
            let nString = simulation.objects[index].mesh.name.substring(type.length + 1);
            if (!isNaN(nString)) {
                if (count + 1 < parseInt(nString)) {
                    count++;
                    return type + '-' + count;
                } else {
                    count = parseInt(nString);
                }
            }
        }
    }
    count++;
    return type + '-' + count;
}

//Function Call and Export

initThree();
initCannon();
initControls();

const simulation = new Simulation(scene, world, camera, orbitControls, transformControls);

animate();


export { simulation, camera, transformControls, orbitControls, copyobjects, renderer, updateVectors, changeTimeStep, printToLog, generateJSON, setCamera, rewindobjects, toggleStats, toggleResultantForceVector, toggleComponentForcesVectors, toggleResultantVelocityVector, toggleComponentVelocityVectors, switchControls, setDisabledPhysical, setDisabledVisual, updateStaticValues, updateVarValues, setSizesForShape, toggleValues, updateValuesWhileRunning };