const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({ canvas: viewportCanvas,})
renderer.setClearColor( 0xffffff, 1);

let cameraMetrics = {
    viewHeight: 900,
    aspectRatio: window.innerWidth / window.innerHeight
}

let userInterface = {
    isDarkMode: true
}

const camera = new THREE.OrthographicCamera(-cameraMetrics.aspectRatio * cameraMetrics.viewHeight / 2, cameraMetrics.aspectRatio * cameraMetrics.viewHeight / 2, cameraMetrics.viewHeight / 2, -cameraMetrics.viewHeight / 2, -1000, 1000);

let simulation = {
    gravity: 10,
    time: 0, //in ms
    timePerTick: 1, //in ms
    items: [],
    numberOfObjects: {
        boxes: 0
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
    }
}

class item {
    constructor(type, dimensions, color, position) {
        this.type = type;
        this.moveable = type

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
        let node = document.createElement("DIV");
        let textNode = document.createElement("input");
        let buttonNode = document.createElement('input');
        node.classList.add("item-list-field");
        textNode.type = 'text';
        textNode.value = this.name;
        textNode.setAttribute('required', "");
        textNode.classList.add("item-list-editable");
        buttonNode.type = 'button';
        buttonNode.classList.add("item-list-field-button");
        buttonNode.addEventListener('click', () =>{
            textNode.focus();
        });
        this.previousTextNodeItemZero = textNode.innerText[0];
        textNode.addEventListener("blur", () => {
            if (textNode.value.length == 0) {
                textNode.focus();
            } else {
                this.name = textNode.value;
            }
        });
        node.appendChild(textNode);
        node.appendChild(buttonNode);
        document.getElementById("right-ui-item-container").appendChild(node);
    }
}

simulation.items.push(new item('box', { width: 10, height: 300, depth: 100 }, 0x000000, { x: 500, y: 100, z: 0 }));
simulation.items.push(new item('box', { width: 100, height: 300, depth: 100 }, 0x000000, { x: -670, y: 0, z: 0 }));

const animate = function () {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};

animate();

simulation.tickHandling();