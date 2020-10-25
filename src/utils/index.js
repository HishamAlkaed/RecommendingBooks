import axios from 'axios'
import { find, matchesProperty } from 'lodash';
import { COLORS } from './constants';
import Library from './lib'

const ENDPOINT = 'http://192.168.2.6:7200/repositories/Final3_3'


async function queryBackend(query, {queryOnly, inf, color, order=0}={}) {
    const { data: { results: { bindings } } } = await axios.get(window.encodeURI(`${ENDPOINT}?query=${query}`), {
        headers: {'Accept':'application/sparql-results+json', 'Content-Type':'application/sparql-results+json'}
    })
    if (queryOnly) {
        return bindings;
    }
    const result = new Library()
    if (!inf) {
        bindings.forEach(b => {
            const { title, author_name, genre_name, rating } = extractValues(['title', 'author_name', 'genre_name', 'rating'], b);
            result.authors.set(author_name, author_name);
            let genre = result.genres.get(title) || []
            const genres = !genre.includes(genre_name) ? [...genre, genre_name] : genre
            result.genres.set(title, genres);
            result.books.set(title, { title: title, author: result.authors.get(author_name), genre_name: genres, rating, color: color  || COLORS.green, order});
        })
    } else {
        order = order || 1
        bindings.forEach(b => {
            let { inf_title, inf_author_name, inf_genre_name, infby_title, infby_author_name, infby_genre_name } = extractValues(['inf_title', 'inf_author_name', 'inf_genre_name', 'infby_title', 'infby_author_name', 'infby_genre_name'], b)
            if (inf_title) {
                let genre = result.genres.get(inf_title) || []
                const genres = !genre.includes(inf_genre_name) ? [...genre, inf_genre_name] : genre
                result.genres.set(inf_title, genres);
                result.authors.set(inf_author_name, inf_author_name);
                result.books.set(inf_title, { title: inf_title, author: result.authors.get(inf_author_name), genre_name: genres, color: color || COLORS.orange, order });
            }
            if (infby_title) {
                let genre = result.genres.get(infby_title) || []
                const genres = !genre.includes(infby_genre_name) ? [...genre, infby_genre_name] : genre
                result.genres.set(infby_title, genres);
                result.authors.set(infby_author_name, infby_author_name);
                result.books.set(infby_title, { title: infby_title, author: result.authors.get(infby_author_name), genre_name: genres, color: color || COLORS.orange, order });
            }
        })
        result.normalize_books()
    }
    return Array.from(result.books.values())
}

export function extractData(props) {
    return {authors: props.location.state.authors, books: props.location.state.books, genres: props.location.state.genres}
}

export function extractValues(keys, values) {
    return keys.reduce((p, key) => {
        if (values[key] && !p[key]) {
            p[key] = values[key].value
        } 
        return p;
    }, {});
}

function parseName(name) {
    return name.split(" ").join("_").replace(/[^a-zA-Z ]/g, '_')
}

function getOrder(color) {
    const allColors = Object.values(COLORS);
    return allColors.indexOf(color)
}

export async function GetAll(limit=100000) {
    const query = `
    PREFIX ol: <http://www.semanticweb.org/OwnersLib/>
    select ?title ?rating ?author_name ?genre_name where { 
        ?author a ol:Author ;
                ol:has_written ?book ;
                owl:NamedIndividual ?author_name .
        
        ?book ol:has_title ?title ;
            a ?genre .
        FILTER (?genre != ol:Book)
        OPTIONAL { ?book ol:has_rating ?rating . }
        ?genre ol:has_genre_name ?org_genre_name .
        bind(replace(?org_genre_name, "_", " ") as ?genre_name)
        filter(!contains(?genre_name, "See top shelves")) 
    } limit ${limit}
    
`
    const bindings = await queryBackend(query, {queryOnly: true});
    let result = new Library()
    // result.genres.set('Short Story', 'Short story');
    // result.genres.set('Comedic novel', 'Comedic novel');
    // result.books.set('Angel Fire', {title: 'Angel Fire', rating: 0});
    // result.authors.set('L.A. Weatherly', 'L.A. Weatherly');
    // result.authors.set('Anna Todd', 'Anna Todd');
    bindings.forEach(b => {
        const { title, author_name, genre_name, rating } = b;
        result.books.set(title.value, { title: title.value, rating: rating ? rating.value : null });
        result.authors.set(author_name.value, author_name.value);
        result.genres.set(genre_name.value, genre_name.value);
    })
    result.normalize_books()
    return result
}

