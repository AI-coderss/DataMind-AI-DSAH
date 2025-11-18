import Welcome from './pages/Welcome';
import Dashboard from './pages/Dashboard';
import DataSources from './pages/DataSources';
import AIInsights from './pages/AIInsights';
import Reports from './pages/Reports';
import Schedules from './pages/Schedules';
import Settings from './pages/Settings';
import Home from './pages/Home';
import AIChat from './pages/AIChat';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Welcome": Welcome,
    "Dashboard": Dashboard,
    "DataSources": DataSources,
    "AIInsights": AIInsights,
    "Reports": Reports,
    "Schedules": Schedules,
    "Settings": Settings,
    "Home": Home,
    "AIChat": AIChat,
}

export const pagesConfig = {
    mainPage: "Welcome",
    Pages: PAGES,
    Layout: __Layout,
};