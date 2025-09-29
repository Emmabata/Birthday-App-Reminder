// Utilities to query DOM safely across desktop table and mobile cards
function getRows() {
    return Array.from(document.querySelectorAll(".row"));
}

function getToday() {
    const now = new Date();
    return { m: now.getMonth() + 1, d: now.getDate() };
}

function isTodayRow(row) {
    const { m, d } = getToday();
    const rm = Number(row.dataset.month);
    const rd = Number(row.dataset.day);
    return rm === m && rd === d;
}

// ---- Search filter ----
function applyFilters() {
    const q = (document.getElementById("search")?.value || "")
        .toLowerCase()
        .trim();
    const onlyToday = document.body.dataset.onlyToday === "1";

    getRows().forEach((r) => {
        const name = r.dataset.name || "";
        const email = r.dataset.email || "";
        const searchMatch = !q || name.includes(q) || email.includes(q);
        const todayMatch = !onlyToday || isTodayRow(r);
        r.style.display = searchMatch && todayMatch ? "" : "none";
    });
}

function onSearchInput() {
    applyFilters();
}

function toggleTodayFilter() {
    const btn = document.getElementById("filter-today");
    const active = document.body.dataset.onlyToday === "1";
    if (active) {
        document.body.dataset.onlyToday = "0";
        btn.classList.remove("bg-emerald-600", "text-white", "border-emerald-600");
    } else {
        document.body.dataset.onlyToday = "1";
        btn.classList.add("bg-emerald-600", "text-white", "border-emerald-600");
    }
    applyFilters();
}

function clearFilters() {
    const search = document.getElementById("search");
    if (search) search.value = "";
    document.body.dataset.onlyToday = "0";
    const btn = document.getElementById("filter-today");
    if (btn)
        btn.classList.remove("bg-emerald-600", "text-white", "border-emerald-600");
    getRows().forEach((r) => (r.style.display = ""));
    showToast();
}

// ---- Toast ----
function showToast() {
    const t = document.getElementById("toast");
    if (!t) return;
    t.classList.remove("hidden");
    setTimeout(() => t.classList.add("hidden"), 1500);
}

// ---- Delete (confirm without inline handlers) ----
function wireDeleteButtons() {
  // Any delete button with data-action (form action) and data-name
    document
        .querySelectorAll("[data-action][data-name].js-delete")
        .forEach((btn) => {
            btn.addEventListener("click", (e) => {
            e.preventDefault();
            const action = btn.getAttribute("data-action");
            const name = btn.getAttribute("data-name") || "this record";
        // Use modal if present; otherwise simple confirm()
        const modal = document.getElementById("modal");
        if (modal) {
            document.getElementById(
            "modal-text"
            ).textContent = `Are you sure you want to delete “${name}”?`;
            const form = document.getElementById("delete-form");
            form.action = action;
            modal.classList.add("show");
        } else {
            if (window.confirm(`Delete “${name}”?`)) {
            // Create a form and submit (POST)
            const form = document.createElement("form");
            form.method = "post";
            form.action = action;
            document.body.appendChild(form);
            form.submit();
        }
        }
      });
    });

    const cancel = document.querySelector('#modal button[type="button"]');
    if (cancel) {
        cancel.addEventListener("click", () => {
        document.getElementById("modal")?.classList.remove("show");
        });
    }
}

// ---- Wire up events on DOM ready ----
document.addEventListener('DOMContentLoaded', () => {
  // Track filter state on <body>
    document.body.dataset.onlyToday = '0';

    const search = document.getElementById('search');
    if (search) search.addEventListener('input', onSearchInput);

    const todayBtn = document.getElementById('filter-today');
    if (todayBtn) todayBtn.addEventListener('click', toggleTodayFilter);

    const resetBtn = document.getElementById('clear-filters');
    if (resetBtn) resetBtn.addEventListener('click', clearFilters);

    wireDeleteButtons();
});
