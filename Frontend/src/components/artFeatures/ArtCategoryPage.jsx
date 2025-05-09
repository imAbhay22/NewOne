// src/components/artCategories/ArtCategoryPage.jsx
import { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import ArtGrid from "../common/ArtGrid";

const ArtCategoryPage = ({ category, title }) => {
  const { artworks, loading, error } = useAppContext();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  useEffect(() => {
    setCurrentPage(1);
  }, [category]);

  const artworks2D = Array.isArray(artworks) ? artworks : [];

  const filteredArtworks = artworks2D.filter((art) =>
    art.categories?.some((c) => c.toLowerCase() === category.toLowerCase())
  );

  const totalItems = filteredArtworks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentArtworks = filteredArtworks.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleNextPage = () => {
    setCurrentPage((p) => Math.min(p + 1, totalPages));
  };

  return (
    <div className="p-8 mt-10">
      <h2 className="text-4xl font-bold mb-6 text-center text-[silver]">
        {title || "Artworks"}
      </h2>

      {error && (
        <div className="py-8 text-center text-red-500">
          Error loading artworks: {error.message}
        </div>
      )}

      <ArtGrid
        artworks={currentArtworks}
        loading={loading}
        error={error}
        gridClass="grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        emptyItems={loading ? itemsPerPage : 0}
      />

      {totalPages > 1 && (
        <div className="w-[75vw] mx-auto flex justify-center mt-8">
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || loading}
            className="px-8 py-3 text-lg text-white transition-colors bg-gray-800 rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More Artworks"}
          </button>
        </div>
      )}

      {!loading && filteredArtworks.length === 0 && (
        <div className="text-center text-gray-800">
          No artworks found in this category
        </div>
      )}
    </div>
  );
};

export default ArtCategoryPage;
