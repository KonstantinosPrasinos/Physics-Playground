import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';
import {timeline} from "./timeline.js";
import {events} from "./events.js";

class Simulation {
    constructor(scene, world, camera) {
        this.objects = [];
        this.isPaused = true;
        this.selectedElement = null;
        this.selectedObject = null;
        this.savedState = [];
        this.scene = scene;
        this.world = world;
        this.camera = camera;
        this.selectedModeElement = null;
    }

    createBox() {
        return this.createObject("Cube");
    }

    createSphere() {
        return this.createObject("Sphere");
    }

    createObject(objectType) {
        const radius = 1;

        // Create body
        const tempBody = new CANNON.Body({
            mass: 1,
            linearDamping: 0,
            fixedRotation: true,
            angularDamping: 0
        });

        tempBody.acceleration = new CANNON.Vec3(0, 0, 0);
        tempBody.collisionEventIds = [];
        tempBody.hasEventListener = false;
        tempBody.triggerEventWithEverything = false;

        let shape;

        if (objectType === "Cube") {
            shape = new CANNON.Box(new CANNON.Vec3(radius / 2, radius / 2, radius / 2));
        } else {
            shape = new CANNON.Sphere(radius);
        }

        tempBody.addShape(shape);
        tempBody.position.set(0, 0, 0);

        // Add body to world
        this.world.addBody(tempBody);

        // Create mesh
        let geometry;

        if (objectType === "Cube") {
            geometry = new THREE.BoxGeometry(radius, radius, radius);
        } else {
            geometry = new THREE.SphereGeometry(radius, Math.ceil(radius / 10) * 16, Math.ceil(radius / 10) * 8);
        }


        const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        const tempMesh = new THREE.Mesh(geometry, material);

        tempMesh.position.set(0, 0, 0);
        tempMesh.name = this.#generateName(objectType);

        this.scene.add(tempMesh);

        let object = {
            body: tempBody,
            mesh: tempMesh
        }

        this.objects.push(object);
        this.#addItemToList(this.objects.length - 1);
        this.objects.sort((a, b) => (a.mesh.name > b.mesh.name) ? 1 : -1);

        // Enable download and save scene buttons
        document.getElementById("download-button").setAttribute("aria-disabled", "false")
        document.getElementById("bookmark-button").disabled = false;

        return object;
    }

    #generateName(type) {
        let count = -1;

