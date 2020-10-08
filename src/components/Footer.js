import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { withRouter } from 'react-router';

import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';

import BookIcon from '@material-ui/icons/BookOutlined';

const useStyles = makeStyles({
  root: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'blue',
  },
});

function parsePathname({ location: { pathname } }) {
  return pathname ? pathname.split('/')[1] : null;
}

function Footer(props) {
  const classes = useStyles();
  const [value, setValue] = useState(parsePathname(props));

  useEffect(() => {
    return props.history.listen(() => {
      setValue(parsePathname(props.history));
    });
  });

  return (
    <BottomNavigation
      value={value}
      onChange={(event, newValue, ...all) => {
        props.history.push(newValue);
        setValue(newValue);
      }}
      className={classes.root}
    >
      <BottomNavigationAction
        value="book"
        label="All Books"
        icon={<BookIcon style={{ color: 'white' }} />}
      />
    </BottomNavigation>
  );
}

export default withRouter(Footer);
