import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  Zap,
  Sparkles,
  Hammer,
  Paintbrush,
  Cpu,
  Wind,
  ShieldAlert,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  User,
  Users,
  Search,
  FileText,
  Calendar,
  Phone,
  Mail,
  HelpCircle,
  Menu,
  X,
  Compass,
  CheckCircle2,
  Award,
  Layers,
  Building2,
  MessageSquare,
  Sparkle,
  Briefcase,
  Shield
} from "lucide-react";
import "../landing.css";

export default function HomePage({ initialSection = null, initialModal = null, onSelectRole }) {
  const navigate = useNavigate();
  // Navigation & Scroll State
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState("All Locations");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState("all");
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(initialModal === "login");
  const [authRoleTab, setAuthRoleTab] = useState("customer");
  const [workerModalOpen, setWorkerModalOpen] = useState(initialModal === "worker");
  const [serviceModalData, setServiceModalData] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  // Form states
  const [workerForm, setWorkerForm] = useState({
    name: "",
    trade: "Plumbing",
    phone: "",
    city: "Guntur",
    experience: "1-3 years",
  });
  const [workerSubmitted, setWorkerSubmitted] = useState(false);

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
      setShowBackToTop(window.scrollY > 450);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle initial section scroll
  useEffect(() => {
    if (initialSection) {
      setTimeout(() => {
        scrollToSection(initialSection);
      }, 150);
    }
  }, [initialSection]);

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

  // 8 Required Service Categories
  const serviceCategories = [
    {
      id: "plumbing",
      categoryType: "repair",
      title: "Plumbing",
      desc: "Leak detection, pipeline repairs, tap installations, bathroom sanitary fittings, and drain block clearing.",
      icon: Wrench,
      img: "/images/cat_plumbing.jpg",
      fallbackImg: "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=85",
      tags: ["Pipe Leak Repair", "Bathroom Fittings", "Drain Clearance"],
      scope: [
        "Concealed & exposed pipe leak diagnosis",
        "Washbasin, commode & diverter installation",
        "Kitchen sink drain blockage & sewer clearing",
        "Overhead water tank float valve maintenance"
      ]
    },
    {
      id: "electrical",
      categoryType: "repair",
      title: "Electrical",
      desc: "Certified electrical diagnostics, switchboard repair, MCB panel maintenance, fan fitting, and wiring safety audits.",
      icon: Zap,
      img: "/images/cat_electrical.jpg",
      fallbackImg: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=85",
      tags: ["Switchboard Repair", "MCB Troubleshooting", "Wiring Safety"],
      scope: [
        "Short-circuit diagnosis & earthing inspection",
        "Ceiling fan & designer light installations",
        "Main distribution board fuse & breaker fixes",
        "Appliance power-point cabling & load balancing"
      ]
    },
    {
      id: "cleaning",
      categoryType: "care",
      title: "Cleaning",
      desc: "Deep home sanitization, kitchen degreasing, bathroom scrubbing, sofa shampooing, and dust removal.",
      icon: Sparkles,
      img: "/images/cat_cleaning.jpg",
      fallbackImg: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=85",
      tags: ["Deep Sanitization", "Kitchen Degreasing", "Bathroom Scrubbing"],
      scope: [
        "Full apartment or villa deep cleaning",
        "Kitchen chimney, countertop & tile degreasing",
        "Intensive bathroom descaling & floor disinfection",
        "Upholstery, mattress & sofa vacuum shampooing"
      ]
    },
    {
      id: "carpentry",
      categoryType: "repair",
      title: "Carpentry",
      desc: "Custom furniture repair, door and lock fittings, cupboard hinges, modular shelving, and woodwork touchups.",
      icon: Hammer,
      img: "/images/cat_carpentry.jpg",
      fallbackImg: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=85",
      tags: ["Door Lock Fitting", "Cabinet Hinges", "Furniture Assembly"],
      scope: [
        "Main door latch, lock & handle alignment",
        "Hydraulic wardrobe hinges & drawer channels",
        "Flat-pack furniture assembly (beds, desks, racks)",
        "Teakwood window frame repairs & touchups"
      ]
    },
    {
      id: "painting",
      categoryType: "care",
      title: "Painting",
      desc: "Interior wall repainting, exterior weather coating, moisture-blocking primer, texture painting, and touchups.",
      icon: Paintbrush,
      img: "/images/cat_painting.jpg",
      fallbackImg: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=85",
      tags: ["Interior Emulsion", "Wall Touch-ups", "Waterproof Coating"],
      scope: [
        "Room repaint & complete interior color refresh",
        "Waterproofing damp barrier & anti-fungal primer",
        "Decorative accent wall texture finishes",
        "Doors, grills & window enamel polishing"
      ]
    },
    {
      id: "appliance",
      categoryType: "repair",
      title: "Appliance Repair",
      desc: "Fast diagnosis and repairs for washing machines, refrigerators, microwaves, and everyday home appliances.",
      icon: Cpu,
      img: "/images/cust_hero_worker.jpg",
      fallbackImg: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=85",
      tags: ["Washing Machine Fix", "Refrigerator Cooling", "Microwave Service"],
      scope: [
        "Washing machine drum, spin & drain troubleshooting",
        "Refrigerator compressor cooling & thermostat fixes",
        "Microwave magnetron & heating coil repairs",
        "Kitchen chimney motor & filter maintenance"
      ]
    },
    {
      id: "ac-services",
      categoryType: "repair",
      title: "AC Services",
      desc: "Seasonal air conditioner servicing, filter deep cleaning, gas pressure refills, and cooling efficiency repair.",
      icon: Wind,
      img: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=85",
      fallbackImg: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=85",
      tags: ["AC Gas Refill", "Filter Cleaning", "Cooling Repair"],
      scope: [
        "Indoor split unit coil foam jet wash",
        "Outdoor condenser unit dust & debris wash",
        "R32/R410A refrigerant gas leak check & top-up",
        "Thermostat calibration & compressor diagnostics"
      ]
    },
    {
      id: "pest-control",
      categoryType: "care",
      title: "Pest Control",
      desc: "Eco-friendly, odorless pest management for termites, cockroaches, bedbugs, mosquitoes, and rodent prevention.",
      icon: ShieldAlert,
      img: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=800&q=85",
      fallbackImg: "https://images.unsplash.com/photo-1584744982491-665216d95f8b?auto=format&fit=crop&w=800&q=85",
      tags: ["Termite Treatment", "Cockroach Gel", "Odorless Spray"],
      scope: [
        "Kitchen cabinet odorless gel baiting",
        "Woodwork anti-termite drilling & chemical injection",
        "Bedbug thermal spray & mattress inspection",
        "Drainage barrier netting & mosquito fogging"
      ]
    },
  ];

  const filteredServices = serviceCategories.filter((s) => {
    if (activeCategoryFilter === "all") return true;
    if (activeCategoryFilter === "repairs") return s.categoryType === "repair";
    if (activeCategoryFilter === "care") return s.categoryType === "care";
    return true;
  });

  // FAQ Items
  const faqList = [
    {
      q: "What is WorkSphere AI?",
      a: "WorkSphere AI is an intelligent home-services marketplace that connects customers directly with vetted, qualified local technicians across essential trades including plumbing, electrical, carpentry, cleaning, painting, appliance repair, AC maintenance, and pest control."
    },
    {
      q: "How do I discover and book a service professional?",
      a: "Simply browse our 8 service categories, select the specific task you require, pick your preferred appointment time, and submit your booking request. Our platform matches you with qualified local professionals in your neighborhood."
    },
    {
      q: "How are workers and technicians verified?",
      a: "Technicians on WorkSphere AI undergo structured verification covering identity authentication, trade skills assessment, and service history checks before taking customer requests."
    },
    {
      q: "How does customer-to-worker communication work?",
      a: "Once a booking request is initiated, customers and workers can communicate directly regarding job details, arrival times, and site specifics with transparent status tracking throughout the engagement."
    },
    {
      q: "How can skilled professionals join WorkSphere AI?",
      a: "Trade professionals can register by clicking 'Become a Worker'. After providing trade specialization, experience, and contact details, applicants enter our credentialing process to receive verified local customer leads."
    },
    {
      q: "Is there any hidden fee or booking surcharge?",
      a: "No. WorkSphere AI is built on transparency. All service scopes and estimates are presented upfront before work begins, ensuring fair rates for homeowners and direct earnings for trade artisans."
    }
  ];

  const cityOptions = ["All Locations", "Guntur", "Vijayawada", "Tenali", "Mangalagiri", "Amaravati", "Hyderabad"];

  const handleWorkerFormSubmit = (e) => {
    e.preventDefault();
    setWorkerSubmitted(true);
  };

  const handleContactFormSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
  };

  return (
    <div className="landing-page-root">
      {/* =========================================================================
          1. HEADER & RESPONSIVE NAVIGATION BAR
          ========================================================================= */}
      <header className={`landing-navbar ${isScrolled ? "scrolled" : ""}`}>
        <div className="landing-container landing-nav-inner">
          {/* WorkSphere AI Logo & Brand Name */}
          <div className="landing-brand" onClick={() => scrollToSection("hero")}>
            <div className="landing-brand-icon">
              <Sparkles size={20} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span className="landing-brand-title">WorkSphere AI</span>
              <span style={{ fontSize: "0.68rem", color: "#C8A96A", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 700 }}>
                Home Services Marketplace
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="landing-nav-menu" aria-label="Main Navigation">
            <span className="landing-nav-link" onClick={() => scrollToSection("hero")}>
              Home
            </span>
            <span className="landing-nav-link" onClick={() => scrollToSection("services")}>
              Services
            </span>
            <span className="landing-nav-link" onClick={() => scrollToSection("how-it-works")}>
              How It Works
            </span>
            <span className="landing-nav-link" onClick={() => scrollToSection("why-worksphere")}>
              About
            </span>
            <span className="landing-nav-link" onClick={() => scrollToSection("contact")}>
              Contact
            </span>
          </nav>

          {/* Nav Actions */}
          <div className="landing-nav-actions">
            {/* Location Filter Dropdown */}
            <div style={{ position: "relative" }}>
              <button
                className="landing-city-dropdown"
                onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                aria-label="Filter by Location"
              >
                <MapPin size={14} color="#C8A96A" />
                <span>{selectedCity}</span>
                <ChevronDown size={14} />
              </button>

              {cityDropdownOpen && (
                <div className="landing-dropdown-menu">
                  {cityOptions.map((c) => (
                    <div
                      key={c}
                      onClick={() => {
                        setSelectedCity(c);
                        setCityDropdownOpen(false);
                      }}
                      className={`landing-dropdown-item ${selectedCity === c ? "active" : ""}`}
                    >
                      {c}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sign In Button */}
            <button
              className="landing-login-btn"
              onClick={() => {
                setAuthRoleTab("customer");
                setAuthModalOpen(true);
              }}
              id="header-sign-in-btn"
            >
              <User size={15} />
              <span>Sign In</span>
            </button>

            {/* Get Started Button */}
            <button
              className="landing-btn-gold"
              onClick={() => scrollToSection("services")}
              id="header-get-started-btn"
            >
              <span>Get Started</span>
              <ArrowRight size={15} />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              className="landing-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              id="mobile-nav-toggle-btn"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="landing-mobile-drawer">
            <span className="landing-mobile-link" onClick={() => scrollToSection("hero")}>Home</span>
            <span className="landing-mobile-link" onClick={() => scrollToSection("services")}>Services</span>
            <span className="landing-mobile-link" onClick={() => scrollToSection("how-it-works")}>How It Works</span>
            <span className="landing-mobile-link" onClick={() => scrollToSection("why-worksphere")}>About</span>
            <span className="landing-mobile-link" onClick={() => scrollToSection("contact")}>Contact</span>
            <div className="landing-mobile-drawer-actions">
              <button
                className="landing-btn-outline w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAuthModalOpen(true);
                }}
              >
                Sign In
              </button>
              <button
                className="landing-btn-gold w-full"
                onClick={() => {
                  setMobileMenuOpen(false);
                  scrollToSection("services");
                }}
              >
                Explore Services
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          2. HERO SECTION
          ========================================================================= */}
      <section id="hero" className="landing-hero">
        <div className="landing-container">
          <div className="landing-hero-grid">
            {/* Left Column: Headlines & CTAs */}
            <div>
              <div className="landing-hero-badge">
                <span className="landing-hero-badge-dot" />
                <span>WorkSphere AI</span>
                <span className="landing-hero-badge-divider">|</span>
                <span style={{ color: "#D0DCD4" }}>Verified Local Home Services</span>
              </div>

              <h1 className="landing-hero-headline">
                Trusted Home Services,
                <br />
                <span className="landing-gold-highlight">Made Simple.</span>
              </h1>

              <p className="landing-hero-sub">
                Discover skilled local service professionals, schedule verified trade specialists,
                and track your home repairs with seamless confidence and upfront transparency.
              </p>

              <div className="landing-hero-buttons">
                <button
                  className="landing-btn-gold"
                  onClick={() => scrollToSection("services")}
                  id="hero-explore-services-btn"
                >
                  <span>Explore Services</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  className="landing-btn-outline"
                  onClick={() => {
                    setWorkerSubmitted(false);
                    setWorkerModalOpen(true);
                  }}
                  id="hero-become-worker-btn"
                >
                  <Users size={16} />
                  <span>Become a Worker</span>
                </button>
              </div>

              {/* Verified Features Pills */}
              <div className="hero-features-strip">
                <div className="hero-feature-pill">
                  <ShieldCheck size={16} color="#C8A96A" />
                  <span>Verified Credentials</span>
                </div>
                <div className="hero-feature-pill">
                  <Clock size={16} color="#C8A96A" />
                  <span>Clear Time Slots</span>
                </div>
                <div className="hero-feature-pill">
                  <CheckCircle2 size={16} color="#C8A96A" />
                  <span>Direct Communication</span>
                </div>
              </div>
            </div>

            {/* Right Column: Visual Layout with High-Quality Image */}
            <div>
              <div className="hero-collage-card">
                {/* Floating Top Badge */}
                <div className="hero-floating-badge-top">
                  <div className="hero-floating-icon-wrap">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#FFFFFF" }}>
                      Verified Professionals
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#D0DCD4" }}>
                      Trade & Background Verified
                    </div>
                  </div>
                </div>

                {/* Main Hero Visual Layout */}
                <div className="hero-visual-container">
                  <img
                    src="/images/hero_workers.jpg"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1000&q=85";
                    }}
                    alt="WorkSphere AI Professional Technicians"
                    className="hero-main-image"
                  />
                  <div className="hero-visual-overlay">
                    <div className="hero-panel-role">VERIFIED HOME TRADES</div>
                    <div className="hero-panel-name">Direct Local Connections Across 8 Core Disciplines</div>
                  </div>
                </div>

                {/* Bottom Assurance Banner */}
                <div className="hero-collage-banner">
                  <div className="hero-banner-check">
                    <Check size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.84rem", fontWeight: "700", color: "#FFFFFF" }}>
                      Structured Scope & Upfront Transparency
                    </div>
                    <div style={{ fontSize: "0.73rem", color: "#D0DCD4" }}>
                      Clear service details before work begins with no hidden surprises
                    </div>
                  </div>
                </div>

                {/* Floating Bottom Badge */}
                <div className="hero-floating-badge-bottom">
                  <div className="hero-floating-icon-wrap" style={{ background: "rgba(200, 169, 106, 0.2)" }}>
                    <Calendar size={16} color="#C8A96A" />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: "800", color: "#FFFFFF" }}>
                      Easy Scheduling
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#C8A96A" }}>
                      Choose your preferred day & slot
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. SERVICE CATEGORIES (8 Core Categories)
          ========================================================================= */}
      <section id="services" className="landing-section landing-section-ivory">
        <div className="landing-container">
          <div className="landing-section-header">
            <div>
              <div className="landing-eyebrow">
                <span>• SERVICE CATEGORIES</span>
              </div>
              <h2 className="landing-section-title">
                Explore Essential Home Trades
              </h2>
              <p className="landing-section-sub">
                Connect with skilled professionals across 8 core service categories tailored for your home needs.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="landing-filter-pills" role="tablist">
              <button
                className={`landing-filter-btn ${activeCategoryFilter === "all" ? "active" : ""}`}
                onClick={() => setActiveCategoryFilter("all")}
              >
                All 8 Categories
              </button>
              <button
                className={`landing-filter-btn ${activeCategoryFilter === "repairs" ? "active" : ""}`}
                onClick={() => setActiveCategoryFilter("repairs")}
              >
                Repairs & Maintenance
              </button>
              <button
                className={`landing-filter-btn ${activeCategoryFilter === "care" ? "active" : ""}`}
                onClick={() => setActiveCategoryFilter("care")}
              >
                Home Care & Improvements
              </button>
            </div>
          </div>

          {/* 8 Category Cards Grid */}
          <div className="landing-services-grid">
            {filteredServices.map((service) => {
              const ServiceIcon = service.icon;
              return (
                <div
                  key={service.id}
                  className="service-card"
                  onClick={() => setServiceModalData(service)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setServiceModalData(service);
                    }
                  }}
                  aria-label={`View details for ${service.title}`}
                >
                  <div className="service-card-image-wrap">
                    <img
                      src={service.img}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = service.fallbackImg;
                      }}
                      alt={service.title}
                      loading="lazy"
                    />
                    <div className="service-card-icon-badge">
                      <ServiceIcon size={18} />
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
                    <span className="service-card-action-text">Explore Scope</span>
                    <div className="service-card-arrow-circle">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          4. HOW IT WORKS (4 Clear Steps)
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
              From discovering the right trade to completing the job, our platform coordinates a reliable,
              transparent home service experience.
            </p>
          </div>

          <div className="how-steps-grid">
            {/* Step 1 */}
            <div
              className={`step-card ${activeStep === 1 ? "active" : ""}`}
              onClick={() => setActiveStep(1)}
              tabIndex={0}
              role="button"
            >
              <div className="step-card-header">
                <span className="step-label">STEP 01</span>
                <div className="step-icon-wrap">
                  <FileText size={18} />
                </div>
              </div>
              <h3 className="step-title">Choose a Service</h3>
              <div className="step-quote">“Select the exact trade and task required for your home.”</div>
              <p className="step-desc">
                Browse our structured catalog of 8 core home trades. Specify your task, whether it is an urgent
                pipe repair, room painting, or AC servicing.
              </p>
              <div className="step-card-footer">
                <span>Task Selection</span>
                <Check size={16} color="#347B63" />
              </div>
            </div>

            {/* Step 2 */}
            <div
              className={`step-card ${activeStep === 2 ? "active" : ""}`}
              onClick={() => setActiveStep(2)}
              tabIndex={0}
              role="button"
            >
              <div className="step-card-header">
                <span className="step-label">STEP 02</span>
                <div className="step-icon-wrap">
                  <Search size={18} />
                </div>
              </div>
              <h3 className="step-title">Find a Suitable Professional</h3>
              <div className="step-quote">“Discover verified trade specialists near your location.”</div>
              <p className="step-desc">
                Review available technicians with verified trade backgrounds, proven skill experience,
                and hyper-local proximity to your neighborhood.
              </p>
              <div className="step-card-footer">
                <span>Technician Discovery</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Step 3 */}
            <div
              className={`step-card ${activeStep === 3 ? "active" : ""}`}
              onClick={() => setActiveStep(3)}
              tabIndex={0}
              role="button"
            >
              <div className="step-card-header">
                <span className="step-label">STEP 03</span>
                <div className="step-icon-wrap">
                  <Calendar size={18} />
                </div>
              </div>
              <h3 className="step-title">Request a Booking</h3>
              <div className="step-quote">“Select your preferred date, time slot, and job specifics.”</div>
              <p className="step-desc">
                Submit your booking with clear task details and transparent scope definitions.
                Technicians receive direct notifications to confirm scheduling.
              </p>
              <div className="step-card-footer">
                <span>Booking Dispatch</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Step 4 */}
            <div
              className={`step-card ${activeStep === 4 ? "active" : ""}`}
              onClick={() => setActiveStep(4)}
              tabIndex={0}
              role="button"
            >
              <div className="step-card-header">
                <span className="step-label">STEP 04</span>
                <div className="step-icon-wrap">
                  <Clock size={18} />
                </div>
              </div>
              <h3 className="step-title">Track Your Service</h3>
              <div className="step-quote">“Follow real-time status and communicate about the job.”</div>
              <p className="step-desc">
                Track your request progression from acceptance to technician arrival. Coordinate site details
                directly and confirm job satisfaction upon completion.
              </p>
              <div className="step-card-footer">
                <span>Status & Fulfillment</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. WHY WORKSPHERE AI (Product Capabilities)
          ========================================================================= */}
      <section id="why-worksphere" className="landing-section landing-section-dark">
        <div className="landing-container">
          <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 3.5rem" }}>
            <div className="landing-eyebrow" style={{ justifyContent: "center", color: "#C8A96A" }}>
              <span>• CORE PRODUCT CAPABILITIES</span>
            </div>
            <h2 className="landing-section-title dark" style={{ textAlign: "center" }}>
              Why WorkSphere AI
            </h2>
            <p className="landing-section-sub dark" style={{ margin: "0.75rem auto 0", textAlign: "center" }}>
              A modern digital marketplace platform built specifically to streamline home service discovery,
              booking visibility, and professional coordination.
            </p>
          </div>

          <div className="ai-features-grid">
            {/* Feature 1 */}
            <div className="ai-feature-card">
              <div className="ai-feature-icon-wrap">
                <Compass size={22} />
              </div>
              <h3 className="ai-feature-title">Convenient Service Discovery</h3>
              <p className="ai-feature-desc">
                Quickly locate the exact trade category and task specification you need without endless phone calls
                or uncertain word-of-mouth referrals.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="ai-feature-card">
              <div className="ai-feature-icon-wrap">
                <Clock size={22} />
              </div>
              <h3 className="ai-feature-title">Clear Booking Status</h3>
              <p className="ai-feature-desc">
                Transparent request tracking at every stage, providing clarity from initial submission through
                worker confirmation, dispatch, and work completion.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="ai-feature-card">
              <div className="ai-feature-icon-wrap">
                <MessageSquare size={22} />
              </div>
              <h3 className="ai-feature-title">Customer-Worker Communication</h3>
              <p className="ai-feature-desc">
                Direct channels for customers and technicians to share task notes, access instructions, and arrival
                updates without middleman confusion.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="ai-feature-card">
              <div className="ai-feature-icon-wrap">
                <Layers size={22} />
              </div>
              <h3 className="ai-feature-title">Responsive & Accessible Design</h3>
              <p className="ai-feature-desc">
                Engineered for maximum accessibility across smartphones, tablets, and desktop displays with readable
                contrast, clear typography, and zero horizontal overflow.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="ai-feature-card">
              <div className="ai-feature-icon-wrap">
                <ShieldCheck size={22} />
              </div>
              <h3 className="ai-feature-title">Structured Trade Credentialing</h3>
              <p className="ai-feature-desc">
                Every worker profile is organized around trade specializations, verified background details,
                and confirmed capabilities for dependable work standards.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="ai-feature-card">
              <div className="ai-feature-icon-wrap">
                <FileText size={22} />
              </div>
              <h3 className="ai-feature-title">Transparent Task Scoping</h3>
              <p className="ai-feature-desc">
                Detailed service descriptions outline exactly what each job entails before dispatch,
                eliminating ambiguity and establishing mutual trust.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          6. SEPARATE CUSTOMER AND WORKER ENTRY POINTS
          ========================================================================= */}
      <section className="landing-section landing-section-ivory">
        <div className="landing-container">
          <div className="entry-points-grid">
            {/* Customer Entry Point */}
            <div className="entry-card customer-entry-card">
              <div className="entry-badge customer-badge">
                <User size={14} />
                <span>For Customers & Homeowners</span>
              </div>
              <h3 className="entry-title">Looking for Trusted Home Help?</h3>
              <p className="entry-desc">
                Discover local trade specialists for everyday home repairs, installations, deep cleaning,
                and improvements. Fast scoping and reliable scheduling.
              </p>
              <ul className="entry-points-list">
                <li><Check size={16} color="#347B63" /> Browse 8 verified home trade categories</li>
                <li><Check size={16} color="#347B63" /> Upfront service scoping & clear slot scheduling</li>
                <li><Check size={16} color="#347B63" /> Direct communication with your assigned technician</li>
              </ul>
              <button
                className="landing-btn-gold"
                onClick={() => scrollToSection("services")}
                id="customer-explore-btn"
              >
                <span>Explore Services</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Worker Entry Point */}
            <div className="entry-card worker-entry-card">
              <div className="entry-badge worker-badge">
                <Users size={14} />
                <span>For Skilled Professionals</span>
              </div>
              <h3 className="entry-title">Are You a Skilled Professional?</h3>
              <p className="entry-desc">
                Expand your customer reach, showcase your trade expertise, and receive genuine local
                service booking leads directly on your phone.
              </p>
              <ul className="entry-points-list">
                <li><Check size={16} color="#C8A96A" /> Direct neighborhood booking opportunities</li>
                <li><Check size={16} color="#C8A96A" /> Flexible availability and work schedule controls</li>
                <li><Check size={16} color="#C8A96A" /> Professional trade profile with verified skills</li>
              </ul>
              <button
                className="landing-btn-outline dark-outline"
                onClick={() => {
                  setWorkerSubmitted(false);
                  setWorkerModalOpen(true);
                }}
                id="worker-register-btn"
              >
                <span>Register as a Professional</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          7. FAQ SECTION (Accordion)
          ========================================================================= */}
      <section className="landing-section landing-section-sage">
        <div className="landing-container">
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 3rem" }}>
            <div className="landing-eyebrow" style={{ justifyContent: "center" }}>
              <span>• FREQUENTLY ASKED QUESTIONS</span>
            </div>
            <h2 className="landing-section-title" style={{ textAlign: "center" }}>
              Clear Answers to Common Questions
            </h2>
            <p className="landing-section-sub" style={{ margin: "0.75rem auto 0", textAlign: "center" }}>
              Everything you need to know about how WorkSphere AI operates, service verification, and booking.
            </p>
          </div>

          <div className="faq-container">
            {faqList.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className={`faq-item ${isOpen ? "open" : ""}`}>
                  <button
                    className="faq-question-btn"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <div className="faq-toggle-icon">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </button>
                  {isOpen && (
                    <div className="faq-answer-panel">
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. CONTACT SECTION & FINAL CTA
          ========================================================================= */}
      <section id="contact" className="landing-final-cta">
        <div className="landing-container landing-cta-content">
          <div>
            <div className="landing-eyebrow" style={{ justifyContent: "center", color: "#C8A96A" }}>
              <span>• GET IN TOUCH</span>
            </div>
            <h2 className="landing-cta-headline">
              Ready to Experience Simpler Home Services?
            </h2>
            <p className="landing-cta-sub">
              Whether you need a reliable repair professional or want to offer your trade skills,
              WorkSphere AI is built for trustworthy collaboration.
            </p>
            <div className="landing-cta-buttons">
              <button
                className="landing-btn-gold"
                onClick={() => scrollToSection("services")}
              >
                <span>Find a Service</span>
                <ArrowRight size={17} />
              </button>
              <button
                className="landing-btn-outline"
                onClick={() => {
                  setContactSubmitted(false);
                  setContactModalOpen(true);
                }}
              >
                <Mail size={16} />
                <span>Contact Inquiries</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          9. PROFESSIONAL FOOTER
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
                Trusted Home Services, Made Simple. Connecting local households with qualified, verified
                service professionals across Andhra Pradesh.
              </p>
              <div className="footer-location-badges">
                <span className="footer-pill">Guntur</span>
                <span className="footer-pill">Vijayawada</span>
                <span className="footer-pill">Tenali</span>
                <span className="footer-pill">Amaravati</span>
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div>
              <div className="landing-footer-col-title">Navigation</div>
              <ul className="landing-footer-links">
                <li><span className="landing-footer-link" onClick={() => scrollToSection("hero")}>Home</span></li>
                <li><span className="landing-footer-link" onClick={() => scrollToSection("services")}>Services</span></li>
                <li><span className="landing-footer-link" onClick={() => scrollToSection("how-it-works")}>How It Works</span></li>
                <li><span className="landing-footer-link" onClick={() => scrollToSection("why-worksphere")}>About WorkSphere AI</span></li>
                <li><span className="landing-footer-link" onClick={() => scrollToSection("contact")}>Contact Us</span></li>
              </ul>
            </div>

            {/* Service Directory Links */}
            <div>
              <div className="landing-footer-col-title">Service Disciplines</div>
              <ul className="landing-footer-links">
                <li><span className="landing-footer-link" onClick={() => scrollToSection("services")}>Plumbing Repairs</span></li>
                <li><span className="landing-footer-link" onClick={() => scrollToSection("services")}>Electrical Services</span></li>
                <li><span className="landing-footer-link" onClick={() => scrollToSection("services")}>Deep Cleaning</span></li>
                <li><span className="landing-footer-link" onClick={() => scrollToSection("services")}>Carpentry & Woodwork</span></li>
                <li><span className="landing-footer-link" onClick={() => scrollToSection("services")}>Painting & Primer</span></li>
                <li><span className="landing-footer-link" onClick={() => scrollToSection("services")}>Appliance & AC Repair</span></li>
                <li><span className="landing-footer-link" onClick={() => scrollToSection("services")}>Pest Control</span></li>
              </ul>
            </div>

            {/* Support & Contact */}
            <div>
              <div className="landing-footer-col-title">Support & Portals</div>
              <ul className="landing-footer-links">
                <li>
                  <span
                    className="landing-footer-link"
                    onClick={() => {
                      setAuthRoleTab("customer");
                      setAuthModalOpen(true);
                    }}
                  >
                    Customer Sign In
                  </span>
                </li>
                <li>
                  <span
                    className="landing-footer-link"
                    onClick={() => {
                      setAuthRoleTab("worker");
                      setAuthModalOpen(true);
                    }}
                  >
                    Worker Sign In
                  </span>
                </li>
                <li>
                  <span
                    className="landing-footer-link"
                    onClick={() => {
                      setWorkerSubmitted(false);
                      setWorkerModalOpen(true);
                    }}
                  >
                    Become a Worker
                  </span>
                </li>
                <li>
                  <span
                    className="landing-footer-link"
                    onClick={() => {
                      setContactSubmitted(false);
                      setContactModalOpen(true);
                    }}
                  >
                    Support Inquiries
                  </span>
                </li>
                <li><span className="landing-footer-link">support@worksphere.ai</span></li>
              </ul>
            </div>
          </div>

          <div className="landing-footer-bottom">
            <div>© {new Date().getFullYear()} WorkSphere AI. All rights reserved. Step 2 Complete Website Design.</div>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <span className="landing-footer-link">Privacy Policy</span>
              <span className="landing-footer-link">Terms of Service</span>
              <span className="landing-footer-link">Verification Standards</span>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          INTERACTIVE MODALS
          ========================================================================= */}

      {/* 1. Sign In / Authentication Modal */}
      {/* 1. Sign In / 3 Login Cards Modal */}
      {authModalOpen && (
        <div className="modal-backdrop" onClick={() => setAuthModalOpen(false)}>
          <div className="modal-card wide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div className="modal-badge-icon">
                  <Sparkles size={20} color="#C8A96A" />
                </div>
                <div>
                  <h3 className="modal-title">Sign In to WorkSphere AI</h3>
                  <p className="modal-subtitle">Choose your role to open your dedicated dashboard</p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setAuthModalOpen(false)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {/* 3 Arranged Login Cards */}
            <div className="modal-auth-cards-grid">
              {/* Card 1: Customer */}
              <div className="modal-auth-card">
                <div className="modal-auth-card-icon user-icon">
                  <User size={26} />
                </div>
                <div className="modal-auth-card-badge">STEP 3 DASHBOARD</div>
                <h4 className="modal-auth-card-title">Customer Login</h4>
                <p className="modal-auth-card-desc">
                  Browse 50 categories, book verified trade specialists, and track jobs in real time.
                </p>
                <div className="modal-auth-card-actions">
                  <button
                    className="landing-btn-gold w-full text-sm"
                    onClick={() => {
                      setAuthModalOpen(false);
                      if (onSelectRole) onSelectRole("customer");
                      else navigate("/customer/dashboard");
                    }}
                  >
                    <span>Open Customer Dashboard</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    className="modal-auth-sub-btn"
                    onClick={() => {
                      setAuthModalOpen(false);
                      navigate("/customer/login");
                    }}
                  >
                    Customer Sign In Form →
                  </button>
                </div>
              </div>

              {/* Card 2: Worker */}
              <div className="modal-auth-card worker">
                <div className="modal-auth-card-icon worker-icon">
                  <Briefcase size={26} />
                </div>
                <div className="modal-auth-card-badge gold-badge">STEP 4 DASHBOARD</div>
                <h4 className="modal-auth-card-title">Worker Login</h4>
                <p className="modal-auth-card-desc">
                  Receive local customer booking leads, accept or reject jobs, and update work status.
                </p>
                <div className="modal-auth-card-actions">
                  <button
                    className="landing-btn-gold w-full text-sm"
                    onClick={() => {
                      setAuthModalOpen(false);
                      if (onSelectRole) onSelectRole("worker");
                      else navigate("/worker/dashboard");
                    }}
                  >
                    <span>Open Worker Dashboard</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    className="modal-auth-sub-btn"
                    onClick={() => {
                      setAuthModalOpen(false);
                      navigate("/worker/login");
                    }}
                  >
                    Worker Sign In Form →
                  </button>
                </div>
              </div>

              {/* Card 3: Admin */}
              <div className="modal-auth-card">
                <div className="modal-auth-card-icon admin-icon">
                  <Shield size={26} color="#C8A96A" />
                </div>
                <div className="modal-auth-card-badge gold-badge">STEP 5 DASHBOARD</div>
                <h4 className="modal-auth-card-title">Admin Login</h4>
                <p className="modal-auth-card-desc">
                  Platform governance, worker application reviews, database bookings, and service catalog.
                </p>
                <div className="modal-auth-card-actions">
                  <button
                    className="landing-btn-gold w-full text-sm"
                    onClick={() => {
                      setAuthModalOpen(false);
                      if (onSelectRole) onSelectRole("admin");
                      else navigate("/admin/dashboard");
                    }}
                  >
                    <span>Open Admin Dashboard</span>
                    <ArrowRight size={14} />
                  </button>
                  <button
                    className="modal-auth-sub-btn"
                    onClick={() => {
                      setAuthModalOpen(false);
                      navigate("/admin/login");
                    }}
                  >
                    Admin Sign In Form →
                  </button>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", paddingTop: "0.5rem" }}>
              <button
                type="button"
                className="modal-auth-sub-btn"
                style={{ fontSize: "0.84rem", color: "#5A6D65" }}
                onClick={() => {
                  setAuthModalOpen(false);
                  navigate("/login");
                }}
              >
                Or view the full standalone 3-Portal selection screen →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Become a Worker Modal */}
      {workerModalOpen && (
        <div className="modal-backdrop" onClick={() => setWorkerModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="modal-badge-icon">
                  <Award size={18} color="#C8A96A" />
                </div>
                <div>
                  <h3 className="modal-title">Join as a Service Professional</h3>
                  <p className="modal-subtitle">Register your trade interest</p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setWorkerModalOpen(false)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {workerSubmitted ? (
              <div style={{ padding: "1.5rem 0", textAlign: "center" }}>
                <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#E9EFE9", display: "grid", placeItems: "center", margin: "0 auto 1rem", color: "#347B63" }}>
                  <Check size={24} />
                </div>
                <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#142D27", marginBottom: "0.5rem" }}>
                  Application Interest Received!
                </h4>
                <p style={{ fontSize: "0.85rem", color: "#5A6D65", lineHeight: 1.6, maxWidth: "340px", margin: "0 auto 1.5rem" }}>
                  Thank you, <strong>{workerForm.name || "Technician"}</strong>. Worker registration and document verification
                  will officially open in Step 3 (Supabase Integration).
                </p>
                <button
                  className="landing-btn-gold"
                  onClick={() => setWorkerModalOpen(false)}
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleWorkerFormSubmit} className="modal-form">
                <div>
                  <label className="modal-label">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your full name"
                    value={workerForm.name}
                    onChange={(e) => setWorkerForm({ ...workerForm, name: e.target.value })}
                    className="modal-input"
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div>
                    <label className="modal-label">Primary Trade</label>
                    <select
                      value={workerForm.trade}
                      onChange={(e) => setWorkerForm({ ...workerForm, trade: e.target.value })}
                      className="modal-input"
                    >
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrical">Electrical</option>
                      <option value="Carpentry">Carpentry</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Painting">Painting</option>
                      <option value="Appliance Repair">Appliance Repair</option>
                      <option value="AC Services">AC Services</option>
                      <option value="Pest Control">Pest Control</option>
                    </select>
                  </div>

                  <div>
                    <label className="modal-label">City</label>
                    <select
                      value={workerForm.city}
                      onChange={(e) => setWorkerForm({ ...workerForm, city: e.target.value })}
                      className="modal-input"
                    >
                      <option value="Guntur">Guntur</option>
                      <option value="Vijayawada">Vijayawada</option>
                      <option value="Tenali">Tenali</option>
                      <option value="Amaravati">Amaravati</option>
                      <option value="Mangalagiri">Mangalagiri</option>
                      <option value="Hyderabad">Hyderabad</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="modal-label">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={workerForm.phone}
                    onChange={(e) => setWorkerForm({ ...workerForm, phone: e.target.value })}
                    className="modal-input"
                  />
                </div>

                <div className="modal-info-box" style={{ margin: "4px 0" }}>
                  <div style={{ fontSize: "0.78rem", color: "#5A6D65" }}>
                    WorkSphere AI connects verified technicians directly with local customer leads. Full worker portal onboarding goes live in Step 3.
                  </div>
                </div>

                <button type="submit" className="landing-btn-gold w-full" style={{ marginTop: "8px" }}>
                  <span>Submit Worker Interest</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* 3. Service Scope Preview Modal */}
      {serviceModalData && (
        <div className="modal-backdrop" onClick={() => setServiceModalData(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="modal-badge-icon">
                  {React.createElement(serviceModalData.icon, { size: 18, color: "#C8A96A" })}
                </div>
                <div>
                  <h3 className="modal-title">{serviceModalData.title}</h3>
                  <p className="modal-subtitle">Service Discipline Overview</p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setServiceModalData(null)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: "0.9rem", color: "#5A6D65", lineHeight: 1.6, marginBottom: "1.25rem" }}>
              {serviceModalData.desc}
            </p>

            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#142D27", marginBottom: "8px" }}>
              Key Tasks Included in this Trade:
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem", display: "flex", flexDirection: "column", gap: "8px" }}>
              {serviceModalData.scope.map((task, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "0.84rem", color: "#243B33" }}>
                  <CheckCircle2 size={16} color="#347B63" style={{ flexShrink: 0 }} />
                  <span>{task}</span>
                </li>
              ))}
            </ul>

            <div className="modal-footer" style={{ display: "flex", gap: "10px" }}>
              <button
                className="landing-btn-outline w-full"
                style={{ color: "#142D27", borderColor: "rgba(20, 45, 39, 0.2)", background: "#FFFFFF" }}
                onClick={() => setServiceModalData(null)}
              >
                Close
              </button>
              <button
                className="landing-btn-gold w-full"
                onClick={() => {
                  setServiceModalData(null);
                  setAuthRoleTab("customer");
                  setAuthModalOpen(true);
                }}
              >
                Request Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Contact Inquiries Modal */}
      {contactModalOpen && (
        <div className="modal-backdrop" onClick={() => setContactModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div className="modal-badge-icon">
                  <Mail size={18} color="#C8A96A" />
                </div>
                <div>
                  <h3 className="modal-title">Contact Support & Inquiries</h3>
                  <p className="modal-subtitle">We are here to assist you</p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setContactModalOpen(false)}
                aria-label="Close dialog"
              >
                <X size={20} />
              </button>
            </div>

            {contactSubmitted ? (
              <div style={{ padding: "1.5rem 0", textAlign: "center" }}>
                <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "#E9EFE9", display: "grid", placeItems: "center", margin: "0 auto 1rem", color: "#347B63" }}>
                  <Check size={24} />
                </div>
                <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#142D27", marginBottom: "0.5rem" }}>
                  Inquiry Transmitted!
                </h4>
                <p style={{ fontSize: "0.85rem", color: "#5A6D65", lineHeight: 1.6, maxWidth: "340px", margin: "0 auto 1.5rem" }}>
                  Thank you for reaching out to WorkSphere AI. Our customer experience team responds within 24 operational hours.
                </p>
                <button
                  className="landing-btn-gold"
                  onClick={() => setContactModalOpen(false)}
                >
                  Close Window
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactFormSubmit} className="modal-form">
                <div>
                  <label className="modal-label">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="modal-input"
                  />
                </div>
                <div>
                  <label className="modal-label">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="modal-input"
                  />
                </div>
                <div>
                  <label className="modal-label">Message or Question</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us about your service or partnership question..."
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="modal-input"
                    style={{ resize: "vertical" }}
                  />
                </div>
                <button type="submit" className="landing-btn-gold w-full" style={{ marginTop: "8px" }}>
                  <span>Transmit Inquiry</span>
                  <Send size={15} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          className="back-to-top-btn"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <ChevronUp size={20} />
        </button>
      )}
    </div>
  );
}
