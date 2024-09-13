import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

let page = 1;
let matches = books;

const starting = document.createDocumentFragment();

// Define objects to represent key elements - ADDED*
const bookElements = {};
const authorElements = {};
const genreElements = {};

// Create and store book preview elements
function createBookPreview({ author, id, image, title }) {
    const element = document.createElement('button');
    element.classList.add('preview');
    element.setAttribute('data-preview', id);
    element.innerHTML = `
        <img
            class="preview__image"
            src="${image}"
            alt="${title} cover"
        />
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;
    
    bookElements[id] = element;  // Store element with book id as key - ADDED*
    return element;
}

// Initialize book previews
for (const book of matches.slice(0, BOOKS_PER_PAGE)) {
    const previewElement = createBookPreview(book);
    starting.appendChild(previewElement);
}

document.querySelector('[data-list-items]').appendChild(starting);

// Create and store genre options
const genreHtml = document.createDocumentFragment();
const firstGenreElement = document.createElement('option');
firstGenreElement.value = 'any';
firstGenreElement.innerText = 'All Genres';
genreHtml.appendChild(firstGenreElement);

for (const [id, name] of Object.entries(genres)) {
    const element = document.createElement('option');
    element.value = id;
    element.innerText = name;
    genreHtml.appendChild(element);
    genreElements[id] = element;  // Store element with genre id as key - *ADDED
}

document.querySelector('[data-search-genres]').appendChild(genreHtml);

// Create and store author options
const authorsHtml = document.createDocumentFragment();
const firstAuthorElement = document.createElement('option');
firstAuthorElement.value = 'any';
firstAuthorElement.innerText = 'All Authors';
authorsHtml.appendChild(firstAuthorElement);

for (const [id, name] of Object.entries(authors)) {
    const element = document.createElement('option');
    element.value = id;
    element.innerText = name;
    authorsHtml.appendChild(element);
    authorElements[id] = element;  // Store element with author id as key - ADDED*
}

document.querySelector('[data-search-authors]').appendChild(authorsHtml);

// Set initial theme
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.querySelector('[data-settings-theme]').value = 'night';
    document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
    document.documentElement.style.setProperty('--color-light', '10, 10, 20');
} else {
    document.querySelector('[data-settings-theme]').value = 'day';
    document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', '255, 255, 255');
}

function updateShowMoreButton() {
    const remaining = matches.length - (page * BOOKS_PER_PAGE);
    document.querySelector('[data-list-button]').innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${remaining > 0 ? remaining : 0})</span>
    `;
    document.querySelector('[data-list-button]').disabled = remaining < 1;
}
// Show more button now gets updated with number of books left to show
updateShowMoreButton();

// Event listeners for overlays and form submissions
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false;
});

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false;
});

document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true;
    document.querySelector('[data-search-title]').focus();
});

document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true;
});

document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false;
});

document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);

    if (theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
    
    document.querySelector('[data-settings-overlay]').open = false;
});

document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = [];

    for (const book of books) {
        let genreMatch = filters.genre === 'any';

        for (const singleGenre of book.genres) {
            if (genreMatch) break;
            if (singleGenre === filters.genre) { genreMatch = true; }
        }

        if (
            (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
            (filters.author === 'any' || book.author === filters.author) &&
            genreMatch
        ) {
            result.push(book);
        }
    }

    page = 1;
    matches = result;

    if (result.length < 1) {
        document.querySelector('[data-list-message]').classList.add('list__message_show');
    } else {
        document.querySelector('[data-list-message]').classList.remove('list__message_show');
    }

    document.querySelector('[data-list-items]').innerHTML = '';
    const newItems = document.createDocumentFragment();

    for (const { author, id, image, title } of result.slice(0, BOOKS_PER_PAGE)) {
        // Creating new syntax way of previewing books - ADDED*
        if (!bookElements[id]) {
            const element = createBookPreview({ author, id, image, title });
            newItems.appendChild(element);
        } else {
            newItems.appendChild(bookElements[id]);
        }
    }

    document.querySelector('[data-list-items]').appendChild(newItems);
    // Show more button now gets updated with number of books left to show
    updateShowMoreButton();

    window.scrollTo({top: 0, behavior: 'smooth'});
    document.querySelector('[data-search-overlay]').open = false;
});

document.querySelector('[data-list-button]').addEventListener('click', () => {
    const fragment = document.createDocumentFragment();

    for (const { author, id, image, title } of matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)) {
         // Creating new syntax way of previewing books - ADDED* part2
        if (!bookElements[id]) {
            const element = createBookPreview({ author, id, image, title });
            fragment.appendChild(element);
        } else {
            fragment.appendChild(bookElements[id]);
        }
    }

    document.querySelector('[data-list-items]').appendChild(fragment);
    page += 1;
    // Show more button now gets updated with number of books left to show
    updateShowMoreButton(); 
});

document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const pathArray = Array.from(event.path || event.composedPath());
    let active = null;

    for (const book of pathArray) {
        if (active) break;

        if (node?.dataset?.preview) {
            // Re-organized syntax style from iterative style to FUNCTIONAL Style - ADDED*
            // This looks for the book that matches the ID and brings back or returns it.
            active = books.find(book => book.id === node?.dataset?.preview);
        }
    }
    
    if (active) {
        document.querySelector('[data-list-active]').open = true;
        document.querySelector('[data-list-blur]').src = active.image;
        document.querySelector('[data-list-image]').src = active.image;
        document.querySelector('[data-list-title]').innerText = active.title;
        document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
        document.querySelector('[data-list-description]').innerText = active.description;
    }
});
