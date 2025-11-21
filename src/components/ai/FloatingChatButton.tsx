import { useState } from "react";
import { Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import HealthChatWindow from "./HealthChatWindow";

const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform z-40 bg-primary hover:bg-primary-dark"
        size="icon"
      >
        <Bot className="w-6 h-6 text-primary-foreground" />
      </Button>

      {/* Chat Window */}
      {isOpen && <HealthChatWindow onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default FloatingChatButton;
