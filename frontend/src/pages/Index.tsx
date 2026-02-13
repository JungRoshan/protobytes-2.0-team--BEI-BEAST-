import { Link } from "react-router-dom";
import { Construction, Trash2, Droplets, Zap, Lightbulb, MessageSquare, FileText, Search, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/aaa.jpeg";

const categoryItems = [
  { id: "road", label: "Road Issues", icon: Construction, color: "text-primary" },
  { id: "waste", label: "Waste Management", icon: Trash2, color: "text-success" },
  { id: "water", label: "Water Problems", icon: Droplets, color: "text-info" },
  { id: "electricity", label: "Electricity", icon: Zap, color: "text-warning" },
  { id: "streetlight", label: "Streetlight", icon: Lightbulb, color: "text-accent" },
  { id: "other", label: "Other Issues", icon: MessageSquare, color: "text-muted-foreground" },
];

const steps = [
  { icon: FileText, title: "Submit your complaint", desc: "Fill in the details about the issue you've noticed in your city." },
  { icon: Search, title: "Authorities review & act", desc: "Local authorities are notified and assign the issue for resolution." },
  { icon: CheckCircle, title: "Track until resolved", desc: "Follow real-time status updates until the problem is fixed." },
];

const Index = () => {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Smart city" className="h-full w-full object-cover" />
          <div className="absolute inset-0 hero-gradient opacity-80" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-36 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground text-balance leading-tight mb-4">
            Raise Your Voice for a Better City
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/85 max-w-2xl mx-auto mb-8">
            Report city problems easily and track their resolution in real time.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="text-base font-semibold px-8">
              <Link to="/report">
                Report Issue <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base font-semibold px-8 bg-primary-foreground/10 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground">
              <Link to="/track">Track Complaint</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Report by Category</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Select the type of issue you want to report. We'll route it to the right department.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoryItems.map((cat) => (
            <Link
              key={cat.label}
              to={`/report?category=${cat.id}`}
              className="group flex flex-col items-center gap-3 rounded-xl border bg-card p-6 card-shadow transition-all hover:card-shadow-hover hover:-translate-y-1"
            >
              <cat.icon className={`h-8 w-8 ${cat.color} transition-transform group-hover:scale-110`} />
              <span className="text-sm font-medium text-center">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50">
        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">How It Works</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">Three simple steps to make your city better.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full hero-gradient">
                  <step.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card border text-sm font-bold">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
