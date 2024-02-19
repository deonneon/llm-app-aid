import { useState, useEffect } from "react";
import "../styling/critical-components.css";
import CreationsDrawer from "./Drawer";
import LoginDrawer from "./Login";

const NavBar: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoginDrawerOpen, setIsLoginDrawerOpen] = useState(false);

  const toggleCreationDrawer = (open: boolean) => () => {
    setIsDrawerOpen(open);
  };

  const toggleLoginDrawer = (open: boolean) => () => {
    setIsLoginDrawerOpen(open);
  };

  return (
    <>
      <nav className="flex items-center justify-between bg-white p-3 px-4">
        {/* Hamburger*/}
        <button
          className="h-7"
          type="button"
          aria-label="Main Menu"
          onClick={toggleCreationDrawer(true)}
        >
          <span className="susu-icon susu-icon-menu" aria-hidden="true">
            <span className="sr-only">Menu</span>
          </span>
        </button>

        {/* Title */}
        <div className="text-md md:text-l font-semibold">
          <a href=".">WORKSHEET GENERATOR</a>
        </div>

        {/* User action icons */}
        <div className="flex h-7 items-center space-x-4">
          <div
            className="header__actions-item cursor-pointer "
            role="search"
            onClick={toggleLoginDrawer(true)}
          >
            <a className="header__btn account-btn">
              <span className="susu-icon susu-icon-profile" aria-hidden="true">
                <span className="sr-only">Account</span>
              </span>
            </a>
          </div>

          <div className="header__actions-item">
            <a className="wishlist-header-btn  header__btn" href="/wishlist">
              <span className="susu-icon susu-icon-wishlist" aria-hidden="true">
                <span className="sr-only">saved draft</span>
              </span>
            </a>
          </div>
        </div>
      </nav>

      {isDrawerOpen && (
        <div
          className="overlay-drawer"
          onClick={() => setIsDrawerOpen(false)}
        ></div>
      )}

      <CreationsDrawer
        isOpen={isDrawerOpen}
        onClose={toggleCreationDrawer(false)}
      />
      <LoginDrawer
        isOpen={isLoginDrawerOpen}
        onClose={toggleLoginDrawer(false)}
      />
    </>
  );
};

export default NavBar;
