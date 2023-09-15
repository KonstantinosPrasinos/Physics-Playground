import {simulation} from "./main.js";

/* Left ui buttons */
document.getElementById("add-cube-button").onclick = simulation.createBox.bind(simulation, 0, 0, 0, 2, 2, 2);
document.getElementById("add-sphere-button").onclick = simulation.createSphere.bind(simulation, 5, 0, 0, 1);

/* Right ui inputs */