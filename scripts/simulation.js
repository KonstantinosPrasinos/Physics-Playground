let canvas = document.getElementById("viewportCanvas");
import * as THREE from 'https://unpkg.com/three@0.126.1/build/three.module.js';

class Simulation {
    constructor(scene, world, camera, orbitControls, transformControls) {
        this.objects = [];
        this.isPaused = true;
        this.logPerSteps = 0;
        this.savedLog = null;
        this.selectedElement = null;
        this.selectedObject = null;
        this.placingObject = false;
        this.objectPlaceDist = 50;
        this.savedState = [];
        this.scene = scene;
        this.world = world;
        this.camera = camera;
    }

    createBox(x, y, z, width, height, depth) {
        let shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
        let tempBody = new CANNON.Body({
            mass: 4,
            linearDamping: 0,
            fixedRotation: true
        });

        tempBody.addShape(shape);
        tempBody.position.set(x, y, z);
        this.world.addBody(tempBody);

        let geometry = new THREE.BoxGeometry(width, height, depth);
        let material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        let tempMesh = new THREE.Mesh(geometry, material);
        tempMesh.position.set(x, y, z);
        tempMesh.userData.createsGravity = true;
        tempMesh.userData.selectable = true;
        tempMesh.userData.hasVectors = false;
        this.scene.add(tempMesh);

        tempMesh.name = this.#generateName('Cube');
        let box = {
            body: tempBody,
            mesh: tempMesh
        }

        this.objects.push(box);
        this.#addItemToList(this.objects.length - 1);
        this.objects.sort((a, b) => (a.mesh.name > b.mesh.name) ? 1 : -1);
    }

    createSphere(x, y, z, radius) {
        let shape = new CANNON.Sphere(radius);
        let tempBody = new CANNON.Body({
            mass: 4,
            linearDamping: 0,
            fixedRotation: true
        });
        tempBody.addShape(shape);
        tempBody.position.set(x, y, z);
        this.world.addBody(tempBody);
        let geometry = new THREE.SphereGeometry(radius, Math.ceil(radius / 10) * 16, Math.ceil(radius / 10) * 8);
        let material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
        let tempMesh = new THREE.Mesh(geometry, material);
        tempMesh.position.set(x, y, z);
        tempMesh.userData.createsGravity = true;
        tempMesh.userData.selectable = true;
        tempMesh.userData.hasVectors = false;
        this.scene.add(tempMesh);

        tempMesh.name = this.#generateName('Sphere');
        let sphere = {
            body: tempBody,
            mesh: tempMesh
        }
        this.objects.push(sphere);
        this.#addItemToList(this.objects.length - 1);
        this.objects.sort((a, b) => (a.mesh.name > b.mesh.name) ? 1 : -1);
    }