export async function getAuthor(author, {color, limit=100}={}) {
    const query = `
    PREFIX ol: <http://www.semanticweb.org/OwnersLib/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    select DISTINCT ?title ?author_name ?genre_name ?rating where { 
        ol:${parseName(author)} a ol:Author;
                        ol:has_written ?book ;
                        owl:NamedIndividual ?author_name .
        ?book ol:has_title ?title ; ol:has_author ?author ; a ?genre.
        OPTIONAL { ?book ol:has_rating ?rating . } 
        ?genre ol:has_genre_name ?org_genre_name.
        filter (!contains(str(?org_genre_name), "Book"))
        bind(replace(?org_genre_name, "_", " ") as ?genre_name) 
    } ORDER BY DESC (?rating) limit ${limit}
    `
    const result = await queryBackend(query, {color, order: getOrder(color)})
    const inf_books = await getInfAuthor(author);

    return [...result, ...inf_books]
}

export async function getInfAuthor(author, limit=100) {
    const query = `
    PREFIX ol: <http://www.semanticweb.org/OwnersLib/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    select ?inf_title ?inf_author_name ?inf_genre_name ?infby_title ?infby_author_name ?infby_genre_name  where { 
        { 
            ol:${parseName(author)} dbo:influenced ?inf_author . 
            ?inf_book dbo:author ?inf_author . 
            ?inf_author owl:NamedIndividual ?inf_author_name .
            ?inf_book ol:has_title ?inf_title .
            OPTIONAL {
                ?inf_book rdf:type ?inf_genre . 
                ?inf_genre ol:has_genre_name ?inf_genre_name.
                filter (!contains(str(?inf_genre_name), "Book"))
            }
        } UNION {
            ol:${parseName(author)} dbo:influencedBy ?infby_author . 
            ?infby_book dbo:author ?infby_author  . 
            ?infby_author owl:NamedIndividual ?infby_author_name .
            ?infby_book ol:has_title ?infby_title .
            OPTIONAL {
                ?infby_book rdf:type ?infby_genre. 
                ?infby_genre ol:has_genre_name ?infby_genre_name .
                filter (!contains(str(?infby_genre_name), "Book"))
            }
        }
        
    } 
    `
    const result = await queryBackend(query, {inf: true})
    return result
}

export async function getGenres(genre, { limit = 100, color}={}) {
    const query = `
      PREFIX ol: <http://www.semanticweb.org/OwnersLib/>
      select ?title ?genre_name ?author_name ?rating where { 
        ?book a ol:${parseName(genre)} ;
            ol:has_title ?title ;
            ol:has_author ?author .
      	OPTIONAL {?book ol:has_rating ?rating . }
        ?author owl:NamedIndividual ?author_name .            
        ol:${parseName(genre)}  ol:has_genre_name ?genre_name1 .
        filter (!contains(str(?genre_name1), "Book"))
    	bind(replace(?genre_name1, "_", " ") as ?genre_name)
      } ORDER BY DESC (?rating) limit ${limit}
    `;
    const result = await queryBackend(query, {color, order: getOrder(color)})
    return result
}

export async function getBooks(book, {color, limit = 100}={}) {
    const query = `
    PREFIX ol: <http://www.semanticweb.org/OwnersLib/>

    select DISTINCT ?title ?author_name ?genre_name ?rating where{
        ol:${parseName(book)} ol:has_author ?author .
        ?author owl:NamedIndividual ?author_name .
        ?author ol:has_written ?author_book .
        ?author_book ol:has_title ?title;
            a ?genre .
        ?genre ol:has_genre_name ?genre_name1 .
      	OPTIONAL { ?author_book ol:has_rating ?rating . }
        filter (!contains(str(?genre_name1), "Book"))
        filter (?book != ol:${parseName(book)})
        bind(replace(?genre_name1, "_", " ") as ?genre_name)   
    } ORDER BY DESC (?rating) limit ${limit}
    `;
    const result = await queryBackend(query, {color, order: getOrder(color)})
    const inf_books = await getBooksAuthors(book, {color: color && COLORS.red, order: getOrder(color ? COLORS.red : color)});
    let inf_genres = []
    // TODO: conver all filtering functionality into lodash ones (ie in functions below)
    if (!find(inf_books, matchesProperty('title', book)) && !find(result, matchesProperty('title', book))) {
        inf_genres = await getGenres(book, {color: color && COLORS.red, order: getOrder(color ? COLORS.red : color)});
    }
    return [...result, ...inf_books, ...inf_genres]
}

