
import React from 'react';
import { withRouter } from 'react-router';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
// import Paper from '@material-ui/core/Paper';

import Header from '../components/Header';
import { Typography } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: 275,
    width: '100%',
    margin: 0,
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
    console.log(props)
  const classes = useStyles();

  return (
    <React.Fragment>
        <Header />
        <Grid>
          <Typography>
            SOme stuff!!
          </Typography>
          <Typography> 
            SOme stuff!! 2
          </Typography>
          <Typography>
            SOme stuff!! 3
          </Typography>
          <Typography>
            SOme stuff!! 4
          </Typography>
        </Grid>
    </React.Fragment>
  );
}
export default Books;