    #generateName(type) {
        let count = -1;
        for (let index in this.objects) {
            if (this.objects[index].mesh.name.length >= type.length + 2 && this.objects[index].mesh.name.substring(0, type.length + 1) == type + '-') {
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

    placeObject(object){
        this.placingObject = true;
        let orbitControlsWereEnabled;
        function findPosition(event){
            let mouseVector = new THREE.Vector2();
            let rayCaster = new THREE.Raycaster();

            mouseVector.x = (event.offsetX / parseInt(window.getComputedStyle(canvas).width)) * 2 - 1;
            mouseVector.y = -(event.offsetY / parseInt(window.getComputedStyle(canvas).height)) * 2 + 1;

            rayCaster.setFromCamera(mouseVector, camera);
            let tempVector = new THREE.Vector3();
            rayCaster.ray.at(this.objectPlaceDist, tempVector);
            object.position.set(tempVector.x, tempVector.y, tempVector.z);
        }

        function handleWheel(event){
            if (event.wheelDeltaY < 0){
                if (this.objectPlaceDist > 5){
                    this.objectPlaceDist -= 5;
                    findPosition(event);
                }
            } else {
                this.objectPlaceDist += 5;
                findPosition(event);
            }
        }

        function handleShiftDown(event){
            if (event.code == 'ShiftLeft') {
                if (orbitControls.enabled){
                    console.log("stopping orbit controls");
                    orbitControls.enabled = false;
                    orbitControlsWereEnabled = true;
                }
                canvas.addEventListener("wheel", handleWheel )
            }
        }

        function stopShift(){
            if (orbitControlsWereEnabled){
                console.log("starting orbit controls")
                orbitControls.enabled = true;
            }
            canvas.removeEventListener("wheel", handleWheel);
            document.removeEventListener("keydown", handleShiftDown);
            document.removeEventListener("keyup", stopShift);
        }

        document.addEventListener("keydown", handleShiftDown);
        document.addEventListener("keyup", stopShift);
        canvas.addEventListener("mousemove", findPosition);

        function removeEventListeners(){
            canvas.removeEventListener("mousemove", findPosition);
            canvas.removeEventListener("click", removeEventListeners);
            this.placingObject = false;
        }
        canvas.addEventListener("click", removeEventListeners)
    }

    checkForObject(event) {
        let mouseVector = new THREE.Vector2();
        let rayCaster = new THREE.Raycaster();

        mouseVector.x = (event.offsetX / parseInt(window.getComputedStyle(canvas).width)) * 2 - 1;
        mouseVector.y = -(event.offsetY / parseInt(window.getComputedStyle(canvas).height)) * 2 + 1;

        rayCaster.setFromCamera(mouseVector, camera);
        // rayDirection = rayCaster.ray.direction;

        return rayCaster.intersectObjects(this.scene.children);
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


        if (this.selectedObject) {
            // Enable inputs if object selected
            this.setPropertiesDisabled(false);

            // Populate inputs again
            this.#addDataToFields(this.selectedObject.body, this.selectedObject.mesh)
        }

        // Enable disabled buttons
        document.getElementById("add-cube-button").disabled = false;
        document.getElementById("add-sphere-button").disabled = false;
        document.getElementById("move-button").disabled = false;
        document.getElementById("resize-button").disabled = false
        document.getElementById("rotate-button").disabled = false;


    }

    setPropertiesDisabled(isDisabled) {
        const container = document.getElementById('right-ui-properties');
        const inputElements = container.querySelectorAll('input');

        for (const inputElement of inputElements) {
            inputElement.disabled = isDisabled;
        }
    }

    #selectObject(objectMesh, objectBody, index, radioInput) {
        // Uncheck the previous radio
        if (this.selectedElement) {
            this.selectedElement.checked = false;
            this.selectedElement = null;
            this.selectedObject = null;
        }

        this.#addDataToFields(objectBody, objectMesh);


        // Todo Add acceleration and angular acceleration

        // Set selectedElement to this element
        this.selectedElement = radioInput;
        this.selectedObject = this.objects[index];

        // Enable the inputs if simulation is not running
        if (this.world.time === 0) {
            this.setPropertiesDisabled(false);
        }
    }

    #addDataToFields(objectBody, objectMesh) {
        // Add all the required data to the fields
        document.getElementById("object-name").innerText = objectMesh.name;
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
    }

    #deselectObject() {
        this.selectedElement = null;
        this.selectedObject = null;

        // Disable inputs
        this.setPropertiesDisabled(true);

        // Remove all data from fields
        document.getElementById("object-name").innerText = "No item is selected"
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

        // Todo Remove acceleration and angular acceleration
    }

    #addItemToList(index) {
        // Get object by index
        const objectMesh = this.objects[index].mesh;
        const objectBody = this.objects[index].body;
        
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
                this.#selectObject(objectMesh, objectBody, index, radioInput);
            } else {
                this.#deselectObject();
            }
        }
        
        // Generate the label
        const inputLabel = document.createElement("LABEL");
        
        inputLabel.setAttribute("for", radioInput.id);
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
        removeButton.innerHTML = "remove";

        removeButton.onclick = () => {
            // Deselect object
            if (this.selectedObject === this.objects[index]) {
                this.#deselectObject();
            }

            // Remove from objects, html and scene
            this.objects.splice(index, 1);

            document.getElementById("right-ui-objects-list").removeChild(containerDiv);

            const indexInScene = this.scene.children.indexOf(objectMesh);
            this.scene.children.splice(indexInScene, 1);
        }

        // Append all the nodes to their parent
        containerDiv.appendChild(radioInput);
        containerDiv.appendChild(inputLabel);
        containerDiv.appendChild(followButton);
        containerDiv.appendChild(removeButton);

        document.getElementById("right-ui-objects-list").appendChild(containerDiv);
        radioInput.click();
    }

}

export {Simulation};