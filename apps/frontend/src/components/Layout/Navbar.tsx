import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <header className="py-6 px-8 flex justify-between items-center">
        <Link to="/"><h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-white">Streamly</h1></Link>
        <nav className='flex justify-center items-center gap-4'>
            <Link to="/pricing" className="text-gray-400 hover:text-white transition duration-300">Pricing</Link>
            <Link to="/signup" className="text-gray-400 hover:text-white transition duration-300">Sign Up</Link>
            <WalletMultiButton />
        </nav>
    </header>
  )
}

export default Navbar