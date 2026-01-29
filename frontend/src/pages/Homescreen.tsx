
import { useNavigate } from "react-router-dom";
import { Users, View } from 'lucide-react';
import './Homescreen.css'


const Homescreen = () => {
  const navigate = useNavigate();
  return (
    <div className='main-container'>

      <div className="container">
        <h1 className='' >Welcome to the Client Dashboard</h1>
        <h2> Please select an option</h2>
        <div className="button-wrapper">
          <div onClick={() => navigate("/dashboard")}>
            <button

            >Face Enrollment</button>
            <View />

          </div>
          <div onClick={() => navigate("/VisitorRegistrationForm")} >

            <button

            >Visitor Management</button>

            <Users />
          </div>
        </div>
      </div>

    </div>
  )
}

export default Homescreen