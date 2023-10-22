import {simulation} from "./main.js";
import {timeline} from "./timeline.js";

const events = {
    events: [],
    totalEvents: 0,
    
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

            sourceText = simulation.objects.find(object => object.mesh.uuid === objectUuid)?.mesh.name;
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
            targetText = simulation.objects.find(object => object.mesh.uuid === objectUuid)?.mesh.name;
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
            const sourceBody = simulation.objects.find(object => object.mesh.uuid === objectUuid)?.body;

            if (eventWithId.target === "anything") {
                sourceBody.triggerEventWithEverything = true;
            } else {
                sourceBody.collisionEventIds.push(id);
            }

            if (!sourceBody.hasEventListener) {
                sourceBody.addEventListener("collide", this.handleCollisionEvent.bind(this));
            }
        }

        this.totalEvents++;
    },
    handleCollisionEvent(cannonEvent) { // Spider-Man 2099 is not happy
        if (
            cannonEvent.target.collisionEventIds.length > 0 ||
            cannonEvent.body.collisionEventIds.length > 0 ||
            cannonEvent.target.triggerEventWithEverything ||
            cannonEvent.body.triggerEventWithEverything
        ) {

            const collisionBodyUuid = simulation.objects.find(obj => obj.body.id === cannonEvent.body.id).mesh.uuid;

            if (cannonEvent.target.triggerEventWithEverything || cannonEvent.body.triggerEventWithEverything) {
                const collisionTargetUuid = simulation.objects.find(obj => obj.body.id === cannonEvent.target.id).mesh.uuid;
                const event = this.events.find(tempEvent => tempEvent.source === `object-${collisionTargetUuid}` && tempEvent.target === "anything");

                if (!event.fulfillmentTime || event.fulfillmentTime === simulation.world.time - simulation.world.dt) {
                    this.handleEventTriggered({...event, target: `object-${collisionBodyUuid}`});
                }

                event.fulfillmentTime = simulation.world.time;
            } else {
                const targetEvents = this.events.filter(event => cannonEvent.target.collisionEventIds.includes(event.id));

                for (const event of targetEvents) {
                    if (!event.fulfillmentTime || event.fulfillmentTime === simulation.world.time - simulation.world.dt) {
                        const collisionBodyUuid = simulation.objects.find(obj => obj.body.id === cannonEvent.body.id).mesh.uuid;
                        const targetUuid = event.target.substring(7, event.target.length);

                        if (collisionBodyUuid === targetUuid) {
                            this.handleEventTriggered(event);
                        }
                    }

                    event.fulfillmentTime = simulation.world.time;
                }
            }
        }
    },

    handleEventTriggered(event) {
        // If the event is source time then don't print
        if (event.source !== "Time") {
            timeline.addEntry(event);
        }

        simulation.pause();
    },

    removeEvent(event, calledByOtherAnythingEvent = false) {
        // Remove row from table
        document.getElementById("events-table-body").removeChild(document.getElementById(`events-table-row-${event.id}`));

        if (event.type === "collision") {
            // Remove simulation. event from the body
            const objectUuid = event.source.substring(7, event.source.length);
            const sourceBody = simulation.objects.find(object => object.mesh.uuid === objectUuid)?.body;

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
    },
    
    checkEvents() {
        const derivatives = {
            position: "velocity",
            rotation: "angularVelocity",
            velocity: "acceleration"
        }

        this.events.forEach((event) => {
            // For event with a source of time
            if (!event.fulfillmentTime || event.fulfillmentTime === simulation.world.time - simulation.world.dt ) { // make sure the same event doesn't get fulfilled back to back
                if (event.source === "Time") {
                    const targetTime = parseFloat(event.target.substring(7, event.target.length)) * 2;

                    if (targetTime >= simulation.world.time - simulation.world.dt && targetTime <= simulation.world.time + simulation.world.dt) {
                        this.handleEventTriggered(event);
                    }
                } else if (event.type !== "collision") {
                    const axis = event.type.charAt(event.type.length - 1);

                    // Make event case camelCase
                    const type = event.type.substring(0, event.type.length - 2);

                    // Get source body and target
                    const objectUuid = event.source.substring(7, event.source.length);
                    const sourceBody = simulation.objects.find(obj => obj.mesh.uuid === objectUuid).body;
                    const target = parseFloat(event.target.substring(7, event.target.length));

                    if (
                        target >= sourceBody[type][axis] - sourceBody[derivatives[type]][axis] * simulation.world.dt &&
                        target <= sourceBody[type][axis] + sourceBody[derivatives[type]][axis] * simulation.world.dt
                    ) {
                        event.fulfillmentTime = simulation.world.time;
                        this.handleEventTriggered(event);
                    }
                }
            }
        })
    },

    resetFulfillmentTimes() {
        for (const index in this.events) {
            this.events[index].fulfillmentTime = null;
        }
    },

    clearThoseWithObject() {
        this.events = this.events.filter(event => event.source === "Time");

        const childrenToBeRemoved = document.querySelectorAll(".event-row-source-object");

        childrenToBeRemoved.forEach(child => {
            child.remove();
        })
    },

    clear() {
        for (const child of document.getElementById("events-table-body").children) {
            child.remove();
        }

        this.events = [];
    },

    loadFromObject(object, newUuids) {
        for (const key in object) {
            const jsonEvent = object[key];

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
    }
}

export {events};