export async function getBooksAuthors(book, {color, limit = 100}={}) {
    const query = `
    PREFIX ol: <http://www.semanticweb.org/OwnersLib/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    select distinct ?infby_author_name ?infby_title ?infby_genre_name ?inf_author_name ?inf_title ?inf_genre_name where{
        ol:${parseName(book)} ol:has_author ?author.
        {
            ?author dbo:influenced ?inf_author . 
        ?inf_book dbo:author ?inf_author ; 
            ol:has_title ?inf_title;
                    a ?genre1.
            ?genre1 ol:has_genre_name ?inf_genre_name1.
            ?inf_author owl:NamedIndividual ?inf_author_name.
        filter (!contains(str(?inf_book), str(?inf_author)))
        filter (!contains(str(?inf_genre_name1), "Book"))
        bind(replace(?inf_genre_name1, "_", " ") as ?inf_genre_name) 

        }
        
        UNION {
            ?author dbo:influencedBy ?infby_author . 
            ?infby_book dbo:author ?infby_author;
                ol:has_title ?infby_title;
                        a ?genre2.
            ?genre2 ol:has_genre_name ?infby_genre_name1.
            ?infby_author owl:NamedIndividual ?infby_author_name.
        filter (!contains(str(?infby_book), str(?infby_author)))
        filter (!contains(str(?infby_genre_name1), "Book"))
        bind(replace(?infby_genre_name1, "_", " ") as ?infby_genre_name) 

        }	
    } ORDER BY DESC (?rating) limit ${limit}
    `;
    const result = await queryBackend(query, {inf: true, color, order: getOrder(color)})
    return result
}

export async function getBooksGenres(book, limit = 100) {
    const query = `
    PREFIX ol: <http://www.semanticweb.org/OwnersLib/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    select ?title ?genre_name ?author_name ?rating where{
        ol:${parseName(book)} a ?genre.
        ?genre ol:has_genre_name ?genre_name1.
        ?book a ?genre;
            ol:has_title ?title;
            ol:has_author ?author.
        optional{?book ol:has_rating ?rating}
        ?author owl:NamedIndividual ?author_name.
        filter (!contains(str(?genre_name1), "Book"))
        bind(replace(?genre_name1, "_", " ") as ?genre_name) 
    } order by desc(?rating) LIMIT ${limit}
    `
    const result = await queryBackend(query, {color: COLORS.red, order: getOrder(COLORS.red) })
    return result
}

// EXAMPLE: Edward Rutherfurd and genre Historical
export async function getAuthorsGenres({author, genre}, limit = 100) {
    const query = `
    PREFIX ol: <http://www.semanticweb.org/OwnersLib/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbr: <http://dbpedia.org/resource/>
    select ?title ?genre_name ?author_name ?rating where {    
            ?book dbo:author ol:${parseName(author)} . 
            ol:${parseName(author)} owl:NamedIndividual ?author_name.
            
            ?book a ol:${parseName(genre)} . 
            ol:${parseName(genre)} ol:has_genre_name ?genre_name1.
            ?book ol:has_title ?title .
        optional{?book ol:has_rating ?rating}
        
        filter (!contains(str(?genre_name1), "Book"))
        bind(replace(?genre_name1, "_", " ") as ?genre_name)
    }order by desc(?rating) limit ${limit}
    `
    const result = await queryBackend(query)
    const inf_books = await getAuthorsGenresInf({author, genre}, {inf: true})
    const genre_books = (await getGenres(genre, {color: COLORS.red, order: getOrder(COLORS.red)})).filter(b => result.some(r => !b.title.includes(r.title)))
    return [...result, ...inf_books, ...genre_books,]
}

