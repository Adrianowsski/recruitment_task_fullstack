import React from 'react';
import { Route, Redirect, Switch, Link } from 'react-router-dom';
import Dashboard from './Dashboard';
import CurrencyDetails from './CurrencyDetails';

export default function Home() {
    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    {/* bez brandu */}
                    <div className="collapse navbar-collapse show">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item"><Link className="nav-link" to="/">Dashboard</Link></li>
                        </ul>
                    </div>
                </div>
            </nav>

            <Switch>
                <Route exact path="/" component={Dashboard} />
                <Route path="/currency/:code" component={CurrencyDetails} />
                <Redirect to="/" />
            </Switch>
        </>
    );
}
