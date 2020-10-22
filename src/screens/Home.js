import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import Header from '../components/Header';
import { Button } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Autocomplete, {createFilterOptions} from '@material-ui/lab/Autocomplete';


import { GetAll } from '../utils/index'

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
  input: {
    color: 'white',
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
  const [selectedBooks, setSelectedBooks] = useState([])
  const [selectedAuthors, setSelectedAuthors] = useState([])
  const [selectedGenres, setSelectedGenres] = useState([])

  useEffect(() => {
    GetAll()
    .then(({books, genres, authors}) => {
      setBooks(books)
      setGenres(genres)
      setAuthors(authors)
    })
  }, [])
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
              options={Array.from(genres.values())}
              getOptionLabel={(option) => option}
              filterOptions={filterOptions}
              // disableCloseOnSelect={selectedGenres.length > 1}
              loading={genres.length < 1}
              onChange={(e, newGenres) => {
                setSelectedGenres(newGenres)
              }}
              getOptionDisabled={() => selectedGenres.length > 2}
              disableCloseOnSelect
              // renderTags={(param) => {
              //   return param
              // }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  className={classes.input}
                  // InputLabelProps={{className: classes.input}}
                  // inputProps={{className: classes.input}}
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
              options={Array.from(authors.values())}
              getOptionLabel={(option) => option}
              filterOptions={filterOptions}
              // defaultValue={[top100Films[13]]}
              onChange={(e, newAuthors) => {
                setSelectedAuthors(newAuthors)
              }}
              getOptionDisabled={() => selectedAuthors.length > 2}
              disableCloseOnSelect
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
              options={Array.from(books.values())}//.sort((a, b) => b.rating - a.rating)}
              getOptionLabel={(option) => option.title}
              filterOptions={filterOptions}
              onChange={(e, newBooks) => {
                setSelectedBooks(newBooks)
              }}
              getOptionDisabled={() => selectedBooks.length > 2}
              disableCloseOnSelect
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
              if (selectedBooks.length > 0 || selectedGenres.length > 0 || selectedAuthors.length > 0) {
                props.history.push('/books', {books: selectedBooks.length && selectedBooks, genres: selectedGenres.length && selectedGenres, authors: selectedAuthors.length && selectedAuthors})
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
