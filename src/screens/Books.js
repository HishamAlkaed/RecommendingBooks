
import React, { useEffect, useState } from 'react';
import { withRouter } from 'react-router';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { orderBy, uniqBy } from 'lodash';

import Header from '../components/Header';
import { Button, Card,  Checkbox, FormControlLabel, LinearProgress, TextField, Tooltip, Typography } from '@material-ui/core';
import BooksTable from '../components/Table';
import { getAuthor, extractData, getGenres, getBooks, getAuthorsGenres, getAuthorsBooks, getGenresBooks } from '../utils';

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
                return [...p, ...data]
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
              <Typography variant="h6"><span style = {{background: '#9bdeac', margin: 12}}>Most relevent.</span>   
               <span style = {{background: '#f5d47a', margin: 12}}>Less relevent.</span>   
               <span style = {{background: '#e7305b', margin: 12}}>Least relevent.</span></Typography>
              <Grid container alignContent="center" direction="row">
                {meta && uniqBy(orderBy(meta, 'order'), 'title').map((v, i) => {
                  if (!v.title) return null;
                  return ((v.title.toLowerCase().includes(filterValue)) && <Card key={Math.random()} className={classes.item}>
                    <Grid item style={{ backgroundColor: v.color, height: '100%' }}>
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
      </div>
    </React.Fragment>
  );
}
export default withRouter(Books)