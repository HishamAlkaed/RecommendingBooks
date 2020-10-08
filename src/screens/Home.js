import React from 'react';
import { withRouter } from 'react-router';

import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
// import Paper from '@material-ui/core/Paper';

import Header from '../components/Header';

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
        spacing={3}
      >
        ADD INPUTS!
      </Grid>
    </React.Fragment>
  );
}
export default withRouter(Home);
