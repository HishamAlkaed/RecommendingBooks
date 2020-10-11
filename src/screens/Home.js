import React from 'react';
import { withRouter } from 'react-router';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
// import Paper from '@material-ui/core/Paper';

import Header from '../components/Header';
import { Button, Input } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import {genres} from '../components/Genres'
import {authors} from '../components/Authors'
import {books} from '../components/Books'

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 275,
    width: '100%',
    // margin: 0,
    margin: theme.spacing(1),
  },
  paper: {
    height: 140,
    width: 300,
    background: '#d8eefe',
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  drop_down: {
    margin: theme.spacing(5),
    width: '40%',
    background: 'linear-gradient(45deg, #c9d9f2 30%, #7ea9ed 90%)',
    borderRadius: 9,
  },
  go_button: {
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    border: 0,
    borderRadius: 5,
    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
    color: 'white',
    height: 48,
    padding: '0 30px',
  }
}));

function Home(props) {
  const classes = useStyles();

  return (
    <React.Fragment>
      <Header title="Home" />
      <Grid
        container
        className={classes.root}
        alignContent="center"
        alignItems="center"
        justify="center"
        spacing={10}
      >
        <form className={classes.root} noValidate autoComplete="off">
          <div>
            <TextField
              id="standard-select-genre"
              className={classes.drop_down}
              select
              label="Select"
              // onChange={handleChange}
              helperText="Please select the desired genre"
            >
              {genres.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>  
          </div>
          <div>
            <TextField 
              id="standard-select-author"
              className={classes.drop_down}
              select
              label="Select"
              // onChange={handleChange}
              helperText="Please select the desired author"
            >
              {authors.map((option) => (
                <MenuItem key={option.label} value={option.label}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <div>
            <TextField 
              id="standard-select-book"
              className={classes.drop_down}
              select
              label="Select"
              // onChange={handleChange}
              helperText="Please select the desired book"
            >
              {books.map((option) => (
                <MenuItem key={option.label} value={option.label}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </div>
          <Button className={classes.go_button} variant="contained" color="primary" >
            Go / Search
          </Button>
        </form>
      </Grid>
    </React.Fragment>
  );
}
export default withRouter(Home);
