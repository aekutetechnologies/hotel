import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ButtonProps } from "@/components/ui/new-button";
import { Loader2 } from "lucide-react";

export interface ApiButtonProps extends ButtonProps {
  /** The async function to execute when the button is clicked */
  onClick: () => Promise<any>;
  /** Text to display on the button while loading */
  loadingText?: string;
  /** Whether to show a loading spinner */
  showSpinner?: boolean;
  /** Whether to disable the button during loading */
  disableDuringLoading?: boolean;
  /** Cooldown time in milliseconds to prevent duplicate clicks */
  cooldown?: number;
}

/**
 * Button component designed for API interactions with built-in protection
 * against duplicate submissions and visual feedback during loading states.
 */
export function ApiButton({
  children,
  onClick,
  loadingText,
  showSpinner = true,
  disableDuringLoading = true,
  cooldown = 300,
  disabled,
  ...props
}: ApiButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent duplicate submissions
    if (isSubmittingRef.current) {
      console.log("Request already in progress, preventing duplicate submission");
      event.preventDefault();
      return;
    }

    try {
      setIsLoading(true);
      isSubmittingRef.current = true;
      
      await onClick();
      
      // Set a cooldown period to prevent rapid repeated clicks
      if (cooldown > 0) {
        if (cooldownTimerRef.current) {
          clearTimeout(cooldownTimerRef.current);
        }
        
        cooldownTimerRef.current = setTimeout(() => {
          isSubmittingRef.current = false;
        }, cooldown);
      }
    } catch (error) {
      console.error("Error in API button click handler:", error);
    } finally {
      setIsLoading(false);
      
      // If no cooldown is set, immediately allow new submissions
      if (cooldown === 0) {
        isSubmittingRef.current = false;
      }
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || (disableDuringLoading && isLoading)}
      {...props}
    >
      {isLoading && showSpinner && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {isLoading && loadingText ? loadingText : children}
    </Button>
  );
} 