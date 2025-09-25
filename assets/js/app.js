import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import '../css/app.css';
import Home from './components/Home';

console.log('React bundle loaded'); // diagnostyka

ReactDOM.render(
    <Router><Home /></Router>,
    document.getElementById('root')
);
