const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let simulation = {
    gravity: 10,
    time: 0, //in ms
    timePerTick: 1, //in ms
    items: [],
    tickHandling: function () {
        setInterval(() => {
            this.items.forEach(item => {
                item.checkDimensions();
                item.moveX();
            })
            this.time += this.timePerTick;
        }, this.timePerTick);
    }
}

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

camera.position.z = 5;

class item {
    constructor(type, dimensions, color, position) {
        this.type = type;
        
        if (type == 'box') {
            this.geometry = new THREE.BoxGeometry(dimensions.width, dimensions.height, dimensions.depth);
            this.material = new THREE.MeshBasicMaterial(`{ color: ${color}}`);
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

        this.moveX = function(){
            this.position.x = this.position.x + (this.velocity.x * simulation.timePerTick) + ( 0.5 * this.acceleration.x * Math.pow(simulation.timePerTick / 1000, 2));
            this.velocity.x = this.velocity.x + this.acceleration.x * simulation.timePerTick;
            this.object.position.x = this.position.x;
        }

        this.moveY = function(){
            this.position.y = this.position.y + (this.velocity.y * simulation.timePerTick) + ( 0.5 * this.acceleration.y * Math.pow(simulation.timePerTick / 1000, 2));
            this.velocity.y = this.velocity.y + this.acceleration.y * simulation.timePerTick;
            this.object.position.y = this.position.y;
        }

        this.moveZ = function(){
            this.position.z = this.position.z + (this.velocity.z * simulation.timePerTick) + ( 0.5 * this.acceleration.z * Math.pow(simulation.timePerTick / 1000, 2));
            this.velocity.z = this.velocity.z + this.acceleration.z * simulation.timePerTick;
            this.object.position.z = this.position.z;
        }

        this.checkDimensions = function (){
            this.dimensions.width = this.geometry.parameters.width * this.object.scale.x;
            this.dimensions.height = this.geometry.parameters.height * this.object.scale.y;
            this.dimensions.depth = this.geometry.parameters.depth * this.object.scale.z;
        }
    }
}

const animate = function () {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
};

simulation.items.push(new item('box', {width: 3, height: 0.1, depth: 0.5}, '0x00ff00', {x: 0, y: 0, z: 0}));
simulation.items.push(new item('box', {width: 3, height: 0.1, depth: 0.5}, '0x00ff00', {x: 0, y: 0, z: 0}));

simulation.items[0].acceleration.x = 0.000001;
simulation.items[1].acceleration.x = -0.000001;

simulation.tickHandling();

animate();