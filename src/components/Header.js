import React from 'react';
import { withRouter } from 'react-router';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import HomeIcon from '@material-ui/icons/Home';

import CustomizedMenus from './HeaderMenue';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

function Header(props) {
  const classes = useStyles();
  const [openUpdates, setOpenUpdates] = React.useState(false);
  const [openVideo, setOpenVideo] = React.useState(false);

  const toggleVideo = () => {
    setOpenVideo(!openVideo);
  };
  const toggleUpdates = () => {
    setOpenUpdates(!openUpdates);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            onClick={() => props.history.push('/', props.history.location.state)}
          >
            <HomeIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            {props.title}
          </Typography>
          <CustomizedMenus
            {...props}
            toggleUpdates={toggleUpdates}
            toggleVideo={toggleVideo}
          />
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default withRouter(Header);
