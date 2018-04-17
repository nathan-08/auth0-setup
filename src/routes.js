import React from 'react'
import { Switch, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard/Dashboard'
export default _ => (
    <Switch>
        <Route exact path="/" render={() => (
            <a href="http://localhost:4000/login">Login</a>
        )} />
        <Route path="/dashboard" component={Dashboard} />
    </Switch>
)