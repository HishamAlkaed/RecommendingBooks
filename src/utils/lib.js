class Library {
    constructor() {
        this.books = new Map()
        this.authors = new Map()
        this.genres = new Map()
        this.state = ''
    }

    normalize_books() {
        this.genres.forEach(genre => this.books.has(genre) && this.books.delete(genre))
    }

    normalize_genres() {
        this.books.forEach(book => this.genres.has(book) && this.books.delete(book))
    }

    flatten() {
        const result = []
        this.books.forEach(book => book)
        return result
    }
}


export default Library