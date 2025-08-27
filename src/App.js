
import './App.css';
import Navbar from './components/navbar/navbar'
import { Routes, Route } from "react-router-dom";
import Home from './components/homepage/homepage'
import UpdatePage from './components/updatePage/updatePage'
import Login from './components/login/login'
import Register from './components/register/register'
import VehiclePage from './components/vehiclePage/vehiclePage'
import UpdateUserInfo from './components/updateUserInfo/updateUserInfo'
import UpdateVehicleInfo from './components/updateVehicleInfo/updateVehicleInfo'
//import React from "react";
import About from './components/about/about';
import UpdatePassword from './components/updatePassword/updatePassword';
import Contact from './components/contact/contact';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';

import Footer from "./footer";
function App() {
    return (

        <div className="app-wrapper">
            <Navbar></Navbar>

            <div className="content">
                <Routes>
                    <Route path="/" element={<Register />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/homepage" element={<PrivateRoute><Home /></PrivateRoute>} />
                    <Route path="/update/:id" element={<PrivateRoute><UpdatePage /></PrivateRoute>} />
                    <Route path="/vehiclePage" element={<PrivateRoute><VehiclePage /></PrivateRoute>} />
                    <Route path="/updateUserInfo/:id" element={<PrivateRoute><UpdateUserInfo /></PrivateRoute>} />
                    <Route path="/updateVehicleInfo/:id" element={<PrivateRoute><UpdateVehicleInfo /></PrivateRoute>} />
                    <Route path="/login" element={< Login />} />
                    <Route path="/updatePassword" element={< UpdatePassword />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                </Routes>
            </div>
            <Footer />
        </div>
    )
}
export default App;


