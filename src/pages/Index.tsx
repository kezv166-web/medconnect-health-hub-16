import Hero from "@/components/Hero";
import RoleSelector from "@/components/RoleSelector";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Hero />
      <RoleSelector />
      
      {/* Footer */}
      <footer className="bg-muted/50 py-8 px-4 mt-16">
        <div className="max-w-7xl mx-auto text-center text-muted-foreground text-sm">
          <p>© 2024 MedConnect. Healthcare Connected.</p>
          <p className="mt-2">Secure • Reliable • Compliant</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
