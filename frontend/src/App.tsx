import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../src/components/Login";
import HRpage from "./pages/HRpage";
// import PhotoCapture from "../src/pages/PhotoCapture";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path ="/ss" element = {<Login/>} />
        <Route path ="/" element = {<HRpage />} />
        {/* <Route path ="/capture" element = {<PhotoCapture/>} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App