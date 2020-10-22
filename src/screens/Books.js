
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import Header from '../components/Header';
import { Button, Card,  Checkbox, FormControlLabel, LinearProgress, TextField, Tooltip, Typography } from '@material-ui/core';
import BooksTable from '../components/Table';
import { getAuthor, extractData, getGenres, getBooks, getAuthorsGenres, getAuthorsBooks, getGenresBooks } from '../utils';
import { COLORS } from '../utils/constants';

const useStyles = makeStyles(theme => ({
  item: {
    flexBasis: 'calc(100% / 2 - 10px)',
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
  const [toggleTable, setToggleTable] = useState(false);
  const [filterValue, setFilterValue] = useState('');
  const [meta, setMeta] = useState([]);
  const [loadingBooks, setLoadingBooks] = useState(true);


  useEffect(() => {
    const { authors, books, genres } = extractData(props);
    // TODO FILTER ALL IN THE index.js; see line 415

    if (authors && genres) {
      for (const author of authors) {
        for (const genre of genres) {
          getAuthorsGenres({ author, genre })
            .then((data) => {
              setMeta((p) => {
                return [...p, ...data]
              })
              setLoadingBooks(false)
            })
        }
      }
    } 
    if (authors && books) {
      for (const author of authors) {
        for (const book of books) {
          getAuthorsBooks({ author, book: book.title })
            .then((data) => {
              setMeta((p) =>{
                return [...p, ...data.filter(b => !p.some(b1 => b1.title === b.title))]
              })
              setLoadingBooks(false)
            })
        }
      }
    }
    if (genres && books) {
      for (const genre of genres) {
        for (const book of books) {
          getGenresBooks({ genre, book: book.title })
            .then((data) => {
              setMeta((p) => [...p, ...data])
              setLoadingBooks(false)
            })
        }
      }

    } 
    if (authors && !(books && genres)) {
      for (const author of authors) {
        getAuthor(author)
          .then((data) => {
            setMeta((p) => [...p, ...data])
            setLoadingBooks(false)
          })
      }
    } else if (genres && !(books && authors)) {
      for (const genre of genres) {
        getGenres(genre)
          .then((data) => {
            setMeta((p) => [...p, ...data])
            setLoadingBooks(false)
          })
      }
    } else if (books && !(genres && authors)) {
      for (const book of books) {
        getBooks(book.title)
          .then((data) => {
            setMeta((p) => [...p, ...data])
            setLoadingBooks(false)
          })
      }
    } 
  }, [props])
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
              setFilterValue(value)
            }} id="filled-search" label="Search field" type="search" variant="outlined" />
            <h3>Books</h3>
            <Grid container alignContent="center" direction="row" style={{width: '75%', margin: '0 auto'}}>
              {/* {meta && meta.sort((a, b) => b.rating - a.rating).map((v, i) => { */}
              {meta && meta.sort((a) => a.color === COLORS.green  ? -1 : 1).map((v, i) => {
                // console.log(v)
                    if (!v.title) return null;
                    return ((v.title.toLowerCase().includes(filterValue)) && <Card key={Math.random()} className={classes.item}>
                      <Grid item style={{backgroundColor: v.color, height: '100%'}}>
                        <Typography variant="h5" component="h2">{v.title}</Typography>
                        <Typography className={classes.pos} color="textSecondary">
                          {i} Author: {v.author}
                        </Typography>
                        <Typography className={classes.pos} color="textSecondary">
                          Genre: {v.genre_name && v.genre_name[0]} 
                          {v.genre_name && v.genre_name.length > 1 && <Tooltip title={v.genre_name.slice(1).join(', ')} placement="left-start">
                            <Button> +{v.genre_name.length - 1} more</Button>
                          </Tooltip>}
                        </Typography>
                        {v.rating && (<Typography className={classes.pos} color="textSecondary">
                          Rating: {v.rating}
                        </Typography>)}
                        {v.similar && (<Typography className={classes.pos} color="textSecondary">
                          Similar to book: {v.count}
                        </Typography>)}
                      </Grid>
                    </Card>)
                  })
                }

              </Grid>

          </div>
      )}
    </React.Fragment>
  );
}
export default withRouter(Books)