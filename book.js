export class Book {
    constructor({ id, author, title, image, description, published, genres }) {
        this.id = id;
        this.author = author;
        this.title = title;
        this.image = image;
        this.description = description;
        this.published = published;
        this.genres = genres;
    }

    getAuthorName() {
        return authors[this.author];
    }

    getPublishedYear() {
        return new Date(this.published).getFullYear();
    }
}