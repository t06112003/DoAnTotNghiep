import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Navigate } from 'react-router-dom';
import Login from './Components/Login';
import Root from './Root';
import Admin from './Components/Admin';
import QuestionDetails from './Components/QuestionDetails';
import User from './Components/User';
import Profile from './Components/Profile';
import TestPage from './Components/TestPage';
import TimeOutPage from './Components/TimeOutPage';
import FinishedPage from './Components/FinishedPage';

import "../src/styles/index.css";
import ResetPassword from './Components/ResetPassword';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route
            path='/'
            element={<Root />}
        >
            <Route
                index
                element={<Navigate to="/login" replace />}
            />
            <Route
                path='/login'
                element={<Login />}
            />
            <Route
                path='/admin'
                element={<Admin />}
            />
            <Route
                path="admin/test/:testId"
                element={<QuestionDetails />} />
            <Route
                path="/user"
                element={<User />} />
            <Route
                path="/profile"
                element={<Profile />} />
            <Route
                path='/user/test/:testId'
                element={<TestPage />} />
            <Route
                path="/timeout"
                element={<TimeOutPage />} />
            <Route
                path="/finished"
                element={<FinishedPage />} />
            <Route
                path="/reset-password/:token"
                element={<ResetPassword />} />
        </Route>
    )
);

ReactDOM.createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />
);