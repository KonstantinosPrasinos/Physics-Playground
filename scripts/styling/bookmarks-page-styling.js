import {generateSceneObject} from "./settings-page-styling.js";
import {simulation} from "../main.js";
import {events} from "../events.js";
import {collapseBookmarks} from "./left-bar-styling.js";

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

        openButton.onclick = () => {
            const newUuids = simulation.loadFromObject(bookmark.objects);

            events.loadFromObject(bookmark.events, newUuids);
        }

        const deleteButton = document.createElement('BUTTON');
        deleteButton.className = 'material-symbols-outlined';
        deleteButton.innerText = 'delete';

        deleteButton.onclick = () => {
            container.remove();
            this.bookmarks.splice(this.bookmarks.indexOf(bookmark), 1);
            this.updateLocalStorage();
        }

        container.appendChild(textSpan);
        container.appendChild(openButton);
        container.appendChild(deleteButton);

        document.getElementById("bookmarks-content").appendChild(container);
    },

    updateLocalStorage() {
        localStorage.setItem('bookmarks', JSON.stringify(this.bookmarks));
    },

    save() {
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

        sceneObject.title = "This is a temp title";
        sceneObject.id = id;

        this.bookmarks.push(sceneObject);
        this.addBookmarkToList(sceneObject);

        this.updateLocalStorage();
    }
};

document.getElementById("bookmark-button").onclick = bookmarks.save.bind(bookmarks);
document.getElementById("close-bookmarks-button").onclick = collapseBookmarks;

bookmarks.init();