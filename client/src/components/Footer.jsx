import LogoDark from "../assets/logo_dark.png"; // Import your logo

const Footer = () => {
  return (
    <footer className="bg-[#003366] text-gray-300 py-4 w-full">
      <div className="container flex items-center justify-between max-w-screen-xl px-12 mx-auto">
        
        {/* Logo (Left) */}
        <div className="flex items-center">
          <img src={LogoDark} alt="Mentora Logo" className="w-auto h-14" />
        </div>

        {/* Copyright (Center) */}
        <div className="text-sm font-medium">
          © {new Date().getFullYear()} Mentora, Inc.
        </div>

        {/* Navigation Links */}
        <ul className="flex space-x-6 text-sm">
          <li><a href="#" className="hover:text-[#16A085]">About</a></li>
          <li><a href="#" className="hover:text-[#16A085]">Courses</a></li>
          <li><a href="#" className="hover:text-[#16A085]">Contact</a></li>
        </ul>

        {/* Tagline & CTA (Right) */}
        <div className="text-sm font-medium">
          "Empowering learners. Unlocking potential." 🚀  
          <a href="#" className="text-[#16A085] hover:underline ml-1">Get Started</a>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
