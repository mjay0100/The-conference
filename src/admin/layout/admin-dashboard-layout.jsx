/* eslint-disable no-unused-vars */
import { useState } from "react";
// import { UserButton, useSession } from "@clerk/clerk-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { checkUserRole } from "../../utils/deleteEventFunction";
import { useGlobalContext } from "../../context";

const navigation = [
  { name: "Admin Dashboard", href: "/admin-dashboard", role: "admin" },
  {
    name: "Create Event",
    href: "/admin-dashboard/create-event",
    role: "admin",
  },
  { name: "Your Profile", href: "/admin-dashboard/profile", role: "admin" },
];
const userNavigation = [
  { name: "Admin Dashboard", href: "/admin-dashboard", role: "admin" },
  {
    name: "Create Event",
    href: "/admin-dashboard/create-event",
    role: "admin",
  },

  { name: "Your Profile", href: "/admin-dashboard/profile", role: "admin" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
export default function DashboardLayout() {
  // const { session } = useSession();
  // const userRole = checkUserRole(session);
  const { pathname } = useLocation();
  const [activeLink, setActiveLink] = useState(pathname);
  const { user } = useGlobalContext();
  return (
    <>
      <div className="min-h-full ">
        <Disclosure as="nav" className="bg-[#001F3F]">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ">
                <div className="flex h-16 items-center justify-between">
                  {/* navlinks and user profile */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {/* logo */}
                      <img
                        className="h-8 w-8"
                        src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                        alt="Your Company"
                      />
                    </div>
                    <div className="hidden md:block">
                      <div className="ml-10 flex items-baseline space-x-4">
                        {navigation.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={classNames(
                              item.href === activeLink
                                ? "bg-[#003366] text-white"
                                : "text-gray-300 hover:bg-[#003366] hover:text-white",
                              "rounded-md px-3 py-2 text-sm font-medium"
                            )}
                            aria-current={
                              item.href === activeLink ? "page" : undefined
                            }
                            onClick={() => setActiveLink(item.href)}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-4 flex items-center md:ml-6">
                      <div className="relative ml-3">
                        <div className="relative flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                          <Link to="/admin-dashboard/profile">
                            <img
                              src={user.photoURL}
                              className="w-8 rounded-full"
                              alt={user.displayName}
                            />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="-mr-2 flex md:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md bg-[#001F3F] p-2 text-gray-400 hover:bg-[#003366] hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                      {open ? (
                        <XMarkIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bars3Icon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>
              {/* mobile view important */}
              <Disclosure.Panel className="md:hidden">
                <div className="border-t border-gray-700 pb-3 pt-4">
                  <div className="flex items-center px-5">
                    <div className="flex-shrink-0"></div>
                  </div>
                  <div className="mt-3 space-y-1 px-2">
                    {userNavigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        className={classNames(
                          "block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-[#003366] hover:text-white",
                          {
                            "bg-[#003366] text-white": pathname.startsWith(
                              item.href
                            ),
                          }
                        )}
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      </div>
      <main>
        <div className="mx-auto">
          {/* main content */}
          <Outlet />
        </div>
      </main>
    </>
  );
}
