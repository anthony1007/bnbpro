import Navbar from "@/components/layout/Navbar";
import GuestHome from "./(guest)/home/page";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <GuestHome />
      <Footer/>
    </>
  )
}
