import {bookmarks} from "../bookmarks.js";

const hideModal = () => {
    // Hide the modal
    document.getElementById("create-bookmark-overlay").classList.add("collapsed");

    // Reset the input
    document.getElementById("bookmark-title-input").value = "";
}

document.getElementById("bookmark-title-input").onkeyup = (event) => {
    document.getElementById("save-create-bookmark-button").disabled = event.target.value.length <= 0;
}

document.getElementById("cancel-create-bookmark-button").onclick = hideModal;
document.getElementById("save-create-bookmark-button").onclick = () => {
    bookmarks.save(document.getElementById("bookmark-title-input").value);
    hideModal();
}