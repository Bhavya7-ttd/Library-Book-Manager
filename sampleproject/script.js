// ===== DOM CACHE =====
const bookForm = document.getElementById("bookForm");
const titleInput = document.getElementById("title");
const authorInput = document.getElementById("author");
const statusInput = document.getElementById("status");
const bookIdInput = document.getElementById("bookId");
const booksTableBody = document.getElementById("booksTableBody");
const emptyMessage = document.getElementById("emptyMessage");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const toggleModeBtn = document.getElementById("toggleMode");
const root = document.documentElement;

// ===== STATE =====
let books = JSON.parse(localStorage.getItem("libraryBooks")) || [];
let editingId = null;

// ===== STORAGE =====
const saveBooks = () =>
  localStorage.setItem("libraryBooks", JSON.stringify(books));

// ===== RENDER =====
function renderBooks() {
  booksTableBody.innerHTML = "";
  emptyMessage.style.display = books.length ? "none" : "block";

  const fragment = document.createDocumentFragment();

  books.forEach(({ id, title, author, status }) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${title}</td>
      <td>${author}</td>
      <td>
        <button class="status-badge status-${status}" 
                data-status="${id}">
          ${status}
        </button>
      </td>
      <td>
        <button class="action-btn" data-edit="${id}">✏️</button>
        <button class="action-btn" data-delete="${id}">🗑️</button>
      </td>
    `;

    fragment.appendChild(tr);
  });

  booksTableBody.appendChild(fragment);
}

// ===== EVENT DELEGATION =====
booksTableBody.addEventListener("click", (e) => {
  const id =
    e.target.dataset.edit ||
    e.target.dataset.delete ||
    e.target.dataset.status;

  if (!id) return;

  if (e.target.dataset.edit) editBook(id);
  if (e.target.dataset.delete) deleteBook(id);
  if (e.target.dataset.status) toggleStatus(id);
});

// ===== CRUD =====
function toggleStatus(id) {
  const statuses = ["Unread", "Reading", "Read"];
  const book = books.find(b => b.id === id);
  const i = statuses.indexOf(book.status);
  book.status = statuses[(i + 1) % statuses.length];
  saveBooks();
  renderBooks();
}

function editBook(id) {
  const book = books.find(b => b.id === id);
  editingId = id;

  titleInput.value = book.title;
  authorInput.value = book.author;
  statusInput.value = book.status;

  submitBtn.textContent = "Update Book";
  cancelBtn.hidden = false;
}

function deleteBook(id) {
  if (!confirm("Delete this book?")) return;
  books = books.filter(b => b.id !== id);
  saveBooks();
  renderBooks();
  cancelEdit();
}

// ===== FORM =====
bookForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const author = authorInput.value.trim();
  const status = statusInput.value;

  if (!title || !author) return;

  if (editingId) {
    const book = books.find(b => b.id === editingId);
    book.title = title;
    book.author = author;
    book.status = status;
  } else {
    books.push({
      id: crypto.randomUUID(),
      title,
      author,
      status
    });
  }

  saveBooks();
  renderBooks();
  cancelEdit();
});

function cancelEdit() {
  editingId = null;
  bookForm.reset();
  submitBtn.textContent = "Add Book";
  cancelBtn.hidden = true;
}

cancelBtn.addEventListener("click", cancelEdit);

// ===== THEME =====
function applyTheme(theme) {
  if (theme === "dark") {
    root.setAttribute("data-theme", "dark");
    toggleModeBtn.textContent = "☀️";
  } else {
    root.removeAttribute("data-theme");
    toggleModeBtn.textContent = "🌙";
  }
  localStorage.setItem("libraryTheme", theme);
}

toggleModeBtn.addEventListener("click", () => {
  const isDark = root.getAttribute("data-theme") === "dark";
  applyTheme(isDark ? "light" : "dark");
});

// ===== INIT =====
function init() {
  applyTheme(localStorage.getItem("libraryTheme") || "light");
  renderBooks();
}

document.addEventListener("DOMContentLoaded", init);