        for (let index in this.objects) {
            if (this.objects[index].mesh.name.length >= type.length + 2 && this.objects[index].mesh.name.substring(0, type.length + 1) === type + '-') {
                let nString = this.objects[index].mesh.name.substring(type.length + 1);
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

    pause() {
        // Pause simulation
        document.getElementById("top-play").innerText = "play_arrow";
        this.isPaused = true;
    }

    rewindState(resetObjects = true) {
        // Reset objects to previous state
        if (resetObjects) {
            for (const object of this.savedState) {
                const targetObject = this.objects.find(tempObject => tempObject.mesh.id === object.id);

                targetObject.mesh.position.x = object.position.x;
                targetObject.mesh.position.y = object.position.y;
                targetObject.mesh.position.z = object.position.z;
                targetObject.body.position.x = object.position.x;
                targetObject.body.position.y = object.position.y;
                targetObject.body.position.z = object.position.z;

                targetObject.mesh.quaternion.x = object.quaternion.x;
                targetObject.mesh.quaternion.y = object.quaternion.y;
                targetObject.mesh.quaternion.z = object.quaternion.z;
                targetObject.body.quaternion.x = object.quaternion.x;
                targetObject.body.quaternion.y = object.quaternion.y;
                targetObject.body.quaternion.z = object.quaternion.z;

                targetObject.body.velocity.x = object.velocity.x;
                targetObject.body.velocity.y = object.velocity.y;
                targetObject.body.velocity.z = object.velocity.z;

                targetObject.body.angularVelocity.x = object.angularVelocity.x;
                targetObject.body.angularVelocity.y = object.angularVelocity.y;
                targetObject.body.angularVelocity.z = object.angularVelocity.z;
            }
        }

        // Reset state
        this.savedState = [];
        this.world.time = 0;

        // Reset clock to 0
        document.getElementById("time").innerHTML = "0.000";


        if (this.selectedObject) {
            // Enable inputs if object selected
            this.setPropertiesDisabled(false);

            // Populate inputs again
            this.addDataToFields(this.selectedObject.body, this.selectedObject.mesh)
        }

        // Reset all event fulfillment times
        events.resetFulfillmentTimes()

        // Enable disabled buttons
        document.getElementById("add-cube-button").disabled = false;
        document.getElementById("add-sphere-button").disabled = false;
        document.getElementById("translate-button").disabled = false;
        document.getElementById("scale-button").disabled = false
        document.getElementById("rotate-button").disabled = false;
    }

    setPropertiesDisabled(isDisabled) {
        const container = document.getElementById('right-ui-properties');
        const inputElements = container.querySelectorAll('input');

        // For labels
        if (isDisabled) {
            document.getElementById("right-ui-properties").classList.add("Disabled")
        } else {
            document.getElementById("right-ui-properties").classList.remove("Disabled")
        }

        // For name
        document.getElementById('object-name').disabled = isDisabled;

        // For rest object properties
        for (const inputElement of inputElements) {
            inputElement.disabled = isDisabled;
        }
    }

    selectObject(object) {
        // Uncheck the previous radio
        if (this.selectedElement) {
            this.selectedElement.checked = false;
            this.selectedElement = null;
            this.selectedObject = null;
        }

        this.addDataToFields(object.body, object.mesh);

        // Get radio assigned to object and set selectedElement to this element
        this.selectedElement = document.getElementById(`radio_input_${object.mesh.uuid}`);
        this.selectedObject = object;
        this.selectedElement.checked = true;

        // Enable the inputs if simulation is not running
        if (this.world.time === 0) {
            this.setPropertiesDisabled(false);
        }
    }

    addDataToFields(objectBody, objectMesh) {
        // Add all the required data to the fields
        document.getElementById("object-name").value = objectMesh.name;
        document.getElementById("item-color-picker").value = `#${objectMesh.material.color.getHexString()}`;

        if (objectMesh.geometry.type === "BoxGeometry") {
            document.getElementById("width-input").value = objectMesh.geometry.parameters.width * objectMesh.scale.x;
            document.getElementById("height-input").value = objectMesh.geometry.parameters.height * objectMesh.scale.y;
            document.getElementById("depth-input").value = objectMesh.geometry.parameters.depth * objectMesh.scale.z;
        } else {
            document.getElementById("width-input").value = objectMesh.geometry.parameters.radius * objectMesh.scale.x;
            document.getElementById("height-input").value = objectMesh.geometry.parameters.radius * objectMesh.scale.y;
            document.getElementById("depth-input").value = objectMesh.geometry.parameters.radius * objectMesh.scale.z;
        }

        document.getElementById("mass-input").value = objectBody.mass;

        document.getElementById("position-x-input").value = objectMesh.position.x;
        document.getElementById("position-y-input").value = objectMesh.position.y;
        document.getElementById("position-z-input").value = objectMesh.position.z;

        document.getElementById("rotation-x-input").value = objectMesh.rotation.x;
        document.getElementById("rotation-y-input").value = objectMesh.rotation.y;
        document.getElementById("rotation-z-input").value = objectMesh.rotation.z;

        document.getElementById("velocity-x-input").value = objectBody.velocity.x;
        document.getElementById("velocity-y-input").value = objectBody.velocity.y;
        document.getElementById("velocity-z-input").value = objectBody.velocity.z;

        document.getElementById("angular-velocity-x-input").value = objectBody.angularVelocity.x;
        document.getElementById("angular-velocity-y-input").value = objectBody.angularVelocity.y;
        document.getElementById("angular-velocity-z-input").value = objectBody.angularVelocity.z;

        document.getElementById("acceleration-x-input").value = objectBody.acceleration.x;
        document.getElementById("acceleration-y-input").value = objectBody.acceleration.y;
        document.getElementById("acceleration-z-input").value = objectBody.acceleration.z;
    }

    deselectObject() {
        document.getElementById(`radio_input_${this.selectedObject.mesh.uuid}`).checked = false;

        this.selectedElement = null;
        this.selectedObject = null;

        // Disable inputs
        this.setPropertiesDisabled(true);

        // Remove all data from fields
        document.getElementById("object-name").value = "No item is selected"
        document.getElementById("item-color-picker").value = "#ff0000"
        document.getElementById("width-input").value = "";
        document.getElementById("height-input").value = "";
        document.getElementById("depth-input").value = "";
        document.getElementById("mass-input").value = "";

        document.getElementById("position-x-input").value = "";
        document.getElementById("position-y-input").value = "";
        document.getElementById("position-z-input").value = "";

        document.getElementById("rotation-x-input").value = "";
        document.getElementById("rotation-y-input").value = "";
        document.getElementById("rotation-z-input").value = "";

        document.getElementById("velocity-x-input").value = "";
        document.getElementById("velocity-y-input").value = "";
        document.getElementById("velocity-z-input").value = "";

        document.getElementById("angular-velocity-x-input").value = "";
        document.getElementById("angular-velocity-y-input").value = "";
        document.getElementById("angular-velocity-z-input").value = "";

        document.getElementById("acceleration-x-input").value = "";
        document.getElementById("acceleration-y-input").value = "";
        document.getElementById("acceleration-z-input").value = "";
    }

    deleteObject(object) {
        console.log(object, this.objects);
        const {mesh, body} = object;
        const index = this.objects.indexOf(object);

        // Deselect object
        if (this.selectedObject === this.objects[index]) {
            this.deselectObject();
        }

        // Remove from objects, html and scene
        this.objects.splice(index, 1);

        const containerElement = document.getElementById(`object_container_${mesh.uuid}`);

        document.getElementById("right-ui-objects-list").removeChild(containerElement);

        const indexInScene = this.scene.children.indexOf(mesh);
        this.scene.children.splice(indexInScene, 1);

        const indexInWorld = this.world.bodies.indexOf(body);
        this.world.bodies.splice(indexInWorld, 1);
    }

    #addItemToList(index) {
        // Get object by index
        const objectMesh = this.objects[index].mesh;
        
        // Generate the div container
        const containerDiv = document.createElement("DIV");
        
        containerDiv.classList.add("right-ui-object");
        containerDiv.id = `object_container_${objectMesh.uuid}`;


        // Generate the radio
        const radioInput = document.createElement("INPUT");
        
        radioInput.id = `radio_input_${objectMesh.uuid}`;
        radioInput.type = "checkbox";
        radioInput.classList = "Radio-Input";
        
        radioInput.addEventListener("change", (event) => {
            console.log('test')
            if (event.target.checked) {
                const objectId = event.target.parentNode.id.split("_")[2];
                const object = this.objects.find(obj => obj.mesh.uuid === objectId);

                this.selectObject(object);
            } else {
                this.deselectObject();
            }
        });
        
        // Generate the label
        const inputLabel = document.createElement("LABEL");
        
        inputLabel.setAttribute("for", radioInput.id);
        inputLabel.id = `radio_label_${objectMesh.uuid}`;
        inputLabel.classList.add("right-ui-object-name");
        inputLabel.innerHTML = objectMesh.name;
        
        // Generate the follow button
        const followButton = document.createElement("BUTTON");
        
        followButton.classList.add("material-symbols-outlined");
        followButton.innerHTML = "videocam";
        
        followButton.addEventListener("click", () => {
            // Follow objectMesh
            if (followButton.innerHTML === "videocam") {
                // Unfollow previous object
                if (this.camera.following) {
                    this.camera.following.button.innerHTML = "videocam";
                    this.camera.following.following = null;
                }

                // Follow new object
                this.camera.following = {mesh: objectMesh, button: followButton}
                followButton.innerHTML = "videocam_off";
            } else {
                // Unfollow object
                this.camera.following = null;
                followButton.innerHTML = "videocam";
            }
        });
        
        // Generate the remove button
        const removeButton = document.createElement("BUTTON");

        removeButton.classList.add("material-symbols-outlined");
        removeButton.innerHTML = "delete";

        removeButton.addEventListener("click", (event) => {
            const objectId = event.target.parentNode.id.split("_")[2];
            const object = this.objects.find(obj => obj.mesh.uuid === objectId);

            this.deleteObject(object);
        });

        // Append all the nodes to their parent
        containerDiv.appendChild(radioInput);
        containerDiv.appendChild(inputLabel);
        containerDiv.appendChild(followButton);
        containerDiv.appendChild(removeButton);

        document.getElementById("right-ui-objects-list").appendChild(containerDiv);
        this.selectObject(this.objects[index])
    }

    synchronizePosition(object) {
        if (!object) {
            object = this.selectedObject;
        }

        object.body.position.x = object.mesh.position.x;
        object.body.position.y = object.mesh.position.y;
        object.body.position.z = object.mesh.position.z;
        // updateVectors(object);
    }

    synchronizeRotation(object) {
        if (!object) {
            object = this.selectedObject;
        }
        
        object.body.quaternion.x = object.mesh.quaternion.x;
        object.body.quaternion.y = object.mesh.quaternion.y;
        object.body.quaternion.z = object.mesh.quaternion.z;
    }

    synchronizeSize(axis, object) {
        if (!object) {
            object = this.selectedObject;
        }

        switch (object.mesh.geometry.type) {
            case "BoxGeometry":
                //Changes the size of the box
                const newWidth = object.mesh.geometry.parameters.width * object.mesh.scale.x / 2;
                const newHeight = object.mesh.geometry.parameters.height * object.mesh.scale.y / 2;
                const newDepth = object.mesh.geometry.parameters.depth * object.mesh.scale.z / 2;

                object.body.shapes[0].halfExtents.set(newWidth, newHeight, newDepth);
                break;
            case "SphereGeometry":
                //Synchronizes the scales of the three dimensions so that they match and become the "radius"
                object.mesh.scale.x = object.mesh.scale[axis];
                object.mesh.scale.y = object.mesh.scale[axis];
                object.mesh.scale.z = object.mesh.scale[axis];

                //Changes the radius of the sphere
                object.body.shapes[0].radius = object.mesh.geometry.parameters.radius * object.mesh.scale.x;

                //Updating of width and height segments when size changes so that if the sphere becomes bigger, it looks like a sphere
                object.mesh.geometry.parameters.widthSegments = Math.ceil(object.body.shapes[0].radius / 10) * 16;
                object.mesh.geometry.parameters.heightSegments = Math.ceil(object.body.shapes[0].radius / 10) * 8;
                break;
            default:
                break;
        }

        //Updates the size of the object
        object.body.shapes[0].updateBoundingSphereRadius();
        // object.body.shapes[0].updateConvexPolyhedronRepresentation();

        object.body.computeAABB();
        object.body.updateBoundingRadius();
        object.body.updateMassProperties();
    }

    reset() {
        // Clear events
        events.clear()

        // Clear timeline
        timeline.clearEntries();

        // Clear all objects
        this.clear(false);

        // Reset time to 0
        this.rewindState(false);
    }

    clear(removeEvents = true) {
        if (this.selectedObject) {
            this.deselectObject();
        }

        while (this.objects.length > 0) {
            this.deleteObject(this.objects[0]);
        }

        // Clear events with objects
        if (removeEvents) {
            events.clearThoseWithObject();
        }
    }
    
    loadFromObject(data) {
        const newUuids = {};
        
        // Clear simulation
        this.reset();

        // Add new objects to simulation
        for (const key in data) {
            const jsonObject = data[key];

            const object = this.createObject(jsonObject.type);

            newUuids[key] = object.mesh.uuid;

            object.mesh.rotation.x = jsonObject.rotation.x;
            object.mesh.rotation.y = jsonObject.rotation.y;
            object.mesh.rotation.z = jsonObject.rotation.z;

            this.synchronizeRotation(object);

            object.mesh.position.x = jsonObject.position.x;
            object.mesh.position.y = jsonObject.position.y;
            object.mesh.position.z = jsonObject.position.z;

            this.synchronizePosition(object);

            object.mesh.scale.x = jsonObject.scale.x;
            object.mesh.scale.y = jsonObject.scale.y;
            object.mesh.scale.z = jsonObject.scale.z;

            this.synchronizeSize("x", object);

            object.mesh.material.color.set(`#${jsonObject.color}`);

            object.mesh.name = jsonObject.name;

            object.body.velocity.x = jsonObject.velocity.x;
            object.body.velocity.y = jsonObject.velocity.y;
            object.body.velocity.z = jsonObject.velocity.z;

            object.body.angularVelocity.x = jsonObject.angularVelocity.x;
            object.body.angularVelocity.y = jsonObject.angularVelocity.y;
            object.body.angularVelocity.z = jsonObject.angularVelocity.z;

            object.body.mass = jsonObject.mass;
            object.body.updateMassProperties();

            object.body.acceleration = new CANNON.Vec3(jsonObject.acceleration.x, jsonObject.acceleration.y, jsonObject.acceleration.z);
        }

        this.deselectObject();

        return newUuids;
    }
}

export {Simulation};