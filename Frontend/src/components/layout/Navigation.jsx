import { Link } from "react-router-dom";
import { useContext } from "react";
import { useAppContext } from "../../context/AppContext";
import { DarkContext } from "../../context/DarkContext";

import Logo from "../pages/Logo";
import SearchBar from "../pages/SearchBar";
import ProfileDropdown from "../pages/ProfileDropdown";
import NavDropdown from "../pages/NavDropDown";
import SecondaryNav from "../pages/SecondaryNav";
import DarkModeToggle from "../pages/DarkModeToggle";
import { FiHeart } from "react-icons/fi";

const Navigation = () => {
  const { setSearchQuery } = useAppContext();
  const { darkMode } = useContext(DarkContext);

  const modeClass = darkMode ? "dark-mode" : "light-mode";
  const navLinkClass =
    "whitespace-nowrap border-b-2 border-transparent pb-1 text-lg font-semibold transition-colors";

  // Dropdown menus for art categories
  const navDropdowns = [
    {
      title: "Paintings",
      defaultTo: "/painting",
      options: [
        { label: "Oil Painting", to: "/oil-painting" },
        { label: "Watercolor", to: "/watercolor" },
        { label: "Acrylic Painting", to: "/acrylic-painting" },
        { label: "Sketch", to: "/sketch" },
        { label: "Portrait Painting", to: "/portrait-painting" },
        { label: "Landscape Painting", to: "/landscape-painting" },
      ],
    },
    {
      title: "Digital & New Media",
      defaultTo: "/digital-art",
      options: [
        { label: "Digital Art", to: "/digital-art" },
        { label: "AI Art", to: "/ai-art" },
        { label: "Vector Art", to: "/vector-art" },
      ],
    },
    {
      title: "Other Art",
      defaultTo: "/mixed-media",
      options: [
        { label: "Photography", to: "/photography" },
        { label: "Mixed Media", to: "/mixed-media" },
        { label: "Collage", to: "/collage" },
        { label: "Abstract Art", to: "/abstract-art" },
        { label: "Impressionism", to: "/impressionism" },
        { label: "Pop Art", to: "/pop-art" },
        { label: "Minimalism", to: "/minimalism" },
        { label: "Conceptual Art", to: "/conceptual-art" },
        { label: "Printmaking", to: "/printmaking" },
        { label: "Modern Art", to: "/modern-art" },
        { label: "Street Art", to: "/street-art" },
        { label: "Realism", to: "/realism" },
        { label: "Surrealism", to: "/surrealism" },
      ],
    },
  ];

  return (
    <nav
      className={`fixed top-0 z-600 w-full p-3 shadow-md min-h-22 transition-all ${modeClass}`}
    >
      <div className="max-w-4xl px-4 mx-auto sm:px-6 xl:max-w-full">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0 w-24 transform xl:w-32 xl:-translate-x-4">
            <Logo />
          </div>

          {/* Desktop Navigation Links */}
          <div className="items-center hidden space-x-6 xl:flex">
            {navDropdowns.map((dropdown, index) => (
              <NavDropdown
                key={index}
                title={<span className={navLinkClass}>{dropdown.title}</span>}
                options={dropdown.options}
                defaultTo={dropdown.defaultTo}
              />
            ))}
            <div className="self-stretch border-l "></div>

            {/* Static Links */}
            <Link to="/upload" className={navLinkClass}>
              Upload Art
            </Link>
            <Link to="/style-transfer" className={navLinkClass}>
              Image Style Change
            </Link>

            <Link to="/about-us" className={navLinkClass}>
              About Us
            </Link>
            <Link to="/contact-us" className={navLinkClass}>
              Contact Us
            </Link>
            <Link to="/favorites" className={navLinkClass}>
              <FiHeart className="w-5 h-5" />
            </Link>
          </div>

          {/* Right-side Utilities */}
          <div className="flex items-center justify-end flex-1 ml-5 space-x-4 md:pl-5 xl:ml-0 xl:flex-none">
            <SearchBar setSearchQuery={setSearchQuery} className="w-full" />
            <ProfileDropdown />
            <DarkModeToggle />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="mt-2 xl:hidden"></div>
      <SecondaryNav />
    </nav>
  );
};

export default Navigation;
