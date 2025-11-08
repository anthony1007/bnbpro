import { ToastProvider } from "@/context/ToastContext";
import "@/styles/index.css";
import "@/styles/globals.css";


export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <title>BNBFund</title>
        <meta name='BNBFund' content='Binance Base Fund' />
        <link rel="icon" type="image/x-icon" href="bnbf.png"></link>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-[#181a20] h-[100%] w-[100%]" >
        <div>
          <ToastProvider>
              {children}
          </ToastProvider>  
        </div>
      </body>
    </html>
  )
}


