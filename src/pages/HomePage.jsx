import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  Phone,
  ArrowRight,
  Briefcase,
  Star,
  Calendar,
  MapPin,
  Check,
  ChevronDown,
  Sparkles,
  Search,
  Building2,
  Wrench,
  Paintbrush,
  Hammer,
  Clock,
  Layers,
  Heart,
  User,
  ChevronUp,
  Menu,
  X,
  Send,
  FileText,
  Truck,
  Cpu,
  Lock,
  Compass,
  CheckCircle2,
  Award,
  Users
} from "lucide-react";
import "../landing.css";

export default function HomePage({ lang = "en" }) {
  const navigate = useNavigate();

  // Navigation & Scroll State
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [activeStep, setActiveStep] = useState(1);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const isEn = lang === "en";

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (window.scrollY > 400) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // 8 Service Categories matching reference screenshots
  const allServices = [
    {
      id: "plumbing",
      category: "repair",
      title: "Plumbing",
      desc: "Expert pipe fittings, water leak fixes, sanitary installations, and tap...",
      icon: Wrench,
      img: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=85",
      tags: ["Pipe Leak Repair", "Bathroom Fitting"],
    },
    {
      id: "electrical",
      category: "repair",
      title: "Electrical Services",
      desc: "Certified electricians for short circuits, switchboards, MCB panels, wiring, and f...",
      icon: Zap,
      img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=85",
      tags: ["MCB Tripping Fix", "Switchboard Repair"],
    },
    {
      id: "carpentry",
      category: "repair",
      title: "Carpentry & Woodwork",
      desc: "Custom furniture assembly, door locks, modular cabinets, hinge repairs, and...",
      icon: Hammer,
      img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=85",
      tags: ["Door Lock Fitting", "Cabinet Hinges"],
    },
    {
      id: "cleaning",
      category: "care",
      title: "Home Cleaning",
      desc: "Deep home sanitization, kitchen chimney degreasing, bathroom scrubbing, and so...",
      icon: Sparkles,
      img: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=85",
      tags: ["Deep Home Cleaning", "Kitchen Degreasing"],
    },
    {
      id: "painting",
      category: "care",
      title: "Painting & Interiors",
      desc: "Waterproofing, interior wall repaints, stencil artistry, texture coating, and...",
      icon: Paintbrush,
      img: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=85",
      tags: ["Wall Touch-ups", "Waterproof Primer"],
    },
    {
      id: "appliance",
      category: "repair",
      title: "Appliance Repair",
      desc: "Fast diagnosis and genuine spares for washing machines, refrigerators,...",
      icon: Cpu,
      img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=85",
      tags: ["Washing Machine Drain Fix", "AC Gas Refill"],
    },
    {
      id: "moving",
      category: "care",
      title: "Moving & Delivery",
      desc: "Careful household shifting, bubble wrapping, heavy appliance transport, an...",
      icon: Truck,
      img: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=85",
      tags: ["Apartment Shifting", "Heavy Furniture Move"],
    },
    {
      id: "business",
      category: "care",
      title: "Business & Daily Services",
      desc: "Commercial facility maintenance, IT cable management, shopfront electricals, and...",
      icon: Briefcase,
      img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=85",
      tags: ["Retail Electric Audit", "Office Server Cable Rack"],
    },
  ];

  const filteredServices = allServices.filter((s) => {
    if (activeCategoryFilter === "all") return true;
    if (activeCategoryFilter === "repairs") return s.category === "repair";
    if (activeCategoryFilter === "care") return s.category === "care";
    return true;
  });

  const cityOptions = ["All Cities", "Guntur", "Vijayawada", "Tenali", "Mangalagiri", "Amaravati", "Hyderabad"];

  return (
    <div className="landing-page-root">
      {/* =========================================================================
          1. STICKY NAVIGATION BAR
          ========================================================================= */}
      <header className={`landing-navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="landing-container landing-nav-inner">
          {/* Brand Logo */}
          <div className="landing-brand" onClick={() => scrollToSection("hero")}>
            <div className="landing-brand-icon">
              <Sparkles size={20} />
            </div>
            <span className="landing-brand-title">WorkSphere AI</span>
            <span className="landing-brand-badge">Professional</span>
          </div>

          {/* Desktop Nav Links */}
          <nav className="landing-nav-menu">
            <span className="landing-nav-link active" onClick={() => scrollToSection("hero")}>
              Home
            </span>
            <span className="landing-nav-link" onClick={() => scrollToSection("services")}>
              Explore Services
            </span>
            <span className="landing-nav-link" onClick={() => scrollToSection("how-it-works")}>
              How It Works
            </span>
            <span className="landing-nav-link" onClick={() => scrollToSection("for-workers")}>
              For Workers
            </span>
            <span className="landing-nav-link" onClick={() => scrollToSection("about-us")}>
              About Us
            </span>
          </nav>

          {/* Nav Actions */}
          <div className="landing-nav-actions">
            {/* City Dropdown */}
            <div style={{ position: "relative" }}>
              <button
                className="landing-city-dropdown"
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
              >
                <MapPin size={14} color="#D6B779" />
                <span>{selectedCity}</span>
                <ChevronDown size={14} />
              </button>

              {cityDropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    right: 0,
                    background: "#142D27",
                    border: "1px solid rgba(255, 255, 255, 0.16)",
                    borderRadius: "14px",
                    padding: "8px",
                    minWidth: "160px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.4)",
                    zIndex: 120,
                  }}
                >
                  {cityOptions.map((c) => (
                    <div
                      key={c}
                      onClick={() => {
                        setSelectedCity(c);
                        setCityDropdownOpen(false);
                      }}
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        color: selectedCity === c ? "#D6B779" : "#FFFFFF",
                        fontWeight: selectedCity === c ? "700" : "500",
                        cursor: "pointer",
                        background: selectedCity === c ? "rgba(255,255,255,0.06)" : "transparent",
                      }}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Log In Button */}
            <button
              className="landing-login-btn"
              onClick={() => navigate("/login")}
              id="header-sign-in-btn"
            >
              <User size={16} />
              <span>Log In</span>
            </button>

            {/* Get Started Button */}
            <button
              className="landing-btn-gold"
              onClick={() => navigate("/login")}
              id="header-get-started-btn"
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              className="landing-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                background: "#142D27",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                padding: "1.5rem",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <span className="landing-nav-link" onClick={() => scrollToSection("hero")}>Home</span>
                <span className="landing-nav-link" onClick={() => scrollToSection("services")}>Explore Services</span>
                <span className="landing-nav-link" onClick={() => scrollToSection("how-it-works")}>How It Works</span>
                <span className="landing-nav-link" onClick={() => scrollToSection("for-workers")}>For Workers</span>
                <span className="landing-nav-link" onClick={() => scrollToSection("about-us")}>About Us</span>
                <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
                  <button
                    className="landing-btn-outline"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/login");
                    }}
                  >
                    Log In
                  </button>
                  <button
                    className="landing-btn-gold"
                    style={{ flex: 1 }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate("/login");
                    }}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* =========================================================================
          2. CINEMATIC HERO SECTION (Matches Reference Image 1 Pixel-for-Pixel)
          ========================================================================= */}
      <section id="hero" className="landing-hero">
        <div className="landing-container">
          <div className="landing-hero-grid">
            {/* Left Content Column */}
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="landing-hero-badge">
                <span className="landing-hero-badge-dot" />
                <span>WorkSphere AI</span>
                <span className="landing-hero-badge-divider">|</span>
                <span style={{ color: "#D0DCD4" }}>VERIFIED LOCAL MARKETPLACE</span>
              </div>

              <h1 className="landing-hero-headline">
                Your Next Trusted
                <br />
                Professional Is
                <br />
                <span className="landing-gold-highlight">One Click Away.</span>
              </h1>

              <p className="landing-hero-sub">
                Discover skilled local professionals, connect with the right people,
                and make everyday service bookings simpler with WorkSphere AI.
              </p>

              <div className="landing-hero-buttons">
                <button
                  className="landing-btn-gold"
                  onClick={() => scrollToSection("services")}
                >
                  <span>Find a Worker</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  className="landing-btn-outline"
                  onClick={() => navigate("/worker/register")}
                >
                  <span>Join as a Professional</span>
                </button>
              </div>
            </motion.div>

            {/* Right Photo Collage Card (Matches Reference Screenshot 1) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="hero-collage-card">
                {/* Floating Top Badge: Verified Professional */}
                <div className="hero-floating-badge-top">
                  <div className="hero-floating-icon-wrap">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: "800", color: "#FFFFFF" }}>
                        Verified Professional
                      </span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#D0DCD4" }}>Police & Skill Verified</div>
                  </div>
                </div>

                {/* Collage Grid: 1 Tall Left + 2 Stacked Right */}
                <div className="hero-collage-grid">
                  {/* Left Tall Panel: Master Electrician */}
                  <div className="hero-collage-left-tall">
                    <img
                      src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=85"
                      alt="Master Electrician Rajesh Sharma"
                    />
                    <div className="hero-panel-caption">
                      <div className="hero-panel-role">MASTER ELECTRICIAN</div>
                      <div className="hero-panel-name">Rajesh Sharma · 12 yrs exp</div>
                    </div>
                  </div>

                  {/* Right Stack: Custom Woodwork (Top) + Plumbing Specialist (Bottom) */}
                  <div className="hero-collage-right-stack">
                    {/* Top: Custom Teak Woodwork */}
                    <div className="hero-collage-thumb">
                      <img
                        src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=85"
                        alt="Custom Teak Woodwork Harpreet Singh"
                      />
                      <div className="hero-panel-caption">
                        <div className="hero-panel-role">CUSTOM TEAK WOODWORK</div>
                        <div className="hero-panel-name">Harpreet Singh</div>
                      </div>
                    </div>

                    {/* Bottom: Plumbing Specialist */}
                    <div className="hero-collage-thumb">
                      <img
                        src="https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=85"
                        alt="Plumbing Specialist Anand Verma"
                      />
                      <div className="hero-panel-caption">
                        <div className="hero-panel-role">PLUMBING SPECIALIST</div>
                        <div className="hero-panel-name">Anand Verma</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Consultation Banner */}
                <div className="hero-collage-banner">
                  <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: "1px solid #D6B779", display: "grid", placeItems: "center", color: "#D6B779", flexShrink: 0 }}>
                    <Check size={13} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#FFFFFF" }}>
                      Customer Consultation & Transparent Handover
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#D0DCD4" }}>
                      Upfront quotes with no hidden charges
                    </div>
                  </div>
                </div>

                {/* Floating Bottom Badge: Quick Booking */}
                <div className="hero-floating-badge-bottom">
                  <div className="hero-floating-icon-wrap" style={{ background: "rgba(214, 183, 121, 0.15)" }}>
                    <Calendar size={16} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "#FFFFFF" }}>
                        Quick Booking
                      </span>
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#D6B779" }}>Slot Confirmed in 60s</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. OVERLAPPING 4-METRIC STATS BAR (Matches Screenshot 2 & 3)
          ========================================================================= */}
      <div className="landing-stats-overlap">
        <div className="landing-container">
          <motion.div
            className="landing-stats-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <div className="landing-stats-row">
              {/* Stat 1 */}
              <div className="landing-stat-item">
                <div className="landing-stat-icon-wrap">
                  <Layers size={22} />
                </div>
                <div>
                  <div className="landing-stat-num">50+ Trades</div>
                  <div className="landing-stat-label">Service Categories</div>
                  <div className="landing-stat-desc">From wiring to plumbing & bespoke woodwork</div>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="landing-stat-item">
                <div className="landing-stat-icon-wrap">
                  <Calendar size={22} />
                </div>
                <div>
                  <div className="landing-stat-num">Instant Slots</div>
                  <div className="landing-stat-label">Easy Booking</div>
                  <div className="landing-stat-desc">Simple 3-step scheduling process</div>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="landing-stat-item">
                <div className="landing-stat-icon-wrap">
                  <MapPin size={22} />
                </div>
                <div>
                  <div className="landing-stat-num">12+ Metros</div>
                  <div className="landing-stat-label">Local Connections</div>
                  <div className="landing-stat-desc">Hyper-local neighborhood coverage across India</div>
                </div>
              </div>

              {/* Stat 4 */}
              <div className="landing-stat-item">
                <div className="landing-stat-icon-wrap">
                  <Heart size={22} />
                </div>
                <div>
                  <div className="landing-stat-num">Fair Pricing</div>
                  <div className="landing-stat-label">Customer-First Trust</div>
                  <div className="landing-stat-desc">Transparent quotes & direct coordination</div>
                </div>
              </div>
            </div>

            {/* Sub-bar */}
            <div className="landing-stats-subbar">
              <span>Verified Local Professionals & Biometric Background Audits</span>
              <span className="landing-stats-subbar-right">Real-time technician availability sync active</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* =========================================================================
          4. SERVICE CATEGORY DIRECTORY (8 Cards Matching Screenshot 2 & 4)
          ========================================================================= */}
      <section id="services" className="landing-section landing-section-ivory">
        <div className="landing-container">
          <div className="landing-section-header">
            <div>
              <div className="landing-eyebrow">
                <span>• SERVICE CATEGORY DIRECTORY</span>
              </div>
              <h2 className="landing-section-title">
                Everyday Problems. <u>Skilled</u> Solutions.
              </h2>
              <p className="landing-section-sub">
                Discover professionals for the jobs that matter most.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="landing-filter-pills">
              <button
                className={`landing-filter-btn ${activeCategoryFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveCategoryFilter("all")}
              >
                All 8 Services
              </button>
              <button
                className={`landing-filter-btn ${activeCategoryFilter === "repairs" ? "active" : ""}`}
                onClick={() => setActiveCategoryFilter("repairs")}
              >
                Home Repairs
              </button>
              <button
                className={`landing-filter-btn ${activeCategoryFilter === "care" ? "active" : ""}`}
                onClick={() => setActiveCategoryFilter("care")}
              >
                Upgrades & Care
              </button>
            </div>
          </div>

          {/* 8 Cards Grid */}
          <div className="landing-services-grid">
            {filteredServices.map((service, index) => {
              const ServiceIcon = service.icon;
              return (
                <motion.div
                  key={service.id}
                  className="service-card"
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  onClick={() => setShowLoginModal(true)}
                >
                  <div className="service-card-image-wrap">
                    <img src={service.img} alt={service.title} loading="lazy" />
                    <div className="service-card-icon-badge">
                      <ServiceIcon size={17} />
                    </div>
                  </div>

                  <h3 className="service-card-title">{service.title}</h3>
                  <p className="service-card-desc">{service.desc}</p>

                  <div className="service-card-tags">
                    {service.tags.map((tag) => (
                      <span key={tag} className="service-tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="service-card-footer">
                    <span className="service-card-action-text">View & Book</span>
                    <div className="service-card-arrow-circle">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. HOW WORKSPHERE AI WORKS (4 Steps Matching Screenshot 5)
          ========================================================================= */}
      <section id="how-it-works" className="landing-section landing-section-sage">
        <div className="landing-container">
          <div style={{ textAlign: "center", maxWidth: "720px", margin: "0 auto 3.5rem" }}>
            <div className="landing-eyebrow" style={{ justifyContent: "center" }}>
              <span>• FOUR SIMPLE STEPS</span>
            </div>
            <h2 className="landing-section-title" style={{ textAlign: "center" }}>
              How WorkSphere AI Works
            </h2>
            <p className="landing-section-sub" style={{ margin: "0.75rem auto 0", textAlign: "center" }}>
              From first tap to completed job, experience a transparent, streamlined connection workflow
              engineered for trust and peace of mind.
            </p>
          </div>

          <div className="how-steps-grid">
            {/* Step 01 */}
            <motion.div
              className={`step-card ${activeStep === 1 ? "active" : ""}`}
              onClick={() => setActiveStep(1)}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="step-card-header">
                <span className="step-label">STEP 01</span>
                <div className="step-icon-wrap">
                  <FileText size={18} />
                </div>
              </div>
              <h3 className="step-title">Describe Your Need</h3>
              <div className="step-quote">“Tell us what needs fixing or what service you need.”</div>
              <p className="step-desc">
                Select your trade, describe the problem, and pick your preferred date and time slot.
                Our smart system scopes the job instantly.
              </p>
              <div className="step-card-footer">
                <span>Selected Step</span>
                <div style={{ color: "#347B63" }}>
                  <Check size={16} />
                </div>
              </div>
            </motion.div>

            {/* Step 02 */}
            <motion.div
              className={`step-card ${activeStep === 2 ? "active" : ""}`}
              onClick={() => setActiveStep(2)}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="step-card-header">
                <span className="step-label">STEP 02</span>
                <div className="step-icon-wrap">
                  <Search size={18} />
                </div>
              </div>
              <h3 className="step-title">Discover Professionals</h3>
              <div className="step-quote">“Explore relevant workers and compare available information.”</div>
              <p className="step-desc">
                Review transparent worker ratings, trade certifications, verified job completions,
                and hourly or fixed rates before deciding.
              </p>
              <div className="step-card-footer">
                <span>Click to inspect</span>
                <ArrowRight size={14} />
              </div>
            </motion.div>

            {/* Step 03 */}
            <motion.div
              className={`step-card ${activeStep === 3 ? "active" : ""}`}
              onClick={() => setActiveStep(3)}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="step-card-header">
                <span className="step-label">STEP 03</span>
                <div className="step-icon-wrap">
                  <Send size={18} />
                </div>
              </div>
              <h3 className="step-title">Contact or Book</h3>
              <div className="step-quote">“Choose a professional and send a booking request.”</div>
              <p className="step-desc">
                Send your request directly to available pros in your neighborhood with upfront
                price estimates and no hidden surprises.
              </p>
              <div className="step-card-footer">
                <span>Click to inspect</span>
                <ArrowRight size={14} />
              </div>
            </motion.div>

            {/* Step 04 */}
            <motion.div
              className={`step-card ${activeStep === 4 ? "active" : ""}`}
              onClick={() => setActiveStep(4)}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="step-card-header">
                <span className="step-label">STEP 04</span>
                <div className="step-icon-wrap">
                  <Clock size={18} />
                </div>
              </div>
              <h3 className="step-title">Track Your Request</h3>
              <div className="step-quote">“Follow your booking status and communicate about the job.”</div>
              <p className="step-desc">
                Monitor live request progression from confirmation to arrival, inspect work completion,
                and pay securely upon satisfaction.
              </p>
              <div className="step-card-footer">
                <span>Click to inspect</span>
                <ArrowRight size={14} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. WORKER SHOWCASE & ADVANTAGES
          ========================================================================= */}
      <section id="for-workers" className="landing-section landing-section-ivory">
        <div className="landing-container">
          <div className="worker-showcase-grid">
            {/* Left Image Showcase */}
            <motion.div
              className="worker-showcase-photo-card"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=85"
                alt="Indian skilled worker craftsman"
              />
              <div className="worker-showcase-overlay-badge">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontSize: "0.95rem", fontWeight: "800", color: "#FFFFFF" }}>
                    Dedicated Artisan Network
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "#D6B779", fontWeight: "700" }}>
                    Verified Tier 1
                  </span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "#D0DCD4" }}>
                  Direct customer bookings without middlemen cuts or arbitrary commissions.
                </div>
              </div>
            </motion.div>

            {/* Right Information */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="landing-eyebrow">
                <span>• FOR LOCAL ARTISANS & TECHNICIANS</span>
              </div>
              <h2 className="landing-section-title">
                Your Skills Deserve More Opportunities.
              </h2>
              <p className="landing-section-sub">
                Build your professional presence, connect with customers, and manage your service requests
                through one convenient, modern platform.
              </p>

              <div className="benefit-list">
                <div className="benefit-pill">
                  <Check size={16} className="benefit-pill-icon" />
                  <span>Create Professional Profile</span>
                </div>
                <div className="benefit-pill">
                  <Check size={16} className="benefit-pill-icon" />
                  <span>Showcase Skills & Portfolio</span>
                </div>
                <div className="benefit-pill">
                  <Check size={16} className="benefit-pill-icon" />
                  <span>Receive Real Booking Leads</span>
                </div>
                <div className="benefit-pill">
                  <Check size={16} className="benefit-pill-icon" />
                  <span>Set Flexible Working Slots</span>
                </div>
                <div className="benefit-pill">
                  <Check size={16} className="benefit-pill-icon" />
                  <span>Review Booking Details</span>
                </div>
                <div className="benefit-pill">
                  <Check size={16} className="benefit-pill-icon" />
                  <span>Dedicated Worker Portal</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
                <button
                  className="landing-btn-gold"
                  onClick={() => navigate("/worker/register")}
                >
                  <span>Register as Worker</span>
                  <ArrowRight size={15} />
                </button>
                <button
                  className="landing-btn-outline"
                  style={{ color: "#142D27", borderColor: "#DDE4DA", background: "#FFFFFF" }}
                  onClick={() => navigate("/worker/login")}
                >
                  <span>Worker Sign In</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. AI-POWERED PLATFORM FEATURES (Forest Green & Gold Accents)
          ========================================================================= */}
      <section className="landing-section landing-section-dark">
        <div className="landing-container">
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 3.5rem" }}>
            <div className="landing-eyebrow" style={{ justifyContent: "center", color: "#D6B779" }}>
              <span>• INTELLIGENT MATCHING</span>
            </div>
            <h2 className="landing-section-title dark" style={{ textAlign: "center" }}>
              Smarter Connections. Better Service Experiences.
            </h2>
            <p className="landing-section-sub dark" style={{ margin: "0.75rem auto 0", textAlign: "center" }}>
              Engineered with modern digital scheduling and verified artisan credentials for rapid resolutions.
            </p>
          </div>

          <div className="ai-features-grid">
            {/* Card 1 */}
            <div className="ai-feature-card">
              <div className="ai-feature-icon-wrap">
                <Compass size={22} />
              </div>
              <h3 className="ai-feature-title">Intelligent Service Discovery</h3>
              <p className="ai-feature-desc">
                Instant semantic trade detection that accurately connects specific household defects
                with certified master technicians.
              </p>
            </div>

            {/* Card 2 */}
            <div className="ai-feature-card">
              <div className="ai-feature-icon-wrap">
                <Award size={22} />
              </div>
              <h3 className="ai-feature-title">Relevant Worker Matches</h3>
              <p className="ai-feature-desc">
                Prioritizes nearby technicians based on verified experience ratings, trade specialty,
                and on-time completion records.
              </p>
            </div>

            {/* Card 3 */}
            <div className="ai-feature-card">
              <div className="ai-feature-icon-wrap">
                <MapPin size={22} />
              </div>
              <h3 className="ai-feature-title">Location-Aware Routing</h3>
              <p className="ai-feature-desc">
                Hyper-local neighborhood assignment across Guntur, Vijayawada, and Krishna districts
                ensuring minimal travel wait times.
              </p>
            </div>

            {/* Card 4 */}
            <div className="ai-feature-card">
              <div className="ai-feature-icon-wrap">
                <Calendar size={22} />
              </div>
              <h3 className="ai-feature-title">Live Booking Management</h3>
              <p className="ai-feature-desc">
                Real-time booking confirmations, instant request updates, and clear schedule
                syncing directly on your dashboard.
              </p>
            </div>

            {/* Card 5 */}
            <div className="ai-feature-card">
              <div className="ai-feature-icon-wrap">
                <ShieldCheck size={22} />
              </div>
              <h3 className="ai-feature-title">Role-Based Dashboards</h3>
              <p className="ai-feature-desc">
                Dedicated interfaces tailored specifically for Customers, Workers, and Admins
                with database-backed role permissions.
              </p>
            </div>

            {/* Card 6 */}
            <div className="ai-feature-card">
              <div className="ai-feature-icon-wrap">
                <Users size={22} />
              </div>
              <h3 className="ai-feature-title">Worker Profile Tools</h3>
              <p className="ai-feature-desc">
                Empowering technicians with self-serve availability slots, service area toggles,
                and job history inspection tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. TESTIMONIALS (Demonstration Content)
          ========================================================================= */}
      <section id="about-us" className="landing-section landing-section-sage">
        <div className="landing-container">
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 3rem" }}>
            <div className="landing-eyebrow" style={{ justifyContent: "center" }}>
              <span>• VERIFIED CUSTOMER PERSPECTIVES</span>
            </div>
            <h2 className="landing-section-title" style={{ textAlign: "center" }}>
              Better Service Starts With Clear Expectations.
            </h2>
            <p className="landing-section-sub" style={{ margin: "0.75rem auto 0", textAlign: "center" }}>
              See how everyday households and trade professionals coordinate smoothly through WorkSphere AI.
            </p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#D6B779" />
                ))}
              </div>
              <p className="testimonial-text">
                “Booking an electrician for my apartment used to take days of phone tags. With WorkSphere,
                a master electrician arrived within 2 hours with clear upfront quotes.”
              </p>
              <div className="testimonial-author">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                  alt="Ananya Sharma"
                  className="testimonial-avatar"
                />
                <div>
                  <div className="testimonial-name">Ananya Sharma</div>
                  <div className="testimonial-role">Homeowner, Guntur</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#D6B779" />
                ))}
              </div>
              <p className="testimonial-text">
                “As a carpenter with 12 years of experience, this portal has brought steady, legitimate
                leads from nearby gated communities right to my phone.”
              </p>
              <div className="testimonial-author">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                  alt="Koteswara Rao"
                  className="testimonial-avatar"
                />
                <div>
                  <div className="testimonial-name">Koteswara Rao</div>
                  <div className="testimonial-role">Woodworker & Polisher</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-rating">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#D6B779" />
                ))}
              </div>
              <p className="testimonial-text">
                “Transparent pricing and no hidden commission surprises. The booking tracking gave me
                total confidence about the technician’s arrival time.”
              </p>
              <div className="testimonial-author">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
                  alt="Venkat Reddy"
                  className="testimonial-avatar"
                />
                <div>
                  <div className="testimonial-name">Venkat Reddy</div>
                  <div className="testimonial-role">Resident, Vijayawada</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. FINAL CALL TO ACTION
          ========================================================================= */}
      <section className="landing-final-cta">
        <div className="landing-container landing-cta-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="landing-eyebrow" style={{ justifyContent: "center", color: "#D6B779" }}>
              <span>• READY TO GET STARTED?</span>
            </div>
            <h2 className="landing-cta-headline">
              Whatever the Job, Start With the Right Connection.
            </h2>
            <p className="landing-cta-sub">
              Discover skilled professionals or bring your expertise to a platform designed
              around better service experiences.
            </p>
            <div className="landing-cta-buttons">
              <button
                className="landing-btn-gold"
                style={{ padding: "12px 28px", fontSize: "1rem" }}
                onClick={() => setShowLoginModal(true)}
              >
                <span>Find a Worker</span>
                <ArrowRight size={17} />
              </button>
              <button
                className="landing-btn-outline"
                style={{ padding: "12px 28px", fontSize: "1rem" }}
                onClick={() => navigate("/worker/register")}
              >
                <span>Join as a Professional</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          10. PREMIUM FOOTER
          ========================================================================= */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-grid">
            {/* Brand Column */}
            <div>
              <div className="landing-brand" style={{ marginBottom: "1rem" }}>
                <div className="landing-brand-icon">
                  <Sparkles size={20} />
                </div>
                <span className="landing-brand-title">WorkSphere AI</span>
              </div>
              <p className="landing-footer-tagline">
                Every Skill. Every Service. One Smart Platform.
                Bridging local homes with verified skilled professionals across Andhra Pradesh.
              </p>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.08)", padding: "4px 8px", borderRadius: "6px", color: "#D6B779" }}>
                  Guntur
                </span>
                <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.08)", padding: "4px 8px", borderRadius: "6px", color: "#D6B779" }}>
                  Vijayawada
                </span>
                <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.08)", padding: "4px 8px", borderRadius: "6px", color: "#D6B779" }}>
                  Amaravati
                </span>
              </div>
            </div>

            {/* Col 1: Explore */}
            <div>
              <div className="landing-footer-col-title">Explore Services</div>
              <ul className="landing-footer-links">
                <li><span className="landing-footer-link" onClick={() => scrollToSection("services")}>Plumbing Repairs</span></li>
                <li><span className="landing-footer-link" onClick={() => scrollToSection("services")}>Electrical Diagnostics</span></li>
                <li><span className="landing-footer-link" onClick={() => scrollToSection("services")}>Custom Carpentry</span></li>
                <li><span className="landing-footer-link" onClick={() => scrollToSection("services")}>Interior Painting</span></li>
                <li><span className="landing-footer-link" onClick={() => scrollToSection("services")}>Deep Sanitization</span></li>
              </ul>
            </div>

            {/* Col 2: For Workers */}
            <div>
              <div className="landing-footer-col-title">For Workers</div>
              <ul className="landing-footer-links">
                <li><span className="landing-footer-link" onClick={() => navigate("/worker/register")}>Register as Worker</span></li>
                <li><span className="landing-footer-link" onClick={() => navigate("/worker/login")}>Worker Portal Login</span></li>
                <li><span className="landing-footer-link" onClick={() => scrollToSection("how-it-works")}>How It Works</span></li>
                <li><span className="landing-footer-link" onClick={() => navigate("/worker/dashboard")}>Worker Dashboard</span></li>
              </ul>
            </div>

            {/* Col 3: Portals */}
            <div>
              <div className="landing-footer-col-title">Account Portals</div>
              <ul className="landing-footer-links">
                <li><span className="landing-footer-link" onClick={() => navigate("/customer/login")}>Customer Sign In</span></li>
                <li><span className="landing-footer-link" onClick={() => navigate("/worker/login")}>Worker Sign In</span></li>
                <li><span className="landing-footer-link" onClick={() => navigate("/admin/login")}>Admin Portal</span></li>
                <li><span className="landing-footer-link" onClick={() => navigate("/customer/dashboard")}>Customer Dashboard</span></li>
              </ul>
            </div>

            {/* Col 4: Trust & Support */}
            <div>
              <div className="landing-footer-col-title">Trust & Help</div>
              <ul className="landing-footer-links">
                <li><span className="landing-footer-link">Biometric Auditing</span></li>
                <li><span className="landing-footer-link">Upfront Quotes</span></li>
                <li><span className="landing-footer-link">Privacy Policy</span></li>
                <li><span className="landing-footer-link">Terms of Service</span></li>
                <li><span className="landing-footer-link">Contact Support</span></li>
              </ul>
            </div>
          </div>

          <div className="landing-footer-bottom">
            <div>© {new Date().getFullYear()} WorkSphere AI Marketplace Inc. All rights reserved.</div>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <span className="landing-footer-link">Privacy</span>
              <span className="landing-footer-link">Terms</span>
              <span className="landing-footer-link">Security</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Back-to-Top Button */}
      {showBackToTop && (
        <button
          className="back-to-top-btn"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <ChevronUp size={22} />
        </button>
      )}

      {/* =========================================================================
          INTERACTIVE 3-ROLE LOGIN SELECTION MODAL
          ========================================================================= */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLoginModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(11, 34, 27, 0.78)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              zIndex: 99999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.25rem",
            }}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 25 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 25 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#FFFFFF",
                borderRadius: "24px",
                maxWidth: "1020px",
                width: "100%",
                padding: "2.5rem 2rem",
                boxShadow: "0 30px 60px -15px rgba(11, 34, 27, 0.45)",
                position: "relative",
                border: "1.5px solid rgba(214, 183, 121, 0.4)",
                maxHeight: "92vh",
                overflowY: "auto",
              }}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowLoginModal(false)}
                aria-label="Close modal"
                style={{
                  position: "absolute",
                  top: "1.25rem",
                  right: "1.25rem",
                  background: "#F1F5F9",
                  border: "none",
                  width: "38px",
                  height: "38px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#475569",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#E2E8F0";
                  e.currentTarget.style.color = "#0F172A";
                  e.currentTarget.style.transform = "rotate(90deg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#F1F5F9";
                  e.currentTarget.style.color = "#475569";
                  e.currentTarget.style.transform = "rotate(0deg)";
                }}
              >
                <X size={18} />
              </button>

              {/* Title Section */}
              <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "rgba(214, 183, 121, 0.16)",
                    color: "#9A7328",
                    padding: "5px 16px",
                    borderRadius: "9999px",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    marginBottom: "0.75rem",
                  }}
                >
                  <Sparkles size={14} color="#9A7328" />
                  <span>{isEn ? "3 DEDICATED PORTALS" : "3 ప్రత్యేక పోర్టల్స్"}</span>
                </div>
                <h2
                  style={{
                    fontSize: "2rem",
                    fontWeight: 800,
                    color: "#0B221B",
                    margin: "0 0 0.5rem 0",
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  {isEn ? "Choose Your Login Portal" : "మీ లాగిన్ పోర్టల్‌ను ఎంచుకోండి"}
                </h2>
                <p
                  style={{
                    fontSize: "0.95rem",
                    color: "#64748B",
                    margin: 0,
                    maxWidth: "580px",
                    marginLeft: "auto",
                    marginRight: "auto",
                    lineHeight: 1.5,
                  }}
                >
                  {isEn
                    ? "Select your role below. Each login opens only its dedicated, protected dashboard."
                    : "క్రింద ఉన్న మీ పాత్రను ఎంచుకోండి. ప్రతి లాగిన్ దాని స్వంత డాష్‌బోర్డ్‌ను మాత్రమే తెరుస్తుంది."}
                </p>
              </div>

              {/* 3 Selectable Cards Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1.5rem",
                  marginBottom: "1.75rem",
                }}
              >
                {/* 1. Customer Login */}
                <div
                  style={{
                    background: "linear-gradient(180deg, #F0FDF4 0%, #FFFFFF 100%)",
                    border: "2px solid #BBF7D0",
                    borderRadius: "18px",
                    padding: "1.75rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    boxShadow: "0 4px 14px rgba(34, 197, 94, 0.08)",
                    transition: "all 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#16A34A";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 24px -6px rgba(22, 163, 74, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#BBF7D0";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(34, 197, 94, 0.08)";
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #10B981 0%, #047857 100%)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1rem",
                      boxShadow: "0 6px 14px rgba(16, 185, 129, 0.3)",
                    }}
                  >
                    <User size={30} strokeWidth={2.4} />
                  </div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      color: "#15803D",
                      background: "#DCFCE7",
                      padding: "3px 10px",
                      borderRadius: "9999px",
                      letterSpacing: "0.05em",
                      marginBottom: "0.5rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {isEn ? "Customer" : "కస్టమర్"}
                  </span>
                  <h3
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "#0B221B",
                      margin: "0 0 0.5rem 0",
                    }}
                  >
                    {isEn ? "Customer Login" : "కస్టమర్ లాగిన్"}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#475569",
                      lineHeight: 1.5,
                      margin: "0 0 1.25rem 0",
                      flex: 1,
                    }}
                  >
                    {isEn
                      ? "Find & hire verified workers, book services by category, and track progress."
                      : "ధృవీకరించబడిన కార్మికులను కనుగొనండి, బుకింగ్‌లను నిర్వహించండి."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      navigate("/customer/login");
                    }}
                    style={{
                      width: "100%",
                      background: "#047857",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "10px",
                      padding: "11px 18px",
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      boxShadow: "0 4px 10px rgba(4, 120, 87, 0.25)",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#065F46"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#047857"; }}
                  >
                    <span>{isEn ? "Open Customer Login" : "కస్టమర్ లాగిన్ తెరవండి"}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>

                {/* 2. Worker Login */}
                <div
                  style={{
                    background: "linear-gradient(180deg, #FEFCE8 0%, #FFFFFF 100%)",
                    border: "2px solid #FDE68A",
                    borderRadius: "18px",
                    padding: "1.75rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    boxShadow: "0 4px 14px rgba(217, 119, 6, 0.08)",
                    transition: "all 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#D97706";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 24px -6px rgba(217, 119, 6, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#FDE68A";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(217, 119, 6, 0.08)";
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
                      color: "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1rem",
                      boxShadow: "0 6px 14px rgba(217, 119, 6, 0.3)",
                    }}
                  >
                    <Briefcase size={30} strokeWidth={2.4} />
                  </div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      color: "#B45309",
                      background: "#FEF3C7",
                      padding: "3px 10px",
                      borderRadius: "9999px",
                      letterSpacing: "0.05em",
                      marginBottom: "0.5rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {isEn ? "Worker / Artisan" : "కార్మికుడు"}
                  </span>
                  <h3
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "#0B221B",
                      margin: "0 0 0.5rem 0",
                    }}
                  >
                    {isEn ? "Worker Login" : "కార్మికుల లాగిన్"}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#475569",
                      lineHeight: 1.5,
                      margin: "0 0 1.25rem 0",
                      flex: 1,
                    }}
                  >
                    {isEn
                      ? "Accept job requests, manage saved skills, and update job status directly."
                      : "కొత్త పనులను స్వీకరించండి, మీ నైపుణ్యాలను భద్రపరచండి."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      navigate("/worker/login");
                    }}
                    style={{
                      width: "100%",
                      background: "#B45309",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "10px",
                      padding: "11px 18px",
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      boxShadow: "0 4px 10px rgba(180, 83, 9, 0.25)",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#92400E"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#B45309"; }}
                  >
                    <span>{isEn ? "Open Worker Login" : "కార్మికుల లాగిన్ తెరవండి"}</span>
                    <ArrowRight size={15} />
                  </button>
                  <div style={{ marginTop: "0.6rem" }}>
                    <span style={{ fontSize: "0.76rem", color: "#64748B" }}>
                      {isEn ? "New worker? " : "కొత్త కార్మికులా? "}
                    </span>
                    <span
                      onClick={() => {
                        setShowLoginModal(false);
                        navigate("/worker/register");
                      }}
                      style={{
                        fontSize: "0.76rem",
                        color: "#B45309",
                        fontWeight: 700,
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      {isEn ? "Register here →" : "దరఖాస్తు చేసుకోండి →"}
                    </span>
                  </div>
                </div>

                {/* 3. Admin Login */}
                <div
                  style={{
                    background: "linear-gradient(180deg, #F1F5F9 0%, #FFFFFF 100%)",
                    border: "2px solid #CBD5E1",
                    borderRadius: "18px",
                    padding: "1.75rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
                    transition: "all 0.25s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#0B221B";
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 24px -6px rgba(11, 34, 27, 0.25)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#CBD5E1";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 14px rgba(15, 23, 42, 0.08)";
                  }}
                >
                  <div
                    style={{
                      width: "60px",
                      height: "60px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #0B221B 0%, #1A3E32 100%)",
                      color: "#D6B779",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "1rem",
                      boxShadow: "0 6px 14px rgba(11, 34, 27, 0.35)",
                      border: "1px solid rgba(214, 183, 121, 0.4)",
                    }}
                  >
                    <ShieldCheck size={30} strokeWidth={2.4} />
                  </div>
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      color: "#0B221B",
                      background: "rgba(214, 183, 121, 0.25)",
                      padding: "3px 10px",
                      borderRadius: "9999px",
                      letterSpacing: "0.05em",
                      marginBottom: "0.5rem",
                      textTransform: "uppercase",
                    }}
                  >
                    {isEn ? "Administrator" : "నిర్వాహకుడు"}
                  </span>
                  <h3
                    style={{
                      fontSize: "1.3rem",
                      fontWeight: 800,
                      color: "#0B221B",
                      margin: "0 0 0.5rem 0",
                    }}
                  >
                    {isEn ? "Admin Login" : "అడ్మిన్ లాగిన్"}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "#475569",
                      lineHeight: 1.5,
                      margin: "0 0 1.25rem 0",
                      flex: 1,
                    }}
                  >
                    {isEn
                      ? "Approve worker applications, review marketplace jobs, and supervise platform analytics."
                      : "కార్మికుల దరఖాస్తులు మరియు ప్లాట్‌ఫారమ్‌ను నిర్వహించండి."}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLoginModal(false);
                      navigate("/admin/login");
                    }}
                    style={{
                      width: "100%",
                      background: "#0B221B",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "10px",
                      padding: "11px 18px",
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      boxShadow: "0 4px 10px rgba(11, 34, 27, 0.3)",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#142D27"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "#0B221B"; }}
                  >
                    <span>{isEn ? "Open Admin Login" : "అడ్మిన్ లాగిన్ తెరవండి"}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              {/* Bottom Row: Full page link */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "6px",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid #F1F5F9",
                }}
              >
                <span style={{ fontSize: "0.82rem", color: "#64748B" }}>
                  {isEn ? "Prefer full-screen role selection?" : "పూర్తి పేజీ కావాలా?"}
                </span>
                <span
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate("/login");
                  }}
                  style={{
                    fontSize: "0.82rem",
                    color: "#0284C7",
                    fontWeight: 700,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {isEn ? "View all roles on dedicated page →" : "రోల్స్ పేజీకి వెళ్లండి →"}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
