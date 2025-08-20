import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login.jsx"; // Import your Login component
function App() {
  return (
    <>
      <div class="blob blob1"></div>
      <div class="blob blob4"></div>

      <div class="blob blob2"></div>
      <div class="blob blob3"></div>
      <div className="content">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
