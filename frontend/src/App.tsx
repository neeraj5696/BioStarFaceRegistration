import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "../src/components/Login";
import HRpage from "./pages/HRpage";
import PhotoCapture from "./pages/PhotoCapture";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path ="/" element = {<Login/>} />
        <Route path ="/dashboard" element = {<HRpage />} />
        <Route path ="/capture/" element = {<PhotoCapture/>} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App