export async function getAuthorsGenresInf({author, genre}, limit=100) {
    const query = `
    PREFIX ol: <http://www.semanticweb.org/OwnersLib/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    select ?inf_title ?inf_author_name ?inf_genre_name ?inf_rating ?infby_title ?infby_author_name ?infby_genre_name ?infby_rating where { 
        { 
            ol:${parseName(author)} dbo:influenced ?inf_author . 
            ?inf_book dbo:author ?inf_author . 
            ?inf_author owl:NamedIndividual ?inf_author_name.
            
            ?inf_book a ol:${parseName(genre)} . 
            ol:${parseName(genre)} ol:has_genre_name ?inf_genre_name1.
            ?inf_book ol:has_title ?inf_title .
            optional{?inf_book ol:has_rating ?inf_rating}
            filter (!contains(str(?inf_genre_name1), "Book"))
            bind(replace(?inf_genre_name1, "_", " ") as ?inf_genre_name)

        } UNION {
            ol:${parseName(author)} dbo:influencedBy ?infby_author . 
            ?infby_book dbo:author ?infby_author . 
            ?infby_author owl:NamedIndividual ?infby_author_name.
            
            ?infby_book a ol:${parseName(genre)} .
            ?infby_book ol:has_title ?infby_title . 
            ol:${parseName(genre)} ol:has_genre_name ?infby_genre_name1.
            optional{?infby_book ol:has_rating ?infby_rating}
            filter (!contains(str(?infby_genre_name1), "Book"))
            bind(replace(?infby_genre_name1, "_", " ") as ?infby_genre_name)
        }
    }
    `
    const result = await queryBackend(query, {inf: true})
    return result
}

export async function getAuthorsBooks({author, book}, limit = 100) {
    const query = `
    PREFIX ol: <http://www.semanticweb.org/OwnersLib/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbr: <http://dbpedia.org/resource/>
    select ?title ?genre_name ?author_name ?rating where {                 
         ol:${parseName(author)} a ol:Author; 
                    owl:NamedIndividual ?author_name;
                    ol:has_written ?book .
        ol:${parseName(book)} a ?genre. 
        ?genre ol:has_genre_name ?genre_name1.
        ?book a ?genre;
            ol:has_title ?title;
            ol:has_author ?author.
        ?author owl:NamedIndividual ?author_name.
        OPTIONAL { ?book ol:has_rating ?rating . } 
        filter (!contains(str(?genre_name1), "Book"))
        bind(replace(?genre_name1, "_", " ") as ?genre_name) 

    }order by desc(?rating) limit ${limit}
    `
    const result = await queryBackend(query)
    const author_books = (await getAuthor(author, { color: COLORS.orange, order: getOrder(COLORS.orange) })).filter(a => result.every(b => !a.title.includes(b.title)))
    const book_books = (await getBooks(book, { color: COLORS.orange, georder: getOrder(COLORS.orange) })).filter(a => result.every(b => !a.title.includes(b.title)))
    const inf_books = (await getAuthorsBooksInf({ book }, { color: COLORS.orange, order: getOrder(COLORS.orange)  })).filter(a => [...author_books, ...book_books].some(b => !a.title.includes(b.title)))
    return [...result, ...author_books, ...book_books, ...inf_books]
}

