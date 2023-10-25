import {bookmarks} from "../bookmarks.js";

const hideModal = () => {
    // Hide the modal
    document.getElementById("create-bookmark-overlay").classList.add("collapsed");

    // Reset the input
    document.getElementById("bookmark-title-input").value = "";
}

document.getElementById("bookmark-title-input").addEventListener("keyup", (event) => {
    document.getElementById("save-create-bookmark-button").disabled = event.target.value.length <= 0;
});

document.getElementById("cancel-create-bookmark-button").addEventListener("click", hideModal);
document.getElementById("save-create-bookmark-button").addEventListener("click", () => {
    bookmarks.save(document.getElementById("bookmark-title-input").value);
    hideModal();
});