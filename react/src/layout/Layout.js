import { Link, Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <nav className="justify-center flex bg-slate-400 p-5">
        <ul className=" flex justify-around w-2/3">
          <li>
            <Link to="/">Boka</Link>
          </li>
          <li>
            <Link to="/blogs">Blogs</Link>
          </li>
          <li>
            <Link to="/contact">Contact</Link>
          </li>
        </ul>
      </nav>

      <Outlet />
    </>
  );
};

export default Layout;
