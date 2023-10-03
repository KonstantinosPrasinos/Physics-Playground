import {setBackgroundWithTheme, simulation} from "../main.js";
import {collapseSettings} from "./left-bar-styling.js";

const cameraFovValue = document.getElementById("camera-fov-slider-value");
const cameraFovSlider = document.getElementById("camera-fov-slider");

let userSettings = {
  theme: "dark",
  showTips: false,
  cameraType: "Orthographic",
  cameraFov: "45"
};

const loadSettingsFromLocalStorage = () => {
    // Get from local storage
    userSettings = JSON.parse(localStorage.getItem("userSettings"));

    // Update settings ui
    switch (userSettings.theme) {
        case "light":
            document.body.className = "light-theme";
            setBackgroundWithTheme();

            document.getElementById("light-theme-radio").checked = true;
            document.getElementById("dark-theme-radio").checked = false;
            break;
        case 'midnight':
            document.body.className = "midnight-theme";
            setBackgroundWithTheme();

            document.getElementById("midnight-theme-radio").checked = true;
            document.getElementById("dark-theme-radio").checked = false;
            break;
        default:
            break;
    }

    if (!userSettings.showTips) {
        document.getElementById("show-tips-button").checked = false;
    }

    if (userSettings.cameraType !== "Orthographic") {
        document.getElementById("perspective-camera-radio").checked = true;
    }

    if (userSettings.cameraFov !== "45") {
        cameraFovSlider.value = userSettings.cameraFov;
        updateCameraFovSliderValue(userSettings.cameraFov);
    }
}
const saveSettingsToLocalStorage = () => {
    localStorage.setItem("userSettings", JSON.stringify(userSettings));
}

document.getElementById("close-settings-button").onclick = () => {
    collapseSettings();
}

document.getElementById("light-theme-radio").onchange = () => {
    if (document.body.className !== "light-theme") {
        document.body.className = "light-theme";
        setBackgroundWithTheme();
        userSettings.theme = "light";
        saveSettingsToLocalStorage();
    }
}

document.getElementById("dark-theme-radio").onchange = () => {
    if (document.body.className !== "dark-theme") {
        document.body.className = "dark-theme";
        setBackgroundWithTheme();
        userSettings.theme = "dark"
        saveSettingsToLocalStorage();
    }
}

document.getElementById("midnight-theme-radio").onchange = () => {
    if (document.body.className !== "midnight-theme") {
        document.body.className = "midnight-theme";
        setBackgroundWithTheme();
        userSettings.theme = "midnight";
        saveSettingsToLocalStorage();
    }
}

const updateCameraFovSliderValue = (value) => {
    const percentage = ((value - 20) / 90) * 100

    cameraFovValue.innerText = `${value}`
    cameraFovValue.style.left = `calc(${percentage}% - ${percentage / 100 * 3.5}em)`
}

cameraFovSlider.addEventListener("input", (event) => {
    updateCameraFovSliderValue(event.target.value);
    userSettings.cameraFov = event.target.value;
    saveSettingsToLocalStorage();
});

document.getElementById("camera-fov-container").onwheel = (event) => {
    if (event.deltaY > 0) {
        cameraFovSlider.value -= 1;
        updateCameraFovSliderValue(cameraFovSlider.value);
    } else if (event.deltaY < 0) {
        cameraFovSlider.value = parseInt(cameraFovSlider.value) + 1;
        updateCameraFovSliderValue(cameraFovSlider.value);
    }
}

document.getElementById("download-button").onclick = (event) => {
    if (simulation.objects.length > 0) {
        // Assemble the object to download
        let downloadableObject = {};

        for (const object of simulation.objects) {
            let temp = {

            }

            temp.position = {x: object.mesh.position.x, y: object.mesh.position.y, z: object.mesh.position.z};
            temp.rotation = {x: object.mesh.rotation.x, y: object.mesh.rotation.y, z: object.mesh.rotation.z};

            if (object.mesh.geometry.type === "BoxGeometry") {
                temp.type = "Cube";
            } else {
                temp.type = "Sphere";
            }

            temp.velocity = {x: object.body.velocity.x, y: object.body.velocity.y, z: object.body.velocity.z};
            temp.angularVelocity = {x: object.body.angularVelocity.x, y: object.body.angularVelocity.y, z: object.body.angularVelocity.z};

            temp.color = object.mesh.material.color.getHexString();
            temp.scale = {x: object.mesh.scale.x, y: object.mesh.scale.y, z: object.mesh.scale.z};

            temp.name = object.mesh.name;

            downloadableObject[object.mesh.uuid] = temp;
        }

        // Encode object
        const data = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(downloadableObject));

        // Download object
        event.target.setAttribute("href", data);
        event.target.setAttribute("download", "scene.json");
    }
}

document.getElementById("upload-button-input").onchange = (event) => {
    const file = event.target.files[0];

    // Create a new FileReader instance
    const reader = new FileReader();

    // Handle file
    reader.onload = (e) => {
        const contents = e.target.result;

        // Process the JSON data here
        try {
            const data = JSON.parse(contents);

            // Clear simulation
            simulation.clear();

            // Add new objects to simulation
            for (const key in data) {
                const jsonObject = data[key];

                const object = simulation.createObject(jsonObject.type);

                object.mesh.rotation.x = jsonObject.rotation.x;
                object.mesh.rotation.y = jsonObject.rotation.y;
                object.mesh.rotation.z = jsonObject.rotation.z;

                simulation.synchronizeRotation(object);

                object.mesh.position.x = jsonObject.position.x;
                object.mesh.position.y = jsonObject.position.y;
                object.mesh.position.z = jsonObject.position.z;

                simulation.synchronizePosition(object);

                object.mesh.scale.x = jsonObject.scale.x;
                object.mesh.scale.y = jsonObject.scale.y;
                object.mesh.scale.z = jsonObject.scale.z;

                simulation.synchronizeSize("x", object);

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
            }

            simulation.deselectObject();
        } catch (e) {
            // Invalid file type
            console.error(e.message);
        }
    };

    // Trigger onload event
    reader.readAsText(file);
}

loadSettingsFromLocalStorage();