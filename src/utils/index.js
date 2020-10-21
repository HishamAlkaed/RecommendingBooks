import axios from 'axios'
import Library from './lib'

const ENDPOINT = 'http://192.168.56.1:7200/repositories/project_1'

function parseName(uri) {
    const splitted = uri.split(/#|\//)
    const name = splitted[splitted.length - 1].replace('_', ' ') 
    return !name.includes('%') ? name : ''
}

export async function GetAll(limit=100) {
    const query = `
    PREFIX ol: <http://www.semanticweb.org/OwnersLib/>
    select ?title ?rating ?author ?genre_name where { 
        ?author a ol:Author ;
                ol:has_written ?book .
        
        ?book ol:has_title ?title ;
            a ?genre .
        FILTER (?genre != ol:Book)
        OPTIONAL { ?book ol:has_rating ?rating . }

        ?genre ol:has_genre_name ?genre_name .
        FILTER (lang(?genre_name) = "en")
    } limit 10000
    
`
    const { data: { results: { bindings } } } = await axios.get(window.encodeURI(`${ENDPOINT}?query=${query}`))
    let result = new Library()
    bindings.forEach(b => {
        const { title, author, genre_name, rating } = b;
        const author_name = parseName(author.value)
        result.books.set(title.value, { title: title.value, author: author_name, genre_name: genre_name.value, rating: rating.value ? rating : null });
        result.authors.set(author_name, author_name);
        result.genres.set(genre_name.value, genre_name.value);
    })
    result.genres.forEach(genre => result.books.has(genre) && result.books.delete(genre))
    console.log(result.books)
    return result
    // setTimeout(setLoadingBooks, 500);
    // .catch((error) => {
    // console.log(`Error calling SPARQL for population: ${error.response.data}`);
    // return error.response.data;
    // });

}

