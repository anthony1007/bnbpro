import "@/styles/index.css";
import "@/styles/globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function GuestLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex-shink-0">
        <Navbar />              
      </div>
      <div className="grow overflow-auto min-h-2em">
          {children}
      </div>
      <div className="flex-shink-0">
        <Footer/>
      </div>      
    </>
  );
}
