import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Package, Heart, LogOut, ChevronRight, Download, Filter, SortAsc, Shield, Settings, Truck, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  shipped: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const PAYMENT_ICONS: Record<string, string> = {
  online: "💳",
  cod: "💵",
  upi: "📱",
  card: "💳",
};

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "profile">("orders");
  const [sortOrder, setSortOrder] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPayment, setFilterPayment] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    setLoading(true);
    const [ordersRes, profileRes] = await Promise.all([
      supabase.from("orders").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
    ]);
    setOrders(ordersRes.data || []);
    setProfile(profileRes.data);
    setLoading(false);
  };

  const downloadCSV = () => {
    const headers = ["Order ID", "Date", "Amount", "Status", "Payment Mode"];
    const rows = filteredOrders.map(o => [
      o.id.slice(0, 8).toUpperCase(),
      new Date(o.created_at).toLocaleDateString("en-IN"),
      `₹${o.total_amount}`,
      o.status,
      o.payment_mode,
    ]);
    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my_transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded CSV!");
  };

  const getOrderStatusProgress = (status: string) => {
    switch (status) {
      case "pending": return 10;
      case "confirmed": return 40;
      case "shipped": return 70;
      case "delivered": return 100;
      default: return 0;
    }
  };

  const downloadReceipt = (order: any) => {
    const receiptContent = `
      RECEIPT - SHOP SMART STYLE SYNC
      Order ID: ${order.id.toUpperCase()}
      Date: ${new Date(order.created_at).toLocaleString()}
      
      Customer Details:
      ${order.shipping_address?.name}
      ${order.shipping_address?.mobile}
      
      Items:
      ${order.items.map((i: any) => `- ${i.products?.name} (Qty: ${i.quantity}): ₹${(i.products?.price * i.quantity).toLocaleString()}`).join("\n")}
      
      Total Amount: ₹${order.total_amount.toLocaleString()}
      Payment Mode: ${order.payment_mode.toUpperCase()}
      Payment Status: ${order.payment_status.toUpperCase()}
      
      Thank you for shopping with us!
    `;
    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt_${order.id.slice(0, 8)}.txt`;
    a.click();
    toast.success("Receipt downloaded!");
  };

  const filteredOrders = orders
    .filter(o => {
      const statusMatch = filterStatus === "all" ? true : o.status === filterStatus;
      const paymentMatch = filterPayment === "all" ? true : o.payment_mode === filterPayment;

      let dateMatch = true;
      if (dateFilter !== "all") {
        const orderDate = new Date(o.created_at);
        const now = new Date();
        if (dateFilter === "last30") {
          dateMatch = (now.getTime() - orderDate.getTime()) <= 30 * 24 * 60 * 60 * 1000;
        } else if (dateFilter === "last6months") {
          dateMatch = (now.getTime() - orderDate.getTime()) <= 180 * 24 * 60 * 60 * 1000;
        }
      }
      return statusMatch && paymentMatch && dateMatch;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortOrder === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortOrder === "highest") return b.total_amount - a.total_amount;
      if (sortOrder === "lowest") return a.total_amount - b.total_amount;
      return 0;
    });

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="md:w-64 shrink-0">
            <div className="bg-card rounded-2xl shadow-card overflow-hidden sticky top-24">
              <div className="gradient-brand p-6 text-primary-foreground">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mb-3">
                  <User className="w-7 h-7" />
                </div>
                <p className="font-brand text-xl font-bold">{profile?.full_name || "User"}</p>
                <p className="text-white/80 text-sm font-body mt-0.5">{user.email}</p>
              </div>

              <nav className="p-3 font-body">
                <button
                  onClick={() => { setActiveTab("orders"); setSelectedOrder(null); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all mb-1
                    ${activeTab === "orders" ? "bg-primary text-primary-foreground font-semibold shadow-md" : "text-foreground hover:bg-secondary"}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4" />
                    My Orders
                  </div>
                  <Badge variant={activeTab === "orders" ? "secondary" : "outline"} className="text-[10px]">{orders.length}</Badge>
                </button>

                <button
                  onClick={() => navigate("/wishlist")}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-secondary transition-all mb-1"
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className="w-4 h-4" />
                    My Wishlist
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
                </button>

                <Separator className="my-2" />

                <button onClick={toggleTheme} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-secondary transition-colors mb-1">
                  <div className="flex items-center gap-2.5"><Settings className="w-4 h-4" />Theme</div>
                  <span className="text-xs text-muted-foreground capitalize">{theme}</span>
                </button>

                <button onClick={() => signOut().then(() => navigate("/"))} className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="w-4 h-4" />Sign Out
                </button>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 space-y-4">
            {selectedOrder ? (
              <div className="bg-card rounded-2xl shadow-card animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setSelectedOrder(null)} className="rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <div>
                    <h2 className="font-brand text-lg font-bold">Order Details</h2>
                    <p className="text-xs text-muted-foreground">#{selectedOrder.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                </div>

                <div className="p-6 space-y-8">
                  {/* Tracking Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                      <Truck className="w-4 h-4" /> Tracking Status
                    </h3>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div>
                          <Badge className={`${STATUS_COLORS[selectedOrder.status]} capitalize`}>{selectedOrder.status}</Badge>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-primary">
                            {getOrderStatusProgress(selectedOrder.status)}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-secondary">
                        <div style={{ width: `${getOrderStatusProgress(selectedOrder.status)}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center gradient-brand transition-all duration-1000"></div>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase px-1">
                        <span>Placed</span>
                        <span className={getOrderStatusProgress(selectedOrder.status) >= 40 ? "text-primary" : ""}>Confirmed</span>
                        <span className={getOrderStatusProgress(selectedOrder.status) >= 70 ? "text-primary" : ""}>Shipped</span>
                        <span className={getOrderStatusProgress(selectedOrder.status) >= 100 ? "text-success" : ""}>Delivered</span>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Items Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Items in Order</h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item: any, i: number) => (
                        <div key={i} className="flex gap-4">
                          <img src={item.products?.images?.[0]} className="w-16 h-20 object-cover rounded-lg bg-secondary" alt="" />
                          <div className="flex-1">
                            <p className="text-sm font-bold">{item.products?.brand}</p>
                            <p className="text-sm text-muted-foreground line-clamp-1">{item.products?.name}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>Qty: {item.quantity}</span>
                              {item.size && <span>Size: {item.size}</span>}
                            </div>
                            <p className="text-sm font-bold mt-1">₹{(item.products?.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Payment & Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Shipping Address</h3>
                      <div className="text-sm space-y-1 font-body">
                        <p className="font-bold">{selectedOrder.shipping_address?.name}</p>
                        <p className="text-muted-foreground">{selectedOrder.shipping_address?.address}</p>
                        <p className="text-muted-foreground">{selectedOrder.shipping_address?.locality}, {selectedOrder.shipping_address?.city}</p>
                        <p className="text-muted-foreground">{selectedOrder.shipping_address?.state} - {selectedOrder.shipping_address?.pincode}</p>
                        <p className="font-semibold mt-2">📞 {selectedOrder.shipping_address?.mobile}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Payment Information</h3>
                      <div className="bg-secondary/30 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Mode</span>
                          <span className="font-bold flex items-center gap-1.5 capitalize">
                            {PAYMENT_ICONS[selectedOrder.payment_mode]} {selectedOrder.payment_mode}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Status</span>
                          <Badge variant="outline" className={selectedOrder.payment_status === "paid" ? "text-success border-success/30" : ""}>
                            {selectedOrder.payment_status}
                          </Badge>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold">
                          <span>Total Paid</span>
                          <span className="text-primary text-lg">₹{selectedOrder.total_amount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-2xl shadow-card overflow-hidden">
                <div className="p-5 border-b border-border bg-secondary/20">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div>
                      <h2 className="font-brand text-xl font-bold">My Transactions</h2>
                      <p className="text-xs text-muted-foreground font-body mt-0.5">Detailed history of all your payments</p>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={downloadCSV} variant="outline" size="sm" className="rounded-full shadow-sm" disabled={filteredOrders.length === 0}>
                        <Download className="w-4 h-4 mr-2" /> Export CSV
                      </Button>
                    </div>
                  </div>

                  {/* Enhanced Filters */}
                  <div className="flex gap-2 mt-4 flex-wrap">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-32 h-8 text-[11px] rounded-full font-body">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterPayment} onValueChange={setFilterPayment}>
                      <SelectTrigger className="w-32 h-8 text-[11px] rounded-full font-body">
                        <SelectValue placeholder="Payment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Modes</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="cod">COD</SelectItem>
                        <SelectItem value="refund">Refund</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="w-32 h-8 text-[11px] rounded-full font-body">
                        <SelectValue placeholder="Date Range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Any Time</SelectItem>
                        <SelectItem value="last30">Last 30 Days</SelectItem>
                        <SelectItem value="last6months">Last 6 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {loading ? (
                  <div className="p-6 space-y-4">
                    {[...Array(3)].map((_, i) => <div key={i} className="shimmer h-24 rounded-2xl" />)}
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="p-12 text-center">
                    <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-10 h-10 text-muted-foreground opacity-40" />
                    </div>
                    <h3 className="font-brand text-lg font-bold">No orders yet</h3>
                    <p className="text-sm text-muted-foreground mb-6">Looks like you haven't shopped anything yet.</p>
                    <Button onClick={() => navigate("/products")} className="gradient-brand border-0 rounded-full px-8">Shop Now</Button>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {filteredOrders.map(order => (
                      <div key={order.id} className="p-5 hover:bg-secondary/30 transition-all group cursor-pointer" onClick={() => setSelectedOrder(order)}>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-16 bg-secondary rounded-lg overflow-hidden shrink-0 border border-border">
                            {order.items?.[0]?.products?.images?.[0] ? (
                              <img src={order.items[0].products.images[0]} className="w-full h-full object-cover" alt="" />
                            ) : <Package className="w-full h-full p-3 text-muted-foreground opacity-50" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs font-bold text-muted-foreground uppercase">Order #{order.id.slice(0, 8)}</p>
                                <p className="text-sm font-semibold mt-0.5 capitalize flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full ${order.status === 'delivered' ? 'bg-success' : 'bg-warning animate-pulse'}`} />
                                  {order.status}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-foreground">₹{Number(order.total_amount).toLocaleString()}</p>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{new Date(order.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-3">
                              <p className="text-xs text-muted-foreground line-clamp-1 italic">
                                {order.items.length > 1 ? `${order.items[0].products?.name} + ${order.items.length - 1} more items` : order.items[0].products?.name}
                              </p>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-[10px] text-primary hover:text-primary hover:bg-primary/10 font-bold"
                                  onClick={(e) => { e.stopPropagation(); downloadReceipt(order); }}
                                >
                                  Receipt
                                </Button>
                                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
