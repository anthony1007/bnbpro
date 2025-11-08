import "@/styles/index.css";
import "@/styles/globals.css";
import NavbarAuth from "@/components/layout/NavbarAuth";
import Footer from "@/components/layout/Footer";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex-shink-0">
        <NavbarAuth />              
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
