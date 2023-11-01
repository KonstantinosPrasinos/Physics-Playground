import {simulation} from "./main.js";

const timeline = {
    totalEntries: 0,

    addEntry(specificEvent) {
        const table = document.getElementById("timeline-table-body");
        const id = this.totalEntries;

        const row = document.createElement("DIV");
        row.id = `timeline-table-row-${id}`;
        
        const timeColumn = document.createElement("DIV");
        timeColumn.innerText = parseFloat(simulation.world.time / 2).toFixed(3);

        const source = document.createElement("DIV");

        let sourceText;

        if (specificEvent.source !== "Time") {
            // Get the name from the uuid
            const objectUuid = specificEvent.source.substring(7, specificEvent.source.length);

            sourceText = simulation.objects.find(object => object.mesh.uuid === objectUuid)?.mesh.name;
            row.className = "specificEvent-row-source-object";

            // In order to change the text when the object name is changed, add it's uuid as a class
            source.classList.add(`includes-object-${objectUuid}`);
        } else {
            sourceText = specificEvent.source;
        }

        source.innerText = sourceText;

        const type = document.createElement("DIV");
        type.innerText = specificEvent.type.replaceAll("-", " ");

        const target = document.createElement("DIV");

        let targetText;
        const targetEventText = specificEvent.target.split("-");

        if (targetEventText[0] === "number") {
            targetText = specificEvent.target.substring(7, specificEvent.target.length);
        } else {
            const objectUuid = specificEvent.target.substring(7, specificEvent.target.length);
            targetText = simulation.objects.find(object => object.mesh.uuid === objectUuid)?.mesh.name;

            // In order to change the text when the object name is changed, add it's uuid as a class
            target.classList.add(`includes-object-${objectUuid}`);
        }

        target.innerText = targetText

        row.appendChild(timeColumn);
        row.appendChild(source);
        row.appendChild(type);
        row.appendChild(target);

        table.appendChild(row);

        this.totalEntries++;
    },

    clearEntries() {
        const table = document.getElementById("timeline-table-body");

        while (table.children.length > 0) {
            table.removeChild(table.lastChild);
        }
    }
};

export {timeline};