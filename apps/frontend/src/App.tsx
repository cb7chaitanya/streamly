import { FaYoutube, FaRocket, FaLaptop } from 'react-icons/fa';
import { SiSolana } from 'react-icons/si';
import Navbar from './components/Layout/Navbar';
import Hero from './components/Landing/Hero';
import Card from './components/Landing/Card';
import Footer from './components/Layout/Footer';
const App = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-neue-helvetica relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-75"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
      <div className="relative z-10">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <Hero />
          <div className="grid md:grid-cols-2 gap-8 text-center">
            <Card icon={<FaRocket className="text-5xl mb-4 mx-auto text-blue-500" />} title="Lightning Fast" description="Experience low-latency streaming for real-time interaction with your audience." />
            <Card icon={<FaLaptop className="text-5xl mb-4 mx-auto text-green-500" />} title="Browser-Based" description="No software to install. Stream directly from your favorite web browser." />
            <Card icon={<FaYoutube className="text-5xl mb-4 mx-auto text-red-500" />} title="YouTube Integration" description="Seamlessly connect and stream to your YouTube channel in seconds." />
            <Card icon={<SiSolana className="text-5xl mb-4 mx-auto text-green-500" />} title="Payments through Solana" description="Keeping your payments secure and fast with Solana." />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  )
}

export default App
