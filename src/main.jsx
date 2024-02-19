import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

//* Import main layout
import RootLayout from "./layouts/root-layout";

//* Import main pages
import IndexPage from "./routes";
import NotFound from "./routes/notFound";
import Profile from "./components/Profile";

//* sign in and sign up
import SignInPage from "./components/SignInPage";
import SignUpPage from "./components/SignUpPage";

//* import user pages
import DashboardPage from "./user/pages/user-dashboard";
import UserSingleEvent from "./user/pages/singleEvent";
import RegisterForEvent from "./user/pages/registerForEvent";
import RegisteredEvents from "./user/pages/registeredEvents";
// import UserProfile from "./user/pages/userProfile";

//* import admin pages
import AdminSingleEvent from "./admin/pages/singleEvent";
import AllUser from "./admin/pages/allUser";
import CreateEvent from "./admin/pages/createEvent";
import EditEvent from "./admin/pages/editEvent";
import AdminDashboard from "./admin/pages/admin-dashboard";
// import AdminProfile from "./components/adminProfile";

//* import reviewer pages
import ReviewerSingleEvent from "./reviewer/pages/singleEvent";
import ReviewerDashboardPage from "./reviewer/pages/reviewer-dashboard";
import ReviewerAllUser from "./reviewer/pages/allUser";

//* admin layout
import AdminDashboardLayout from "./admin/layout/admin-dashboard-layout";

//* user layout
import UserDashboardLayout from "./user/layout/user-dashboard-layout";

//* reviewer layout
import ReviewerDashboardLayout from "./reviewer/layout/reviewer-dashboard-layout";

//* layout to check for user role
import CheckRole from "./components/CheckRole";

// import { AppProvider } from "./context";

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <IndexPage /> },
      { path: "/sign-in", element: <SignInPage /> },
      { path: "/sign-up", element: <SignUpPage /> },

      { path: "*", element: <NotFound /> },
    ],
  },
  {
    element: <CheckRole />,
    children: [
      //! admin pages
      {
        element: <AdminDashboardLayout />,
        path: "/",
        children: [
          {
            path: "/admin-dashboard",
            element: <AdminDashboard />,
          },
          {
            path: "/admin-dashboard/profile",
            element: <Profile />,
          },
          {
            path: "/admin-dashboard/:id",
            element: <AdminSingleEvent />,
          },
          {
            path: "/admin-dashboard/:id/edit",
            element: <EditEvent />,
          },
          {
            path: "/admin-dashboard/create-event",
            element: <CreateEvent />,
          },
          {
            path: "/admin-dashboard/:id/users",
            element: <AllUser />,
          },
        ],
      },
      //! user pages
      {
        element: <UserDashboardLayout />,
        path: "/",
        children: [
          {
            path: "/user-dashboard",
            element: <DashboardPage />,
          },
          {
            path: "/user-dashboard/:id",
            element: <UserSingleEvent />,
          },
          {
            path: "/user-dashboard/registered-events",
            element: <RegisteredEvents />,
          },
          {
            path: "/user-dashboard/:id/register",
            element: <RegisterForEvent />,
          },
          {
            path: "/user-dashboard/profile",
            element: <Profile />,
          },
        ],
      },
      //! reviewer
      {
        element: <ReviewerDashboardLayout />,
        path: "/",
        children: [
          {
            path: "/reviewer-dashboard",
            element: <ReviewerDashboardPage />,
          },
          {
            path: "/reviewer-dashboard/:id",
            element: <ReviewerSingleEvent />,
          },

          {
            path: "/reviewer-dashboard/profile",
            element: <Profile />,
          },
          {
            path: "/reviewer-dashboard/:id/users",
            element: <ReviewerAllUser />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      {/* <AppProvider> */}
      <RouterProvider router={router} />
      {/* </AppProvider> */}
    </ClerkProvider>
  </React.StrictMode>
);
