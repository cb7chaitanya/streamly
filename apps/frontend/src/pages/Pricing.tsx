import React from 'react';
import { FaCheck, FaClock, FaCalendarTimes, FaWindowRestore, FaChartPie, FaMicrophone } from 'react-icons/fa';
import { SiSolana, SiHomeassistantcommunitystore } from 'react-icons/si';
import Navbar from '../components/Layout/Navbar';
import Card from '../components/Pricing/Card';

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
        <footer className="py-6 text-center text-gray-500 text-sm">
          © 2023 Streamly. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default Pricing;
{/* <div className="bg-gray-800 bg-opacity-50 p-8 rounded-xl shadow-lg w-full md:w-96 border-2 border-blue-500">
              <h3 className="text-3xl font-bold mb-4">Premium Plan</h3>
              <p className="text-xl mb-6 text-gray-400">For serious streamers</p>
              <ul className="mb-8">
                <li className="flex items-center mb-2">
                  <FaCheck className="text-green-500 mr-2" />
                  <span>All Free Plan features</span>
                </li>
                <li className="flex items-center mb-2">
                  <FaCheck className="text-green-500 mr-2" />
                  <span>Unlimited streaming time</span>
                </li>
                <li className="flex items-center mb-2">
                  <FaCheck className="text-green-500 mr-2" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center mb-2">
                  <SiSolana className="text-purple-500 mr-2" />
                  <span>Pay with Solana</span>
                </li>
              </ul>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-full text-xl transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center">
                <FaWallet className="mr-2" />
                Upgrade with Solana
              </button>
            </div> */}