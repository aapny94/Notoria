import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/login.jsx"; // Import your Login component
function App() {
  return (
    <>
      <div className="blobContainer">

      </div>

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
