import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  isLoading?: boolean;
}

export function ChatMessage({ role, content, isLoading }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex w-full gap-4 p-4",
        role === "assistant" ? "bg-muted/50" : "bg-background"
      )}
    >
      <Avatar className="h-8 w-8">
        <AvatarImage
          src={
            role === "user"
              ? "https://github.com/shadcn.png"
              : "https://github.com/vercel.png"
          }
          alt={role === "user" ? "User" : "Assistant"}
        />
        <AvatarFallback>
          {role === "user" ? "U" : "A"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="text-sm font-medium">
          {role === "user" ? "You" : "Assistant"}
        </div>
        <div className="text-sm text-muted-foreground">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.2s]" />
              <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0.4s]" />
            </div>
          ) : (
            content
          )}
        </div>
      </div>
    </div>
  );
} 