import React, { useState } from 'react';
import { withRouter } from 'react-router';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import Header from '../components/Header';
import { Button, Input } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Autocomplete, {createFilterOptions} from '@material-ui/lab/Autocomplete';


import {genres_static} from '../components/Genres'
import {authors_static} from '../components/Authors'
import {books_static} from '../components/Books'

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 275,
    width: '100%',
  },
  grid: {
    justifyContent:"center",
    flexDirection: "column",
    width: "50%",
    margin: '0 auto',
  },
  drop_down: {
    margin: theme.spacing(5),
    width: "100%",
    // background: 'linear-gradient(45deg, #c9d9f2 30%, #7ea9ed 90%)',
    borderRadius: 9,
  },
  go_button: {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    border: 0,
    borderRadius: 5,
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    color: 'white',
    height: 48,
    width: "40%",
    padding: '0 30px',
  }
}));

const filterOptions = createFilterOptions({
  matchFrom: "any",
  limit: 5
});

function Home(props) {
  const classes = useStyles();

  const [genres, setGenres] = useState([])
  const [books, setBooks] = useState([])
  const [authors, setAuthors] = useState([])

  return (
    <React.Fragment>
      <Header title="Home" />
        <form className={classes.root} noValidate autoComplete="off">
        <Grid
          container
          className={classes.grid}
        >
          <Grid item>
             <Autocomplete
              multiple
              id="tags-standard"
              className={classes.drop_down}
              options={genres_static}
              getOptionLabel={(option) => option.value}
              filterOptions={filterOptions}
              onChange={(e, newGenres) => {
                setGenres(newGenres)
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label="Select Genres"
                  placeholder="Select desired genre"
                />
              )}
            />
          </Grid>
          <Grid item>
             <Autocomplete
              multiple
              id="tags-standard"
              className={classes.drop_down}
              options={authors_static}
              getOptionLabel={(option) => option.value}
              filterOptions={filterOptions}
              // defaultValue={[top100Films[13]]}
              onChange={(e, newAuthors) => {
                setAuthors(newAuthors)
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label="Select Authors"
                  placeholder="Select desired authors"
                />
              )}
            />
          </Grid>
          <Grid item>
             <Autocomplete
              multiple
              id="tags-standard"
              className={classes.drop_down}
              options={books_static}
              getOptionLabel={(option) => option.value}
              filterOptions={filterOptions}
              // defaultValue={[top100Films[13]]}
              onChange={(e, newBooks) => {
                setBooks(newBooks)
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="standard"
                  label="Similar Books"
                  placeholder="Select similar books"
                />
              )}
            />
          </Grid>
          <Grid item>
            <Button className={classes.go_button} onClick={() => {
              if (books.length > 0) {
                // props.search({books, genres, authors})
                props.history.push('/books', {books, genres, authors})
                console.log(props)
              }
            }} variant="contained" color="primary" >
              Go / Search
            </Button>
          </Grid>
        </Grid>
      </form>
    </React.Fragment>
  );
}
export default withRouter(Home);
