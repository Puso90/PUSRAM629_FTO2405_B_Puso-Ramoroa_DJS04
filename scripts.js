import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'


/**
 * @typedef {object} Filters - Noticed filters are assigned with 'any' and should be filtering correctly books from objects
 * 
 */


let page = 1;
let matches = books;

const listItems = document.querySelector('[data-list-items]');
const searchOverlay = document.querySelector('[data-search-overlay]');
const settingsOverlay = document.querySelector('[data-settings-overlay]');
const listMessage = document.querySelector('[data-list-message]');
const listButton = document.querySelector('[data-list-button]');
const searchGenres = document.querySelector('[data-search-genres]');
const searchAuthors = document.querySelector('[data-search-authors]');
const settingsForm = document.querySelector('[data-settings-form]');
const searchForm = document.querySelector('[data-search-form]');
const listActive = document.querySelector('[data-list-active]');
const listBlur = document.querySelector('[data-list-blur]');
const listImage = document.querySelector('[data-list-image]');
const listTitle = document.querySelector('[data-list-title]');
const listSubtitle = document.querySelector('[data-list-subtitle]');
const listDescription = document.querySelector('[data-list-description]');

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
// So this is to show the books upon entry to webpage
function previewElements() {
    for (const book of matches.slice(0, BOOKS_PER_PAGE)) {
        const previewElement = createBookPreview(book);
        starting.appendChild(previewElement);
    }
listItems.appendChild(starting);

} 
previewElements() //calling back function - Somehow this always confuses me!!


// Create and store genre options
function optionsGenre() {
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

searchGenres.appendChild(genreHtml);

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
searchAuthors.appendChild(authorsHtml);
}
optionsGenre() //These callBack functions are a MASSIVE headache because I do not fully understand them


// Set initial theme
function themes() {
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.querySelector('[data-settings-theme]').value = 'night';
    document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
    document.documentElement.style.setProperty('--color-light', '10, 10, 20');
} else {
    document.querySelector('[data-settings-theme]').value = 'day';
    document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', '255, 255, 255');
}

} 
themes(); // Pretty straight forward and works without complications


function updateShowMoreButton() {
    const remaining = matches.length - (page * BOOKS_PER_PAGE);
    listButton.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${remaining > 0 ? remaining : 0})</span>
    `;
    listButton.disabled = remaining < 1;
}
// Show more button now gets updated with number of books left to show
updateShowMoreButton();


// Event listeners for overlays and form submissions
function overlays() {
    document.querySelector('[data-search-cancel]').addEventListener('click', () => {
        searchOverlay.open = false;
    });

    document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
        settingsOverlay.open = false;
    });

    document.querySelector('[data-header-search]').addEventListener('click', () => {
        searchOverlay.open = true;
        document.querySelector('[data-search-title]').focus();
    });

    document.querySelector('[data-header-settings]').addEventListener('click', () => {
        settingsOverlay.open = true;
    });

    document.querySelector('[data-list-close]').addEventListener('click', () => {
        listActive.open = false;
    });
} 
overlays()

function settingsForms() {
    settingsForm.addEventListener('submit', (event) => {
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
        
        settingsOverlay.open = false;
    });
} settingsForms()

function dataSearch() {
    searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = [];

    for (const book of books) {
        let genreMatch = filters.genre === 'Religion';

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
        listMessage.classList.add('list__message_show');
    } else {
        listMessage.classList.remove('list__message_show');
    }

    listItems.innerHTML = '';
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

    listItems.appendChild(newItems);
    // Show more button now gets updated with number of books left to show
    updateShowMoreButton();

    window.scrollTo({top: 0, behavior: 'smooth'});
    searchOverlay.open = false;
});
} dataSearch()

function listButtons() {
    listButton.addEventListener('click', () => {
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

    listItems.appendChild(fragment);
    page += 1;
    // Show more button now gets updated with number of books left to show
    updateShowMoreButton(); 
});
} listButtons()

function findBooks() {
    listItems.addEventListener('click', (event) => {
        const bookArray = Array.from(event.path || event.composedPath());
        let active = null;
        // added personalisation to reduce confusion and added readability
        for (const specificBook of bookArray) {
            if (active) break;

            if (specificBook?.dataset?.preview) {
                // Re-organized syntax style from iterative style to FUNCTIONAL Style - ADDED*
                // This looks for the book that matches the ID and brings back or returns it.
                active = books.find(book => book.id === specificBook?.dataset?.preview);
            }
        }
        
        if (active) {
            listActive.open = true;
            listBlur.src = active.image;
            listImage.src = active.image;
            listTitle.innerText = active.title;
            listSubtitle.innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
            listDescription.innerText = active.description;
        }
    });

} findBooks()



/*___________________________________________________________________________________________________________________________________________________________
// COMMENTS & NOTES:

    1.  Show more button now interactive with number of books showing and to reveal
    2.  There's only one religious book in the genre object - BOOM Ephifany! 
    3.





___________________________________________________________________________________________________________________________________________________________*/