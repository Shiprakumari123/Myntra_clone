import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube, ShieldCheck, RefreshCw, Smartphone } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
    const sections = [
        {
            title: "ONLINE SHOPPING",
            links: [
                { label: "Men", path: "/products?category=Men" },
                { label: "Women", path: "/products?category=Women" },
                { label: "Kids", path: "/products?category=Kids" },
                { label: "Beauty", path: "/products?category=Beauty" },
                { label: "Gift Cards", path: "#" },
            ]
        },
        {
            title: "USEFUL LINKS",
            links: [
                { label: "Contact Us", path: "#" },
                { label: "FAQ", path: "#" },
                { label: "T&C", path: "#" },
                { label: "Terms Of Use", path: "#" },
                { label: "Track Orders", path: "/profile" },
                { label: "Shipping", path: "#" },
                { label: "Cancellation", path: "#" },
                { label: "Returns", path: "#" },
            ]
        }
    ];

    return (
        <footer className="bg-white dark:bg-zinc-950 border-t border-border pt-12 pb-8 font-body mt-auto">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                    {/* Categories & Links */}
                    {sections.map(section => (
                        <div key={section.title}>
                            <h4 className="text-xs font-bold text-foreground mb-4 tracking-wider">{section.title}</h4>
                            <ul className="space-y-2">
                                {section.links.map(link => (
                                    <li key={link.label}>
                                        <Link to={link.path} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Apps & Social */}
                    <div>
                        <h4 className="text-xs font-bold text-foreground mb-4 tracking-wider">EXPERIENCE OUR APP ON MOBILE</h4>
                        <div className="flex gap-3 mb-6">
                            <a href="#" className="hover:opacity-80 transition-opacity">
                                <img src="https://constant.myntassets.com/web/assets/img/80c4da79-6641-47ad-9fab-6331fa7088f31539674178615-google_play.png" alt="Google Play" className="h-10" />
                            </a>
                            <a href="#" className="hover:opacity-80 transition-opacity">
                                <img src="https://constant.myntassets.com/web/assets/img/bc5e1ad5-3c00-4410-b391-0361304535da1539674178601-apple_store.png" alt="App Store" className="h-10" />
                            </a>
                        </div>

                        <h4 className="text-xs font-bold text-foreground mb-4 tracking-wider uppercase">Keep in touch</h4>
                        <div className="flex gap-4">
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Facebook className="w-5 h-5" /></a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Twitter className="w-5 h-5" /></a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Youtube className="w-5 h-5" /></a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors"><Instagram className="w-5 h-5" /></a>
                        </div>
                    </div>

                    {/* Policies */}
                    <div className="space-y-6">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 gradient-subtle rounded-lg flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">100% ORIGINAL</p>
                                <p className="text-xs text-muted-foreground mt-0.5">guarantee for all products on myntra.com</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 gradient-subtle rounded-lg flex items-center justify-center shrink-0">
                                <RefreshCw className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">Return within 30days</p>
                                <p className="text-xs text-muted-foreground mt-0.5">of receiving your order</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="bg-border/50 mb-8" />

                {/* Popular Searches */}
                <div className="mb-10">
                    <h4 className="text-xs font-bold text-foreground mb-3 tracking-wider uppercase">Popular Searches</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        Makeup | Dresses For Girls | T-Shirts | Sandals | Shoes | Headphones | Babydolls | Blazers For Men | Ladies Watches | Bags | Sport Shoes | Reebok Shoes | Puma Shoes | Boxers | Wallets | Tops | Earrings | Fastrack Watches | Kurtis | Nike | Smart Watches | Titan Watches | Designer Saree | Adidas Shoes | Sunglasses | Ray Ban | Palazzo | Levi's Jeans | Louis Philippe | Puma Tshirts | Biba | Fossil Watches
                    </p>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground font-semibold">
                    <p>© 2025 www.myntra.com. All rights reserved.</p>
                    <div className="flex gap-4">
                        <Link to="/profile" className="hover:text-foreground">Track Order</Link>
                        <Link to="#" className="hover:text-foreground">Privacy Policy</Link>
                        <Link to="#" className="hover:text-foreground">Terms of Use</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
