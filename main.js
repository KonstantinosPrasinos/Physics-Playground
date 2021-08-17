const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

let physics = {
    gravity: 10
}

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(2, 0.2, 0.5);
const material = new THREE.MeshBasicMaterial({ color: 0xfbe9e7 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

let movingDirection = 1;

const animate = function () {
    requestAnimationFrame(animate);

    // cube.rotation.x += 0.01;
    // cube.rotation.y += 0.01;
    cube.rotation.z += 0.01;

    if (cube.position.x >= window.innerWidth / 2){
        movingDirection = -1;
    } else if (cube.position.x <= -window.innerWidth / 2){
        movingDirection = 1;
    }
    cube.position.x += 0.02 * movingDirection;

    // console.log(cube.rotation._z, cube.quaternion._z);
    // console.log(cube.position.x, movingDirection);

    renderer.render(scene, camera);
};

animate();

console.log(renderer.getSize());