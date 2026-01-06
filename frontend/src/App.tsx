import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "../src/components/Login";
import PhotoCapture from "./pages/PhotoCapture";
import SearchEmp from "./components/SearchEmp";
import History from "./pages/History";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path ="/" element = {<Login/>} />
        <Route path ="/dashboard" element = {<SearchEmp />} />
        <Route path ="/capture" element = {<PhotoCapture/>} />
        <Route path ="/history" element = {<History/>} />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App