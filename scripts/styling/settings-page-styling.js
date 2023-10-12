import {
    setBackgroundWithTheme,
    setCameraFov,
    setCameraOrthographic,
    setCameraPerspective,
    simulation
} from "../main.js";
import {collapseSettings} from "./left-bar-styling.js";
import {events} from "../events.js";

const cameraFovValue = document.getElementById("camera-fov-slider-value");
const cameraFovSlider = document.getElementById("camera-fov-slider");

let userSettings = {
    theme: "dark",
    cameraType: "Orthographic",
    cameraFov: "45",
    useDeviceTheme: false
};

const loadSettingsFromLocalStorage = () => {
    // Get from local storage
    userSettings = JSON.parse(localStorage.getItem("userSettings"));

    // Update settings ui
    if (userSettings.useDeviceTheme) {
        setColorSchemeEvent(true);
        document.getElementById("device-theme-toggle").checked = true;
    } else {
        switch (userSettings.theme) {
            case "light":
                setLightTheme()
                break;
            case 'midnight':
                setLightTheme()
                break;
            default:
                break;
        }
    }

    if (userSettings.cameraType !== "Orthographic") {
        document.getElementById("perspective-camera-radio").checked = true;
        setCameraPerspective();

        document.getElementById("camera-fov-container-section").classList.remove("Disabled");
        document.getElementById("camera-fov-slider").disabled = false;
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

    setCameraFov(event.target.value);
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
        let downloadableObject = {
            objects: {},
            events: {}
        };

        // Assemble objects object
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
            temp.mass = object.body.mass;

            downloadableObject.objects[object.mesh.uuid] = temp;
        }

        // Assemble events object
        for (const event of simulation.events) {
            downloadableObject.events[event.id] = {...event, id: undefined, fulfillmentTime: undefined};
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
            const newUuids = {};

            // Clear simulation
            simulation.reset();

            // Add new objects to simulation
            for (const key in data?.objects) {
                const jsonObject = data.objects[key];

                const object = simulation.createObject(jsonObject.type);

                newUuids[key] = object.mesh.uuid;

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

            // Add new events to simulation
            for (const key in data?.events) {
                const jsonEvent = data.events[key];

                if (jsonEvent.source.includes("object")) {
                    const oldUuid = jsonEvent.source.substring(7, jsonEvent.source.length);
                    
                    jsonEvent.source = `object-${newUuids[oldUuid]}`
                }

                if (jsonEvent.target.includes("object")) {
                    const oldUuid = jsonEvent.target.substring(7, jsonEvent.target.length);

                    jsonEvent.target = `object-${newUuids[oldUuid]}`
                }

                events.addEvent(jsonEvent);
            }
        } catch (e) {
            // Invalid file type
            console.error(e);
        }
    };

    // Trigger onload event
    reader.readAsText(file);
}

document.getElementById("perspective-camera-radio").onchange = (event) => {
    if (event.target.checked) {
        setCameraPerspective();
        userSettings.cameraType = "Perspective";

        saveSettingsToLocalStorage();

        document.getElementById("camera-fov-container-section").classList.remove("Disabled");
        document.getElementById("camera-fov-slider").disabled = false;
    }
}

document.getElementById("orthographic-camera-radio").onchange = (event) => {
    if (event.target.checked) {
        setCameraOrthographic();
        userSettings.cameraType = "Orthographic";

        saveSettingsToLocalStorage();

        document.getElementById("camera-fov-container-section").classList.add("Disabled");
        document.getElementById("camera-fov-slider").disabled = true;
    }
}

const setDarkTheme = () => {
    document.body.className = "dark-theme";
    setBackgroundWithTheme();

    document.getElementById("dark-theme-radio").checked = true;
}

const setLightTheme = () => {
    document.body.className = "light-theme";
    setBackgroundWithTheme();

    document.getElementById("light-theme-radio").checked = true;
}

const setColorSchemeEvent = (bool) => {
    if (bool) {
        document.getElementById("theme-section").classList.add("Disabled");
    } else {
        document.getElementById("theme-section").classList.remove("Disabled");
    }
    document.getElementById("light-theme-radio").disabled = bool;
    document.getElementById("dark-theme-radio").disabled = bool;
    document.getElementById("midnight-theme-radio").disabled = bool;

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDarkTheme();
    } else {
        setLightTheme();
    }
    const eventListener = (event) => {
        if (event.matches) {
            // Dark mode
            setDarkTheme();
        } else {
            // Light mode
            setLightTheme();
        }
    }

    if (bool) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', eventListener)
    } else {
        window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', eventListener);
    }
}

document.getElementById("device-theme-toggle").onchange = (event) => {
    if (event.target.checked) {
        setColorSchemeEvent(true);
        // Disable theme picker
    } else {
        setColorSchemeEvent(false);
        userSettings.us
    }

    userSettings.useDeviceTheme = event.target.checked;
    saveSettingsToLocalStorage();
}

loadSettingsFromLocalStorage();