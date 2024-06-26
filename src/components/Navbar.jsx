// import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Dialog, Popover } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

const Navbar = () => {
  //   const { userId, isLoaded } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleLinkClick = () => {
    // Close the mobile menu when a link is clicked
    setMobileMenuOpen(false);
  };
  return (
    <div>
      <header className="bg-white">
        <nav
          className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
          aria-label="Global"
        >
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5">
              <span className="sr-only">Your Company</span>
              <img
                className="h-8 w-auto"
                src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
                alt=""
              />
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <Popover.Group className="hidden lg:flex lg:gap-x-12">
            <Link
              to="/"
              className="text-sm font-semibold leading-6 text-gray-900"
              // onClick={handleLinkClick}
            >
              Home
            </Link>
            {/* <SignedIn> */}
            {/* <Link
              to="/admin-dashboard"
              className="text-sm font-semibold leading-6 text-gray-900"
            >
              dashboard
            </Link> */}
            {/* </SignedIn> */}
            {/* <SignedOut> */}
            <Link
              to="/sign-in"
              className="text-sm font-semibold leading-6 text-gray-900"
              // onClick={handleLinkClick}
            >
              Sign in
            </Link>
            {/* </SignedOut> */}
          </Popover.Group>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <Link
              to="/sign-up"
              className="text-sm font-semibold leading-6 text-gray-900"
              // onClick={handleLinkClick}
            >
              Sign up <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
        {/* controls hiding links during screen change */}
        <Dialog
          as="div"
          className="lg:hidden"
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
        >
          <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 transform transition-transform ease-in-out duration-300">
            {/* Close button */}
            {/* Mobile navigation links */}
            <div className="space-y-2 py-6">
              <Link
                to="/"
                className="text-sm font-semibold leading-6 text-gray-900"
                onClick={handleLinkClick}
              >
                Home
              </Link>
            </div>
            <div className="space-y-2 py-6">
              <Link
                to="/sign-in"
                className="text-sm font-semibold leading-6 text-gray-900"
                onClick={handleLinkClick}
              >
                Sign in
              </Link>
            </div>
            <div className="py-6">
              <Link
                to="/sign-up"
                className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                onClick={handleLinkClick}
              >
                Sign up
              </Link>
            </div>
          </Dialog.Panel>
        </Dialog>
      </header>
    </div>
  );
};

export default Navbar;
