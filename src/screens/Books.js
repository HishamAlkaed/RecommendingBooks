
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
// import Paper from '@material-ui/core/Paper';

import Header from '../components/Header';
import { Card, CardContent, Typography } from '@material-ui/core';
import axios from 'axios';

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
  const [meta, setMeta] = useState();


  useEffect(() => {
    const mySparqlEndpoint = "http://dbpedia.org/sparql/";
      // FILTER (lang(?label) = "en")
    let query = `
    SELECT ${props.location.state.books.map((_, i) => `?${i}_author`).join(' ')}
      ${props.location.state.books.map((book, i) => `(count(DISTINCT ?${i}_similar) as ?${i}_count)`).join(' ')}
    
  WHERE
    { 
      ${props.location.state.books.map((book, i) => `dbr:` + book.value + ` dbo:author ?${i}_author .`).join('\n')}
      ${props.location.state.books.map((book, i) => `dbr:` + book.value + ` owl:sameAs ?${i}_similar .`).join('\n')}
    }
    `;

    axios.get(window.encodeURI(`${mySparqlEndpoint}?query=${query}`))
    .then((response) => {
      const {bindings} = response.data.results;
      let result = ''
      bindings.forEach(b => {
        result = props.location.state.books.map((book, i) => ({title: book.value, author: b[i + '_author'].value, count: b[i + '_count'].value}))
      })
      setMeta(result)
      })
      .catch((error) => {
        console.log(`Error calling SPARQL for population: ${error.response.data}`);
        return error.response.data;
      });
  }, [])

  return (
    <React.Fragment>
        <Header />
          {props.location.state && Object.keys(props.location.state).map(entry => {
            let content;
            if (entry === 'books') {
              content = meta && meta.map(v => {
                return (<Card key={v.title} className={classes.root}>
                  <CardContent>
                    <Typography variant="h5" component="h2">{v.title}</Typography>
                    <Typography className={classes.pos} color="textSecondary">
                    Author: {v.author}
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
          })}
    </React.Fragment>
  );
}
export default withRouter(Books)