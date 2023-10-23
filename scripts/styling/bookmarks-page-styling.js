import {simulation} from "../main.js";
import {collapseBookmarks} from "./left-bar-styling.js";

document.getElementById("close-bookmarks-button").onclick = collapseBookmarks;
document.getElementById("bookmark-button").onclick = () => {
    if (simulation.objects.length > 0) {
        document.getElementById("create-bookmark-overlay").classList.remove("collapsed");
    }
}