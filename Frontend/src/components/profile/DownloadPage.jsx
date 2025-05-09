import React, { useEffect, useState } from "react";
import axios from "axios";

const DownloadPage = () => {
  const [downloads, setDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDownloads = async () => {
      try {
        const token = localStorage.getItem("token"); // Or however you're storing it
        const response = await axios.get(
          "http://localhost:5000/api/payments/user",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(response.data);
      } catch (error) {
        console.error("Failed to fetch downloads", error);
      }
    };

    fetchDownloads();
  }, []);

  return (
    <div className="min-h-screen p-6 text-white bg-gray-900">
      <h1 className="mb-6 text-3xl font-bold">🎨 Your Purchased Artworks</h1>

      {loading ? (
        <p className="text-gray-400">Loading your purchases...</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : downloads.length === 0 ? (
        <p className="text-gray-400">You haven't purchased any artworks yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {downloads.map((order) => {
            const imageUrl = order.artwork_id?.image_url;
            const title = order.artwork_id?.title || "Untitled";

            return (
              <a
                key={order._id}
                href={imageUrl}
                download
                className="block p-2 transition border border-gray-700 rounded hover:bg-gray-800"
              >
                <img
                  src={imageUrl}
                  alt={title}
                  className="object-cover w-full h-40 mb-2 rounded"
                  onError={(e) => (e.target.style.display = "none")}
                />
                <p className="text-sm truncate">{title}</p>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DownloadPage;
