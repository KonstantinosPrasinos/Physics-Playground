const canvasHandlerParams = {
    canClickCanvas: true
}

function updateValuesPerTick(){
    if (simulation.itemSelected > -1){
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
}

function updateValuesOnce(bool){
    setDisabled(bool);
    if (!bool){
        updateValues();
        if (simulation.objects[simulation.itemSelected].mesh.userData.hasVectors){
            for (let i in simulation.objects[simulation.itemSelected].mesh.children){
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
        colorPicker.value = `#${simulation.objects[simulation.itemSelected].mesh.material.color.getHexString()}`;
        document.getElementById("mass-input").value = simulation.objects[simulation.itemSelected].body.mass;
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
    } else {
        document.getElementById("width-input").value = "";
        document.getElementById("height-input").value = "";
        document.getElementById("depth-input").value = "";
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
        document.getElementById("mass-input").value = "";
        document.getElementById("force-vectors-single").checked = false;
        document.getElementById("force-vectors-all").checked = false;
        document.getElementById("velocity-vectors-single").checked = false;
        document.getElementById("velocity-vectors-all").checked = false;
        document.getElementById("wireframe-toggle").checked = false;
        document.getElementById("collisionResponse-toggle").checked = false;
        colorPicker.value = "#000000";
    }
}

export {updateValuesOnce, updateValuesPerTick, canvasHandlerParams};