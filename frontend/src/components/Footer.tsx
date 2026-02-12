import { Megaphone } from "lucide-react";

const Footer = () => (
  <footer className="border-t bg-card">
    <div className="container mx-auto px-4 py-10 grid gap-8 sm:grid-cols-3 text-sm">
      <div>
        <div className="flex items-center gap-2 font-bold text-lg text-primary mb-2">
          <Megaphone className="h-5 w-5" />
          HamroAwaj
        </div>
        <p className="text-muted-foreground">
          Empowering citizens to build a better city, one complaint at a time.
        </p>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Team</h4>
        <p className="text-muted-foreground">BEI BEAST</p>
        <p className="text-muted-foreground mt-1">Hackathon: Protobytes 2.0</p>
      </div>
      <div>
        <h4 className="font-semibold mb-2">Project</h4>
        <p className="text-muted-foreground">HamroAwaj — E-Governance Civic Complaint Platform</p>
        <p className="text-muted-foreground mt-1">© 2025 All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
