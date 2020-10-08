import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Home from './screens/Home';

export default function AllRoutes() {
  return (
    <Switch>
      <Route exact path="/">
        <Home />
        {/* TODO: add more routes! */}
      </Route>
    </Switch>
  );
}
