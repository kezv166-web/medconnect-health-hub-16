import { Activity } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-background to-primary/5 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto text-center animate-fade-in">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="p-3 bg-primary rounded-2xl shadow-lg">
            <Activity className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            MedConnect
          </h1>
        </div>

        {/* Hero headline */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
          Healthcare <span className="text-primary">Connected</span>
        </h2>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
          Seamlessly connecting patients, doctors, and hospitals in one unified platform. 
          Modern healthcare management built for the future.
        </p>

        {/* Trust indicators */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full" />
            <span>HIPAA Compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full" />
            <span>End-to-End Encrypted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full" />
            <span>24/7 Support</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
