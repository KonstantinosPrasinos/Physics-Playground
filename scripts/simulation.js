import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';

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
        this.events = [];
        this.totalEvents = 0;
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
            fixedRotation: true
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

    rewindState() {
        // Reset objects to previous state
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
        for (const index in this.events) {
            this.events[index].fulfillmentTime = null;
        }

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

    #deleteObject(object) {
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
        
        radioInput.onchange = (event) => {
            if (event.target.checked) {
                this.selectObject(this.objects[index]);
            } else {
                this.deselectObject();
            }
        }
        
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
        
        followButton.onclick = () => {
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
        }
        
        // Generate the remove button
        const removeButton = document.createElement("BUTTON");

        removeButton.classList.add("material-symbols-outlined");
        removeButton.innerHTML = "delete";

        removeButton.onclick = () => {
            this.#deleteObject(this.objects[index]);
        }

        // Append all the nodes to their parent
        containerDiv.appendChild(radioInput);
        containerDiv.appendChild(inputLabel);
        containerDiv.appendChild(followButton);
        containerDiv.appendChild(removeButton);

        document.getElementById("right-ui-objects-list").appendChild(containerDiv);
        radioInput.click();
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
        object.body.updateBoundingRadius();
        object.body.updateMassProperties();
    }

    addEvent(event) {
        const id = this.totalEvents;
        const eventWithId = {...event, id: id, fulfillmentTime: null}
        this.events.push(eventWithId);


        const table = document.getElementById("events-table-body");

        const row = document.createElement("DIV");
        row.id = `events-table-row-${id}`;

        // Get the name from the uuid
        let sourceText;

        if (event.source !== "Time") {
            const objectUuid = event.source.substring(7, event.source.length);
            sourceText = this.objects.find(object => object.mesh.uuid === objectUuid)?.mesh.name;
            row.className = "event-row-source-object";
        } else {
            sourceText = event.source;
        }

        const source = document.createElement("DIV");
        source.innerText = sourceText;

        const type = document.createElement("DIV");
        type.innerText = event.type.replaceAll("-", " ");

        let targetText;
        const targetEventText = event.target.split("-");

        if (targetEventText[0] === "number") {
            targetText = event.target.substring(7, event.target.length);
        } else if (targetEventText[0] === "object") {
            const objectUuid = event.target.substring(7, event.target.length);
            targetText = this.objects.find(object => object.mesh.uuid === objectUuid)?.mesh.name;
        } else {
            // For anything
            targetText = "anything";
        }

        const target = document.createElement("DIV");
        target.innerText = targetText

        // Generate the remove button
        const removeButton = document.createElement("BUTTON");

        removeButton.classList.add("material-symbols-outlined");
        removeButton.innerHTML = "delete";

        removeButton.onclick = () => {
            this.removeEvent(eventWithId);
        }

        row.appendChild(source);
        row.appendChild(type);
        row.appendChild(target);
        row.appendChild(removeButton);

        table.appendChild(row);

        // If event is collision add CANNON collision event
        if (eventWithId.type === "collision") {
            const objectUuid = eventWithId.source.substring(7, eventWithId.source.length);
            const sourceBody = this.objects.find(object => object.mesh.uuid === objectUuid)?.body;

            if (eventWithId.target === "anything") {
                sourceBody.triggerEventWithEverything = true;
            } else {
                // Add event id to the body
                sourceBody.collisionEventIds.push(id);
            }

            if (!sourceBody.hasEventListener) {
                sourceBody.addEventListener("collide", this.#handleCollisionEvent.bind(this));
            }
        }

        this.totalEvents++;
    }

    #handleCollisionEvent(cannonEvent) { // Spider-Man 2099 is not happy
        if (
            cannonEvent.target.collisionEventIds.length > 0 ||
            cannonEvent.body.collisionEventIds.length > 0 ||
            cannonEvent.target.triggerEventWithEverything ||
            cannonEvent.body.triggerEventWithEverything
        ) {
            if (cannonEvent.target.triggerEventWithEverything || cannonEvent.body.triggerEventWithEverything) {
                this.pause();
            } else {
                // Check for events in target
                const targetEvents = this.events.filter(event => cannonEvent.target.collisionEventIds.includes(event.id));

                targetEvents.forEach(event => {
                    if (!event.fulfillmentTime || event.fulfillmentTime === this.world.time - this.world.dt) {
                        const collisionBodyUuid = this.objects.find(obj => obj.body.id === cannonEvent.body.id).mesh.uuid;
                        const targetUuid = event.target.substring(7, event.target.length);

                        if (collisionBodyUuid === targetUuid) {
                            this.pause();
                        }
                    }

                    event.fulfillmentTime = this.world.time;
                });
            }
        }
    }

    removeEvent(event, calledByOtherAnythingEvent = false) {
        // Remove row from table
        document.getElementById("events-table-body").removeChild(document.getElementById(`events-table-row-${event.id}`));

        if (event.type === "collision") {
            // Remove this event from the body
            const objectUuid = event.source.substring(7, event.source.length);
            const sourceBody = this.objects.find(object => object.mesh.uuid === objectUuid)?.body;

            if (event.target === "anything") {
                sourceBody.triggerEventWithEverything = false;
                // If not called by other source
                if (!calledByOtherAnythingEvent) {
                    // Delete other similar events
                    this.events
                        .filter(tempEvent => tempEvent.source === event.source && tempEvent.target === "anything")
                        .forEach(tempEvent => this.removeEvent(tempEvent, true));
                }
            } else {
                // Add id to collision event array
                sourceBody.collisionEventIds.splice(sourceBody.collisionEventIds.indexOf(event.id));
            }
        }

        // Remove entry from array
        this.events.splice(this.events.indexOf(event), 1);
    }

    checkEvents() {
        const derivatives = {
            position: "velocity",
            rotation: "angularVelocity",
            velocity: "acceleration"
        }

        this.events.forEach((event) => {
            // For event with a source of time
            if (!event.fulfillmentTime || event.fulfillmentTime === this.world.time - this.world.dt ) { // make sure the same event doesn't get fulfilled back to back
                if (event.source === "Time") {
                    const targetTime = parseFloat(event.target.substring(7, event.target.length)) * 2;

                    if (targetTime >= this.world.time - this.world.dt && targetTime <= this.world.time + this.world.dt) {
                        this.pause();
                    }
                } else if (event.type !== "collision") {
                    const axis = event.type.charAt(event.type.length - 1);

                    // Make event case camelCase
                    const type = event.type.substring(0, event.type.length - 2);

                    // Get source body and target
                    const objectUuid = event.source.substring(7, event.source.length);
                    const sourceBody = this.objects.find(obj => obj.mesh.uuid === objectUuid).body;
                    const target = parseFloat(event.target.substring(7, event.target.length));

                    if (
                        target >= sourceBody[type][axis] - sourceBody[derivatives[type]][axis] * this.world.dt &&
                        target <= sourceBody[type][axis] + sourceBody[derivatives[type]][axis] * this.world.dt
                    ) {
                        event.fulfillmentTime = this.world.time;
                        this.pause();
                    }
                }
            }
        })
    }

    clear() {
        if (this.selectedObject) {
            this.deselectObject();
        }

        while (this.objects.length > 0) {
            this.#deleteObject(this.objects[0]);
        }

        // Clear events with objects
        this.events = this.events.filter(event => event.source === "Time");

        const childrenToBeRemoved = document.querySelectorAll(".event-row-source-object");

        childrenToBeRemoved.forEach(child => {
            child.remove();
        })
    }
}

export {Simulation};