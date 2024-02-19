import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./routes/sign-up";
import Signin from "./routes/sign-in";
import Dashboard from "./routes/dashboard";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* Define routes using the Route component */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/sign-in" element={<Signin />} />
          <Route path="/sign-up" element={<Signup />} />
          {/* <Route path="/admin-dashboard" element={<AdminDashboard />} /> */}

          {/* Add a default route for 404 page */}
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
