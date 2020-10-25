import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import Header from '../components/Header';
import { Button, Typography } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Autocomplete, {createFilterOptions} from '@material-ui/lab/Autocomplete';


import { GetAll } from '../utils/index'

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 275,
    width: '100%',
  },
  grid: {
    justifyContent: "center",
    flexDirection: "column",
    width: "50%",
    margin: '0 auto',
  },
  drop_down: {
    margin: theme.spacing(5),
    width: "100%",
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
    marginLeft: theme.spacing(5),
  },
  info: {
    fontSize: '1.4em',
    padding: 0,
    fontFamily: 'cursive',
  }
}));

const filterOptions = createFilterOptions({
  matchFrom: "any",
  limit: 7
});

function Home(props) {
  const classes = useStyles();

  const [genres, setGenres] = useState([])
  const [books, setBooks] = useState([])
  const [authors, setAuthors] = useState([])
  const [selectedBooks, setSelectedBooks] = useState(props.history.location.state.books || [])
  const [selectedAuthors, setSelectedAuthors] = useState(props.history.location.state.authors || [])
  const [selectedGenres, setSelectedGenres] = useState(props.history.location.state.genres || [])

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
            <Typography component="h2" className={[classes.drop_down, classes.info]}>
              Choose your favorite author/s (among {authors.size}), genre/s (among {genres.size}) and book/s (among {books.size}) in order to get the best recommendations!
              </Typography>
          </Grid>
          <Grid item>
            <Autocomplete
              multiple
              id="tags-standard"
              className={classes.drop_down}
              options={Array.from(genres.values())}
              defaultValue={selectedGenres}
              getOptionLabel={(option) => option}
              filterOptions={filterOptions}
              loading={genres.length < 1}
              onChange={(e, newGenres) => {
                setSelectedGenres(newGenres)
              }}
              getOptionDisabled={() => selectedGenres.length > 2}
              disableCloseOnSelect
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
              defaultValue={selectedAuthors}
              getOptionLabel={(option) => option}
              filterOptions={filterOptions}
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
              options={Array.from(books.values())}
              defaultValue={selectedBooks}
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
                props.history.push('/books', { books: selectedBooks.length && selectedBooks, genres: selectedGenres.length && selectedGenres, authors: selectedAuthors.length && selectedAuthors })
              } else {
                alert("Please input at least one field.")
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