export async function getAuthorsBooksInf({ book }, limit = 100) {
    const query = `
    PREFIX ol: <http://www.semanticweb.org/OwnersLib/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    PREFIX dbr: <http://dbpedia.org/resource/>
    Select ?inf_title ?inf_author_name ?inf_genre_name ?inf_rating ?nfby_title ?infby_author_name ?infby_genre_name ?infby_rating WHERE{
        dbr:${parseName(book)} ol:has_author ?author; 
                                a ?book_genre.
        ?book_genre ol:has_genre_name ?some_name.
        {
        ?author dbo:influenced ?inf_author.
        ?inf_author owl:NamedIndividual ?inf_author_name;
                ol:has_written ?inf_book.
        ?inf_book ol:has_title ?inf_title;
            a ?book_genre.
        ?book_genre ol:has_genre_name ?inf_genre_name1.
            optional{?inf_book ol:has_rating ?inf_rating}
        bind(replace(?inf_genre_name1, "_", " ") as ?inf_genre_name) 
            filter (!contains(str(?inf_genre_name), "Book"))
        }
        union
        {
        ?author dbo:influencedBy ?infby_author.
        ?infby_author owl:NamedIndividual ?infby_author_name;
                ol:has_written ?infby_book.
        ?infby_book ol:has_title ?infby_title;
            a ?book_genre.
        ?book_genre ol:has_genre_name ?infby_genre_name1.
            optional{?infby_book ol:has_rating ?infby_rating}
        bind(replace(?infby_genre_name1, "_", " ") as ?infby_genre_name)
            filter (!contains(str(?infby_genre_name), "Book"))
        }
    }
    `
    const result = await queryBackend(query, {inf: true, color: COLORS.red, order: getOrder(COLORS.red) })
    return result
}

export async function getGenresBooks({genre, book}, limit = 100) {
    const query = `
    PREFIX ol: <http://www.semanticweb.org/OwnersLib/>
    PREFIX dbr: <http://dbpedia.org/resource/>
    select Distinct ?title ?author_name ?genre_name ?rating where{
        ol:${parseName(genre)} ol:has_genre_name ?genre_name1.
        ol:${parseName(book)} ol:has_author ?author. 
        ?author ol:has_written ?book;
                owl:NamedIndividual ?author_name.
        ?book a ol:${parseName(genre)};
            ol:has_title ?title.
        optional{?book ol:has_rating ?rating}
        bind(replace(?genre_name1, "_", " ") as ?genre_name) 
        filter (!contains(str(?genre_name), "Book")) 
    } order by desc(?rating)
    `
    const result = await queryBackend(query)
    const inf_books = await getGenresBooksInf({genre, book})
    const genre_books = await getGenres(genre, {color: COLORS.red, order: getOrder(COLORS.red)})
    const book_books = await (await getBooks(book, {color: COLORS.red, order: getOrder(COLORS.red)})).filter(b => !b.title.includes(book))
    // const book_books = await getGenresBooksOnly(book, {color: COLORS.red})
    return [...result, ...inf_books, ...genre_books, ...book_books]
}

export async function getGenresBooksInf({ genre, book }, limit = 100) {
    const query = `
    PREFIX ol: <http://www.semanticweb.org/OwnersLib/>
    PREFIX dbr: <http://dbpedia.org/resource/>
    PREFIX dbo: <http://dbpedia.org/ontology/>
    select Distinct ?inf_title ?inf_author_name ?inf_genre_name ?inf_rating
    ?infby_title ?infby_author_name ?infby_genre_name ?infby_rating where{
        ol:${parseName(genre)} ol:has_genre_name ?genre_name. 
        ol:${parseName(book)} ol:has_author ?author.
        {
        ?author dbo:influenced ?inf_author.
        ?inf_author ol:has_written ?inf_book;
                owl:NamedIndividual ?inf_author_name.
        ?inf_book a ol:${parseName(genre)};
            ol:has_title ?inf_title.
        ol:${parseName(genre)} ol:has_genre_name ?inf_genre_name1.
        optional{?inf_book ol:has_rating ?inf_rating}
        bind(replace(?inf_genre_name1, "_", " ") as ?inf_genre_name) 
            filter (!contains(str(?inf_genre_name), "Book")) }
        union{
            ?author dbo:influencedBy ?infby_author.
        ?infby_author ol:has_written ?infby_book;
                owl:NamedIndividual ?infby_author_name.
        ?infby_book a ol:${parseName(genre)};
            ol:has_title ?infby_title.
        ol:${parseName(genre)} ol:has_genre_name ?infby_genre_name1.
        optional{?infby_book ol:has_rating ?infby_rating}
        bind(replace(?infby_genre_name1, "_", " ") as ?infby_genre_name) 
            filter (!contains(str(?infby_genre_name), "Book"))
        }
    }
    `
    const result = await queryBackend(query, {inf: true})
    return result
}
