import Navbar from "../Components/Navbar";

function MainLayout({ children }) {
  return (
    <>
      <Navbar />

      <main className="app-main">{children}</main>
    </>
  );
}

export default MainLayout;
