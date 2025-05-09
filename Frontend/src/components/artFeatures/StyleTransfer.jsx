import React, { useState, useEffect } from "react";
import axios from "axios";

const StyleTransfer = () => {
  const [content, setContent] = useState(null);
  const [contentPreview, setContentPreview] = useState(null);
  const [style, setStyle] = useState(null);
  const [stylePreview, setStylePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleContentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setContent(file);
      setContentPreview(URL.createObjectURL(file));
    }
  };

  const handleStyleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setStyle(file);
      setStylePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content || !style) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("content", content);
    formData.append("style", style);

    try {
      const response = await axios.post("/api/style-transfer", formData, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(new Blob([response.data]));
      setResult(url);
    } catch (error) {
      console.error("Error:", error);
      alert("Error processing images");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (contentPreview) URL.revokeObjectURL(contentPreview);
      if (stylePreview) URL.revokeObjectURL(stylePreview);
      if (result) URL.revokeObjectURL(result);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl p-6 mx-auto my-8 text-black bg-white rounded-lg shadow">
        <h2 className="mb-6 text-2xl font-bold text-center">
          Art Style Transfer
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 font-medium">Content Image:</label>
              <input
                type="file"
                onChange={handleContentChange}
                accept="image/*"
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
              {contentPreview && (
                <div className="mt-2">
                  <img
                    src={contentPreview}
                    alt="Content preview"
                    className="object-contain w-full h-48 mx-auto rounded"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block mb-2 font-medium">Style Image:</label>
              <input
                type="file"
                onChange={handleStyleChange}
                accept="image/*"
                required
                className="w-full p-2 border border-gray-300 rounded"
              />
              {stylePreview && (
                <div className="mt-2">
                  <img
                    src={stylePreview}
                    alt="Style preview"
                    className="object-contain w-full h-48 mx-auto rounded"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-6 py-3 px-4 rounded font-medium text-white ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Processing..." : "Generate Art"}
          </button>
        </form>

        {result && (
          <div className="mt-8">
            <h3 className="mb-4 text-xl font-medium text-center">Comparison</h3>

            <div className="flex flex-col items-center justify-center gap-4 md:flex-row">
              {/* Content Image */}
              <div className="w-full md:w-1/4">
                <div className="flex flex-col items-center">
                  <p className="mb-2 font-medium">Content</p>
                  <img
                    src={contentPreview}
                    alt="Content"
                    className="object-contain w-full h-40 rounded shadow"
                  />
                </div>
              </div>

              {/* Plus Symbol */}
              <div className="flex items-center justify-center">
                <span className="text-2xl font-bold">+</span>
              </div>

              {/* Style Image */}
              <div className="w-full md:w-1/4">
                <div className="flex flex-col items-center">
                  <p className="mb-2 font-medium">Style</p>
                  <img
                    src={stylePreview}
                    alt="Style"
                    className="object-contain w-full h-40 rounded shadow"
                  />
                </div>
              </div>

              {/* Equals Symbol */}
              <div className="flex items-center justify-center">
                <span className="text-2xl font-bold">=</span>
              </div>

              {/* Result Image */}
              <div className="w-full md:w-1/4">
                <div className="flex flex-col items-center">
                  <p className="mb-2 font-medium">Result</p>
                  <img
                    src={result}
                    alt="Result"
                    className="object-contain w-full h-40 rounded shadow"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 text-center">
              <a
                href={result}
                download="styled-image.png"
                className="inline-block px-4 py-2 font-medium text-white bg-green-600 rounded hover:bg-green-700"
              >
                Download Result
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StyleTransfer;
