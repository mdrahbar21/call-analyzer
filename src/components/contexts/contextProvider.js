"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';

const StateContext = createContext();

const initialState = {
  chat: false, 
  cart: false, 
  userProfile: false, 
  notification: false,
};

export const ContextProvider = ({ children }) => {
  const [screenSize, setScreenSize] = useState(undefined);
  const [currentColor, setCurrentColor] = useState("#ffffff");
  const [currentMode, setCurrentMode] = useState("Light");
  const [themeSettings, setThemeSettings] = useState(false);
  const [activeMenu, setActiveMenu] = useState(true);
  const [isClicked, setIsClicked] = useState(initialState);

  useEffect(() => {
    setCurrentColor(localStorage.getItem("colorMode") || "#ffffff");
    setCurrentMode(localStorage.getItem("themeMode") || "Light");
  }, []);

  const setMode = (e) => {
    const mode = e.target.value;
    setCurrentMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem("themeMode", mode);
    }
  };

  const setColor = (color) => {
    setCurrentColor(color);
    if (typeof window !== 'undefined') {
      localStorage.setItem("colorMode", color);
    }
  };

  const handleClick = (clicked) => 
    setIsClicked({ ...isClicked, [clicked]: !isClicked[clicked] });

  const toggleActiveMenu = () => {
    if (activeMenu==true){
      setActiveMenu(false);
    } else {
      setActiveMenu(true);
    }
  };

  return (
    <StateContext.Provider
      value={{
        currentColor,
        currentMode,
        activeMenu,
        screenSize,
        setScreenSize,
        handleClick,
        isClicked,
        initialState,
        setIsClicked,
        setActiveMenu,
        setCurrentColor,
        setCurrentMode,
        setMode,
        setColor,
        themeSettings,
        setThemeSettings,
        toggleActiveMenu
      }}
    >
      {children}
    </StateContext.Provider>
  );
};

export const AppStateContext = () => useContext(StateContext);
