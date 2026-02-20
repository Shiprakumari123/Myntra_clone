import { useState, useEffect } from "react";
import { Bell, Package, Tag, Info, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    type: "order" | "promo" | "info";
    read: boolean;
}

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // Load from localStorage
        const saved = localStorage.getItem("user_notifications");
        if (saved) {
            setNotifications(JSON.parse(saved));
        } else {
            // Mock initial notifications
            const initial: Notification[] = [
                {
                    id: "1",
                    title: "Welcome to Myntra! 🎉",
                    message: "Enjoy 50% OFF on your first order. Use code: MYNTRA50",
                    time: new Date().toISOString(),
                    type: "promo",
                    read: false,
                }
            ];
            setNotifications(initial);
            localStorage.setItem("user_notifications", JSON.stringify(initial));
        }

        // Listen for custom events to add notifications from other components
        const handleNewNotif = (event: any) => {
            const newNotif = event.detail;
            setNotifications(prev => {
                const updated = [newNotif, ...prev];
                localStorage.setItem("user_notifications", JSON.stringify(updated));
                return updated;
            });
        };

        window.addEventListener("add-notification", handleNewNotif);
        return () => window.removeEventListener("add-notification", handleNewNotif);
    }, []);

    const markAllRead = () => {
        const updated = notifications.map(n => ({ ...n, read: true }));
        setNotifications(updated);
        localStorage.setItem("user_notifications", JSON.stringify(updated));
    };

    const clearAll = () => {
        setNotifications([]);
        localStorage.setItem("user_notifications", JSON.stringify([]));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "order": return <Package className="w-4 h-4 text-blue-500" />;
            case "promo": return <Tag className="w-4 h-4 text-success" />;
            default: return <Info className="w-4 h-4 text-primary" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="w-80 sm:w-96 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-4 bg-secondary/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-brand font-bold">Notifications</h3>
                    {unreadCount > 0 && <Badge variant="destructive" className="h-5 px-1.5 min-w-[20px] rounded-full text-[10px]">{unreadCount}</Badge>}
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={markAllRead} className="h-7 text-[10px] font-bold">Mark Read</Button>
                    <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-[10px] text-destructive font-bold">Clear All</Button>
                </div>
            </div>

            <ScrollArea className="h-[350px]">
                {notifications.length === 0 ? (
                    <div className="p-12 text-center">
                        <Bell className="w-10 h-10 text-muted-foreground opacity-20 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground font-body">No new notifications</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {notifications.map(notif => (
                            <div
                                key={notif.id}
                                className={`p-4 hover:bg-secondary/20 transition-colors cursor-pointer relative ${!notif.read ? "bg-primary/5" : ""}`}
                                onClick={() => {
                                    const updated = notifications.map(n => n.id === notif.id ? { ...n, read: true } : n);
                                    setNotifications(updated);
                                    localStorage.setItem("user_notifications", JSON.stringify(updated));
                                }}
                            >
                                {!notif.read && <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full" />}
                                <div className="flex gap-3">
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center mt-0.5">
                                        {getIcon(notif.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground leading-tight">{notif.title}</p>
                                        <p className="text-xs text-muted-foreground font-body mt-1 leading-relaxed">{notif.message}</p>
                                        <p className="text-[10px] text-muted-foreground mt-2 font-mono">
                                            {new Date(notif.time).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            <div className="p-3 bg-secondary/10 border-t border-border text-center">
                <Button variant="link" className="text-[10px] h-4 font-bold uppercase tracking-wider text-muted-foreground hover:text-primary">
                    View All Activities
                </Button>
            </div>
        </div>
    );
}

// Helper to send notifications from anywhere
export const pushNotification = (title: string, message: string, type: "order" | "promo" | "info" = "info") => {
    const newNotif: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        title,
        message,
        time: new Date().toISOString(),
        type,
        read: false,
    };

    // Dispatch custom event for web UI
    const event = new CustomEvent("add-notification", { detail: newNotif });
    window.dispatchEvent(event);

    // Send message to Expo WebView (if running on mobile)
    if ((window as any).ReactNativeWebView) {
        (window as any).ReactNativeWebView.postMessage(JSON.stringify({
            type: 'SHOW_NOTIFICATION',
            title,
            message,
        }));
    }

    // Also show toast
    toast(title, {
        description: message,
        action: {
            label: "View",
            onClick: () => console.log("Notification clicked"),
        },
    });
};
