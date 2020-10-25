
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { orderBy, some, uniqBy } from 'lodash';

import Header from '../components/Header';
import { Button, Card,  Checkbox, FormControlLabel, LinearProgress, TextField, Tooltip, Typography } from '@material-ui/core';
import BooksTable from '../components/Table';
import { getAuthor, extractData, getGenres, getBooks, getAuthorsGenres, getAuthorsBooks, getGenresBooks } from '../utils';

const useStyles = makeStyles(theme => ({
  item: {
    // '&:hover': {
    //   background: 'red',
    // },
    flexBasis: 'calc(100% / 2 - 10px)',
    margin: 5,
  },
  hover: {
    transition: '400ms',
    '&:hover': {
      background: '#b9a4a4 !important',
    }
  },
  link: {
    color: 'black',
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
    if (some(authors) && some(genres)) {
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
    if (some(authors) && some(books)) {
      for (const author of authors) {
        for (const book of books) {
          getAuthorsBooks({ author, book: book.title })
            .then((data) => {
              setMeta((p) =>{
                return [...p, ...data]
              })
              setLoadingBooks(false)
            })
        }
      }
    }
    if (some(genres) && some(books)) {
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
    if (some(authors) && !(some(books) && some(genres))) {
      for (const author of authors) {
        getAuthor(author)
          .then((data) => {
            setMeta((p) => [...p, ...data])
            setLoadingBooks(false)
          })
      }
    } else if (some(genres) && !(some(books) && some(authors))) {
      for (const genre of genres) {
        getGenres(genre)
          .then((data) => {
            setMeta((p) => [...p, ...data])
            setLoadingBooks(false)
          })
      }
    } else if (some(books) && !(some(genres) && some(authors))) {
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
      <Header title="Book Recommendations" />
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
      <div style={{ width: '75%', margin: '0 auto' }}>
        {toggleTable ? (
          // {/* TODO: choose a table or cards (if cards, then stack them 3 in a row) */}
          <BooksTable loadingBooks={loadingBooks} meta={uniqBy(orderBy(meta, 'order'), 'title')} />
        ) : (
            <div>
              <TextField onChange={e => {
                const value = e.target.value
                setFilterValue(value)
              }} id="filled-search" label="Search field" type="search" variant="outlined" />
              <Typography variant="h4">Books</Typography>
              {/* <div style={{textAlign: 'left'}}> */}
              <Typography variant="h6"><span>Green &rarr; relavent.</span></Typography>
              <Typography variant="h6">Orange &rarr; less relavent.</Typography>
              <Typography variant="h6">Red &rarr; least relavent.</Typography>
              {/* </div> */}
              <Grid container alignContent="center" direction="row">
                {meta && uniqBy(orderBy(meta, 'order'), 'title').map((v, i) => {
                  if (!v.title) return null;
                  return ((v.title.toLowerCase().includes(filterValue)) && <Card key={Math.random()} className={classes.item}>
                    <Grid item className={classes.hover} style={{ backgroundColor: v.color, height: '100%' }}>
                      <Typography variant="h5" className={classes.link} component="a" href={v.url} target="blank">{v.title}</Typography>
                      <Typography className={classes.pos} color="textSecondary">
                        {i + 1} Author: {v.author}
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
      </div>
    </React.Fragment>
  );
}
export default withRouter(Books)