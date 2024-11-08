const Footer = ({className}: {className?: string}) => {
  return (
    <footer className={`py-6 text-center text-gray-500 text-sm ${className}`}>
      © 2023 Streamly. All rights reserved.
    </footer>
  );
};

export default Footer;
