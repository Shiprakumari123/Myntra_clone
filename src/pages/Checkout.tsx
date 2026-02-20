import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Home, CreditCard, Wallet, Truck, CheckCircle2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { pushNotification } from "@/components/NotificationCenter";

export default function Checkout() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { cartItems, cartTotal, clearCart } = useCart();
    const [step, setStep] = useState<"address" | "payment" | "success">("address");
    const [loading, setLoading] = useState(false);

    const [address, setAddress] = useState({
        name: "",
        mobile: "",
        pincode: "",
        locality: "",
        address: "",
        city: "",
        state: "",
    });

    const [paymentMode, setPaymentMode] = useState("online");

    const activeItems = cartItems.filter(i => !i.saved_for_later);
    const deliveryCharge = cartTotal >= 999 ? 0 : 49;
    const totalPayable = cartTotal + deliveryCharge;

    const handleAddressSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!address.name || !address.mobile || !address.pincode || !address.address) {
            toast.error("Please fill all required fields");
            return;
        }
        setStep("payment");
    };

    const handlePlaceOrder = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from("orders")
                .insert({
                    user_id: user.id,
                    items: activeItems as any,
                    total_amount: totalPayable,
                    payment_mode: paymentMode,
                    payment_status: paymentMode === "online" ? "paid" : "pending",
                    status: "pending",
                    shipping_address: address as any,
                } as any)
                .select()
                .single();

            if (error) throw error;

            await clearCart();
            setStep("success");
            toast.success("Order placed successfully!");

            // Trigger proper notification
            pushNotification(
                "Order Placed! 🛍️",
                `Your order #${data.id.slice(0, 8).toUpperCase()} has been placed successfully and is pending confirmation.`,
                "order"
            );
        } catch (error: any) {
            console.error("Error placing order:", error);
            toast.error(error.message || "Failed to place order");
        } finally {
            setLoading(false);
        }
    };

    if (activeItems.length === 0 && step !== "success") {
        navigate("/cart");
        return null;
    }

    if (step === "success") {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <CheckCircle2 className="w-20 h-20 text-success mb-6 animate-bounce" />
                <h1 className="font-brand text-3xl font-bold mb-2">Order Confirmed!</h1>
                <p className="text-muted-foreground font-body text-center mb-8 max-w-sm">
                    Your order has been placed successfully. You can track your order status in the profile section.
                </p>
                <div className="flex gap-4">
                    <Button onClick={() => navigate("/profile")} className="gradient-brand text-primary-foreground border-0 font-body">
                        View Order
                    </Button>
                    <Button onClick={() => navigate("/")} variant="outline" className="font-body">
                        Continue Shopping
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Progress Tracker */}
                <div className="flex items-center justify-center mb-10">
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === "address" ? "gradient-brand text-white" : "bg-success text-white"}`}>
                            {step === "address" ? "1" : <CheckCircle2 className="w-5 h-5" />}
                        </div>
                        <span className={`text-sm font-semibold ${step === "address" ? "text-primary" : "text-muted-foreground"}`}>Address</span>
                    </div>
                    <div className="w-16 h-[2px] bg-border mx-2" />
                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${step === "payment" ? "gradient-brand text-white" : "bg-secondary text-muted-foreground"}`}>
                            2
                        </div>
                        <span className={`text-sm font-semibold ${step === "payment" ? "text-primary" : "text-muted-foreground"}`}>Payment</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="md:col-span-2">
                        {step === "address" ? (
                            <div className="bg-card rounded-2xl shadow-card p-6">
                                <h2 className="font-brand text-xl font-bold mb-6 flex items-center gap-2">
                                    <Home className="w-5 h-5 text-primary" /> Delivery Address
                                </h2>
                                <form onSubmit={handleAddressSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="name">Full Name*</Label>
                                            <Input
                                                id="name"
                                                placeholder="Contact Name"
                                                value={address.name}
                                                onChange={e => setAddress(prev => ({ ...prev, name: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="mobile">Mobile Number*</Label>
                                            <Input
                                                id="mobile"
                                                placeholder="10-digit mobile number"
                                                value={address.mobile}
                                                onChange={e => setAddress(prev => ({ ...prev, mobile: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="pincode">Pincode*</Label>
                                            <Input
                                                id="pincode"
                                                placeholder="6-digit pincode"
                                                value={address.pincode}
                                                onChange={e => setAddress(prev => ({ ...prev, pincode: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="locality">Locality/Town</Label>
                                            <Input
                                                id="locality"
                                                placeholder="Locality"
                                                value={address.locality}
                                                onChange={e => setAddress(prev => ({ ...prev, locality: e.target.value }))}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="address">Address (House No, Building, Street)*</Label>
                                        <Input
                                            id="address"
                                            placeholder="Address"
                                            value={address.address}
                                            onChange={e => setAddress(prev => ({ ...prev, address: e.target.value }))}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="city">City/District*</Label>
                                            <Input
                                                id="city"
                                                placeholder="City"
                                                value={address.city}
                                                onChange={e => setAddress(prev => ({ ...prev, city: e.target.value }))}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="state">State*</Label>
                                            <Input
                                                id="state"
                                                placeholder="State"
                                                value={address.state}
                                                onChange={e => setAddress(prev => ({ ...prev, state: e.target.value }))}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full gradient-brand text-primary-foreground border-0 font-bold h-12 mt-4">
                                        DELIVER TO THIS ADDRESS
                                    </Button>
                                </form>
                            </div>
                        ) : (
                            <div className="bg-card rounded-2xl shadow-card p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="font-brand text-xl font-bold flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-primary" /> Choose Payment Mode
                                    </h2>
                                    <Button variant="ghost" size="sm" onClick={() => setStep("address")} className="text-primary hover:text-primary/80">
                                        Change Address
                                    </Button>
                                </div>

                                <div className="mb-6 p-4 bg-secondary/50 rounded-xl border border-dashed border-border">
                                    <p className="text-xs font-bold text-muted-foreground uppercase mb-2 flex items-center gap-1.5">
                                        <Truck className="w-3.5 h-3.5" /> Delivering to:
                                    </p>
                                    <p className="text-sm font-semibold">{address.name} | {address.mobile}</p>
                                    <p className="text-sm text-muted-foreground">{address.address}, {address.locality}, {address.city}, {address.state} - {address.pincode}</p>
                                </div>

                                <RadioGroup value={paymentMode} onValueChange={setPaymentMode} className="space-y-3">
                                    <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMode === "online" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-border/80"}`} onClick={() => setPaymentMode("online")}>
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem value="online" id="online" />
                                            <div>
                                                <Label htmlFor="online" className="font-bold text-base cursor-pointer">PhonePe / Google Pay / Cards</Label>
                                                <p className="text-xs text-muted-foreground">Faster & Secure online payment</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 grayscale group-checked:grayscale-0 opacity-50">
                                            <CreditCard className="w-5 h-5" />
                                            <Wallet className="w-5 h-5" />
                                        </div>
                                    </div>

                                    <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all cursor-pointer ${paymentMode === "cod" ? "border-primary bg-primary/5 shadow-sm" : "border-border hover:border-border/80"}`} onClick={() => setPaymentMode("cod")}>
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem value="cod" id="cod" />
                                            <div>
                                                <Label htmlFor="cod" className="font-bold text-base cursor-pointer">Cash on Delivery (COD)</Label>
                                                <p className="text-xs text-muted-foreground">Pay when you receive the order</p>
                                            </div>
                                        </div>
                                        <span className="text-2xl">💵</span>
                                    </div>
                                </RadioGroup>

                                <Button
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    className="w-full gradient-brand text-primary-foreground border-0 font-bold h-12 mt-8"
                                >
                                    {loading ? "PLACING ORDER..." : "PAY & PLACE ORDER"}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Price Details Side Panel */}
                    <div className="space-y-4">
                        <div className="bg-card rounded-2xl shadow-card p-5 font-body">
                            <h3 className="font-brand text-base font-bold mb-4 uppercase text-muted-foreground">Price Details ({activeItems.length} Items)</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total MRP</span>
                                    <span className="text-foreground">₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Delivery Fee</span>
                                    <span className={deliveryCharge === 0 ? "text-success font-bold" : "text-foreground"}>
                                        {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-base font-bold pt-1">
                                    <span>Total Amount</span>
                                    <span>₹{totalPayable.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-success/5 border border-success/20 rounded-2xl p-4 flex gap-3">
                            <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                            <p className="text-xs text-success-foreground font-semibold">
                                You are eligible for FREE Delivery on this order. 100% Secure Payments.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
