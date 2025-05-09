// src/components/pages/FavoritesPage.jsx
import React, { useState } from "react";
import { useFavorites } from "../../context/FavoritesContext";
import { FiX } from "react-icons/fi";
import placeholderImg from "../../assets/images/AboutImg.jpg";
import ArtDetailModal from "./ArtDetailModal";

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();
  const [selectedArtwork, setSelectedArtwork] = useState(null);

  const CategoryBadge = ({ categories }) => (
    <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full sm:px-3">
      {Array.isArray(categories) && categories.length > 0
        ? categories[0]
        : "Painting"}
    </span>
  );

  return (
    <div className="min-h-[61vh] p-6">
      <h1 className="mb-4 text-2xl font-semibold">Your Favorites</h1>

      {favorites.length === 0 ? (
        <p>No favorites yet. Click the heart on any artwork to save it here.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArtwork(art)}
              className="relative overflow-hidden bg-white rounded-lg shadow-lg"
            >
              <img
                src={
                  art.filePath
                    ? encodeURI(
                        `${import.meta.env.VITE_API_URL}/${art.filePath.replace(
                          /\\/g,
                          "/"
                        )}`
                      )
                    : art.image || placeholderImg
                }
                alt={art.title}
                className="object-cover w-full h-64"
              />
              <div className="absolute top-2 left-2 sm:top-6 sm:left-6">
                <CategoryBadge categories={art.categories} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 text-white bg-black/70">
                <h3 className="font-semibold text-md">{art.title}</h3>
                <p className="text-xs">{art.artist}</p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(art.id);
                }}
                className="absolute p-1 transition rounded-full top-2 right-2 bg-white/80 hover:bg-white"
              >
                <FiX className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedArtwork && (
        <ArtDetailModal
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
        />
      )}
    </div>
  );
}
