import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Navigate } from 'react-router-dom';
import SubmitAnswerForm from './Components/SubmitAnswerForm';
import Login from './Components/Login';
import Root from './Root';
import Admin from './Components/Admin';
import QuestionDetails from './Components/QuestionDetails';
import User from './Components/User';
import Profile from './Components/Profile';

import "../src/styles/index.css";

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
        path='/submit-answer'
        element={<SubmitAnswerForm />}
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
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
);