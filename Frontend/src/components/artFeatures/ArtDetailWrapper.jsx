import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ArtDetailModal from "../artFeatures/ArtDetailModal";

export default function ArtDetailWrapper() {
  const { id } = useParams(); // grabs the :id from /artworks/:id
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1) fetch the artwork by ID
  useEffect(() => {
    async function fetchArtwork() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/artworks/${id}`
        );
        const data = await res.json();
        setArtwork(data);
      } catch (err) {
        console.error("Failed to load artwork", err);
      } finally {
        setLoading(false);
      }
    }
    fetchArtwork();
  }, [id]);

  // 2) show a loader if you want
  if (loading)
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        Loading…
      </div>
    );

  // 3) render the modal, and onClose navigate to the home page
  return <ArtDetailModal artwork={artwork} onClose={() => navigate("/")} />;
}
