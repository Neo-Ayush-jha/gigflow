import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
                <Briefcase className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient">GigFlow</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Connect with talented freelancers and find the perfect gig for your project.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">For Clients</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/post-gig" className="hover:text-primary transition-colors">Post a Gig</Link></li>
              <li><Link to="/gigs" className="hover:text-primary transition-colors">Browse Freelancers</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">Manage Projects</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">For Freelancers</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/gigs" className="hover:text-primary transition-colors">Find Gigs</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">My Bids</Link></li>
              <li><Link to="/profile" className="hover:text-primary transition-colors">Build Profile</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-semibold">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Contact</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} GigFlow. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
