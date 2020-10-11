import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Books from './screens/Books';

import Home from './screens/Home';

export default function AllRoutes() {
  return (
    <Switch>
      <Route exact path="/">
        <Home />
        {/* TODO: add more routes! */}
      </Route>
      <Route exact path="/books">
        <Books />
      </Route>
    </Switch>
  );
}
