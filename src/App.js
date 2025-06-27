
import './App.css';
import Navbar from './components/navbar/navbar'
import { Routes, Route } from "react-router-dom";
import Home from './components/homepage/homepage'
import UpdatePage from './components/updatePage/updatePage'
import Login from './components/login/login'
import Register from './components/register/register'
import React from "react";
import About from './components/about/about';
import Contact from './components/contact/contact';

import Footer from "./footer";
function App() {
    return (

        <div className="app-wrapper">
            <Navbar></Navbar>

            <div className="content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/homepage" element={<Home />} />
                    <Route path="/update/:id" element={<UpdatePage />} />
                    <Route path="/login" element={< Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                </Routes>
            </div>
            <Footer />
        </div>
    )
}
export default App;


