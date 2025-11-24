import { Smartphone, Monitor, Share2, Menu, Download, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const InstallGuide = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">Install MedConnect</h1>
          <p className="text-xl text-muted-foreground">
            Get the full app experience with notifications and offline access
          </p>
        </div>

        {/* iPhone Installation */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">iPhone / iPad (Safari)</h2>
          </div>
          <ol className="space-y-4 ml-6">
            <li className="flex gap-3">
              <span className="font-bold text-primary">1.</span>
              <div>
                <p className="font-semibold">Open in Safari</p>
                <p className="text-sm text-muted-foreground">Make sure you're using Safari browser (not Chrome)</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">2.</span>
              <div>
                <p className="font-semibold">Tap the Share button</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Share2 className="h-4 w-4" /> Look for this icon at the bottom of the screen
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">3.</span>
              <div>
                <p className="font-semibold">Scroll and tap "Add to Home Screen"</p>
                <p className="text-sm text-muted-foreground">You may need to scroll down in the menu</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">4.</span>
              <div>
                <p className="font-semibold">Tap "Add" in the top right</p>
                <p className="text-sm text-muted-foreground">The MedConnect icon will appear on your home screen</p>
              </div>
            </li>
          </ol>
        </Card>

        {/* Android Installation */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Android (Chrome / Samsung Internet)</h2>
          </div>
          <ol className="space-y-4 ml-6">
            <li className="flex gap-3">
              <span className="font-bold text-primary">1.</span>
              <div>
                <p className="font-semibold">Look for the install banner</p>
                <p className="text-sm text-muted-foreground">A prompt may appear automatically - tap "Install"</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">OR</span>
              <div className="text-muted-foreground">Use the manual method below</div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">2.</span>
              <div>
                <p className="font-semibold">Tap the Menu button</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Menu className="h-4 w-4" /> Three dots in the top right corner
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">3.</span>
              <div>
                <p className="font-semibold">Tap "Install app" or "Add to Home screen"</p>
                <p className="text-sm text-muted-foreground">The option name varies by browser</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">4.</span>
              <div>
                <p className="font-semibold">Confirm installation</p>
                <p className="text-sm text-muted-foreground">Tap "Install" in the popup dialog</p>
              </div>
            </li>
          </ol>
        </Card>

        {/* Desktop Installation */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Monitor className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold">Desktop (Chrome / Edge / Brave)</h2>
          </div>
          <ol className="space-y-4 ml-6">
            <li className="flex gap-3">
              <span className="font-bold text-primary">1.</span>
              <div>
                <p className="font-semibold">Look for the install icon</p>
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Download className="h-4 w-4" /> In the address bar (right side)
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">2.</span>
              <div>
                <p className="font-semibold">Click "Install"</p>
                <p className="text-sm text-muted-foreground">The app will open in its own window</p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-primary">OR</span>
              <div>
                <p className="font-semibold">Use the menu method</p>
                <p className="text-sm text-muted-foreground">Menu (⋮) → Install MedConnect</p>
              </div>
            </li>
          </ol>
        </Card>

        {/* Benefits */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <h2 className="text-2xl font-bold mb-4">Why Install?</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">App Icon on Home Screen</p>
                <p className="text-sm text-muted-foreground">Quick access like a native app</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Medicine Reminders</p>
                <p className="text-sm text-muted-foreground">Notifications even when closed</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Offline Access</p>
                <p className="text-sm text-muted-foreground">Works without internet</p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Faster Loading</p>
                <p className="text-sm text-muted-foreground">Cached for speed</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <Button size="lg" onClick={() => navigate('/patient-dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InstallGuide;
