import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Container } from 'react-bootstrap';

import { GlobalProvider } from './shared/context/GlobalState';
import NavBar from './shared/components/NavBar';
import Play from './score/pages/Play';
import Scoreboard from './score/pages/Scoreboard';
import './App.css';

const App = () => {
  return (
    <GlobalProvider>
      <Router>
        <NavBar />
        <Container>
          <Switch>
            <Route path="/" exact component={Play}></Route>
            <Route path="/scoreboard" exact component={Scoreboard}></Route>
            <Route
              path="/scoreboard/:playerId"
              exact
              component={Scoreboard}
            ></Route>
          </Switch>
        </Container>
      </Router>
    </GlobalProvider>
  );
};

export default App;
