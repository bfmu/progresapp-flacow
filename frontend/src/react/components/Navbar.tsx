import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const { logout, isAuth, profile } = useAuthStore((state) => state);

  const navigate = useNavigate();

  useEffect(() => {
    if (isDropdownOpen && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      dropdownRef.current.style.top = `${buttonRect.bottom + window.scrollY}px`;
      dropdownRef.current.style.left = `${buttonRect.right - dropdownRef.current.offsetWidth + window.scrollX}px`;
    }
  }, [isDropdownOpen]);

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a
          href="/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            FLACOW
          </span>
        </a>
        <div className="flex items-center md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <button
            type="button"
            ref={buttonRef}
            onClick={toggleDropdown}
            className="flex text-sm bg-gray-800 rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
            id="user-menu-button"
            aria-expanded={isDropdownOpen ? "true" : "false"}
          >
            <span className="sr-only">Open user menu</span>
            <img
              className="w-8 h-8 rounded-full"
              src="#"
              alt="user photo"
            />
          </button>
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute w-48 z-50 text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600"
              id="user-dropdown"
            >
              <div className="px-4 py-3">
                <span className="block text-sm text-gray-900 dark:text-white">
                  {profile ? profile.name : "Invitado"}
                </span>
                <span className="block text-sm text-gray-500 truncate dark:text-gray-400">
                  {profile ? profile.email : "Registrate"}
                </span>
              </div>
              <ul className="py-2" aria-labelledby="user-menu-button">
                {profile ? (
                  <>
                    <li>
                      <Link
                        to="/app/dashboard"
                        onClick={closeDropdown}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/app/muscles"
                        onClick={closeDropdown}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                      >
                        Musculos
                      </Link>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          logout();
                          closeDropdown();
                          window.location.href = '/'
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                      >
                        Sign out
                      </button>
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <Link
                        to="/app/login"
                        onClick={closeDropdown}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                      >
                        Identificate
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/app/register"
                        onClick={closeDropdown}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
                      >
                        Registrarse
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
