const themeSwitch = document.getElementById("theme-switch");

function applySavedTheme() {
    const savedTheme = localStorage.getItem("journal-theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }

    updateThemeButton();
}

function toggleTheme() {
    document.body.classList.toggle("dark-mode");

    const isDarkMode =
        document.body.classList.contains("dark-mode");

    localStorage.setItem(
        "journal-theme",
        isDarkMode ? "dark" : "light"
    );

    updateThemeButton();
}

function updateThemeButton() {
    if (!themeSwitch) {
        return;
    }

    const isDarkMode =
        document.body.classList.contains("dark-mode");

    themeSwitch.setAttribute(
        "aria-label",
        isDarkMode
            ? "Switch to light mode"
            : "Switch to dark mode"
    );

    themeSwitch.setAttribute(
        "title",
        isDarkMode
            ? "Switch to light mode"
            : "Switch to dark mode"
    );
}

applySavedTheme();

if (themeSwitch) {
    themeSwitch.addEventListener("click", toggleTheme);
} else {
    console.error("Theme button was not found.");
}
// ===============================
// SEARCH BUTTON
// ===============================


const searchButton =
document.getElementById("navSearchButton");


const searchOverlay =
document.getElementById("searchOverlay");


const closeSearch =
document.getElementById("closeSearch");


const searchInput =
document.getElementById("searchInput");



if(searchButton){


searchButton.addEventListener(
"click",
()=>{

    searchOverlay.classList.add("active");

    searchInput.focus();

});


}



if(closeSearch){


closeSearch.addEventListener(
"click",
()=>{

    searchOverlay.classList.remove("active");

});


}




// CLOSE WHEN CLICK OUTSIDE

searchOverlay?.addEventListener(
"click",
(e)=>{

if(e.target === searchOverlay){

searchOverlay.classList.remove("active");

}

});