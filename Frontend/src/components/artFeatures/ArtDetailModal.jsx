import { useContext, useState, useEffect, useRef } from "react";
import { FiX, FiMaximize, FiHeart, FiShare2 } from "react-icons/fi";
import { DarkContext } from "../../context/DarkContext";
import placeholderImg from "../../assets/images/AboutImg.jpg";
import { useFavorites } from "../../context/FavoritesContext";
import { showToast } from "../../utils/toast";

export default function ArtDetailModal({ artwork, onClose }) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const imgRef = useRef(null);
  const { darkMode } = useContext(DarkContext);
  const modeClass = darkMode ? "dark-mode" : "light-mode";
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  // Consistent artwork ID
  const artworkWithId = { ...artwork, id: artwork.id || artwork._id };

  // Lock background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Reset loading on artwork change
  useEffect(() => {
    setIsLoading(true);
  }, [artwork]);

  // Reload cached images
  useEffect(() => {
    if (imgRef.current?.complete) handleImageLoad();
  }, []);

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Hide spinner when visible
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible" && imgRef.current?.complete) {
        setIsLoading(false);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (!artwork) return null;

  // Aspect ratio helper
  const getAspect = (w, h) => {
    if (!w || !h) return "0:0";
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const d = gcd(w, h);
    return `${w / d}:${h / d}`;
  };
  const aspectRatio = getAspect(imgSize.width, imgSize.height);

  // Build image src
  const getImageSrc = () => {
    if (artwork.filePath) {
      return encodeURI(
        `${import.meta.env.VITE_API_URL}/${artwork.filePath.replace(
          /\\/g,
          "/"
        )}`
      );
    }
    if (artwork.image) return artwork.image;
    return placeholderImg;
  };

  // Share link
  const handleShare = async () => {
    try {
      const artId = artworkWithId.id;
      const url = `${window.location.origin}/artworks/${artId}`;
      await navigator.clipboard.writeText(url);
      showToast("Artwork link copied!");
    } catch {
      showToast("Could not copy artwork link.");
    }
  };

  // Image loaded
  function handleImageLoad(e) {
    const target = e?.target || imgRef.current;
    if (!target) return;
    const { naturalWidth: width, naturalHeight: height } = target;
    setImgSize({ width, height });
    setIsLoading(false);
  }

  // CategoryBadge component - added the missing component
  const CategoryBadge = ({ category }) => (
    <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full sm:px-3">
      {category || "Painting"}
    </span>
  );

  // Favorite toggle
  const handleFavoriteToggle = () => {
    const artId = artworkWithId.id;
    if (isFavorite(artId)) {
      removeFavorite(artId);
      showToast("Removed from favorites");
    } else {
      addFavorite(artworkWithId);
      showToast("Added to favorites");
    }
  };

  // Payment handler
  const handlePayment = async () => {
    if (!window.Razorpay) {
      showToast("Payment gateway is loading. Please try again.");
      return;
    }

    setIsProcessingPayment(true);

    try {
      const price = (artwork.price || 1) * 100; // paise
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: price,
          currency: "INR",
          receipt: `rcpt_${artworkWithId.id}_${Date.now()}`,
        }),
      });
      if (!res.ok) throw new Error("Order creation failed");
      const orderData = await res.json();

      const options = {
        key: import.meta.env.VITE_RZP_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ArtEchoes",
        description: artwork.title,
        image: `${import.meta.env.VITE_API_URL}/logo.png`,
        order_id: orderData.id,
        handler: (response) => {
          showToast("Payment successful!");
          setIsProcessingPayment(false);
          verifyPayment(response);
          onClose();
        },
        modal: { ondismiss: () => setIsProcessingPayment(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      showToast("Payment failed. Please try again.");
      setIsProcessingPayment(false);
    }
  };

  // Verify payment server-side
  const verifyPayment = async ({
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
  }) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/payments/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
          }),
        }
      );
      const result = await res.json();
      if (!result.success) showToast("Verification failed! Contact support.");
    } catch (e) {
      console.error(e);
      showToast("Verification error.");
    }
  };

  // Fullscreen overlay
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
        <button
          onClick={() => setIsFullScreen(false)}
          className="absolute z-50 p-2 transition rounded-full shadow-lg top-4 right-4 bg-white/50 hover:bg-white/70"
          aria-label="Close fullscreen view"
        >
          <FiX className="w-6 h-6 text-black" />
        </button>
        <div className="relative flex items-center justify-center w-full h-full p-4 sm:p-8">
          <img
            ref={imgRef}
            loading="lazy"
            src={getImageSrc()}
            alt={artwork.title}
            className="object-contain max-w-full max-h-full"
            onClick={() => setIsFullScreen(false)}
            onLoad={handleImageLoad}
            onError={() => {
              imgRef.current.src = placeholderImg;
              setIsLoading(false);
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-3xl font-bold text-white select-none md:text-5xl opacity-60">
              ArtEchoes
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 mt-22 sm:p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white w-[95vw] sm:w-[90vw] max-h-[98vh] sm:max-h-[90vh] flex flex-col md:flex-row relative shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute z-20 p-1 transition rounded-full shadow top-2 right-2 sm:top-4 sm:right-4 sm:p-2 bg-white/70 hover:bg-white"
        >
          <FiX className="w-4 h-4 text-gray-700 sm:w-5 sm:h-5" />
        </button>

        {/* Image Section */}
        <div className="relative flex flex-col w-full h-56 bg-gray-100 sm:h-64 md:h-auto md:w-3/5">
          {/* Category Badge - Now positioned with higher z-index */}
          <div className="absolute z-10 top-2 left-2 sm:top-6 sm:left-6">
            <CategoryBadge category={artwork.categories} />
          </div>

          {/* Image Container - Centered with proper padding */}
          <div className="flex items-center justify-center w-full h-full p-4">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="w-8 h-8 border-2 border-gray-400 rounded-full sm:w-12 sm:h-12 border-t-gray-800 animate-spin"></div>
              </div>
            )}

            <div className="relative flex items-center justify-center w-full h-full">
              <img
                ref={imgRef}
                loading="lazy"
                src={getImageSrc()}
                alt={artwork.title}
                className={`max-w-full max-h-full object-contain transition-opacity duration-500 ${
                  isLoading ? "opacity-0" : "opacity-100"
                }`}
                onLoad={handleImageLoad}
                onError={() => {
                  imgRef.current.src = placeholderImg;
                  setIsLoading(false);
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-xl font-bold text-white select-none md:text-3xl opacity-60">
                  ArtEchoes
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsFullScreen(true)}
              className="absolute z-10 flex items-center gap-1 p-1 text-xs text-black transition rounded shadow bottom-2 right-2 sm:bottom-6 sm:right-6 sm:p-2 sm:text-sm bg-white/80 backdrop-blur-sm hover:bg-white"
            >
              <FiMaximize className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">View</span>
            </button>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="flex-shrink-0 w-px h-full bg-gray-200"></div>

        {/* Details Section */}
        <div
          className={`${modeClass} md:w-2/5 w-full flex flex-col p-4 sm:p-6 md:p-8 overflow-y-auto`}
        >
          <h2 className="text-xl font-light truncate sm:text-2xl md:text-3xl">
            {artwork.title}
          </h2>

          <div className="flex items-center gap-2 mt-2">
            <div>
              <div className="text-sm font-medium sm:text-base">
                {artwork.artist || "Unknown Artist"}
              </div>
              <div className="text-xs sm:text-sm">
                {artwork.createdAt
                  ? new Date(artwork.createdAt).toLocaleDateString()
                  : "Unknown date"}
              </div>
            </div>
          </div>

          <p className="mt-2 overflow-y-auto prose sm:mt-4 prose-xs sm:prose-sm max-h-20 sm:max-h-32 md:max-h-none">
            {artwork.description ||
              "A beautiful piece of art which currently lacks a proper description."}
          </p>

          <section className="pt-4 mt-4 border-t border-gray-200">
            <h3 className="mb-2 text-base font-medium sm:text-lg">
              Artwork Details
            </h3>
            <div className="grid grid-cols-2 text-xs gap-x-4 gap-y-2 sm:text-sm sm:gap-x-6">
              <div>
                <span className="text-gray-500">Dimensions</span>
                <p>
                  {imgSize.width} × {imgSize.height} px
                </p>
              </div>
              <div>
                <span className="text-gray-500">Aspect Ratio</span>
                <p>{aspectRatio}</p>
              </div>
              <div>
                <span className="text-gray-500">Medium</span>
                <p>Digital only</p>
              </div>
            </div>
          </section>

          <section className="pt-4 mt-4 border-t border-gray-200">
            <h3 className="mb-2 text-base font-medium sm:text-lg">
              Provenance
            </h3>
            <p className="text-xs sm:text-sm">
              {artwork.provenance ||
                "Most artworks are either sourced online or created by me."}
            </p>
          </section>

          <div className="flex flex-col gap-3 mt-6 sm:gap-4">
            <div className="flex items-end justify-between">
              <div>
                <span className="text-xs text-gray-500 sm:text-sm">Price</span>
                <p className="text-lg font-medium sm:text-xl md:text-2xl">
                  {artwork.price > 0 ? `₹${artwork.price}` : "Free"}
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={handleFavoriteToggle}
                  className="p-1 transition rounded-full sm:p-2 hover:bg-gray-100"
                >
                  <FiHeart
                    className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                      isFavorite(artworkWithId.id)
                        ? "text-red-500"
                        : "text-gray-400"
                    }`}
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="p-1 transition rounded-full sm:p-2 hover:bg-gray-100"
                >
                  <FiShare2 className="w-4 h-4 text-gray-400 sm:w-5 sm:h-5 hover:text-gray-600" />
                </button>
              </div>
            </div>
            <button
              className={`w-full py-2 text-sm font-medium text-white transition rounded sm:py-3 sm:text-base ${
                isProcessingPayment
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-black hover:bg-gray-800"
              }`}
              onClick={handlePayment}
              disabled={isProcessingPayment}
            >
              {isProcessingPayment
                ? "Processing..."
                : artwork.price > 0
                ? `Purchase for ₹${artwork.price}`
                : "Get for Free"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
