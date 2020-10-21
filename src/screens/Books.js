
import React, { useEffect, useState, forwardRef } from 'react';
import { withRouter } from 'react-router';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import Header from '../components/Header';
import { Card, CardContent, Checkbox, CircularProgress, FormControlLabel, InputBase, LinearProgress, TextField, Typography } from '@material-ui/core';
import axios from 'axios';
import MaterialTable from 'material-table';
import BooksTable from '../components/Table';

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 275,
    margin: 5,
  },
  paper: {
    height: 140,
    width: 100,
    background: '#d8eefe',
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

function Books(props) {
  const classes = useStyles();
  const [toggleTable, setToggleTable] = useState(true);
  const [filterValue, setFilterValue] = useState('');
  const [meta, setMeta] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);


  useEffect(() => {
    // const mySparqlEndpoint = "http://dbpedia.org/sparql/";
    const mySparqlEndpoint = "http://192.168.56.1:7200/repositories/project";
      // FILTER (lang(?label) = "en")
    let query = `
    SELECT ${props.location.state.books.map((_, i) => `?${i}_author`).join(' ')}
      ${props.location.state.books.map((book, i) => `(count(DISTINCT ?${i}_similar) as ?${i}_count)`).join(' ')}
    
  WHERE
    { 
      ${props.location.state.books.map((book, i) => `dbr:` + book + ` dbo:author ?${i}_author .`).join('\n')}
      ${props.location.state.books.map((book, i) => `dbr:` + book + ` owl:sameAs ?${i}_similar .`).join('\n')}
    }
    `;
    console.log(props.history.location.state.genres[0])
    query = `
      PREFIX ol: <http://www.semanticweb.org/OwnersLib/>
      select ?title ?genre_title ?author_name ?rating where { 
        ?book a ol:${props.history.location.state.genres[0].replace(' ', '_')} ;
            ol:has_title ?title ;
            ol:has_author ?author ;
      	    ol:has_rating ?rating .
          ?author owl:NamedIndividual ?author_name .
          ol:${props.history.location.state.genres[0].replace(' ', '_')}  ol:has_genre_name ?genre_title .
      } limit 15
    `;

    axios.get(window.encodeURI(`${mySparqlEndpoint}?query=${query}`))
    .then((response) => {
      console.log(response)
      const {bindings} = response.data.results;
      let result = []
      bindings.forEach(b => {
        const {title, author_name, genre_title, rating} = b;

        result.push({title: title.value, author: author_name.value, count: 0, genre_title: genre_title.value, rating: rating.value });
        // result = props.location.state.books.map((book, i) => ({title: book.value, author: b[i + '_author'].value, count: b[i + '_count'].value}))
      })
      // console.log(result)
      setMeta(result)
      setTimeout(setLoadingBooks, 500);
      })
      .catch((error) => {
        console.log(`Error calling SPARQL for population: ${error.response.data}`);
        return error.response.data;
      });
  }, [])

  return (
    <React.Fragment>
      <Header />
      {loadingBooks && <LinearProgress />}

      <FormControlLabel
        control={
          <Checkbox
            checked={toggleTable}
            onChange={() => setToggleTable(!toggleTable)}
            name="checkedB"
            color="primary"
          />
        }
        label="Toggle Tabular"
      />
      {toggleTable ? (

      // {/* TODO: choose a table or cards (if cards, then stack them 3 in a row) */}
      <BooksTable loadingBooks={loadingBooks} meta={meta} />
      ) : (
          <div>
            <TextField onChange={e => {
              const value = e.target.value
              // const newMeta = meta.filter(b => b.title.toLowerCase().includes(value))
              setFilterValue(value)
            }} id="filled-search" label="Search field" type="search" variant="filled" />
            {props.location.state && Object.keys(props.location.state).map(entry => {
              let content;
              if (entry === 'books') {
                content = meta && meta.sort((a, b) => b.rating - a.rating).map((v, i) => {
                  return (v.title.toLowerCase().includes(filterValue) && <Card key={Math.random()} className={classes.root}>
                    <CardContent>
                      <Typography variant="h5" component="h2">{v.title}</Typography>
                      <Typography className={classes.pos} color="textSecondary">
                        {i} Author: {v.author}
                      </Typography>
                      <Typography className={classes.pos} color="textSecondary">
                        Genre: {v.genre_title}
                      </Typography>
                      <Typography className={classes.pos} color="textSecondary">
                        Rating: {v.rating}
                      </Typography>
                      <Typography className={classes.pos} color="textSecondary">
                        Similar to book: {v.count}
                      </Typography>
                    </CardContent>
                  </Card>)
                })
              }

              return <Grid container alignContent="center" direction="column" key={entry}>
                {props.location.state[entry].length > 0 && <h3>{entry.toUpperCase()}</h3>}
                {content}
              </Grid>
            })
            }
          </div>
      )}
    </React.Fragment>
  );
}
export default withRouter(Books)