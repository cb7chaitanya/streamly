import React from 'react';
import { FaCheck, FaClock, FaCalendarTimes, FaWindowRestore, FaChartPie, FaMicrophone } from 'react-icons/fa';
import { SiSolana, SiHomeassistantcommunitystore } from 'react-icons/si';
import Navbar from '../components/Layout/Navbar';
import Card from '../components/Pricing/Card';
import Footer from '../components/Layout/Footer';

const Pricing: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-neue-helvetica relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-75"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl opacity-20"></div>
      <div className="relative z-10">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <h2 className="text-5xl md:text-6xl font-black mb-12 text-center leading-tight">Choose Your Streaming Plan</h2>
          <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-8">
            <Card icons={[<FaMicrophone className="text-green-500 mr-2" />, <FaClock className="text-green-500 mr-2" />, <FaWindowRestore className="text-green-500 mr-2" />, <FaChartPie className="text-green-500 mr-2" />]} title="Free Plan" description="For the casual streamer" points={["Basic customer support", "15 minutes time limit", "Limited customization options", "Limited Analytics"]} buttonText='Start Streaming Now'/>
            <Card icons={[<FaCheck className='mr-2 text-green-500' />, <FaCalendarTimes className='mr-2 text-green-500' />, <SiHomeassistantcommunitystore className='mr-2 text-green-500' />, <SiSolana className='mr-2 text-blue-500' />]} title="Premium Plan" description="For serious streamers" points={["All Free Plan features", "Unlimited streaming time", "Priority support", "Pay with Solana"]} buttonText='Pay via Solana'/>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Pricing;