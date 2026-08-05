(() => {
    "use strict";

    /* =========================================
       DEFAULT JOURNAL DATA
    ========================================= */

    const defaultJournals = [
        {
            id: 1,
            week: "Week 1",
            category: "Study Notes",
            title: "Introduction to Information Assurance",
            description:
                "Today I learned the basic concepts of Information Assurance and why it is important in protecting data.",
            date: "August 3, 2026",
            image: "images/journal/post4.png",
            readTime: 3
        },
        {
            id: 2,
            week: "Week 2",
            category: "Technology",
            title: "CIA Triad",
            description:
                "We discussed Confidentiality, Integrity, and Availability and their real-life applications.",
            date: "August 10, 2026",
            image: "images/journal/post5.png",
            readTime: 5
        },
        {
            id: 3,
            week: "Week 3",
            category: "Technology",
            title: "Authentication",
            description:
                "We learned different authentication methods including passwords and biometrics.",
            date: "August 17, 2026",
            image: "images/journal/post6.png",
            readTime: 4
        }
    ];

    const STORAGE_KEY = "jaixLearningJournals";
    const JOURNALS_PER_PAGE = 3;

    /* =========================================
       HTML ELEMENTS
    ========================================= */

    const container = document.getElementById("journalContainer");
    const modal = document.getElementById("journalModal");

    const addBtn = document.getElementById("addJournal");
    const cancelBtn = document.getElementById("cancelBtn");
    const saveBtn = document.getElementById("saveBtn");
    const modalClose = document.getElementById("modalClose");
    const modalTitle = document.getElementById("modalTitle");

    const searchInput = document.getElementById("searchInput");
    const navSearchButton = document.getElementById("navSearchButton");

    const sortSelect = document.getElementById("sortSelect");
    const loadMoreButton = document.getElementById("loadMoreButton");

    const filterButtons = document.querySelectorAll(".filter-button");
    const subscribeForm = document.querySelector(".subscribe-form");

    const titleInput = document.getElementById("title");
    const weekInput = document.getElementById("week");
    const categoryInput = document.getElementById("category");
    const dateInput = document.getElementById("date");
    const imageInput = document.getElementById("image");
    const descriptionInput = document.getElementById("description");

    /* =========================================
       APPLICATION STATE
    ========================================= */

    let journals = loadJournals();
    let editingJournalId = null;
    let activeCategory = "all";
    let currentSort = "latest";
    let visibleCount = JOURNALS_PER_PAGE;

    /* =========================================
       LOAD AND SAVE DATA
    ========================================= */

    function loadJournals() {
        try {
            const savedJournals = localStorage.getItem(STORAGE_KEY);

            if (savedJournals === null) {
                return defaultJournals.map((journal) => ({
                    ...journal
                }));
            }

            const parsedJournals = JSON.parse(savedJournals);

            if (!Array.isArray(parsedJournals)) {
                return defaultJournals.map((journal) => ({
                    ...journal
                }));
            }

            return parsedJournals.map(normalizeJournal);
        } catch (error) {
            console.error("Unable to load journal entries:", error);

            return defaultJournals.map((journal) => ({
                ...journal
            }));
        }
    }

    function saveJournalsToStorage() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(journals)
            );
        } catch (error) {
            console.error("Unable to save journal entries:", error);
        }
    }

    function normalizeJournal(journal) {
        const description = String(journal.description || "");

        return {
            id: Number(journal.id) || Date.now(),
            week: String(journal.week || "Journal Entry"),
            category:
                String(journal.category || "") ||
                inferCategory(journal.title),
            title: String(journal.title || "Untitled Journal"),
            description,
            date: String(journal.date || ""),
            image:
                String(journal.image || "") ||
                "images/journal/post1.png",
            readTime:
                Number(journal.readTime) ||
                estimateReadTime(description)
        };
    }

    /* =========================================
       FILTER AND SORT JOURNALS
    ========================================= */

    function getFilteredJournals() {
        const searchTerm = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const filteredJournals = journals.filter((journal) => {
            const searchableText = [
                journal.title,
                journal.week,
                journal.category,
                journal.description,
                journal.date
            ]
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                searchableText.includes(searchTerm);

            const matchesCategory =
                activeCategory === "all" ||
                journal.category.toLowerCase() ===
                    activeCategory.toLowerCase();

            return matchesSearch && matchesCategory;
        });

        return sortJournals(filteredJournals);
    }

    function sortJournals(journalList) {
        const sortedJournals = [...journalList];

        if (currentSort === "oldest") {
            sortedJournals.sort(
                (firstJournal, secondJournal) =>
                    getDateValue(firstJournal.date) -
                    getDateValue(secondJournal.date)
            );
        }

        if (currentSort === "latest") {
            sortedJournals.sort(
                (firstJournal, secondJournal) =>
                    getDateValue(secondJournal.date) -
                    getDateValue(firstJournal.date)
            );
        }

        if (currentSort === "title") {
            sortedJournals.sort((firstJournal, secondJournal) =>
                firstJournal.title.localeCompare(
                    secondJournal.title
                )
            );
        }

        return sortedJournals;
    }

    /* =========================================
       DISPLAY JOURNALS
    ========================================= */

    function displayJournals() {
        if (!container) {
            return;
        }

        const filteredJournals = getFilteredJournals();

        if (filteredJournals.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon" aria-hidden="true">
                        ✦
                    </div>

                    <h3>No journal entries found</h3>

                    <p>
                        Try another keyword or choose a different
                        journal category.
                    </p>
                </div>
            `;

            updateLoadMoreButton(0);
            return;
        }

        const visibleJournals = filteredJournals.slice(
            0,
            visibleCount
        );

        container.innerHTML = visibleJournals
            .map(createJournalCard)
            .join("");

        updateLoadMoreButton(filteredJournals.length);
    }

    function createJournalCard(journal) {
        const title = escapeHTML(journal.title);
        const description = escapeHTML(journal.description);
        const category = escapeHTML(
            journal.category || "Reflections"
        );
        const week = escapeHTML(journal.week);
        const date = escapeHTML(journal.date);
        const image = escapeHTML(journal.image);
        const readTime =
            Number(journal.readTime) ||
            estimateReadTime(journal.description);

        return `
            <article
                class="journal-card"
                data-journal-id="${journal.id}"
            >
                <div class="journal-image-wrapper">
                    <img
                        src="${image}"
                        alt="${title}"
                        class="journal-image"
                        loading="lazy"
                    >
                </div>

                <div class="journal-content">

                    <span class="post-category">
                        ${category}
                    </span>

                    <h3 class="journal-title">
                        ${title}
                    </h3>

                    <p class="journal-excerpt">
                        ${description}
                    </p>

                    <div class="post-meta">
                        <span>${date}</span>

                        <span aria-hidden="true">•</span>

                        <span>
                            ${readTime} min read
                        </span>
                    </div>

                    <div class="journal-card-footer">

                        <span class="journal-week">
                            ${week}
                        </span>

                        <div class="card-buttons">

                            <button
                                type="button"
                                class="edit-btn"
                                data-action="edit"
                                data-id="${journal.id}"
                                aria-label="Edit ${title}"
                            >
                                Edit
                            </button>

                            <button
                                type="button"
                                class="delete-btn"
                                data-action="delete"
                                data-id="${journal.id}"
                                aria-label="Delete ${title}"
                            >
                                Delete
                            </button>

                            <button
                                type="button"
                                class="bookmark-button"
                                data-action="bookmark"
                                aria-label="Bookmark ${title}"
                                aria-pressed="false"
                            >
                                <svg
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        d="M6 3.75A1.75 1.75 0 0 1 7.75 2h8.5A1.75 1.75 0 0 1 18 3.75V22l-6-3.75L6 22V3.75Zm1.5 0v15.54L12 16.48l4.5 2.81V3.75a.25.25 0 0 0-.25-.25h-8.5a.25.25 0 0 0-.25.25Z"
                                    />
                                </svg>
                            </button>

                        </div>

                    </div>

                </div>
            </article>
        `;
    }

    function updateLoadMoreButton(totalJournals) {
        if (!loadMoreButton) {
            return;
        }

        const hasMoreJournals =
            visibleCount < totalJournals;

        loadMoreButton.hidden = !hasMoreJournals;
    }

    /* =========================================
       OPEN ADD JOURNAL MODAL
    ========================================= */

    function openAddModal() {
        editingJournalId = null;

        clearForm();

        if (modalTitle) {
            modalTitle.textContent = "Add New Journal";
        }

        if (saveBtn) {
            saveBtn.textContent = "Save Journal";
        }

        if (weekInput) {
            weekInput.value = `Week ${journals.length + 1}`;
        }

        if (dateInput) {
            dateInput.value = getTodayForInput();
        }

        if (categoryInput) {
            categoryInput.value = "Reflections";
        }

        openModal();

        window.requestAnimationFrame(() => {
            titleInput?.focus();
        });
    }

    /* =========================================
       OPEN AND CLOSE MODAL
    ========================================= */

    function openModal() {
        if (!modal) {
            return;
        }

        modal.style.display = "flex";
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
    }

    function closeModal() {
        if (!modal) {
            return;
        }

        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");

        editingJournalId = null;
        clearForm();
    }

    /* =========================================
       SAVE OR UPDATE JOURNAL
    ========================================= */

    function saveJournal() {
        const title = titleInput?.value.trim() || "";
        const week = weekInput?.value.trim() || "";
        const date = dateInput?.value || "";
        const image = imageInput?.value.trim() || "";
        const description =
            descriptionInput?.value.trim() || "";

        const category =
            categoryInput?.value.trim() || "Reflections";

        if (
            !title ||
            !week ||
            !date ||
            !image ||
            !description
        ) {
            alert("Please complete all journal fields.");
            return;
        }

        const formattedDate = formatDate(date);
        const readTime = estimateReadTime(description);

        if (editingJournalId !== null) {
            const journal = journals.find(
                (item) => item.id === editingJournalId
            );

            if (journal) {
                journal.title = title;
                journal.week = week;
                journal.category = category;
                journal.date = formattedDate;
                journal.image = image;
                journal.description = description;
                journal.readTime = readTime;
            }
        } else {
            const newJournal = {
                id: getNextId(),
                week,
                category,
                title,
                description,
                date: formattedDate,
                image,
                readTime
            };

            journals.push(newJournal);
        }

        saveJournalsToStorage();

        visibleCount = JOURNALS_PER_PAGE;

        closeModal();
        displayJournals();
    }

    /* =========================================
       EDIT JOURNAL
    ========================================= */

    function editJournal(id) {
        const journal = journals.find(
            (item) => item.id === id
        );

        if (!journal) {
            return;
        }

        editingJournalId = id;

        if (titleInput) {
            titleInput.value = journal.title;
        }

        if (weekInput) {
            weekInput.value = journal.week;
        }

        if (categoryInput) {
            categoryInput.value =
                journal.category || "Reflections";
        }

        if (dateInput) {
            dateInput.value = convertDateForInput(
                journal.date
            );
        }

        if (imageInput) {
            imageInput.value = journal.image;
        }

        if (descriptionInput) {
            descriptionInput.value =
                journal.description;
        }

        if (modalTitle) {
            modalTitle.textContent = "Edit Journal";
        }

        if (saveBtn) {
            saveBtn.textContent = "Update Journal";
        }

        openModal();

        window.requestAnimationFrame(() => {
            titleInput?.focus();
        });
    }

    /* =========================================
       DELETE JOURNAL
    ========================================= */

    function deleteJournal(id) {
        const journal = journals.find(
            (item) => item.id === id
        );

        if (!journal) {
            return;
        }

        const confirmed = window.confirm(
            `Delete "${journal.title}"?`
        );

        if (!confirmed) {
            return;
        }

        journals = journals.filter(
            (item) => item.id !== id
        );

        saveJournalsToStorage();

        visibleCount = JOURNALS_PER_PAGE;

        displayJournals();
    }

    /* =========================================
       BOOKMARK BUTTON
    ========================================= */

    function toggleBookmark(button) {
        const isBookmarked =
            button.getAttribute("aria-pressed") === "true";

        button.setAttribute(
            "aria-pressed",
            String(!isBookmarked)
        );

        button.classList.toggle(
            "bookmarked",
            !isBookmarked
        );
    }

    /* =========================================
       SEARCH, FILTER, AND SORT
    ========================================= */

    function refreshJournalFeed() {
        visibleCount = JOURNALS_PER_PAGE;
        displayJournals();
    }

    function selectCategory(selectedButton) {
        activeCategory =
            selectedButton.dataset.category || "all";

        filterButtons.forEach((button) => {
            const isSelected =
                button === selectedButton;

            button.classList.toggle(
                "active",
                isSelected
            );

            button.setAttribute(
                "aria-pressed",
                String(isSelected)
            );
        });

        refreshJournalFeed();
    }

    /* =========================================
       FORM HELPERS
    ========================================= */

    function clearForm() {
        if (titleInput) {
            titleInput.value = "";
        }

        if (weekInput) {
            weekInput.value = "";
        }

        if (categoryInput) {
            categoryInput.value = "Reflections";
        }

        if (dateInput) {
            dateInput.value = "";
        }

        if (imageInput) {
            imageInput.value = "";
        }

        if (descriptionInput) {
            descriptionInput.value = "";
        }
    }

    function getNextId() {
        if (journals.length === 0) {
            return 1;
        }

        return (
            Math.max(
                ...journals.map((journal) =>
                    Number(journal.id)
                )
            ) + 1
        );
    }

    function formatDate(dateValue) {
        const selectedDate = new Date(
            `${dateValue}T00:00:00`
        );

        if (Number.isNaN(selectedDate.getTime())) {
            return dateValue;
        }

        return selectedDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }

    function convertDateForInput(formattedDate) {
        const date = new Date(formattedDate);

        if (Number.isNaN(date.getTime())) {
            return "";
        }

        const year = date.getFullYear();
        const month = String(
            date.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            date.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function getTodayForInput() {
        const today = new Date();

        const year = today.getFullYear();
        const month = String(
            today.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            today.getDate()
        ).padStart(2, "0");

        return `${year}-${month}-${day}`;
    }

    function getDateValue(dateString) {
        const date = new Date(dateString);
        const dateValue = date.getTime();

        return Number.isNaN(dateValue)
            ? 0
            : dateValue;
    }

    function estimateReadTime(description) {
        const words = String(description)
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        return Math.max(
            1,
            Math.ceil(words.length / 180)
        );
    }

    function inferCategory(title) {
        const normalizedTitle = String(title || "")
            .toLowerCase();

        const technologyKeywords = [
            "authentication",
            "security",
            "information assurance",
            "cia triad",
            "password",
            "technology"
        ];

        const belongsToTechnology =
            technologyKeywords.some((keyword) =>
                normalizedTitle.includes(keyword)
            );

        return belongsToTechnology
            ? "Technology"
            : "Reflections";
    }

    function escapeHTML(value) {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    /* =========================================
       EVENT LISTENERS
    ========================================= */

    addBtn?.addEventListener(
        "click",
        openAddModal
    );

    cancelBtn?.addEventListener(
        "click",
        closeModal
    );

    saveBtn?.addEventListener(
        "click",
        saveJournal
    );

    modalClose?.addEventListener(
        "click",
        closeModal
    );

    searchInput?.addEventListener(
        "input",
        refreshJournalFeed
    );

    sortSelect?.addEventListener("change", () => {
        currentSort = sortSelect.value;
        refreshJournalFeed();
    });

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            selectCategory(button);
        });
    });

    loadMoreButton?.addEventListener("click", () => {
        visibleCount += JOURNALS_PER_PAGE;
        displayJournals();
    });

    navSearchButton?.addEventListener("click", () => {
        searchInput?.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        window.setTimeout(() => {
            searchInput?.focus();
        }, 350);
    });

    container?.addEventListener("click", (event) => {
        const actionButton = event.target.closest(
            "[data-action]"
        );

        if (!actionButton) {
            return;
        }

        const action = actionButton.dataset.action;
        const journalId = Number(
            actionButton.dataset.id
        );

        if (action === "edit") {
            editJournal(journalId);
        }

        if (action === "delete") {
            deleteJournal(journalId);
        }

        if (action === "bookmark") {
            toggleBookmark(actionButton);
        }
    });

    modal?.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        const modalIsOpen =
            modal?.style.display === "flex";

        if (event.key === "Escape" && modalIsOpen) {
            closeModal();
        }

        if (
            event.key === "Enter" &&
            event.ctrlKey &&
            modalIsOpen
        ) {
            saveJournal();
        }
    });

    subscribeForm?.addEventListener(
        "submit",
        (event) => {
            event.preventDefault();

            const emailInput =
                subscribeForm.querySelector(
                    'input[type="email"]'
                );

            if (!emailInput?.value.trim()) {
                return;
            }

            alert(
                "Thank you for subscribing to the learning journal."
            );

            subscribeForm.reset();
        }
    );

    /* =========================================
       INITIAL DISPLAY
    ========================================= */

    displayJournals();
})();