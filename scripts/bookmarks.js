import {simulation} from "./main.js";
import {events} from "./events.js";
import {generateSceneObject} from "./styling/settings-page-styling.js";

const bookmarks = {
    bookmarks: [],

    init() {
        // Get bookmarks
        const bookmarks = localStorage.getItem("bookmarks");

        if (!bookmarks) return;

        this.bookmarks = JSON.parse(bookmarks);

        // Add elements to list for each bookmark
        this.bookmarks.forEach(bookmark => this.addBookmarkToList(bookmark));
    },

    addBookmarkToList(bookmark) {
        const container = document.createElement('DIV');
        container.id = `bookmark-${bookmark.id}`;
        container.className = "bookmark-container Horizontal-Flex-Container"

        const textSpan = document.createElement("SPAN");
        textSpan.innerText = bookmark.title;

        const openButton = document.createElement('BUTTON');
        openButton.className = 'material-symbols-outlined';
        openButton.innerText = 'open_in_new';

        openButton.addEventListener("click", () => {
            const newUuids = simulation.loadFromObject(bookmark.objects);

            events.loadFromObject(bookmark.events, newUuids);

            // Enable download and save scene buttons
            document.getElementById("download-button").setAttribute("aria-disabled", "false")
            document.getElementById("bookmark-button").disabled = false;
        });

        const deleteButton = document.createElement('BUTTON');
        deleteButton.className = 'material-symbols-outlined';
        deleteButton.innerText = 'delete';

        deleteButton.addEventListener("click", () => {
            container.remove();
            this.bookmarks.splice(this.bookmarks.indexOf(bookmark), 1);
            this.updateLocalStorage();
        });

        container.appendChild(textSpan);
        container.appendChild(openButton);
        container.appendChild(deleteButton);

        document.getElementById("bookmarks-content").appendChild(container);
    },

    updateLocalStorage() {
        localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
    },

    save(title) {
        if (simulation.objects.length > 0) {
            const sceneObject = generateSceneObject();

            // Generate id;
            let id;

            for (let i = 0; i < this.bookmarks.length + 1; i++) {
                const found = this.bookmarks.find(bookmark => bookmark.id === i);

                if (!found) {
                    id = i;
                    break;
                }
            }

            sceneObject.title = title;
            sceneObject.id = id;

            this.bookmarks.push(sceneObject);
            this.addBookmarkToList(sceneObject);

            this.updateLocalStorage();
        }
    }
};

bookmarks.init();

export {bookmarks};