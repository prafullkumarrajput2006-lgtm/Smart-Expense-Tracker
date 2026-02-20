import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';
import HomeIcon from '@mui/icons-material/Home';
import LoginIcon from '@mui/icons-material/Login';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import HistoryIcon from '@mui/icons-material/History';
import InsightsIcon from '@mui/icons-material/Insights';

const Navbar = () => {
  return (
    <nav className="navbar">
      <h1>💰 Smart Expense Tracker</h1>
      <ul>
        <li>
          <Link to="/">
            <HomeIcon style={{ fontSize: '18px', marginRight: '5px', verticalAlign: 'middle' }} />
            Homeee
          </Link>
        </li>
        <li>
          <Link to="/login">
            <LoginIcon style={{ fontSize: '18px', marginRight: '5px', verticalAlign: 'middle' }} />
            Login
          </Link>
        </li>
        <li>
          <Link to="/dashboard">
            <DashboardIcon style={{ fontSize: '18px', marginRight: '5px', verticalAlign: 'middle' }} />
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/add-expense">
            <AddCircleIcon style={{ fontSize: '18px', marginRight: '5px', verticalAlign: 'middle' }} />
            Add Expense
          </Link>
        </li>
        <li>
          <Link to="/expense-history">
            <HistoryIcon style={{ fontSize: '18px', marginRight: '5px', verticalAlign: 'middle' }} />
            History
          </Link>
        </li>
        <li>
          <Link to="/insights">
            <InsightsIcon style={{ fontSize: '18px', marginRight: '5px', verticalAlign: 'middle' }} />
            Insights
          </Link>
        </li>
        <li>
          <Link to="/budget">
            <span style={{ fontSize: '18px', marginRight: '5px', verticalAlign: 'middle' }}>💰</span>
            Budget
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;