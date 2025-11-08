import "@/styles/index.css";
import "@/styles/globals.css";
import Footer from "@/components/layout/Footer";
import NavbarAdmin from "@/components/layout/NavbarAdmin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex-shink-0">
        <NavbarAdmin />              
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
