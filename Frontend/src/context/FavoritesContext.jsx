// src/context/FavoritesContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("favorites")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = (art) => {
    setFavorites((prev) =>
      prev.find((a) => a.id === art.id) ? prev : [...prev, art]
    );
  };

  const removeFavorite = (id) =>
    setFavorites((prev) => prev.filter((a) => a.id !== id));

  const isFavorite = (id) => favorites.some((a) => a.id === id);

  return (
    <FavoritesContext.Provider
      value={{ favorites, addFavorite, removeFavorite, isFavorite }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
