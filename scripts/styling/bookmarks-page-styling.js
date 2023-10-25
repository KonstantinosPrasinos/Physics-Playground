import {simulation} from "../main.js";
import {collapseBookmarks} from "./left-bar-styling.js";

document.getElementById("close-bookmarks-button").addEventListener("click", collapseBookmarks);
document.getElementById("bookmark-button").addEventListener("click", () => {
    if (simulation.objects.length > 0) {
        document.getElementById("create-bookmark-overlay").classList.remove("collapsed");
    }
});