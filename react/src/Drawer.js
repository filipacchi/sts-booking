import React from "react";
import { LuMenu } from "react-icons/lu";


const Drawer = () => {


    return (
        <div>
            <span className="flex items-center p-5 gap-3"><button className="transition-all ease-in-out duration-500 hover:scale-110 focus:rotate-180"><LuMenu size="30" /></button> <h1>STS Bokning</h1></span>
           <div className="p-5 bg-gray-400 w-fit text-white flex">
            <span>
           <LuMenu size="30" />
           <LuMenu size="30" />
           <LuMenu size="30" />
           <LuMenu size="30" />
           </span>
           <span className="transform">
            <ul className="">
                <li>Home</li>
                <li>Services</li>
                <li>Bookings</li>
                <li>Contacts</li>
            </ul>
           </span>
           </div>
           
        </div>
    )

}

export default Drawer;