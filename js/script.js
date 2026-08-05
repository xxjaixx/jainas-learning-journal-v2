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