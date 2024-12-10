import { useEffect, useRef } from 'react';
import { createContext, useState } from "react";
import { Outlet, ScrollRestoration, useLocation } from "react-router-dom";

import Header from "./Components/Shared/Header";
import ToastMessages from "./Components/Shared/ToastMessage";

export const AppData = createContext();

const Root = () => {
    const location = useLocation();

    const [isShow, setIsShow] = useState(false);
    const [userData, setUserData] = useState(JSON.parse(localStorage.getItem('userData')) ? JSON.parse(localStorage.getItem('userData')) : {});
    const [currentRoute, setCurrentRoute] = useState(location.pathname)
    const [type, setType] = useState('');
    const [message, setMessage] = useState('');

    const timeOut1 = useRef();

    const showToast = () => {
        clearTimeout(timeOut1.current);
        setIsShow(false);
        timeOut1.current = setTimeout(() => {
            setIsShow(true);
        }, 100);
    };

    useEffect(() => {
        setCurrentRoute(location.pathname)
    }, [location.pathname])

    const shouldShowHeader = !(
        currentRoute === "/login" || 
        currentRoute.startsWith("/reset-password")
    );

    return (
        <AppData.Provider value={{ showToast, setType, setMessage, currentRoute, setCurrentRoute, userData, setUserData }}>
            {shouldShowHeader && <Header />}
            <ToastMessages isDisplay={isShow} type={type} message={message} setIsDisplay={setIsShow} />
            <ScrollRestoration />
            <Outlet />
        </AppData.Provider>
    );
};

export default Root;
