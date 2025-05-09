import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import ArtDetailModal from "../artFeatures/ArtDetailModal";
import placeholderImg from "../../assets/images/AboutImg.jpg";

const CategoryBadge = ({ categories }) => (
  <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full sm:px-3">
    {Array.isArray(categories) && categories.length > 0
      ? categories[0]
      : "Painting"}
  </span>
);

const InfiniteArtScroll = () => {
  const [artworks, setArtworks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);

  const BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/artworks`)
      .then((res) => {
        setArtworks(Array.isArray(res.data.artworks) ? res.data.artworks : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [BASE_URL]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;
    const scrollCenter = container.scrollLeft + container.clientWidth / 2;
    const items = Array.from(container.querySelectorAll(".art-card"));

    let closest = 0;
    let minDist = Infinity;
    items.forEach((item, idx) => {
      const center = item.offsetLeft + item.offsetWidth / 2;
      const dist = Math.abs(scrollCenter - center);
      if (dist < minDist) {
        minDist = dist;
        closest = idx;
      }
    });
    setActiveIndex(closest);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    setTimeout(handleScroll, 100);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [artworks]);

  if (loading) return <div className="text-center">Loading artworks...</div>;
  if (error) return <div className="text-center">Error: {error}</div>;

  return (
    <div className="relative h-[55vh] w-full overflow-hidden">
      <div
        ref={containerRef}
        className="h-full overflow-x-scroll hide-scrollbar"
      >
        <div className="inline-flex items-center h-full px-6 gap-x-12">
          {artworks.map((art, idx) => {
            const isActive = idx === activeIndex;
            const isAdjacent =
              idx === activeIndex - 1 || idx === activeIndex + 1;
            return (
              <motion.div
                key={art.id || idx}
                className="art-card flex-shrink-0 w-[35vw] lg:w-[18vw] h-[40vh] relative cursor-pointer group rounded-xl shadow-md overflow-hidden bg-white"
                onClick={() => setSelectedArtwork(art)}
                animate={{
                  scale: isActive ? 1.3 : isAdjacent ? 1.1 : 1,
                  zIndex: isActive ? 30 : isAdjacent ? 20 : 10,
                  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                }}
              >
                <img
                  loading="lazy"
                  src={
                    art.filePath
                      ? encodeURI(
                          `${BASE_URL}/${art.filePath.replace(/\\/g, "/")}`
                        )
                      : placeholderImg
                  }
                  alt={art.title}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-2 left-2 sm:top-6 sm:left-6">
                  <CategoryBadge categories={art.categories} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 text-white bg-black/70">
                  <h3 className="font-semibold text-md">{art.title}</h3>
                  <p className="text-xs">{art.artist}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {selectedArtwork && (
        <ArtDetailModal
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
        />
      )}
    </div>
  );
};

export default InfiniteArtScroll;
