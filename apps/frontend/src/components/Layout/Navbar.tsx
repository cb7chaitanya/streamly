import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <header className="py-6 px-8 flex justify-between items-center">
        <Link to="/"><h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-white">Streamly</h1></Link>
        <nav>
            <Link to="/pricing" className="text-gray-400 hover:text-white mx-3 transition duration-300">Pricing</Link>
            <Link to="/signup" className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-full transition duration-300">Sign Up</Link>
        </nav>
    </header>
  )
}

export default Navbar