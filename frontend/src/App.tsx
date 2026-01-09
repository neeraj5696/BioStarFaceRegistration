import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Login from "../src/components/Login";
import PhotoCapture from "./pages/PhotoCapture";
import SearchEmp from "./components/SearchEmp";
import History from "./pages/History";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path ="/" element = {<Login/>} />
        <Route path ="/dashboard" element = {
          <ProtectedRoute>
            <SearchEmp />
          </ProtectedRoute>
        } />
        <Route path ="/capture" element = {<PhotoCapture/>} />
        <Route path ="/history" element = {
          <ProtectedRoute>
            <History/>
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App