// src/routes/AppRoutes.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

// Layout components
import { HeroSection } from "../components/layout";

// Common components
import { InfiniteScroll, FeaturedArtistsCarousel } from "../components/common";

// Page components
import { AboutUs, ContactUs } from "../components/pages";

// Art Categories components
import {
  PaintingsPage,
  Drawing,
  OilPainting,
  Watercolor,
  Sketch,
  DigitalArt,
  Photography,
  MixedMedia,
  Collage,
  AbstractArt,
  Impressionism,
  PopArt,
  AIArt,
  VectorArt,
  Minimalism,
  ConceptualArt,
  Printmaking,
  AcrylicPainting,
  PortraitPainting,
  LandscapePainting,
  ModernArt,
  StreetArt,
  Realism,
  Surrealism,
  TraditionalArt,
} from "../components/artCategories";
import {
  ArtDetailModal,
  SearchResultsPage,
  UploadArt,
  StyleTransfer,
  ArtDetailWrapper,
  FavoritesPage,
} from "../components/artFeatures";
import {
  SignUp,
  Login,
  ForgotPassword,
  ResetPassword,
} from "../components/auth";

// Profile components
import ProfilePage from "../components/profile/ProfilePage";
import DownloadPage from "../components/profile/DownloadPage";

// Utils and constants
import ArtGrid from "../components/common/ArtGrid";
import { WeeklyTopArt } from "../utils/constants";

const AppRoutes = () => {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <HeroSection />
            <h2 className="mb-4 ml-10 text-4xl font-bold text-center">
              All Artworks
            </h2>
            <InfiniteScroll />
            <h2 className="mt-10 mb-4 text-xl font-bold text-center">
              This Week's top Art, rated by yours truly, hehe..
            </h2>
            <ArtGrid defaultArtworks={WeeklyTopArt} />
            <FeaturedArtistsCarousel />
            <AboutUs />
          </>
        }
      />
      <Route path="/artwork/:id" element={<ArtDetailModal />} />

      {/* Category routes */}
      <Route path="/painting" element={<PaintingsPage />} />
      <Route path="/drawing" element={<Drawing />} />
      <Route path="/oil-painting" element={<OilPainting />} />
      <Route path="/watercolor" element={<Watercolor />} />
      <Route path="/acrylic-painting" element={<AcrylicPainting />} />
      <Route path="/sketch" element={<Sketch />} />
      <Route path="/digital-art" element={<DigitalArt />} />
      <Route path="/photography" element={<Photography />} />
      <Route path="/mixed-media" element={<MixedMedia />} />
      <Route path="/collage" element={<Collage />} />
      <Route path="/abstract-art" element={<AbstractArt />} />
      <Route path="/impressionism" element={<Impressionism />} />
      <Route path="/pop-art" element={<PopArt />} />
      <Route path="/minimalism" element={<Minimalism />} />
      <Route path="/conceptual-art" element={<ConceptualArt />} />
      <Route path="/printmaking" element={<Printmaking />} />
      <Route path="/portrait-painting" element={<PortraitPainting />} />
      <Route path="/landscape-painting" element={<LandscapePainting />} />
      <Route path="/modern-art" element={<ModernArt />} />
      <Route path="/street-art" element={<StreetArt />} />
      <Route path="/realism" element={<Realism />} />
      <Route path="/surrealism" element={<Surrealism />} />
      <Route path="/vector-art" element={<VectorArt />} />
      <Route path="/ai-art" element={<AIArt />} />
      <Route path="/traditional-art" element={<TraditionalArt />} />

      <Route path="/upload" element={<UploadArt />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/contact-us" element={<ContactUs />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/downloads" element={<DownloadPage />} />
      <Route path="/downloads/:id" element={<DownloadPage />} />

      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/art/:id" element={<ArtDetailModal />} />
      <Route path="/artworks/:id" element={<ArtDetailWrapper />} />
      <Route path="/style-transfer" element={<StyleTransfer />} />
    </Routes>
  );
};

export default AppRoutes;
