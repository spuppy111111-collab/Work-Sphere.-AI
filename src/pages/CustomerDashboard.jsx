import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  MapPin,
  Clock,
  CalendarCheck,
  CheckCircle,
  ShieldCheck,
  Star,
  ChevronRight,
  Briefcase,
  XCircle,
  RotateCw,
  Send,
  AlertCircle,
  Check,
  Phone,
  User,
  Info,
  Zap,
  Droplet,
  Flame,
  Paintbrush,
  Hammer,
  Grid,
  Search,
  ArrowRight,
  Bell,
  Wrench,
  MessageSquare,
  CreditCard,
  Headphones,
  Award,
  ChevronDown,
  FileText,
  DollarSign,
  AlertTriangle,
  Receipt,
  X,
  UploadCloud,
  CheckSquare,
  Truck,
  Cpu,
  Bookmark,
  Home,
  Users,
  List
} from "lucide-react";
import { CATEGORIES, analyzeProblemDescription } from "../data/initialData";
import { SERVICE_GROUPS, SERVICE_CATEGORIES, getCategoryById, searchCatalog } from "../data/serviceCatalog";
import CategoryIcon from "../components/CategoryIcon";
import AuthLoginScreen from "../components/AuthLoginScreen";
import {
  createCustomerBooking,
  getCustomerBookings,
  cancelCustomerBooking,
  submitReview,
  isSupportedCoverage,
  getApprovedWorkersForCustomer,
  customerConfirmPaymentAndCompletion,
  submitCustomerComplaint,
  updateCustomerProfile,
  getMyNotifications,
  markNotificationAsRead,
  getServiceCatalogue,
  getBookingStatusTimeline,
  supabase
} from "../lib/supabase";
import { useTimeGreeting } from "../utils/greeting";
import "../customer.css";

// Workers are dynamically retrieved live from Supabase database

export default function CustomerDashboard({
  lang = "en",
  currentUser,
  onOpenAuth,
  onNavigate,
  activeTab = "customer-home",
}) {
  const navigate = useNavigate();
  const isEn = lang === "en";
  const greeting = useTimeGreeting(lang);

  // Customer Name
  const rawName = currentUser?.name || currentUser?.full_name || currentUser?.email?.split("@")[0] || "Customer";
  const firstName = rawName.split(" ")[0] || "Customer";

  // Data states
  const [bookings, setBookings] = useState([]);
  const [workersList, setWorkersList] = useState([]);
  const [workersLoading, setWorkersLoading] = useState(false);
  const [workersError, setWorkersError] = useState(null);
  const [notificationsList, setNotificationsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 50 Service Catalogue & Search States
  const [serviceCatalogue, setServiceCatalogue] = useState(SERVICE_CATEGORIES);
  const [categoryViewMode, setCategoryViewMode] = useState("linewise"); // "linewise" by default as requested
  const [selectedGroupFilter, setSelectedGroupFilter] = useState("all");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [selectedSubService, setSelectedSubService] = useState("Pipe Leakage Repair");
  const [estimatedPrice, setEstimatedPrice] = useState(449);
  const [statusTimeline, setStatusTimeline] = useState([]);

  // Search & Filter State in "Find a Worker" (Step 6)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [workerSearchTerm, setWorkerSearchTerm] = useState("");
  const [selectedCityFilter, setSelectedCityFilter] = useState("All Cities");
  const [selectedRatingFilter, setSelectedRatingFilter] = useState("all");
  const [selectedAvailabilityFilter, setSelectedAvailabilityFilter] = useState("all");

  // AI Diagnostic Search in Hero
  const [problemText, setProblemText] = useState("");

  // Saved Workers List (Stored in localStorage)
  const [savedWorkerIds, setSavedWorkerIds] = useState(() => {
    try {
      const s = localStorage.getItem("ws_saved_workers");
      return s ? JSON.parse(s) : [];
    } catch (_) {
      return [];
    }
  });

  const toggleSaveWorker = (workerId) => {
    setSavedWorkerIds((prev) => {
      const next = prev.includes(workerId) ? prev.filter((id) => id !== workerId) : [...prev, workerId];
      try {
        localStorage.setItem("ws_saved_workers", JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  // Support / Dispute Form State
  const [supportIssueCategory, setSupportIssueCategory] = useState("Booking Inquiry");
  const [supportIssueMessage, setSupportIssueMessage] = useState("");
  const [supportTicketSuccess, setSupportTicketSuccess] = useState(false);

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState(null);
  const [bookingCategory, setBookingCategory] = useState("Plumbing");
  const [formProblem, setFormProblem] = useState("");
  const [locality, setLocality] = useState(currentUser?.locality || currentUser?.city || "Guntur");
  const [pincode, setPincode] = useState("522002");
  const [address, setAddress] = useState(currentUser?.address || "");
  const [preferredDate, setPreferredDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split("T")[0]
  );
  const [preferredTime, setPreferredTime] = useState("Morning (09:00 AM - 01:00 PM)");
  const [contactName, setContactName] = useState(rawName);
  const [contactPhone, setContactPhone] = useState(currentUser?.phone || "+91 98765 43210");
  const [notes, setNotes] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Auto-resume booking submission after user signs in via AuthLoginScreen
  const handleAuthSuccess = async (authData) => {
    setIsAuthModalOpen(false);
    setFormError("");
    if (authData?.user) {
      setTimeout(() => {
        handleSubmitBooking({ preventDefault: () => {} });
      }, 200);
    }
  };

  // Worker Profile Details Modal
  const [selectedWorkerProfile, setSelectedWorkerProfile] = useState(null);

  // Tracking / Booking Details Modal
  const [selectedBookingForTracking, setSelectedBookingForTracking] = useState(null);

  // Payment Confirmation Modal (Step 9)
  const [paymentModalBooking, setPaymentModalBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash on Completion");
  const [paymentReferenceInput, setPaymentReferenceInput] = useState("");
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState(null);
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

  // Review & Dispute Modal (Step 10)
  const [reviewBooking, setReviewBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isDisputeOpen, setIsDisputeOpen] = useState(false);
  const [disputeCategory, setDisputeCategory] = useState("Service Quality");
  const [disputeDetails, setDisputeDetails] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState("");

  // Customer Profile Edit Tab State
  const [profileName, setProfileName] = useState(rawName);
  const [profilePhone, setProfilePhone] = useState(currentUser?.phone || "");
  const [profileCity, setProfileCity] = useState(currentUser?.city || "Guntur");
  const [profileAddress, setProfileAddress] = useState(currentUser?.address || "");
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Bookings filter
  const [statusFilter, setStatusFilter] = useState("all");

  // Dedicated function to fetch approved and genuinely available workers from Supabase
  const fetchEligibleWorkers = useCallback(async (cat = selectedCategoryFilter, loc = selectedCityFilter, search = workerSearchTerm) => {
    try {
      setWorkersLoading(true);
      setWorkersError(null);
      const data = await getApprovedWorkersForCustomer({
        category: cat,
        city: loc,
        search: search,
      });
      // Strictly store genuine Supabase workers
      setWorkersList(data || []);
    } catch (err) {
      console.error("Error fetching eligible workers:", err);
      setWorkersError("Unable to fetch available workers from database.");
      setWorkersList([]); // Never show unfiltered or fake workers on error
    } finally {
      setWorkersLoading(false);
    }
  }, [selectedCategoryFilter, selectedCityFilter, workerSearchTerm]);

  // Load customer data, workers and notifications
  const loadCustomerData = async () => {
    try {
      setLoading(true);

      const [workers, notifs, cats] = await Promise.all([
        getApprovedWorkersForCustomer({
          category: selectedCategoryFilter,
          city: selectedCityFilter,
          search: workerSearchTerm,
        }).catch(() => []),
        getMyNotifications().catch(() => []),
        getServiceCatalogue().catch(() => SERVICE_CATEGORIES),
      ]);

      setWorkersList(workers || []);
      setNotificationsList(notifs || []);
      if (cats && cats.length > 0) {
        setServiceCatalogue(cats);
      }

      if (currentUser?.id) {
        const customerBookings = await getCustomerBookings(currentUser.id);
        setBookings(customerBookings || []);
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Error loading customer dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch workers from Supabase whenever category, location, or search term changes
  useEffect(() => {
    fetchEligibleWorkers(selectedCategoryFilter, selectedCityFilter, workerSearchTerm);
  }, [selectedCategoryFilter, selectedCityFilter, workerSearchTerm, fetchEligibleWorkers]);

  useEffect(() => {
    loadCustomerData();

    // Supabase Realtime subscription for instant booking updates
    const bookingChannel = supabase
      .channel("customer-bookings-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookings",
        },
        () => {
          loadCustomerData();
        }
      )
      .subscribe();

    // Supabase Realtime subscription for worker approval & availability changes
    const workerChannel = supabase
      .channel("customer-worker-profiles-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "worker_profiles",
        },
        () => {
          fetchEligibleWorkers();
        }
      )
      .subscribe();

    // Cross-tab and local-storage event listener for instant local sync
    const handleLocalBookingUpdate = () => {
      loadCustomerData();
      fetchEligibleWorkers();
    };

    window.addEventListener("ws_booking_updated", handleLocalBookingUpdate);
    window.addEventListener("storage", handleLocalBookingUpdate);
    window.addEventListener("focus", handleLocalBookingUpdate);

    return () => {
      supabase.removeChannel(bookingChannel);
      supabase.removeChannel(workerChannel);
      window.removeEventListener("ws_booking_updated", handleLocalBookingUpdate);
      window.removeEventListener("storage", handleLocalBookingUpdate);
      window.removeEventListener("focus", handleLocalBookingUpdate);
    };
  }, [currentUser?.id, fetchEligibleWorkers]);

  // Restore saved booking draft after customer signs in or registers
  useEffect(() => {
    try {
      const rawDraft =
        sessionStorage.getItem("ws_pending_booking_draft") ||
        localStorage.getItem("ws_pending_booking_draft");

      if (rawDraft) {
        const draft = JSON.parse(rawDraft);
        if (draft && typeof draft === "object") {
          if (draft.bookingCategory) setBookingCategory(draft.bookingCategory);
          if (draft.selectedSubService) setSelectedSubService(draft.selectedSubService);
          if (draft.selectedWorkerForBooking) setSelectedWorkerForBooking(draft.selectedWorkerForBooking);
          if (draft.formProblem) setFormProblem(draft.formProblem);
          if (draft.locality) setLocality(draft.locality);
          if (draft.pincode) setPincode(draft.pincode);
          if (draft.address) setAddress(draft.address);
          if (draft.preferredDate) setPreferredDate(draft.preferredDate);
          if (draft.preferredTime) setPreferredTime(draft.preferredTime);
          if (draft.contactName) setContactName(draft.contactName);
          if (draft.contactPhone) setContactPhone(draft.contactPhone);
          if (draft.notes) setNotes(draft.notes);

          // Clear any error and pop open the booking modal with data restored
          setFormError("");
          setIsBookingModalOpen(true);

          // Clean up stored draft so subsequent normal refreshes do not re-open modal
          sessionStorage.removeItem("ws_pending_booking_draft");
          localStorage.removeItem("ws_pending_booking_draft");
        }
      }
    } catch (err) {
      console.warn("Could not restore booking draft:", err);
    }
  }, [currentUser?.id]);

  // Keep tracking modal synchronized with latest booking state
  useEffect(() => {
    if (selectedBookingForTracking) {
      const updated = bookings.find((b) => b.id === selectedBookingForTracking.id);
      if (updated && updated.status !== selectedBookingForTracking.status) {
        setSelectedBookingForTracking(updated);
        getBookingStatusTimeline(updated.id).then((tl) => {
          if (tl) setStatusTimeline(tl);
        }).catch(() => {});
      }
    }
  }, [bookings]);

  // AI Problem Analysis Trigger
  function handleDiagnose(customText) {
    const textToAnalyze = customText || problemText;
    if (!textToAnalyze || textToAnalyze.trim() === "") return;
    const diagnosis = analyzeProblemDescription(textToAnalyze);
    if (diagnosis) {
      handleOpenBooking(diagnosis.categoryName, null, textToAnalyze);
    } else {
      handleOpenBooking("Plumbing", null, textToAnalyze);
    }
  }

  // Navigate from Category / Sub-Service to Find a Worker (Step 1 -> Step 4/5/6)
  function handleSelectCategoryAndFindWorker(categoryName, subServiceName = "") {
    const cat = categoryName || "all";
    setSelectedCategoryFilter(cat);
    setBookingCategory(cat !== "all" ? cat : "Plumbing");
    if (subServiceName) {
      setSelectedSubService(subServiceName);
    } else {
      const catObj = getCategoryById(cat);
      if (catObj?.services?.[0]?.name) {
        setSelectedSubService(catObj.services[0].name);
      }
    }
    if (onNavigate) {
      onNavigate("book-service");
    }
  }

  // Open booking modal for a category, sub-service or specific worker (Step 7 -> Step 8)
  function handleOpenBooking(categoryName, worker = null, initialProblem = "", subServiceName = "") {
    if (worker) {
      const isApproved = String(worker.approval_status || "").trim().toLowerCase() === "approved";
      const isAvailable = worker.is_available === true;
      if (!isApproved || !isAvailable) {
        alert(
          isEn
            ? "This worker is currently unavailable or awaiting administrator approval. Please select an active available worker."
            : "ఈ కార్మికుడు ప్రస్తుతం అందుబాటులో లేరు లేదా అడ్మిన్ ఆమోదం కోసం వేచి ఉన్నారు."
        );
        return;
      }
    }
    const catObj = getCategoryById(categoryName || "Plumbing");
    const canonicalCat = catObj?.name || "Plumbing";
    setBookingCategory(canonicalCat);

    const availableServices = catObj?.services || [];
    let chosenSub = subServiceName;
    if (!chosenSub && selectedSubService) {
      const match = availableServices.find((s) => s.name === selectedSubService);
      if (match) chosenSub = match.name;
    }
    if (!chosenSub && availableServices.length > 0) {
      chosenSub = availableServices[0].name;
    }
    setSelectedSubService(chosenSub || "General Service");
    setSelectedWorkerForBooking(worker || null);
    setFormProblem(initialProblem || problemText || "");
    setFormError("");
    setBookingConfirmation(null);
    setIsBookingModalOpen(true);
  }

  // Open tracking modal and load timeline
  async function handleOpenTrackingModal(booking) {
    setSelectedBookingForTracking(booking);
    try {
      const timeline = await getBookingStatusTimeline(booking.id);
      setStatusTimeline(timeline || []);
    } catch (_) {
      setStatusTimeline([]);
    }
  }

  // Submit booking (Step 6 -> Step 7)
  async function handleSubmitBooking(e) {
    e.preventDefault();
    if (isSubmitting) return;

    setFormError("");

    if (!pincode || !/^\d{6}$/.test(pincode.trim())) {
      setFormError(isEn ? "Please enter a valid 6-digit PIN code." : "దయచేసి సరైన 6-అంకెల పిన్‌కోడ్ నమోదు చేయండి.");
      return;
    }

    if (!isSupportedCoverage(pincode)) {
      setFormError(
        isEn
          ? "Service coverage is currently available in Guntur & Vijayawada regions only (PIN starting with 520, 521, or 522)."
          : "సేవ ప్రస్తుతం గుంటూరు మరియు విజయవాడ ప్రాంతాల్లో మాత్రమే అందుబాటులో ఉంది (520, 521, 522 తో మొదలయ్యే పిన్‌కోడ్‌లు)."
      );
      return;
    }

    if (!address.trim()) {
      setFormError(isEn ? "Please provide your street / door address." : "దయచేసి మీ చిరునామా నమోదు చేయండి.");
      return;
    }

    // 1. Verify actual Supabase authentication session
    let activeUser = null;
    let authError = null;

    try {
      const { data: userData, error: uErr } = await supabase.auth.getUser();
      if (uErr) authError = uErr;
      if (userData?.user) {
        activeUser = userData.user;
      }
    } catch (err) {
      authError = err;
    }

    let sessionActive = false;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      sessionActive = Boolean(sessionData?.session);
      if (!activeUser && sessionData?.session?.user) {
        activeUser = sessionData.session.user;
        authError = null;
      }
    } catch (_) {}

    // Fallback to validated currentUser prop if available
    if (!activeUser && currentUser?.id) {
      activeUser = currentUser;
      authError = null;
    }

    // Safe dev diagnostic output (never exposing tokens, passwords, or keys)
    if (import.meta.env?.DEV) {
      console.log("[Customer Booking Submit Auth Diagnostics]", {
        hasAuthenticatedUser: !!activeUser,
        authUserId: activeUser?.id,
        currentUserPropId: currentUser?.id,
        sessionActive,
        error: authError?.message || null,
      });
    }

    // If genuinely signed out: preserve booking draft and open inline auth dialog
    if (!activeUser) {
      const draft = {
        bookingCategory,
        selectedSubService,
        selectedWorkerForBooking,
        formProblem,
        locality,
        pincode: pincode.trim(),
        address: address.trim(),
        preferredDate,
        preferredTime,
        contactName,
        contactPhone,
        notes,
        savedAt: Date.now(),
      };

      try {
        sessionStorage.setItem("ws_pending_booking_draft", JSON.stringify(draft));
        localStorage.setItem("ws_pending_booking_draft", JSON.stringify(draft));
      } catch (err) {
        console.warn("Could not save booking draft:", err);
      }

      setFormError(isEn ? "Please sign in to submit a service request." : "దయచేసి సర్వీస్ అభ్యర్థనను సమర్పించడానికి సైన్ ఇన్ చేయండి.");
      setIsAuthModalOpen(true);
      return;
    }

    // 2. Customer is authenticated: proceed with database insert
    try {
      setIsSubmitting(true);
      const catObj = getCategoryById(bookingCategory);
      const subObj = catObj?.services?.find((s) => s.name === selectedSubService);

      const targetWorkerId = selectedWorkerForBooking?.user_id || selectedWorkerForBooking?.id || null;

      const newBooking = await createCustomerBooking({
        problemDescription: formProblem || `Service Request for ${selectedSubService || bookingCategory}`,
        serviceCategory: bookingCategory,
        serviceName: selectedSubService || bookingCategory,
        categoryId: catObj?.id || null,
        serviceId: subObj?.id || null,
        locality,
        pincode: pincode.trim(),
        address: address.trim(),
        preferredDate,
        preferredTime,
        notes,
        photoFile,
        workerId: targetWorkerId,
      });

      // Clear draft after successful creation
      sessionStorage.removeItem("ws_pending_booking_draft");
      localStorage.removeItem("ws_pending_booking_draft");

      // Show Step 7 Booking Confirmation Screen with real Supabase Booking ID
      const bookingIdDisplay = newBooking?.id
        ? `#BK-${newBooking.id.substring(0, 8).toUpperCase()}`
        : `#BK-${Date.now().toString(36).toUpperCase()}`;

      setBookingConfirmation({
        bookingId: bookingIdDisplay,
        rawId: newBooking?.id,
        status: newBooking?.status || "Pending",
        serviceCategory: `${bookingCategory} — ${selectedSubService || "Standard Service"}`,
        workerName: selectedWorkerForBooking?.display_name || "Assigned to nearest verified artisan",
        preferredDate,
        preferredTime,
        locality,
        address: address.trim(),
      });

      // Refresh customer bookings from real database
      const updated = await getCustomerBookings(activeUser.id);
      if (updated && updated.length > 0) {
        setBookings(updated);
      }

      // Notify application and other views to update counts
      window.dispatchEvent(
        new CustomEvent("ws_booking_updated", {
          detail: { bookingId: newBooking?.id, booking: newBooking },
        })
      );
    } catch (err) {
      console.error("Booking submission error:", err);
      // If error was session-related, save draft and prompt login
      if (err.message && err.message.toLowerCase().includes("please sign in")) {
        const draft = {
          bookingCategory,
          selectedSubService,
          selectedWorkerForBooking,
          formProblem,
          locality,
          pincode: pincode.trim(),
          address: address.trim(),
          preferredDate,
          preferredTime,
          contactName,
          contactPhone,
          notes,
          savedAt: Date.now(),
        };
        try {
          sessionStorage.setItem("ws_pending_booking_draft", JSON.stringify(draft));
          localStorage.setItem("ws_pending_booking_draft", JSON.stringify(draft));
        } catch (_) {}

        setFormError(err.message);
        setIsAuthModalOpen(true);
        return;
      }
      setFormError(err.message || "Failed to submit booking request.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Cancel pending booking
  async function handleCancelBooking(bookingId) {
    if (!confirm(isEn ? "Are you sure you want to cancel this pending booking?" : "ఈ బుకింగ్‌ను రద్దు చేయాలనుకుంటున్నారా?")) {
      return;
    }
    try {
      await cancelCustomerBooking(bookingId);
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "Cancelled" } : b))
      );
      if (selectedBookingForTracking?.id === bookingId) {
        setSelectedBookingForTracking((prev) => ({ ...prev, status: "Cancelled" }));
      }
    } catch (err) {
      alert(`Could not cancel booking: ${err.message}`);
    }
  }

  // Confirm Job Completion & Record Payment (Step 9)
  async function handleConfirmPayment(e) {
    e.preventDefault();
    if (!paymentModalBooking) return;

    try {
      setIsConfirmingPayment(true);
      const res = await customerConfirmPaymentAndCompletion({
        bookingId: paymentModalBooking.id,
        paymentMethod,
        paymentReference: paymentReferenceInput.trim() || null,
      });

      const receiptData = {
        receiptNo: res.payment_reference || `WS-PAY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        bookingId: paymentModalBooking.id.substring(0, 8).toUpperCase(),
        service: paymentModalBooking.service_category || "Home Service",
        workerName: paymentModalBooking.worker_profiles?.display_name || "Verified Artisan",
        amount: paymentModalBooking.total_price ? `₹${paymentModalBooking.total_price}` : "Direct Technician Fee",
        method: paymentMethod,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      };

      setPaymentSuccessReceipt(receiptData);

      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.id === paymentModalBooking.id
            ? { ...b, status: "Completed", payment_status: "Paid", payment_method: paymentMethod, payment_reference: receiptData.receiptNo }
            : b
        )
      );

      if (selectedBookingForTracking?.id === paymentModalBooking.id) {
        setSelectedBookingForTracking((prev) => ({
          ...prev,
          status: "Completed",
          payment_status: "Paid",
          payment_method: paymentMethod,
          payment_reference: receiptData.receiptNo,
        }));
      }
    } catch (err) {
      alert(`Could not record payment: ${err.message}`);
    } finally {
      setIsConfirmingPayment(false);
    }
  }

  // Submit Review or Dispute (Step 10)
  async function handleSubmitReviewOrDispute(e) {
    e.preventDefault();
    if (!reviewBooking) return;

    try {
      setIsSubmittingReview(true);

      if (isDisputeOpen && disputeDetails.trim()) {
        await submitCustomerComplaint({
          bookingId: reviewBooking.id,
          workerId: reviewBooking.worker_id || reviewBooking.assigned_worker_id,
          category: disputeCategory,
          description: disputeDetails.trim(),
        });
        setReviewSuccessMsg("Dispute ticket filed with WorkSphere Support. Our executive will contact you.");
      } else {
        await submitReview({
          bookingId: reviewBooking.id,
          workerId: reviewBooking.worker_id || reviewBooking.assigned_worker_id,
          rating,
          comment: reviewComment,
        });
        setReviewSuccessMsg("Thank you! Your feedback helps our artisan community grow.");
      }

      setBookings((prev) =>
        prev.map((b) =>
          b.id === reviewBooking.id ? { ...b, reviews: [{ rating, comment: reviewComment }] } : b
        )
      );

      setTimeout(() => {
        setReviewSuccessMsg("");
        setReviewBooking(null);
        setReviewComment("");
        setDisputeDetails("");
        setIsDisputeOpen(false);
      }, 2000);
    } catch (err) {
      alert(`Submission error: ${err.message}`);
    } finally {
      setIsSubmittingReview(false);
    }
  }

  // Save Customer Profile Changes
  async function handleSaveProfile(e) {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      await updateCustomerProfile({
        fullName: profileName,
        phone: profilePhone,
        city: profileCity,
        address: profileAddress,
      });
      setProfileSaveSuccess(true);
      setTimeout(() => setProfileSaveSuccess(false), 2500);
    } catch (err) {
      alert(`Failed to save profile: ${err.message}`);
    } finally {
      setIsSavingProfile(false);
    }
  }

  // Filtered Bookings for the Table / Cards
  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === "all") return true;
    const st = (b.status || "").toLowerCase().replace(" ", "_");
    return st === statusFilter;
  });

  // Filtered Workers for Find a Worker Tab
  const displayedWorkers = workersList.filter((worker) => {
    // 1. Mandatory eligibility: only approved, genuinely available workers with valid profile data
    if (!worker || !worker.user_id || !worker.display_name) return false;
    const isApproved = String(worker.approval_status || "").trim().toLowerCase() === "approved";
    const isAvailable = worker.is_available === true;
    if (!isApproved || !isAvailable) return false;

    // 2. Category / Trade / Saved Skills filter
    // A worker appears under a category ONLY when their saved skills actually include that category (or trade matches)
    if (selectedCategoryFilter && selectedCategoryFilter !== "all") {
      const target = selectedCategoryFilter.toLowerCase().trim();
      const trade = (worker.trade || "").toLowerCase().trim();
      const skills = Array.isArray(worker.skills)
        ? worker.skills.map((s) => (s || "").toLowerCase().trim())
        : [(worker.skills || "").toLowerCase().trim()];
      const matchTrade = trade === target || trade.includes(target) || target.includes(trade);
      const matchSkills = skills.some((s) => s === target || s.includes(target) || target.includes(s));
      if (!matchTrade && !matchSkills) return false;
    }

    // 3. Location / Service Area filter
    if (selectedCityFilter && selectedCityFilter !== "All Cities") {
      const targetCity = selectedCityFilter.toLowerCase().trim();
      const city = (worker.city || "").toLowerCase().trim();
      const area = (worker.service_area || "").toLowerCase().trim();
      if (targetCity === "guntur") {
        const gunturLocalities = [
          "guntur", "brodipet", "arundelpet", "lakshmipuram", "pattabhipuram",
          "koretipadu", "vidyanagar", "syamalanagar", "gujanagundla", "amaravathi", "old guntur"
        ];
        const match = gunturLocalities.some((loc) => city.includes(loc) || area.includes(loc)) || !city;
        if (!match) return false;
      } else {
        if (!city.includes(targetCity) && !area.includes(targetCity)) return false;
      }
    }

    // 4. Rating filter
    if (selectedRatingFilter && selectedRatingFilter !== "all") {
      const workerRating = Number(worker.rating || 5.0);
      if (workerRating < Number(selectedRatingFilter)) return false;
    }

    // 5. Availability filter
    if (selectedAvailabilityFilter && selectedAvailabilityFilter !== "all") {
      const avail = (worker.availability || "Available Today").toLowerCase();
      if (!avail.includes(selectedAvailabilityFilter.toLowerCase())) return false;
    }

    // 6. Search Term (Name, Trade, City, Service Area, Skills)
    if (workerSearchTerm && workerSearchTerm.trim()) {
      const term = workerSearchTerm.toLowerCase().trim();
      const name = (worker.display_name || "").toLowerCase();
      const trade = (worker.trade || "").toLowerCase();
      const city = (worker.city || "").toLowerCase();
      const area = (worker.service_area || "").toLowerCase();
      const skills = Array.isArray(worker.skills) ? worker.skills.join(" ").toLowerCase() : (worker.skills || "").toLowerCase();
      if (!name.includes(term) && !trade.includes(term) && !city.includes(term) && !area.includes(term) && !skills.includes(term)) {
        return false;
      }
    }
    return true;
  });

  const displayedRecentBookings = bookings.map((b) => ({
    id: b.id,
    booking_code: `Booking #WSA-${(b.id || "").substring(0, 5).toUpperCase()}`,
    service_title: `${b.service_category || b.category_name || "Home Service"} - ${b.service_name || "General Repair"}`,
    category: b.service_category || b.category_name || "Plumbing",
    worker_name: b.worker_profiles?.display_name || (b.worker_id ? "Assigned Worker" : "Pending Worker Assignment"),
    worker_rating: b.worker_profiles?.rating ? Number(b.worker_profiles.rating).toFixed(1) : "5.0",
    worker_reviews_count: b.worker_profiles?.reviews_count || 0,
    worker_avatar: b.worker_profiles?.avatar_url || null,
    date: b.scheduled_at ? new Date(b.scheduled_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Today",
    time: b.preferred_time || "Morning",
    status: (b.status || "pending").toLowerCase(),
    status_label: b.status || "Pending",
    description: b.problem_description || b.description || "Service request",
    locality: b.locality || "Guntur",
    address: b.address || "",
    rawBooking: b,
  })).slice(0, 5);

  const dynamicNotifications = [
    ...(notificationsList || []).map((n) => ({
      id: n.id,
      icon: Bell,
      iconColor: "#0284C7",
      iconBg: "#F0F9FF",
      title: n.title || "Notification",
      message: n.body || n.message || "",
      time: n.created_at ? new Date(n.created_at).toLocaleDateString() : "Recent",
    })),
    ...bookings.slice(0, 4).map((b) => ({
      id: `notif-b-${b.id}`,
      icon: (b.status || "").toLowerCase() === "completed" ? CheckCircle : Clock,
      iconColor: (b.status || "").toLowerCase() === "completed" ? "#10B981" : "#D6B779",
      iconBg: (b.status || "").toLowerCase() === "completed" ? "#ECFDF5" : "#FBF9F4",
      title: `Booking #${(b.id || "").substring(0, 8).toUpperCase()}`,
      message: `${b.service_category || b.category_name || "Service request"} is ${b.status || "Pending"}.`,
      time: b.created_at ? new Date(b.created_at).toLocaleDateString() : "Recent",
    })),
  ];

  return (
    <div className="cust-dashboard-container">
      {/* =========================================================================
          VIEW 1: DASHBOARD TAB (customer-home) — EXACT MATCH TO DESIGN MOCKUP
          ========================================================================= */}
      {(activeTab === "customer-home" || !activeTab) && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Top Row: Welcome Hero Banner + Partner Trust Card */}
          <div className="cust-dashboard-top-grid">
            {/* Left Hero Card */}
            <div className="cust-hero-welcome-banner">
              <div style={{ maxWidth: "58%", zIndex: 2 }}>
                <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#D6B779", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>
                  WELCOME BACK,
                </div>
                <h1 style={{ fontSize: "2.1rem", fontWeight: "800", color: "#FFFFFF", margin: "0 0 10px 0", letterSpacing: "-0.02em" }}>
                  {currentUser?.name || currentUser?.full_name || currentUser?.email?.split("@")[0] || "Customer"} <span style={{ fontSize: "1.8rem" }}>👋</span>
                </h1>
                <p style={{ fontSize: "0.88rem", color: "#D0DCD4", margin: "0 0 20px 0", lineHeight: "1.45" }}>
                  Find skilled workers, book trusted professionals, and get your work done with ease.
                </p>

                {/* Hero Search Bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: "#FFFFFF",
                    borderRadius: "9999px",
                    padding: "6px 8px 6px 16px",
                    gap: "8px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
                    maxWidth: "500px",
                  }}
                >
                  <Search size={16} color="#6F7C72" />
                  <input
                    type="text"
                    placeholder="Search services, e.g. plumbing, electrical..."
                    value={problemText}
                    onChange={(e) => setProblemText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        if (problemText.trim()) {
                          handleDiagnose(problemText);
                        } else {
                          onNavigate && onNavigate("book-service");
                        }
                      }
                    }}
                    style={{
                      border: "none",
                      outline: "none",
                      flex: 1,
                      fontSize: "0.85rem",
                      color: "#1A2823",
                      background: "transparent",
                    }}
                  />
                  <button
                    onClick={() => {
                      if (problemText.trim()) {
                        handleDiagnose(problemText);
                      } else {
                        onNavigate && onNavigate("book-service");
                      }
                    }}
                    style={{
                      background: "#D6B779",
                      color: "#142D27",
                      border: "none",
                      borderRadius: "9999px",
                      padding: "9px 16px",
                      fontSize: "0.82rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      whiteSpace: "nowrap",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#c9a764")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#D6B779")}
                  >
                    <span>Find a Worker</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* Technician Photo Visual on Right */}
              <img
                src="/images/cust_hero_worker.jpg"
                alt="Skilled Worker"
                className="cust-hero-worker-visual"
              />
            </div>

            {/* Right Partner Trust Card */}
            <div className="cust-partner-trust-card">
              <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "1rem" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "#EFEBE1",
                    display: "grid",
                    placeItems: "center",
                    color: "#142D27",
                    flexShrink: 0,
                  }}
                >
                  <Home size={22} color="#142D27" />
                </div>
                <div>
                  <div style={{ fontSize: "1.08rem", fontWeight: "800", color: "#1A2823", lineHeight: "1.25" }}>
                    Your Trusted<br />Home Service Partner
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#6F7C72", marginTop: "4px" }}>
                    Quality • Verified Workers • Safe Payments
                  </div>
                </div>
              </div>

              {/* 4 Feature Columns */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "6px",
                  paddingTop: "0.85rem",
                  borderTop: "1px solid #ECE7DC",
                  textAlign: "center",
                }}
              >
                <div>
                  <ShieldCheck size={20} color="#142D27" style={{ margin: "0 auto 4px" }} />
                  <div style={{ fontSize: "0.74rem", fontWeight: "700", color: "#29342F", lineHeight: "1.2" }}>
                    Verified<br />Workers
                  </div>
                </div>
                <div>
                  <CreditCard size={20} color="#142D27" style={{ margin: "0 auto 4px" }} />
                  <div style={{ fontSize: "0.74rem", fontWeight: "700", color: "#29342F", lineHeight: "1.2" }}>
                    Secure<br />Payments
                  </div>
                </div>
                <div>
                  <Star size={20} color="#142D27" style={{ margin: "0 auto 4px" }} />
                  <div style={{ fontSize: "0.74rem", fontWeight: "700", color: "#29342F", lineHeight: "1.2" }}>
                    Real<br />Reviews
                  </div>
                </div>
                <div>
                  <Headphones size={20} color="#142D27" style={{ margin: "0 auto 4px" }} />
                  <div style={{ fontSize: "0.74rem", fontWeight: "700", color: "#29342F", lineHeight: "1.2" }}>
                    24/7<br />Support
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row: Left (Categories + Recent Bookings) | Right (Notifications + Support Banner) */}
          <div className="cust-dashboard-main-grid">
            {/* Left Column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Service Categories Section */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#1A2823", margin: 0 }}>
                    Service Categories
                  </h3>
                  <button
                    onClick={() => {
                      setCategoryViewMode("linewise");
                      if (onNavigate) onNavigate("browse-services");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#142D27",
                      fontWeight: "700",
                      fontSize: "0.84rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>View All</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                {/* 5 Visual Category Cards */}
                <div className="cust-category-cards-row">
                  {/* 1. Plumbing */}
                  <div
                    className="cust-cat-card-modern"
                    onClick={() => handleSelectCategoryAndFindWorker("Plumbing", "Tap Repair")}
                  >
                    <div className="cust-cat-card-img-wrap">
                      <img src="/images/cat_plumbing.jpg" alt="Plumbing" />
                      <div className="cust-cat-card-floating-badge">
                        <Wrench size={15} color="#142D27" />
                      </div>
                    </div>
                    <div className="cust-cat-card-body">
                      <div className="cust-cat-card-title">Plumbing</div>
                      <div className="cust-cat-card-desc">
                        Leakage • Tap Repair • Drainage • Fittings
                      </div>
                    </div>
                  </div>

                  {/* 2. Electrical */}
                  <div
                    className="cust-cat-card-modern"
                    onClick={() => handleSelectCategoryAndFindWorker("Electrical Services", "Fan Installation")}
                  >
                    <div className="cust-cat-card-img-wrap">
                      <img src="/images/cat_electrical.jpg" alt="Electrical" />
                      <div className="cust-cat-card-floating-badge">
                        <Zap size={15} color="#142D27" />
                      </div>
                    </div>
                    <div className="cust-cat-card-body">
                      <div className="cust-cat-card-title">Electrical</div>
                      <div className="cust-cat-card-desc">
                        Wiring • Switches • Lighting • Fan Installation
                      </div>
                    </div>
                  </div>

                  {/* 3. Carpentry */}
                  <div
                    className="cust-cat-card-modern"
                    onClick={() => handleSelectCategoryAndFindWorker("Carpentry", "Shelf Installation")}
                  >
                    <div className="cust-cat-card-img-wrap">
                      <img src="/images/cat_carpentry.jpg" alt="Carpentry" />
                      <div className="cust-cat-card-floating-badge">
                        <Hammer size={15} color="#142D27" />
                      </div>
                    </div>
                    <div className="cust-cat-card-body">
                      <div className="cust-cat-card-title">Carpentry</div>
                      <div className="cust-cat-card-desc">
                        Furniture • Doors • Shelves • Repairs
                      </div>
                    </div>
                  </div>

                  {/* 4. Cleaning */}
                  <div
                    className="cust-cat-card-modern"
                    onClick={() => handleSelectCategoryAndFindWorker("Home Cleaning", "Full House Cleaning")}
                  >
                    <div className="cust-cat-card-img-wrap">
                      <img src="/images/cat_cleaning.jpg" alt="Cleaning" />
                      <div className="cust-cat-card-floating-badge">
                        <Sparkles size={15} color="#142D27" />
                      </div>
                    </div>
                    <div className="cust-cat-card-body">
                      <div className="cust-cat-card-title">Cleaning</div>
                      <div className="cust-cat-card-desc">
                        Home • Office • Deep Clean • Apartment
                      </div>
                    </div>
                  </div>

                  {/* 5. Painting */}
                  <div
                    className="cust-cat-card-modern"
                    onClick={() => handleSelectCategoryAndFindWorker("Painting Services", "Interior Painting")}
                  >
                    <div className="cust-cat-card-img-wrap">
                      <img src="/images/cat_painting.jpg" alt="Painting" />
                      <div className="cust-cat-card-floating-badge">
                        <Paintbrush size={15} color="#142D27" />
                      </div>
                    </div>
                    <div className="cust-cat-card-body">
                      <div className="cust-cat-card-title">Painting</div>
                      <div className="cust-cat-card-desc">
                        Interior • Exterior • Touch-ups • Wall Care
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Bookings Section Table */}
              <div className="cust-recent-table-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#1A2823", margin: 0 }}>
                    Recent Bookings
                  </h3>
                  <button
                    onClick={() => onNavigate && onNavigate("customer-bookings")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#142D27",
                      fontWeight: "700",
                      fontSize: "0.84rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <span>View All</span>
                    <ArrowRight size={14} />
                  </button>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table className="cust-bookings-modern-table">
                    <thead>
                      <tr>
                        <th style={{ width: "32%" }}>Service</th>
                        <th style={{ width: "26%" }}>Worker</th>
                        <th style={{ width: "20%" }}>Date & Time</th>
                        <th style={{ width: "12%" }}>Status</th>
                        <th style={{ width: "10%", textAlign: "right" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedRecentBookings.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", padding: "2.5rem 1rem", color: "#6F7C72" }}>
                            <Clock size={28} style={{ margin: "0 auto 8px", opacity: 0.5, display: "block" }} />
                            <div style={{ fontWeight: 700, color: "#29342F", fontSize: "0.95rem" }}>No bookings recorded yet</div>
                            <div style={{ fontSize: "0.8rem", marginTop: "4px" }}>Click "Find a Worker" or select a service category to create your first booking.</div>
                          </td>
                        </tr>
                      ) : (
                        displayedRecentBookings.map((row) => (
                        <tr key={row.id} className="booking-row">
                          {/* Service column with icon badge */}
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <div
                                style={{
                                  width: "36px",
                                  height: "36px",
                                  borderRadius: "10px",
                                  background: "#F7F5EF",
                                  border: "1px solid #EAE5D9",
                                  display: "grid",
                                  placeItems: "center",
                                  color: "#142D27",
                                  flexShrink: 0,
                                }}
                              >
                                {row.category?.toLowerCase().includes("plumb") ? (
                                  <Wrench size={16} />
                                ) : row.category?.toLowerCase().includes("elect") ? (
                                  <Zap size={16} />
                                ) : row.category?.toLowerCase().includes("clean") ? (
                                  <Sparkles size={16} />
                                ) : row.category?.toLowerCase().includes("paint") ? (
                                  <Paintbrush size={16} />
                                ) : (
                                  <Hammer size={16} />
                                )}
                              </div>
                              <div>
                                <div style={{ fontSize: "0.88rem", fontWeight: "800", color: "#1A2823" }}>
                                  {row.service_title}
                                </div>
                                <div style={{ fontSize: "0.72rem", color: "#6F7C72" }}>
                                  {row.booking_code}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Worker column */}
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              {row.worker_avatar ? (
                                <img
                                  src={row.worker_avatar}
                                  alt={row.worker_name}
                                  style={{ width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                                />
                              ) : (
                                <div
                                  style={{
                                    width: "34px",
                                    height: "34px",
                                    borderRadius: "50%",
                                    background: "#EAE5D9",
                                    color: "#142D27",
                                    display: "grid",
                                    placeItems: "center",
                                    fontWeight: "800",
                                    fontSize: "0.85rem",
                                    flexShrink: 0,
                                  }}
                                >
                                  {row.worker_name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div style={{ fontSize: "0.84rem", fontWeight: "700", color: "#1A2823" }}>
                                  {row.worker_name}
                                </div>
                                <div style={{ fontSize: "0.72rem", color: "#B98739", display: "flex", alignItems: "center", gap: "2px" }}>
                                  <span>★</span>
                                  <span style={{ fontWeight: "700", color: "#29342F" }}>{row.worker_rating}</span>
                                  <span style={{ color: "#7D8A80" }}>({row.worker_reviews_count} reviews)</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Date & Time column */}
                          <td>
                            <div style={{ fontSize: "0.84rem", fontWeight: "700", color: "#1A2823" }}>
                              {row.date}
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "#7D8A80" }}>
                              {row.time}
                            </div>
                          </td>

                          {/* Status column */}
                          <td>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 10px",
                                borderRadius: "9999px",
                                fontSize: "0.72rem",
                                fontWeight: "700",
                                whiteSpace: "nowrap",
                                background:
                                  row.status === "in_progress"
                                    ? "#E0F2FE"
                                    : row.status === "accepted"
                                    ? "#DCFCE7"
                                    : row.status === "completed"
                                    ? "#E6F4EA"
                                    : "#FEF3C7",
                                color:
                                  row.status === "in_progress"
                                    ? "#0284C7"
                                    : row.status === "accepted"
                                    ? "#16A34A"
                                    : row.status === "completed"
                                    ? "#137333"
                                    : "#D97706",
                              }}
                            >
                              {row.status_label}
                            </span>
                          </td>

                          {/* Action column */}
                          <td style={{ textAlign: "right" }}>
                            <button
                              onClick={() => {
                                if (row.rawBooking) {
                                  handleOpenTrackingModal(row.rawBooking);
                                } else {
                                  setSelectedBookingForTracking({
                                    id: row.id,
                                    service_category: row.category,
                                    service_name: row.service_title,
                                    status: row.status,
                                    scheduled_at: row.date,
                                    preferred_time: row.time,
                                    locality: row.locality,
                                    address: row.address,
                                    problem_description: row.description,
                                    worker_profiles: {
                                      display_name: row.worker_name,
                                      avatar_url: row.worker_avatar,
                                      rating: row.worker_rating,
                                      reviews_count: row.worker_reviews_count,
                                      phone: "+91 98480 22338",
                                    },
                                  });
                                }
                              }}
                              style={{
                                background: "#FFFFFF",
                                border: "1px solid #DDE4DA",
                                borderRadius: "8px",
                                padding: "6px 14px",
                                fontSize: "0.78rem",
                                fontWeight: "700",
                                color: "#1A2823",
                                cursor: "pointer",
                                transition: "all 0.15s ease",
                                whiteSpace: "nowrap",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "#142D27";
                                e.currentTarget.style.background = "#F7F5EF";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "#DDE4DA";
                                e.currentTarget.style.background = "#FFFFFF";
                              }}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column (Notifications + Support Banner) */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Notifications Widget */}
              <div className="cust-notifications-sidebar-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1A2823", margin: 0 }}>
                    Notifications
                  </h3>
                  <button
                    onClick={() => onNavigate && onNavigate("customer-notifications")}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#142D27",
                      fontWeight: "700",
                      fontSize: "0.78rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    <span>View All</span>
                    <ArrowRight size={13} />
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {dynamicNotifications.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "1.5rem 0.5rem", color: "#6F7C72", fontSize: "0.82rem" }}>
                      <Bell size={24} style={{ margin: "0 auto 8px", opacity: 0.4, display: "block" }} />
                      No new notifications yet. Booking status and updates will appear here.
                    </div>
                  ) : (
                    dynamicNotifications.map((n) => {
                      const NIcon = n.icon;
                      return (
                        <div
                          key={n.id}
                          style={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: "10px",
                            paddingBottom: "10px",
                            borderBottom: "1px solid #F0ECE4",
                          }}
                        >
                          <div
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: n.iconBg,
                              color: n.iconColor,
                              display: "grid",
                              placeItems: "center",
                              flexShrink: 0,
                            }}
                          >
                            <NIcon size={15} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#1A2823", lineHeight: "1.3" }}>
                              {n.title}
                            </div>
                            <div style={{ fontSize: "0.74rem", color: "#6F7C72", marginTop: "2px", lineHeight: "1.35" }}>
                              {n.message}
                            </div>
                            <div style={{ fontSize: "0.68rem", color: "#9CA8A0", marginTop: "4px" }}>
                              {n.time}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Support Card */}
              <div className="cust-support-help-banner">
                <img
                  src="/images/cust_support_agent.jpg"
                  alt="Customer Support"
                  style={{ width: "95px", height: "auto", objectFit: "cover", flexShrink: 0 }}
                />
                <div style={{ padding: "16px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <div style={{ fontWeight: "800", fontSize: "1.05rem", color: "#FFFFFF", marginBottom: "4px" }}>
                    Need help?
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#D0DCD4", lineHeight: "1.35", marginBottom: "12px" }}>
                    Our support team is here for you 24/7.
                  </div>
                  <div>
                    <button
                      onClick={() => onNavigate && onNavigate("help-support")}
                      style={{
                        background: "#D6B779",
                        color: "#142D27",
                        border: "none",
                        borderRadius: "8px",
                        padding: "7px 14px",
                        fontSize: "0.78rem",
                        fontWeight: "800",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                        transition: "background 0.2s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#c9a764")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#D6B779")}
                    >
                      <span>Get Support</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Trust Metrics Strip */}
          <div className="cust-bottom-metrics-strip">
            <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
              {/* Stat 1 */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    background: "#EAE5D9",
                    color: "#142D27",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <User size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1A2823", lineHeight: "1.1" }}>
                    500+
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "#6F7C72" }}>Skilled Workers</div>
                </div>
              </div>

              {/* Stat 2 */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    background: "#EAE5D9",
                    color: "#142D27",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Users size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1A2823", lineHeight: "1.1" }}>
                    1000+
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "#6F7C72" }}>Happy Customers</div>
                </div>
              </div>

              {/* Stat 3 */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    background: "#EAE5D9",
                    color: "#142D27",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Star size={18} />
                </div>
                <div>
                  <div style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1A2823", lineHeight: "1.1" }}>
                    4.8/5
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "#6F7C72" }}>Average Rating</div>
                </div>
              </div>
            </div>

            {/* Slogan on Right */}
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontStyle: "italic",
                fontSize: "1.05rem",
                color: "#7D6B42",
                fontWeight: "600",
                letterSpacing: "0.02em",
              }}
            >
              Quality Service Builds Trust
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: BROWSE SERVICES (50 Categories across 10 Clusters & 250+ Services)
          ========================================================================= */}
      {activeTab === "browse-services" && (
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.25rem", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#1A2823", margin: 0 }}>
                  Browse Services
                </h2>
                <span style={{ background: "#E9EFE9", color: "#142D27", padding: "3px 10px", borderRadius: "9999px", fontSize: "0.75rem", fontWeight: 800 }}>
                  50 Categories • 250+ Services
                </span>
              </div>
              <p style={{ fontSize: "0.88rem", color: "#6F7C72", margin: "4px 0 0" }}>
                Select any category or sub-service line to immediately match with verified, background-audited workers.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              {/* Linewise vs Grid view toggle */}
              <div className="cust-view-toggle-wrap">
                <button
                  type="button"
                  className={`cust-view-toggle-btn ${categoryViewMode === "linewise" ? "active" : ""}`}
                  onClick={() => setCategoryViewMode("linewise")}
                  title="View categories organized linewise (Row format)"
                >
                  <List size={14} />
                  <span>Linewise</span>
                </button>
                <button
                  type="button"
                  className={`cust-view-toggle-btn ${categoryViewMode === "grid" ? "active" : ""}`}
                  onClick={() => setCategoryViewMode("grid")}
                  title="View categories as grid cards"
                >
                  <Grid size={14} />
                  <span>Grid</span>
                </button>
              </div>

              {/* Search within Catalogue */}
              <div style={{ display: "flex", alignItems: "center", background: "#FFFFFF", border: "1px solid #DDE4DA", borderRadius: "9999px", padding: "8px 16px", gap: "8px", minWidth: "260px" }}>
                <Search size={15} color="#6F7C72" />
                <input
                  type="text"
                  placeholder="Search across 50 categories..."
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: "0.85rem", width: "100%", background: "transparent", color: "#29342F" }}
                />
                {catalogSearch && (
                  <button onClick={() => setCatalogSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: "#6F7C72", padding: 0 }}>
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* 10 Service Clusters Filter Strip */}
          <div className="cust-groups-scroll" style={{ marginBottom: "1.5rem" }}>
            <button
              className={`cust-group-pill ${selectedGroupFilter === "all" ? "active" : ""}`}
              onClick={() => setSelectedGroupFilter("all")}
            >
              <Grid size={15} />
              <span>All 10 Clusters</span>
            </button>
            {SERVICE_GROUPS.map((grp) => (
              <button
                key={grp.id}
                className={`cust-group-pill ${selectedGroupFilter === grp.id ? "active" : ""}`}
                onClick={() => setSelectedGroupFilter(grp.id)}
              >
                <CategoryIcon name={grp.icon} size={15} />
                <span>{grp.id}. {grp.title || grp.name}</span>
              </button>
            ))}
          </div>

          {/* Categories Rendered Linewise or Grid */}
          {categoryViewMode === "linewise" ? (
            <div className="cust-category-linewise-container">
              {serviceCatalogue
                .filter((cat) => {
                  const matchesGroup = selectedGroupFilter === "all" || cat.groupId === Number(selectedGroupFilter);
                  if (!matchesGroup) return false;
                  if (!catalogSearch || !catalogSearch.trim()) return true;
                  const q = catalogSearch.toLowerCase().trim();
                  const catMatch =
                    (cat.name || "").toLowerCase().includes(q) ||
                    (cat.groupName || "").toLowerCase().includes(q) ||
                    (cat.description || "").toLowerCase().includes(q);
                  const subMatch = (cat.services || []).some(
                    (s) => (s.name || "").toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q)
                  );
                  return catMatch || subMatch;
                })
                .map((cat) => (
                  <div
                    key={cat.id || cat.name}
                    className="cust-category-line-row"
                    onClick={() => handleSelectCategoryAndFindWorker(cat.name)}
                  >
                    <div className="cust-category-line-left">
                      <div className="cust-category-line-icon">
                        <CategoryIcon name={cat.icon} size={22} />
                      </div>
                      <div className="cust-category-line-meta">
                        <div className="cust-category-line-title">{cat.name}</div>
                        <div className="cust-category-line-group">{cat.groupName || "Home Services"}</div>
                      </div>
                    </div>

                    {/* Linewise Sub-services / Skills Chips */}
                    <div className="cust-category-line-skills" onClick={(e) => e.stopPropagation()}>
                      {(cat.services || []).map((sub) => (
                        <span
                          key={sub.id || sub.name}
                          className="cust-subservice-chip"
                          title={sub.description}
                          onClick={() => handleSelectCategoryAndFindWorker(cat.name, sub.name)}
                        >
                          {sub.name}
                        </span>
                      ))}
                    </div>

                    <div className="cust-category-line-actions">
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.75rem", color: "#347B63", fontWeight: 700 }}>
                        <ShieldCheck size={14} />
                        <span>Verified Artisans</span>
                      </div>
                      <button
                        className="cust-category-line-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCategoryAndFindWorker(cat.name);
                        }}
                      >
                        <span>Find Workers</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            /* 50 Categories Grid */
            <div className="cust-50-grid">
              {serviceCatalogue
                .filter((cat) => {
                  const matchesGroup = selectedGroupFilter === "all" || cat.groupId === Number(selectedGroupFilter);
                  if (!matchesGroup) return false;
                  if (!catalogSearch || !catalogSearch.trim()) return true;
                  const q = catalogSearch.toLowerCase().trim();
                  const catMatch =
                    (cat.name || "").toLowerCase().includes(q) ||
                    (cat.groupName || "").toLowerCase().includes(q) ||
                    (cat.description || "").toLowerCase().includes(q);
                  const subMatch = (cat.services || []).some(
                    (s) => (s.name || "").toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q)
                  );
                  return catMatch || subMatch;
                })
                .map((cat) => (
                  <div
                    key={cat.id || cat.name}
                    className="cust-50-card"
                    onClick={() => handleSelectCategoryAndFindWorker(cat.name)}
                  >
                    <div>
                      <div className="cust-50-card-head">
                        <div className="cust-50-icon-wrap">
                          <CategoryIcon name={cat.icon} size={22} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="cust-50-title">{cat.name}</div>
                          <span className="cust-50-group-badge">{cat.groupName}</span>
                        </div>
                      </div>
                      <p className="cust-50-desc">{cat.description}</p>

                      {/* Sub-services pills */}
                      <div className="cust-subservices-list" onClick={(e) => e.stopPropagation()}>
                        {(cat.services || []).map((sub) => (
                          <span
                            key={sub.id || sub.name}
                            className="cust-subservice-chip"
                            title={sub.description}
                            onClick={() => handleSelectCategoryAndFindWorker(cat.name, sub.name)}
                          >
                            {sub.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="cust-50-card-footer">
                      <div className="cust-50-verified-badge">
                        <ShieldCheck size={14} color="#347B63" />
                        <span>Verified Artisans</span>
                      </div>
                      <button
                        className="cust-50-book-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectCategoryAndFindWorker(cat.name);
                        }}
                      >
                        <span>Find a Worker</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          VIEW 2: FIND A WORKER & BROWSE CATEGORIES (book-service)
          ========================================================================= */}
      {activeTab === "book-service" && (
        <section>
          {/* Header */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#29342F", margin: 0 }}>
              Find Approved Local Workers
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#6F7C72", margin: "4px 0 0" }}>
              Browse verified artisans, inspect certifications, and book on-site assistance directly.
            </p>
          </div>

          {/* Active Skill Matched Banner (Step 6 workflow indicator) */}
          {selectedCategoryFilter && selectedCategoryFilter !== "all" && (
            <div className="cust-skill-matched-banner">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#D6B779", color: "#142D27", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Wrench size={20} />
                </div>
                <div>
                  <div style={{ fontSize: "1.05rem", fontWeight: 800 }}>
                    Matching Verified Workers for Skill: <span style={{ color: "#D6B779" }}>{selectedCategoryFilter}</span>
                    {selectedSubService ? ` • ${selectedSubService}` : ""}
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#D0DCD4", marginTop: "2px" }}>
                    Showing verified artisans with matching skills. Click any worker to view details & book directly.
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate("browse-services")}
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                    color: "#FFFFFF",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  Change Category
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategoryFilter("all");
                    setSelectedSubService("");
                  }}
                  style={{
                    background: "#D6B779",
                    border: "none",
                    color: "#142D27",
                    padding: "7px 14px",
                    borderRadius: "8px",
                    fontWeight: 800,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                  }}
                >
                  View All Workers
                </button>
              </div>
            </div>
          )}

          {/* Filter Bar (Step 4 & Step 6) */}
          <div className="cust-filter-bar" style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
            {/* Search Input */}
            <div className="cust-search-input-wrap" style={{ flex: 1, minWidth: "220px" }}>
              <Search size={16} color="#6F7C72" />
              <input
                type="text"
                placeholder="Search workers by name, skill, or trade..."
                value={workerSearchTerm}
                onChange={(e) => setWorkerSearchTerm(e.target.value)}
              />
            </div>

            {/* City Dropdown Filter (Location) */}
            <select
              style={{
                background: "#F7F5EF",
                border: "1px solid #DDE4DA",
                borderRadius: "10px",
                padding: "8px 14px",
                fontWeight: 700,
                color: "#29342F",
                fontSize: "0.85rem",
                outline: "none",
                cursor: "pointer",
              }}
              value={selectedCityFilter}
              onChange={(e) => setSelectedCityFilter(e.target.value)}
            >
              <option value="All Cities">📍 All Cities</option>
              <option value="Guntur">📍 Guntur District</option>
              <option value="Vijayawada">📍 Vijayawada</option>
              <option value="Tenali">📍 Tenali</option>
              <option value="Mangalagiri">📍 Mangalagiri</option>
            </select>

            {/* Rating Filter */}
            <select
              style={{
                background: "#F7F5EF",
                border: "1px solid #DDE4DA",
                borderRadius: "10px",
                padding: "8px 14px",
                fontWeight: 700,
                color: "#29342F",
                fontSize: "0.85rem",
                outline: "none",
                cursor: "pointer",
              }}
              value={selectedRatingFilter}
              onChange={(e) => setSelectedRatingFilter(e.target.value)}
            >
              <option value="all">⭐ All Ratings</option>
              <option value="4.8">⭐ 4.8+ Top Rated</option>
              <option value="4.5">⭐ 4.5+ High Rating</option>
              <option value="4.0">⭐ 4.0+ Verified</option>
            </select>

            {/* Availability Filter */}
            <select
              style={{
                background: "#F7F5EF",
                border: "1px solid #DDE4DA",
                borderRadius: "10px",
                padding: "8px 14px",
                fontWeight: 700,
                color: "#29342F",
                fontSize: "0.85rem",
                outline: "none",
                cursor: "pointer",
              }}
              value={selectedAvailabilityFilter}
              onChange={(e) => setSelectedAvailabilityFilter(e.target.value)}
            >
              <option value="all">🕒 All Availability</option>
              <option value="Today">🟢 Available Today</option>
              <option value="Morning">🌅 Morning Slot</option>
              <option value="Evening">🌆 Evening Slot</option>
            </select>

            {/* Category Dropdown (All 50 Categories across 10 Groups) */}
            <select
              style={{
                background: "#F7F5EF",
                border: "1px solid #DDE4DA",
                borderRadius: "10px",
                padding: "8px 14px",
                fontWeight: 700,
                color: "#29342F",
                fontSize: "0.85rem",
                outline: "none",
                cursor: "pointer",
                maxWidth: "240px",
              }}
              value={selectedCategoryFilter}
              onChange={(e) => {
                const newCat = e.target.value;
                setSelectedCategoryFilter(newCat);
                if (newCat !== "all") {
                  setBookingCategory(newCat);
                  const catObj = getCategoryById(newCat);
                  if (catObj?.services?.[0]?.name) {
                    setSelectedSubService(catObj.services[0].name);
                  }
                }
              }}
            >
              <option value="all">All 50 Service Categories</option>
              {SERVICE_GROUPS.map((grp) => (
                <optgroup key={grp.id} label={`${grp.icon || "📁"} ${grp.title || grp.name}`}>
                  {serviceCatalogue
                    .filter((c) => c.groupId === grp.id || c.groupName === (grp.title || grp.name))
                    .map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>

            {/* Quick Category Filter Pills */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center", width: "100%", marginTop: "4px" }}>
              {[
                { label: "All Trades", val: "all" },
                { label: "Plumbing", val: "Plumbing" },
                { label: "Electrical", val: "Electrical Services" },
                { label: "Carpentry", val: "Carpentry" },
                { label: "Painting", val: "Painting Services" },
                { label: "Cleaning", val: "Home Cleaning" },
                { label: "AC Repair", val: "AC Services" },
                { label: "Bike Repair", val: "Bike Repair" },
              ].map((p) => (
                <button
                  key={p.val}
                  onClick={() => {
                    setSelectedCategoryFilter(p.val);
                    if (p.val !== "all") {
                      setBookingCategory(p.val);
                      const catObj = getCategoryById(p.val);
                      if (catObj?.services?.[0]?.name) {
                        setSelectedSubService(catObj.services[0].name);
                      }
                    }
                  }}
                  style={{
                    background: selectedCategoryFilter === p.val ? "#142D27" : "#F7F5EF",
                    color: selectedCategoryFilter === p.val ? "#FFFFFF" : "#29342F",
                    border: "1px solid #DDE4DA",
                    padding: "6px 14px",
                    borderRadius: "9999px",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 5: Choose Exact Problem or Task (Sub-Service Selector) */}
          <div style={{ background: "#FFFFFF", border: "1px solid #DDE4DA", borderRadius: "16px", padding: "14px 18px", marginTop: "1rem", marginBottom: "1.25rem", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ background: "#142D27", color: "#FFFFFF", fontSize: "0.72rem", fontWeight: 800, padding: "2px 8px", borderRadius: "9999px" }}>
                  Step 5
                </span>
                <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#29342F" }}>
                  Choose Exact Problem or Task: {selectedCategoryFilter !== "all" ? selectedCategoryFilter : "All Categories"}
                </span>
              </div>
              {selectedSubService && (
                <span style={{ fontSize: "0.8rem", color: "#347B63", fontWeight: 700 }}>
                  Selected Task: <b>{selectedSubService}</b>
                </span>
              )}
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setSelectedSubService("")}
                style={{
                  background: !selectedSubService ? "#142D27" : "#F7F5EF",
                  color: !selectedSubService ? "#FFFFFF" : "#29342F",
                  border: "1px solid #DDE4DA",
                  borderRadius: "8px",
                  padding: "6px 12px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                All {selectedCategoryFilter !== "all" ? selectedCategoryFilter : "General"} Tasks
              </button>
              {(getCategoryById(selectedCategoryFilter !== "all" ? selectedCategoryFilter : "Plumbing")?.services || []).map((sub) => (
                <button
                  key={sub.id || sub.name}
                  type="button"
                  onClick={() => setSelectedSubService(sub.name)}
                  style={{
                    background: selectedSubService === sub.name ? "#142D27" : "#F7F5EF",
                    color: selectedSubService === sub.name ? "#FFFFFF" : "#29342F",
                    border: selectedSubService === sub.name ? "1px solid #142D27" : "1px solid #DDE4DA",
                    borderRadius: "8px",
                    padding: "6px 12px",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          </div>

          {/* Worker Cards Grid (Step 5) */}
          <div className="cust-worker-grid">
            {workersLoading ? (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "4rem 1.5rem",
                  background: "#FFFFFF",
                  borderRadius: "20px",
                  border: "1px solid #DDE4DA",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    border: "3px solid rgba(11, 34, 27, 0.12)",
                    borderTopColor: "#0B221B",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#29342F" }}>
                  Fetching verified available workers...
                </span>
                <span style={{ fontSize: "0.82rem", color: "#88978C" }}>
                  Validating live database availability and approval status
                </span>
              </div>
            ) : workersError ? (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "3.5rem 1.5rem",
                  background: "#FFF5F5",
                  borderRadius: "20px",
                  border: "1px solid #FED7D7",
                }}
              >
                <AlertCircle size={42} color="#E53E3E" style={{ margin: "0 auto 12px" }} />
                <div style={{ fontWeight: 800, color: "#9B2C2C", fontSize: "1.1rem", marginBottom: "6px" }}>
                  {workersError}
                </div>
                <p style={{ fontSize: "0.85rem", color: "#C53030", margin: "0 auto 16px" }}>
                  Could not retrieve active workers from Supabase. Unfiltered workers are blocked.
                </p>
                <button
                  type="button"
                  onClick={() => fetchEligibleWorkers()}
                  style={{
                    background: "#E53E3E",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "9px 20px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Retry Loading
                </button>
              </div>
            ) : displayedWorkers.length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3.5rem 1.5rem", background: "#FFFFFF", borderRadius: "20px", border: "1px solid #DDE4DA" }}>
                <User size={44} color="#b2c0b6" style={{ margin: "0 auto 12px" }} />
                <div style={{ fontWeight: 800, color: "#29342F", fontSize: "1.15rem", marginBottom: "8px" }}>
                  No available workers for this service right now. Please try another service or check again later.
                </div>
                <p style={{ fontSize: "0.85rem", color: "#6F7C72", margin: "6px auto 18px", maxWidth: "460px", lineHeight: "1.45" }}>
                  {selectedCategoryFilter !== "all"
                    ? `Currently no approved professional has saved "${selectedCategoryFilter}" in their active skills, or all matching artisans are currently offline.`
                    : "No verified artisans meet the selected criteria at this moment."}
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                  {selectedCategoryFilter !== "all" && (
                    <button
                      type="button"
                      style={{
                        background: "#F7F5EF",
                        border: "1px solid #DDE4DA",
                        color: "#29342F",
                        borderRadius: "9999px",
                        padding: "9px 18px",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setSelectedCategoryFilter("all");
                        setSelectedSubService("");
                      }}
                    >
                      View All Workers
                    </button>
                  )}
                  <button
                    className="cust-btn-book-now"
                    style={{ display: "inline-flex", width: "auto", margin: 0 }}
                    onClick={() => handleOpenBooking(selectedCategoryFilter !== "all" ? selectedCategoryFilter : "Plumbing")}
                  >
                    <span>Post {selectedCategoryFilter !== "all" ? selectedCategoryFilter : ""} Booking Request</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              displayedWorkers.map((worker) => (
                <div
                  key={worker.user_id || worker.id}
                  className="cust-worker-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedWorkerProfile(worker)}
                  title={`Click to view ${worker.display_name}'s full profile & booking details`}
                >
                  {/* Top: Avatar & Name */}
                  <div className="cust-worker-card-header">
                    {worker.avatar_url ? (
                      <img src={worker.avatar_url} alt={worker.display_name} className="cust-worker-avatar" />
                    ) : (
                      <div className="cust-worker-avatar">
                        {(worker.display_name || "W")[0].toUpperCase()}
                      </div>
                    )}
                    <div className="cust-worker-info-wrap">
                      <div className="cust-worker-name">{worker.display_name}</div>
                      <div className="cust-worker-trade">
                        <Wrench size={13} />
                        <span>{worker.trade || "Certified Artisan"}</span>
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#6F7C72" }}>
                        📍 {worker.city || "Guntur"} • {worker.experience_years || 5} yrs experience
                      </div>
                    </div>
                  </div>

                  {/* Rating & Verified Badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div className="cust-worker-rating-row" style={{ margin: 0 }}>
                      <Star size={15} fill="#D6B779" color="#D6B779" />
                      <span>{worker.rating ? Number(worker.rating).toFixed(1) : "5.0"}</span>
                      <span style={{ color: "#6F7C72", fontWeight: 500 }}>
                        {worker.reviews_count ? `(${worker.reviews_count} reviews)` : "(New)"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", background: "#E9EFE9", color: "#347B63", padding: "2px 8px", borderRadius: "6px", fontWeight: 700 }}>
                      <ShieldCheck size={13} />
                      <span>Verified</span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="cust-worker-skills-tags" style={{ display: "flex", flexWrap: "wrap", gap: "6px", margin: "8px 0" }}>
                    {(worker.skills && worker.skills.length > 0 ? worker.skills : [worker.trade || "Expert"]).map((sk) => {
                      const isMatch =
                        selectedCategoryFilter &&
                        selectedCategoryFilter !== "all" &&
                        sk.toLowerCase().includes(selectedCategoryFilter.toLowerCase());
                      return (
                        <span
                          key={sk}
                          className="cust-skill-badge"
                          style={{
                            background: isMatch ? "#142D27" : "#F7F5EF",
                            color: isMatch ? "#D6B779" : "#29342F",
                            border: isMatch ? "1px solid #142D27" : "1px solid #DDE4DA",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: isMatch ? 800 : 600,
                          }}
                        >
                          {sk}
                        </span>
                      );
                    })}
                  </div>

                  {/* Meta: Availability, Service Area, Hourly Rate */}
                  <div className="cust-worker-meta-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", borderTop: "1px solid #F0ECE4", paddingTop: "8px", marginTop: "4px" }}>
                    <span style={{ color: "#347B63", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}>
                      <Check size={13} />
                      <span>{worker.is_available ? (worker.availability || "Available Today") : "Unavailable"}</span>
                    </span>
                    <span style={{ color: "#6F7C72", fontWeight: 600 }}>
                      📍 {worker.service_area || worker.city || "Guntur & Nearby"}
                    </span>
                    {worker.hourly_rate ? (
                      <span style={{ color: "#B98739", fontWeight: 700 }}>
                        ₹{worker.hourly_rate}/hr
                      </span>
                    ) : null}
                  </div>

                  {/* Actions: View Profile, Call Button (if phone present), Bookmark & Book Now */}
                  <div className="cust-worker-actions-row" style={{ display: "flex", gap: "6px", alignItems: "center", marginTop: "10px" }} onClick={(e) => e.stopPropagation()}>
                    <button
                      className="cust-btn-view-profile"
                      style={{ flex: 1, padding: "8px 10px", fontSize: "0.8rem" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedWorkerProfile(worker);
                      }}
                    >
                      View Profile
                    </button>
                    {worker.phone && (
                      <a
                        href={`tel:${worker.phone}`}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          background: "#F7F5EF",
                          color: "#142D27",
                          border: "1px solid #DDE4DA",
                          borderRadius: "10px",
                          padding: "9px 10px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textDecoration: "none",
                          transition: "all 0.15s ease",
                        }}
                        title={`Call ${worker.display_name}`}
                      >
                        <Phone size={14} />
                      </a>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveWorker(worker.user_id || worker.id);
                      }}
                      style={{
                        background: savedWorkerIds.includes(worker.user_id || worker.id) ? "#142D27" : "#FFFFFF",
                        color: savedWorkerIds.includes(worker.user_id || worker.id) ? "#D6B779" : "#6F7C72",
                        border: "1px solid #DDE4DA",
                        borderRadius: "10px",
                        padding: "9px 10px",
                        cursor: "pointer",
                        display: "grid",
                        placeItems: "center",
                        transition: "all 0.15s ease",
                      }}
                      title={savedWorkerIds.includes(worker.user_id || worker.id) ? "Saved to Favorites" : "Save Worker"}
                    >
                      <Bookmark size={15} fill={savedWorkerIds.includes(worker.user_id || worker.id) ? "#D6B779" : "none"} />
                    </button>
                    <button
                      className="cust-btn-book-now"
                      style={{ flex: 1.2, padding: "8px 12px", fontSize: "0.82rem" }}
                      onClick={() => handleOpenBooking(selectedCategoryFilter !== "all" ? selectedCategoryFilter : (worker.trade || "General Service"), worker, "", selectedSubService)}
                    >
                      <span>Book Now</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          VIEW: SAVED WORKERS (saved-workers)
          ========================================================================= */}
      {activeTab === "saved-workers" && (
        <section>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#1A2823", margin: 0 }}>
              Saved Workers
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#6F7C72", margin: "4px 0 0" }}>
              Quickly rebook or contact your preferred and bookmarked verified artisans.
            </p>
          </div>

          <div className="cust-worker-grid">
            {workersList.filter((w) => savedWorkerIds.includes(w.user_id || w.id)).length === 0 ? (
              <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3.5rem 1.5rem", background: "#FFFFFF", borderRadius: "20px", border: "1px solid #DDE4DA" }}>
                <Bookmark size={42} color="#D6B779" style={{ margin: "0 auto 10px" }} />
                <div style={{ fontWeight: 800, color: "#29342F", fontSize: "1.15rem" }}>No saved workers yet</div>
                <p style={{ fontSize: "0.85rem", color: "#6F7C72", margin: "4px 0 16px" }}>
                  Bookmark your favorite professionals in "Find a Worker" for easy access here.
                </p>
                <button
                  className="cust-btn-book-now"
                  style={{ display: "inline-flex", width: "auto", margin: "0 auto" }}
                  onClick={() => onNavigate && onNavigate("book-service")}
                >
                  <Search size={15} />
                  <span>Browse Approved Workers</span>
                </button>
              </div>
            ) : (
              workersList
                .filter((w) => savedWorkerIds.includes(w.user_id || w.id))
                .map((worker) => (
                  <div key={worker.user_id || worker.id} className="cust-worker-card">
                    <div className="cust-worker-card-header">
                      {worker.avatar_url ? (
                        <img src={worker.avatar_url} alt={worker.display_name} className="cust-worker-avatar" />
                      ) : (
                        <div className="cust-worker-avatar">
                          {(worker.display_name || "W")[0].toUpperCase()}
                        </div>
                      )}
                      <div className="cust-worker-info-wrap">
                        <div className="cust-worker-name">{worker.display_name}</div>
                        <div className="cust-worker-trade">
                          <Wrench size={13} />
                          <span>{worker.trade || "Certified Artisan"}</span>
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#6F7C72" }}>
                          📍 {worker.city || "Guntur"} • {worker.experience_years || 5} yrs experience
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <div className="cust-worker-rating-row" style={{ margin: 0 }}>
                        <Star size={15} fill="#D6B779" color="#D6B779" />
                        <span>{worker.rating ? Number(worker.rating).toFixed(1) : "4.9"}</span>
                        <span style={{ color: "#6F7C72", fontWeight: 500 }}>
                          ({worker.reviews_count || 18} reviews)
                        </span>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "0.72rem", background: "#E9EFE9", color: "#347B63", padding: "2px 8px", borderRadius: "6px", fontWeight: 700 }}>
                        <ShieldCheck size={13} />
                        <span>Verified</span>
                      </div>
                    </div>

                    <div className="cust-worker-actions-row" style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "auto" }}>
                      <button
                        className="cust-btn-view-profile"
                        style={{ flex: 1 }}
                        onClick={() => setSelectedWorkerProfile(worker)}
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => toggleSaveWorker(worker.user_id || worker.id)}
                        style={{
                          background: "#fff1f2",
                          color: "#e11d48",
                          border: "1px solid #fecdd3",
                          borderRadius: "10px",
                          padding: "8px 10px",
                          fontSize: "0.76rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                      <button
                        className="cust-btn-book-now"
                        style={{ flex: 1.2 }}
                        onClick={() => handleOpenBooking(worker.trade || "General Service", worker)}
                      >
                        <span>Book Now</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          VIEW 3: MY BOOKINGS & TIMELINE TRACKING (customer-bookings)
          ========================================================================= */}
      {activeTab === "customer-bookings" && (
        <section>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#29342F", margin: 0 }}>
                My Service Bookings & Tracking
              </h2>
              <p style={{ fontSize: "0.9rem", color: "#6F7C72", margin: "4px 0 0" }}>
                Monitor lifecycle progression, verify completion, and manage payment receipts.
              </p>
            </div>

            {/* Status Filter Tabs */}
            <div style={{ display: "flex", gap: "6px", background: "#FFFFFF", padding: "4px", borderRadius: "9999px", border: "1px solid #DDE4DA" }}>
              {["all", "pending", "accepted", "in_progress", "completed", "cancelled"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  style={{
                    background: statusFilter === st ? "#142D27" : "transparent",
                    color: statusFilter === st ? "#FFFFFF" : "#6F7C72",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "9999px",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", background: "#FFFFFF", borderRadius: "20px", border: "1px solid #DDE4DA" }}>
              <CalendarCheck size={42} color="#b2c0b6" style={{ margin: "0 auto 8px" }} />
              <div style={{ fontWeight: 800, color: "#29342F", fontSize: "1.1rem" }}>No bookings in this filter</div>
              <p style={{ fontSize: "0.85rem", color: "#6F7C72", margin: "4px 0 16px" }}>
                Select a service or search workers to schedule assistance.
              </p>
              <button
                className="cust-btn-book-now"
                style={{ display: "inline-flex", width: "auto", margin: "0 auto" }}
                onClick={() => onNavigate && onNavigate("book-service")}
              >
                <span>Find a Worker</span>
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {filteredBookings.map((b) => (
                <div
                  key={b.id}
                  style={{
                    background: "#FFFFFF",
                    border: "1px solid #DDE4DA",
                    borderRadius: "18px",
                    padding: "1.25rem 1.5rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "1rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                  }}
                >
                  {/* Left: Service & Problem */}
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "0.72rem", background: "#E9EFE9", color: "#142D27", padding: "2px 8px", borderRadius: "6px", fontWeight: 800 }}>
                        #BK-{b.id.substring(0, 8).toUpperCase()}
                      </span>
                      <h4 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#29342F", margin: 0 }}>
                        {b.service_category || "Home Service"}
                      </h4>
                    </div>
                    <p style={{ fontSize: "0.85rem", color: "#6F7C72", margin: "0 0 6px 0", maxWidth: "480px" }}>
                      {b.description || "Service request description"}
                    </p>
                    <div style={{ display: "flex", gap: "12px", fontSize: "0.78rem", color: "#6F7C72" }}>
                      <span>📍 {b.locality || "Guntur"}</span>
                      <span>📅 {b.scheduled_at ? new Date(b.scheduled_at).toLocaleDateString() : "Flexible"}</span>
                      <span>⏰ {b.preferred_time || "Morning"}</span>
                    </div>
                  </div>

                  {/* Middle: Worker & Payment */}
                  <div style={{ minWidth: "180px" }}>
                    <div style={{ fontSize: "0.78rem", color: "#6F7C72", marginBottom: "2px" }}>Assigned Professional:</div>
                    <div style={{ fontWeight: 800, color: "#29342F", fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "6px" }}>
                      <User size={14} color="#347B63" />
                      <span>{b.worker_profiles?.display_name || "Waiting worker accept..."}</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", marginTop: "4px" }}>
                      Payment: <b style={{ color: b.payment_status === "Paid" ? "#347B63" : "#B98739" }}>{b.payment_status || "Pending"}</b>
                    </div>
                  </div>

                  {/* Right: Status Pill & Action Buttons */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <span
                      className={
                        b.status === "Completed"
                          ? "status-pill-completed"
                          : b.status === "In Progress"
                          ? "status-pill-in-progress"
                          : b.status === "Accepted"
                          ? "status-pill-accepted"
                          : "status-pill-pending"
                      }
                    >
                      {b.status || "Pending"}
                    </span>

                    {/* Track Timeline Button */}
                    <button
                      className="cust-btn-view-profile"
                      onClick={() => setSelectedBookingForTracking(b)}
                    >
                      Track Timeline
                    </button>

                    {/* Step 9 Action: Confirm Completion & Record Payment */}
                    {b.status === "Completed" && b.payment_status !== "Paid" && (
                      <button
                        className="cust-btn-book-now"
                        style={{ background: "#D6B779", color: "#142D27" }}
                        onClick={() => {
                          setPaymentModalBooking(b);
                          setPaymentSuccessReceipt(null);
                        }}
                      >
                        <CreditCard size={14} />
                        <span>Confirm Payment</span>
                      </button>
                    )}

                    {/* Step 10 Action: Rate & Review */}
                    {b.status === "Completed" && (
                      <button
                        className="cust-btn-view-profile"
                        style={{ background: "#ecfdf5", color: "#059669", borderColor: "#a7f3d0" }}
                        onClick={() => {
                          setReviewBooking(b);
                          setReviewSuccessMsg("");
                        }}
                      >
                        <Star size={13} fill="#059669" />
                        <span>Review</span>
                      </button>
                    )}

                    {/* Cancel action if Pending */}
                    {(b.status === "Pending" || b.status === "pending") && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        style={{
                          background: "#fff1f2",
                          border: "1px solid #fecdd3",
                          color: "#e11d48",
                          padding: "6px 10px",
                          borderRadius: "8px",
                          fontSize: "0.78rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* =========================================================================
          VIEW 4: NOTIFICATIONS TAB (customer-notifications)
          ========================================================================= */}
      {activeTab === "customer-notifications" && (
        <section>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#29342F", margin: 0 }}>
              Booking Notifications
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#6F7C72", margin: "4px 0 0" }}>
              Real-time updates regarding service acceptances, job starts, and payment verifications.
            </p>
          </div>

          <div className="cust-card">
            {notificationsList.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2.5rem", color: "#6F7C72" }}>
                <Bell size={36} color="#b2c0b6" style={{ margin: "0 auto 8px" }} />
                <div style={{ fontWeight: 700, color: "#29342F" }}>All caught up!</div>
                <p style={{ fontSize: "0.82rem", margin: "4px 0 0" }}>No unread booking notifications.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {notificationsList.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationAsRead(n.id)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "12px 14px",
                      background: n.is_read ? "#FFFFFF" : "#F7F5EF",
                      borderRadius: "12px",
                      border: "1px solid #DDE4DA",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#E9EFE9", color: "#142D27", display: "grid", placeItems: "center", flexShrink: 0 }}>
                      <Bell size={16} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <b style={{ color: "#29342F", fontSize: "0.9rem" }}>{n.title || "Booking Update"}</b>
                        <span style={{ fontSize: "0.72rem", color: "#6F7C72" }}>
                          {n.created_at ? new Date(n.created_at).toLocaleDateString() : "Recent"}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.82rem", color: "#6F7C72", margin: "4px 0 0" }}>
                        {n.body || n.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* =========================================================================
          VIEW 5: MY PROFILE TAB (customer-profile)
          ========================================================================= */}
      {activeTab === "customer-profile" && (
        <section>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#29342F", margin: 0 }}>
              Customer Profile & Addresses
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#6F7C72", margin: "4px 0 0" }}>
              Keep your contact details and service address current for fast on-site coordination.
            </p>
          </div>

          <div className="cust-card" style={{ maxWidth: "700px" }}>
            {profileSaveSuccess && (
              <div className="auth-alert success" style={{ marginBottom: "1rem" }}>
                <CheckCircle size={18} />
                <span>Profile details successfully updated!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="profile-form-grid">
              <div className="profile-field-group">
                <label className="profile-field-label">Full Name</label>
                <input
                  type="text"
                  className="profile-field-input"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                />
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">Email Address (Supabase Login)</label>
                <input
                  type="email"
                  className="profile-field-input"
                  value={currentUser?.email || ""}
                  placeholder="Signed in account email"
                  disabled
                />
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">Phone Number</label>
                <input
                  type="tel"
                  className="profile-field-input"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="profile-field-group">
                <label className="profile-field-label">Operating City</label>
                <select
                  className="profile-field-input"
                  value={profileCity}
                  onChange={(e) => setProfileCity(e.target.value)}
                >
                  <option value="Guntur">Guntur District</option>
                  <option value="Vijayawada">Vijayawada / Krishna</option>
                  <option value="Tenali">Tenali</option>
                  <option value="Mangalagiri">Mangalagiri</option>
                </select>
              </div>

              <div className="profile-field-group" style={{ gridColumn: "1 / -1" }}>
                <label className="profile-field-label">Service Street Address & Door No.</label>
                <textarea
                  className="profile-field-input"
                  rows={3}
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  placeholder="e.g. Flat 302, Sri Krishna Residency, Brodipet 4th Line, Guntur"
                />
              </div>

              <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1rem" }}>
                <div style={{ fontSize: "0.8rem", color: "#347B63", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShieldCheck size={16} />
                  <span>Coverage active: Guntur & Krishna postal divisions (520xxx, 521xxx, 522xxx)</span>
                </div>

                <button
                  type="submit"
                  className="cust-btn-book-now"
                  style={{ width: "auto", padding: "10px 24px" }}
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? "Saving..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* =========================================================================
          VIEW 6: HELP & SUPPORT TAB (help-support)
          ========================================================================= */}
      {activeTab === "help-support" && (
        <section>
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.6rem", fontWeight: "800", color: "#1A2823", margin: 0 }}>
              Help & Support
            </h2>
            <p style={{ fontSize: "0.9rem", color: "#6F7C72", margin: "4px 0 0" }}>
              24/7 dedicated assistance for your bookings, artisan questions, payment queries, and dispute resolution.
            </p>
          </div>

          {/* 3 Contact Support Channels */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            <div className="cust-card" style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#EAE5D9", color: "#142D27", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Phone size={20} />
              </div>
              <div>
                <div style={{ fontSize: "0.92rem", fontWeight: "800", color: "#1A2823" }}>24/7 Customer Helpline</div>
                <div style={{ fontSize: "0.82rem", color: "#142D27", fontWeight: 700, margin: "2px 0" }}>1800-425-WORK (9675)</div>
                <div style={{ fontSize: "0.72rem", color: "#6F7C72" }}>Toll-free • English & Telugu assistance</div>
              </div>
            </div>

            <div className="cust-card" style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#EAE5D9", color: "#142D27", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <Send size={20} />
              </div>
              <div>
                <div style={{ fontSize: "0.92rem", fontWeight: "800", color: "#1A2823" }}>Email Support Desk</div>
                <div style={{ fontSize: "0.82rem", color: "#142D27", fontWeight: 700, margin: "2px 0" }}>support@worksphere.ai</div>
                <div style={{ fontSize: "0.72rem", color: "#6F7C72" }}>Response guaranteed within 2 hours</div>
              </div>
            </div>

            <div className="cust-card" style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "#EAE5D9", color: "#142D27", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontSize: "0.92rem", fontWeight: "800", color: "#1A2823" }}>Artisan Dispute Resolution</div>
                <div style={{ fontSize: "0.82rem", color: "#142D27", fontWeight: 700, margin: "2px 0" }}>Quality Guarantee</div>
                <div style={{ fontSize: "0.72rem", color: "#6F7C72" }}>Free rework protection for completed jobs</div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.5rem" }}>
            {/* Report a Booking Issue / Dispute Ticket */}
            <div className="cust-card">
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                <AlertTriangle size={18} color="#D6B779" />
                <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#1A2823", margin: 0 }}>
                  Report Booking Problem or Request Assistance
                </h3>
              </div>

              {supportTicketSuccess ? (
                <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "16px", borderRadius: "12px", color: "#065F46" }}>
                  <div style={{ fontWeight: 800, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    <CheckCircle size={18} color="#059669" />
                    <span>Ticket Submitted Successfully!</span>
                  </div>
                  <p style={{ fontSize: "0.82rem", margin: "6px 0 0 0", lineHeight: "1.4" }}>
                    Your request has been logged. A customer relations executive has been assigned and will contact you via phone within 30 minutes.
                  </p>
                  <button
                    onClick={() => {
                      setSupportTicketSuccess(false);
                      setSupportIssueMessage("");
                    }}
                    style={{
                      marginTop: "12px",
                      background: "#059669",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "8px",
                      padding: "6px 14px",
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!supportIssueMessage.trim()) return;
                    try {
                      await submitCustomerComplaint({
                        bookingId: bookings[0]?.id || null,
                        workerId: bookings[0]?.worker_id || null,
                        category: supportIssueCategory,
                        description: supportIssueMessage.trim(),
                      });
                      setSupportTicketSuccess(true);
                    } catch (_) {
                      setSupportTicketSuccess(true);
                    }
                  }}
                  style={{ display: "flex", flexDirection: "column", gap: "12px" }}
                >
                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#29342F", display: "block", marginBottom: "4px" }}>
                      Issue Category
                    </label>
                    <select
                      value={supportIssueCategory}
                      onChange={(e) => setSupportIssueCategory(e.target.value)}
                      style={{
                        width: "100%",
                        background: "#F7F5EF",
                        border: "1px solid #DDE4DA",
                        borderRadius: "10px",
                        padding: "8px 12px",
                        fontSize: "0.85rem",
                        color: "#29342F",
                        outline: "none",
                      }}
                    >
                      <option value="Booking Inquiry">General Booking Inquiry</option>
                      <option value="Worker Delayed / No Show">Worker Delayed or No Show</option>
                      <option value="Service Quality Issue">Service Quality / Workmanship</option>
                      <option value="Payment / Billing Issue">Payment or Direct Billing Question</option>
                      <option value="Cancellation Assistance">Cancellation & Reschedule Help</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: "0.82rem", fontWeight: 700, color: "#29342F", display: "block", marginBottom: "4px" }}>
                      Describe the Problem
                    </label>
                    <textarea
                      rows={4}
                      value={supportIssueMessage}
                      onChange={(e) => setSupportIssueMessage(e.target.value)}
                      placeholder="Please explain what happened, including any booking reference number..."
                      required
                      style={{
                        width: "100%",
                        background: "#F7F5EF",
                        border: "1px solid #DDE4DA",
                        borderRadius: "10px",
                        padding: "10px 12px",
                        fontSize: "0.85rem",
                        color: "#29342F",
                        outline: "none",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="cust-btn-book-now"
                    style={{ width: "100%", padding: "10px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                  >
                    <Send size={15} />
                    <span>Submit Ticket to Support</span>
                  </button>
                </form>
              )}
            </div>

            {/* Frequently Asked Questions */}
            <div className="cust-card">
              <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#1A2823", margin: "0 0 1rem 0" }}>
                Frequently Asked Questions
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ background: "#F7F5EF", padding: "12px", borderRadius: "10px" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1A2823" }}>
                    How does WorkSphere AI verify workers?
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#6F7C72", marginTop: "4px", lineHeight: "1.4" }}>
                    Every technician must pass trade skill verification, submit government ID proof, and undergo police verification audit before receiving approval from our Admin Dashboard.
                  </div>
                </div>

                <div style={{ background: "#F7F5EF", padding: "12px", borderRadius: "10px" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1A2823" }}>
                    When do I pay for the service?
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#6F7C72", marginTop: "4px", lineHeight: "1.4" }}>
                    You never pay upfront. You pay the worker directly (via UPI or cash) only after the job is completed and you confirm your satisfaction.
                  </div>
                </div>

                <div style={{ background: "#F7F5EF", padding: "12px", borderRadius: "10px" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1A2823" }}>
                    What if a worker declines my booking request?
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#6F7C72", marginTop: "4px", lineHeight: "1.4" }}>
                    If a worker declines due to schedule conflict, you are immediately notified and can choose another approved artisan in your locality with one click.
                  </div>
                </div>

                <div style={{ background: "#F7F5EF", padding: "12px", borderRadius: "10px" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#1A2823" }}>
                    Can I cancel a booking?
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#6F7C72", marginTop: "4px", lineHeight: "1.4" }}>
                    Yes! You can cancel any booking in "Pending" status directly from "My Bookings" with zero penalty fee.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          MODAL 1: WORKER PROFILE MODAL (All 12 Worker Detail Fields)
          ========================================================================= */}
      {selectedWorkerProfile && (
        <div className="modal-backdrop" onClick={() => setSelectedWorkerProfile(null)}>
          <div className="modal-card" style={{ maxWidth: "600px", padding: "1.75rem" }} onClick={(e) => e.stopPropagation()}>
            {/* Header: Photo, Name, Trade, Verification Badge */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.2rem" }}>
              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                {/* 1. Profile photo */}
                <div style={{ position: "relative" }}>
                  {selectedWorkerProfile.avatar_url ? (
                    <img
                      src={selectedWorkerProfile.avatar_url}
                      alt={selectedWorkerProfile.display_name}
                      className="cust-worker-avatar"
                      style={{ width: "70px", height: "70px", borderRadius: "16px" }}
                    />
                  ) : (
                    <div className="cust-worker-avatar" style={{ width: "70px", height: "70px", borderRadius: "16px", fontSize: "1.6rem" }}>
                      {(selectedWorkerProfile.display_name || "W")[0].toUpperCase()}
                    </div>
                  )}
                  {/* 3. Verification badge on photo */}
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-4px",
                      right: "-4px",
                      background: "#10B981",
                      color: "#FFFFFF",
                      borderRadius: "50%",
                      width: "22px",
                      height: "22px",
                      display: "grid",
                      placeItems: "center",
                      border: "2px solid #FFFFFF",
                    }}
                    title="Admin Approved & Verified"
                  >
                    <Check size={13} />
                  </div>
                </div>

                <div>
                  {/* 2. Full name */}
                  <h3 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#1A2823", margin: "0 0 2px 0" }}>
                    {selectedWorkerProfile.display_name}
                  </h3>
                  <div style={{ color: "#347B63", fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Wrench size={14} />
                    <span>{selectedWorkerProfile.trade || "Certified Master Artisan"}</span>
                  </div>
                  {/* 3. Verification Badge text */}
                  <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", fontSize: "0.74rem", background: "#E9EFE9", color: "#142D27", padding: "2px 8px", borderRadius: "6px", fontWeight: 800, marginTop: "4px" }}>
                    <ShieldCheck size={13} color="#347B63" />
                    <span>Admin Approved & Police Audited</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedWorkerProfile(null)}
                style={{ background: "#F7F5EF", border: "1px solid #DDE4DA", borderRadius: "50%", width: "32px", height: "32px", cursor: "pointer", color: "#6F7C72", display: "grid", placeItems: "center" }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Quick 4-Grid Stats: Rating & Reviews, Experience, Completed Jobs, Pricing */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", background: "#F7F5EF", padding: "12px", borderRadius: "14px", marginBottom: "1.2rem", textAlign: "center" }}>
              {/* 6. Rating and reviews */}
              <div style={{ borderRight: "1px solid #EAE5D9" }}>
                <div style={{ fontSize: "0.7rem", color: "#6F7C72", fontWeight: 700 }}>RATING</div>
                <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#1A2823", display: "flex", alignItems: "center", justifyContent: "center", gap: "3px" }}>
                  <Star size={14} fill="#D6B779" color="#D6B779" />
                  <span>{selectedWorkerProfile.rating ? Number(selectedWorkerProfile.rating).toFixed(1) : "4.9"}</span>
                </div>
                <div style={{ fontSize: "0.68rem", color: "#88978C" }}>{selectedWorkerProfile.reviews_count || 18} reviews</div>
              </div>

              {/* 5. Experience */}
              <div style={{ borderRight: "1px solid #EAE5D9" }}>
                <div style={{ fontSize: "0.7rem", color: "#6F7C72", fontWeight: 700 }}>EXPERIENCE</div>
                <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#1A2823" }}>
                  {selectedWorkerProfile.experience_years || 5}+ Yrs
                </div>
                <div style={{ fontSize: "0.68rem", color: "#88978C" }}>Verified field</div>
              </div>

              {/* 10. Completed jobs */}
              <div style={{ borderRight: "1px solid #EAE5D9" }}>
                <div style={{ fontSize: "0.7rem", color: "#6F7C72", fontWeight: 700 }}>COMPLETED</div>
                <div style={{ fontSize: "1.05rem", fontWeight: "800", color: "#1A2823" }}>
                  {selectedWorkerProfile.completed_jobs_count || 52}
                </div>
                <div style={{ fontSize: "0.68rem", color: "#88978C" }}>Bookings done</div>
              </div>

              {/* 9. Pricing */}
              <div>
                <div style={{ fontSize: "0.7rem", color: "#6F7C72", fontWeight: 700 }}>PRICING</div>
                <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#142D27" }}>
                  {selectedWorkerProfile.pricing ? `₹${selectedWorkerProfile.pricing}` : "On-site Quote"}
                </div>
                <div style={{ fontSize: "0.68rem", color: "#88978C" }}>Zero hidden fee</div>
              </div>
            </div>

            {/* Bio */}
            <div style={{ background: "#FFFFFF", border: "1px solid #DDE4DA", padding: "12px 14px", borderRadius: "12px", fontSize: "0.84rem", color: "#29342F", lineHeight: 1.5, marginBottom: "1rem" }}>
              {selectedWorkerProfile.bio || "Dedicated local professional with verified field experience. Specializes in on-site diagnostics, precision troubleshooting, genuine part fittings, and transparent upfront quotes."}
            </div>

            {/* 4. Skills and Services */}
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#1A2823", marginBottom: "6px" }}>
                Skills & Offered Services:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {(selectedWorkerProfile.skills || [selectedWorkerProfile.trade || "Master Repair"]).map((sk) => (
                  <span key={sk} className="cust-skill-badge" style={{ padding: "5px 12px", fontSize: "0.78rem" }}>
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* 7. Service area & 8. Availability Meta Rows */}
            <div style={{ borderTop: "1px solid #EAE5D9", borderBottom: "1px solid #EAE5D9", padding: "10px 0", marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem" }}>
                <span style={{ color: "#6F7C72", display: "flex", alignItems: "center", gap: "5px" }}>
                  <MapPin size={14} />
                  <span>Service Area Coverage:</span>
                </span>
                <span style={{ fontWeight: 800, color: "#1A2823" }}>
                  {selectedWorkerProfile.service_area || "All Guntur & Vijayawada Municipal Divisions"}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.82rem" }}>
                <span style={{ color: "#6F7C72", display: "flex", alignItems: "center", gap: "5px" }}>
                  <Clock size={14} />
                  <span>Availability Status:</span>
                </span>
                <span style={{ fontWeight: 800, color: "#10B981", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span>🟢</span>
                  <span>{selectedWorkerProfile.availability || "Accepts Requests • Available Today"}</span>
                </span>
              </div>
            </div>

            {/* 11. Booking button & 12. Call button */}
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <a
                href={`tel:${selectedWorkerProfile.phone || "+919848022338"}`}
                style={{
                  background: "#F7F5EF",
                  border: "1px solid #DDE4DA",
                  color: "#142D27",
                  padding: "12px 18px",
                  borderRadius: "12px",
                  fontWeight: 800,
                  fontSize: "0.88rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
                title="Call Worker (Subject to privacy policy)"
              >
                <Phone size={16} />
                <span>Call Worker</span>
              </a>

              <button
                className="cust-btn-book-now"
                style={{ flex: 1, padding: "12px 20px", fontSize: "0.92rem", justifyContent: "center" }}
                onClick={() => {
                  const w = selectedWorkerProfile;
                  setSelectedWorkerProfile(null);
                  handleOpenBooking(w.trade || selectedCategoryFilter || "General Service", w, "", selectedSubService);
                }}
              >
                <span>Book Service with {selectedWorkerProfile.display_name}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: BOOK A WORKER FORM (Step 6 with 10 fields)
          ========================================================================= */}
      {isBookingModalOpen && (
        <div className="modal-backdrop" onClick={() => !isSubmitting && setIsBookingModalOpen(false)}>
          <div
            className="modal-card"
            style={{
              maxWidth: "620px",
              maxHeight: "92vh",
              display: "flex",
              flexDirection: "column",
              padding: 0,
              borderRadius: "20px",
              overflow: "hidden",
              boxShadow: "0 25px 60px rgba(20,45,39,0.28)",
              background: "#FFFFFF",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 1. Fixed Modal Header */}
            <div
              style={{
                padding: "1.2rem 1.5rem",
                borderBottom: "1px solid #E3E9E0",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "#FFFFFF",
                flexShrink: 0,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      background: "#142D27",
                      color: "#D6B779",
                      fontSize: "0.72rem",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      letterSpacing: "0.02em",
                    }}
                  >
                    Step 8 of 11
                  </span>
                  <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#29342F", margin: 0 }}>
                    Book a Local Worker
                  </h3>
                </div>
                <div style={{ fontSize: "0.82rem", color: "#6F7C72", marginTop: "3px" }}>
                  {selectedWorkerForBooking
                    ? `Dispatch request to ${selectedWorkerForBooking.display_name}`
                    : "Enter problem & schedule an on-demand verified professional"}
                </div>
              </div>
              <button
                onClick={() => setIsBookingModalOpen(false)}
                style={{
                  background: "#F7F5EF",
                  border: "1px solid #DDE4DA",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  color: "#6F7C72",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 2. Scrollable Modal Body */}
            <div style={{ padding: "1.25rem 1.5rem", overflowY: "auto", flex: 1 }}>
              {formError && (
                <div
                  className="auth-alert error"
                  style={{
                    marginBottom: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <AlertCircle size={18} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: "0.88rem" }}>{formError}</span>
                  </div>
                  {formError.toLowerCase().includes("sign in") && (
                    <button
                      type="button"
                      onClick={() => setIsAuthModalOpen(true)}
                      style={{
                        background: "#0F3E32",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 14px",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      Sign In Now →
                    </button>
                  )}
                </div>
              )}

              {/* Confirmation screen if saved */}
              {bookingConfirmation ? (
                <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#ecfdf5", color: "#059669", display: "grid", placeItems: "center", margin: "0 auto 12px" }}>
                    <CheckCircle size={32} />
                  </div>
                  <h3 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#29342F", margin: "0 0 6px" }}>
                    Booking Submitted as Pending!
                  </h3>
                  <p style={{ fontSize: "0.88rem", color: "#6F7C72", margin: "0 0 1.5rem" }}>
                    Saved in Supabase as <b>Pending</b>. Waiting for artisan response (acceptance/decline).
                  </p>

                  <div className="payment-receipt-card" style={{ borderStyle: "solid", borderColor: "#DDE4DA", textAlign: "left" }}>
                    <div className="receipt-row">
                      <span className="receipt-label">Booking Reference:</span>
                      <span className="receipt-val" style={{ color: "#142D27" }}>{bookingConfirmation.bookingId}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-label">Service Category:</span>
                      <span className="receipt-val">{bookingConfirmation.serviceCategory}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-label">Preferred Date & Slot:</span>
                      <span className="receipt-val">{bookingConfirmation.preferredDate} ({bookingConfirmation.preferredTime})</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-label">Assigned Pro:</span>
                      <span className="receipt-val">{bookingConfirmation.workerName}</span>
                    </div>
                    <div className="receipt-row">
                      <span className="receipt-label">Supabase Status:</span>
                      <span className="receipt-val" style={{ color: "#B98739", fontWeight: 800 }}>Pending</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px", marginTop: "1.5rem" }}>
                    <button
                      className="cust-btn-book-now"
                      style={{ flex: 1 }}
                      onClick={() => {
                        setIsBookingModalOpen(false);
                        if (onNavigate) onNavigate("customer-bookings");
                      }}
                    >
                      <span>Track in My Bookings</span>
                      <ArrowRight size={15} />
                    </button>
                    <button
                      className="cust-btn-view-profile"
                      style={{ flex: 1 }}
                      onClick={() => setIsBookingModalOpen(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <form id="customer-booking-form" onSubmit={handleSubmitBooking} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {/* 1. Category and Sub-Service Grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label className="profile-field-label">1. Service Category</label>
                      <select
                        className="profile-field-input"
                        style={{ width: "100%", marginTop: "4px" }}
                        value={bookingCategory}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          setBookingCategory(newCat);
                          const catObj = getCategoryById(newCat);
                          if (catObj?.services && catObj.services.length > 0) {
                            setSelectedSubService(catObj.services[0].name);
                          }
                        }}
                      >
                        {SERVICE_GROUPS.map((grp) => (
                          <optgroup key={grp.id} label={`${grp.id}. ${grp.title}`}>
                            {SERVICE_CATEGORIES.filter((c) => c.groupId === grp.id).map((c) => (
                              <option key={c.id} value={c.name}>
                                {c.name}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="profile-field-label">Specific Problem / Task</label>
                      <select
                        className="profile-field-input"
                        style={{ width: "100%", marginTop: "4px" }}
                        value={selectedSubService}
                        onChange={(e) => setSelectedSubService(e.target.value)}
                      >
                        {(
                          (getCategoryById(bookingCategory)?.services?.length ? getCategoryById(bookingCategory).services : null) ||
                          getCategoryById("Plumbing")?.services ||
                          []
                        ).map((s) => (
                          <option key={s.id || s.name} value={s.name}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 2. Selected Worker */}
                  <div>
                    <label className="profile-field-label">2. Assigned Professional</label>
                    {selectedWorkerForBooking ? (
                      <div
                        style={{
                          background: "#F7F5EF",
                          border: "1px solid #DDE4DA",
                          borderRadius: "12px",
                          padding: "10px 14px",
                          marginTop: "4px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div
                            style={{
                              width: "38px",
                              height: "38px",
                              borderRadius: "50%",
                              background: "#142D27",
                              color: "#D6B779",
                              display: "grid",
                              placeItems: "center",
                              fontWeight: 800,
                              fontSize: "0.95rem",
                            }}
                          >
                            {(selectedWorkerForBooking.display_name || "W")[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: "#29342F", fontSize: "0.92rem" }}>
                              {selectedWorkerForBooking.display_name}
                            </div>
                            <div style={{ fontSize: "0.76rem", color: "#6F7C72", marginTop: "1px" }}>
                              {selectedWorkerForBooking.trade || "Certified Artisan"} • 📍 {selectedWorkerForBooking.city || "Guntur"} • ⭐ {selectedWorkerForBooking.rating ? Number(selectedWorkerForBooking.rating).toFixed(1) : "5.0"}
                            </div>
                            {/* Worker Skills Pills */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                              {(selectedWorkerForBooking.skills && selectedWorkerForBooking.skills.length > 0
                                ? selectedWorkerForBooking.skills
                                : [selectedWorkerForBooking.trade || "Certified Artisan"]
                              ).map((sk) => {
                                const isMatch =
                                  bookingCategory &&
                                  sk.toLowerCase().includes(bookingCategory.toLowerCase());
                                return (
                                  <span
                                    key={sk}
                                    style={{
                                      fontSize: "0.7rem",
                                      padding: "2px 7px",
                                      borderRadius: "6px",
                                      background: isMatch ? "#142D27" : "#FFFFFF",
                                      color: isMatch ? "#D6B779" : "#347B63",
                                      border: "1px solid #C8D7C5",
                                      fontWeight: isMatch ? 800 : 600,
                                    }}
                                  >
                                    {sk}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedWorkerForBooking(null)}
                          style={{
                            background: "#fff1f2",
                            border: "1px solid #fecdd3",
                            color: "#e11d48",
                            padding: "5px 12px",
                            borderRadius: "8px",
                            fontSize: "0.75rem",
                            cursor: "pointer",
                            fontWeight: 700,
                          }}
                        >
                          Change
                        </button>
                      </div>
                    ) : (
                      <div
                        style={{
                          background: "#F7F5EF",
                          border: "1px dashed #DDE4DA",
                          borderRadius: "12px",
                          padding: "12px 14px",
                          marginTop: "4px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div style={{ fontSize: "0.85rem", color: "#29342F", fontWeight: 700 }}>
                          ⚡ Auto-match nearest approved {bookingCategory} artisan
                        </div>
                        <span style={{ fontSize: "0.74rem", color: "#347B63", fontWeight: 700, background: "#E9EFE9", padding: "2px 8px", borderRadius: "6px" }}>
                          Instant Match
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 3. Description of Problem */}
                  <div>
                    <label className="profile-field-label">3. Description of Problem / Task</label>
                    <textarea
                      className="profile-field-input"
                      style={{ width: "100%", marginTop: "4px" }}
                      rows={3}
                      placeholder="Explain what needs fixing (e.g., tap leakage under basin, fan speed regulator sparking)..."
                      value={formProblem}
                      onChange={(e) => setFormProblem(e.target.value)}
                      required
                    />
                  </div>

                  {/* 4. Optional Photo Upload */}
                  <div>
                    <label className="profile-field-label">4. Optional Photo of Problem</label>
                    <div
                      style={{
                        marginTop: "4px",
                        border: "1px dashed #DDE4DA",
                        borderRadius: "10px",
                        padding: "10px 14px",
                        background: "#F7F5EF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontSize: "0.82rem", color: photoFile ? "#142D27" : "#6F7C72", fontWeight: photoFile ? 700 : 500 }}>
                        {photoFile ? `📎 ${photoFile.name}` : "Upload picture of issue or appliance"}
                      </span>
                      <label style={{ background: "#142D27", color: "#FFFFFF", padding: "5px 12px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>
                        Browse Photo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setPhotoFile(e.target.files[0] || null)}
                          style={{ display: "none" }}
                        />
                      </label>
                    </div>
                  </div>

                  {/* 5. Service Address, Locality & PIN */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label className="profile-field-label">5. Locality / Colony</label>
                      <input
                        type="text"
                        className="profile-field-input"
                        style={{ width: "100%", marginTop: "4px" }}
                        value={locality}
                        onChange={(e) => setLocality(e.target.value)}
                        placeholder="e.g. Brodipet"
                        required
                      />
                    </div>
                    <div>
                      <label className="profile-field-label">Postal PIN Code</label>
                      <input
                        type="text"
                        className="profile-field-input"
                        style={{ width: "100%", marginTop: "4px" }}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        maxLength={6}
                        placeholder="522002"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="profile-field-label">Complete Street / Flat Address</label>
                    <input
                      type="text"
                      className="profile-field-input"
                      style={{ width: "100%", marginTop: "4px" }}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Door / Flat No., Apartment / Building Name, Street"
                      required
                    />
                  </div>

                  {/* 6 & 7. Preferred Date & Time */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label className="profile-field-label">6. Preferred Date</label>
                      <input
                        type="date"
                        className="profile-field-input"
                        style={{ width: "100%", marginTop: "4px" }}
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="profile-field-label">7. Preferred Time Slot</label>
                      <select
                        className="profile-field-input"
                        style={{ width: "100%", marginTop: "4px" }}
                        value={preferredTime}
                        onChange={(e) => setPreferredTime(e.target.value)}
                      >
                        <option value="Morning (09:00 AM - 01:00 PM)">Morning (09:00 AM - 01:00 PM)</option>
                        <option value="Afternoon (01:00 PM - 05:00 PM)">Afternoon (01:00 PM - 05:00 PM)</option>
                        <option value="Evening (05:00 PM - 09:00 PM)">Evening (05:00 PM - 09:00 PM)</option>
                      </select>
                    </div>
                  </div>

                  {/* 8. Contact Details */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label className="profile-field-label">8. Contact Name</label>
                      <input
                        type="text"
                        className="profile-field-input"
                        style={{ width: "100%", marginTop: "4px" }}
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="profile-field-label">Contact Phone</label>
                      <input
                        type="tel"
                        className="profile-field-input"
                        style={{ width: "100%", marginTop: "4px" }}
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* 9. Direct Artisan Assessment Guarantee (No Prices) */}
                  <div
                    style={{
                      background: "#E9EFE9",
                      border: "1px solid #C8D7C5",
                      borderRadius: "12px",
                      padding: "12px 14px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.74rem", color: "#347B63", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.04em" }}>
                        9. Direct Artisan Assessment
                      </div>
                      <div style={{ fontSize: "0.9rem", color: "#142D27", fontWeight: 800, marginTop: "2px" }}>
                        {selectedSubService || bookingCategory}
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "#29342F", marginTop: "2px" }}>
                        Inspected on-site with transparent artisan confirmation & zero hidden platform markups.
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        color: "#347B63",
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        background: "#FFFFFF",
                        padding: "5px 10px",
                        borderRadius: "9999px",
                        border: "1px solid #C8D7C5",
                        flexShrink: 0,
                      }}
                    >
                      <ShieldCheck size={15} color="#347B63" />
                      <span>Verified Terms</span>
                    </div>
                  </div>
                </form>
              )}
            </div>

            {/* 3. Fixed Modal Footer (Always Visible on Screen) */}
            {!bookingConfirmation && (
              <div
                style={{
                  padding: "1rem 1.5rem",
                  borderTop: "1px solid #E3E9E0",
                  background: "#FFFFFF",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  flexShrink: 0,
                }}
              >
                <button
                  type="submit"
                  form="customer-booking-form"
                  className="cust-btn-book-now"
                  style={{ width: "100%", padding: "12px", fontSize: "0.95rem" }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving Request as Pending..." : "9. Submit Booking (Save as Pending) →"}
                </button>
                <div style={{ textAlign: "center", fontSize: "0.72rem", color: "#6F7C72" }}>
                  🔒 Direct on-demand request • Saved in Supabase as Pending • Free cancellation before arrival
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: TRACKING & STATUS TIMELINE MODAL (Step 8)
          ========================================================================= */}
      {selectedBookingForTracking && (
        <div className="modal-backdrop" onClick={() => setSelectedBookingForTracking(null)}>
          <div className="modal-card" style={{ maxWidth: "620px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", background: "#E9EFE9", color: "#142D27", padding: "2px 8px", borderRadius: "6px", fontWeight: 800 }}>
                  #BK-{selectedBookingForTracking.id.substring(0, 8).toUpperCase()}
                </span>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#29342F", margin: "4px 0 0" }}>
                  {selectedBookingForTracking.service_name
                    ? `${selectedBookingForTracking.service_category} — ${selectedBookingForTracking.service_name}`
                    : selectedBookingForTracking.service_category}
                </h3>
              </div>
              <button onClick={() => setSelectedBookingForTracking(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6F7C72" }}>
                <X size={20} />
              </button>
            </div>

            {/* Stepper Timeline: 6-Stage Customer/Worker Workflow */}
            {["Cancelled", "Rejected", "cancelled", "rejected"].includes(selectedBookingForTracking.status) ? (
              <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: "10px", padding: "12px 16px", marginBottom: "1rem", color: "#e11d48", fontWeight: 700 }}>
                ⚠️ This booking was {selectedBookingForTracking.status.toLowerCase()}.
              </div>
            ) : (() => {
              const bStatus = (selectedBookingForTracking.status || "Pending").toLowerCase().trim();
              const isAccepted = ["accepted", "on the way", "on_the_way", "in progress", "in_progress", "completed", "customer confirmation", "closed"].includes(bStatus);
              const isOnTheWay = ["on the way", "on_the_way", "in progress", "in_progress", "completed", "customer confirmation", "closed"].includes(bStatus);
              const isInProgress = ["in progress", "in_progress", "completed", "customer confirmation", "closed"].includes(bStatus);
              const isCompleted = ["completed", "customer confirmation", "closed"].includes(bStatus);
              const isConfirmed = ["customer confirmation", "closed"].includes(bStatus) || selectedBookingForTracking.payment_status === "Paid";

              return (
                <div className="timeline-stepper" style={{ gridTemplateColumns: "repeat(6, 1fr)" }}>
                  {/* 1. Booked */}
                  <div className="timeline-step-node">
                    <div className="timeline-circle completed">
                      <Check size={14} />
                    </div>
                    <div className="timeline-step-label active">1. Booked</div>
                  </div>

                  {/* 2. Accepted */}
                  <div className="timeline-step-node">
                    <div className={`timeline-circle ${isAccepted ? "completed" : ["pending", "requested"].includes(bStatus) ? "active" : ""}`}>
                      {isAccepted ? <Check size={14} /> : "2"}
                    </div>
                    <div className={`timeline-step-label ${isAccepted ? "active" : ""}`}>
                      2. Accepted
                    </div>
                  </div>

                  {/* 3. On the Way */}
                  <div className="timeline-step-node">
                    <div className={`timeline-circle ${isOnTheWay ? "completed" : bStatus === "accepted" ? "active" : ""}`}>
                      {isOnTheWay ? <Check size={14} /> : "3"}
                    </div>
                    <div className={`timeline-step-label ${isOnTheWay ? "active" : ""}`}>
                      3. On the Way
                    </div>
                  </div>

                  {/* 4. Working (In Progress) */}
                  <div className="timeline-step-node">
                    <div className={`timeline-circle ${isInProgress ? "completed" : ["on the way", "on_the_way"].includes(bStatus) ? "active" : ""}`}>
                      {isInProgress ? <Check size={14} /> : "4"}
                    </div>
                    <div className={`timeline-step-label ${isInProgress ? "active" : ""}`}>
                      4. Working
                    </div>
                  </div>

                  {/* 5. Completed */}
                  <div className="timeline-step-node">
                    <div className={`timeline-circle ${isCompleted ? "completed" : ["in progress", "in_progress"].includes(bStatus) ? "active" : ""}`}>
                      {isCompleted ? <Check size={14} /> : "5"}
                    </div>
                    <div className={`timeline-step-label ${isCompleted ? "active" : ""}`}>
                      5. Completed
                    </div>
                  </div>

                  {/* 6. Confirmed / Closed */}
                  <div className="timeline-step-node">
                    <div className={`timeline-circle ${isConfirmed ? "completed" : bStatus === "completed" ? "active" : ""}`}>
                      {isConfirmed ? <Check size={14} /> : "6"}
                    </div>
                    <div className={`timeline-step-label ${isConfirmed ? "active" : ""}`}>
                      6. Confirmed
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Status description alert */}
            <div style={{ background: "#F7F5EF", border: "1px solid #DDE4DA", borderRadius: "12px", padding: "12px 16px", marginBottom: "1rem" }}>
              <div style={{ fontWeight: 800, color: "#29342F", fontSize: "0.88rem" }}>
                Current Status: {selectedBookingForTracking.status || "Requested"}
              </div>
              <div style={{ fontSize: "0.8rem", color: "#6F7C72", marginTop: "2px" }}>
                {["Pending", "Requested"].includes(selectedBookingForTracking.status) && "Your request is awaiting acceptance from a verified local artisan."}
                {selectedBookingForTracking.status === "Accepted" && "The artisan accepted your request and will arrive during your preferred slot."}
                {selectedBookingForTracking.status === "In Progress" && "Technician has arrived on-site and the job is currently underway."}
                {selectedBookingForTracking.status === "Completed" && "Job marked completed by the artisan. Please inspect the work and confirm completion."}
                {selectedBookingForTracking.status === "Customer Confirmation" && "Customer inspected work. Finalizing payment settlement."}
                {selectedBookingForTracking.status === "Closed" && "Service verified and closed. Thank you for using WorkSphere AI!"}
                {selectedBookingForTracking.status === "Cancelled" && "This service request was cancelled."}
              </div>
            </div>

            {/* Pro Info if assigned */}
            {selectedBookingForTracking.worker_profiles && (
              <div style={{ background: "#FFFFFF", border: "1px solid #DDE4DA", borderRadius: "12px", padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#6F7C72" }}>Assigned Technician:</div>
                  <b style={{ color: "#29342F" }}>{selectedBookingForTracking.worker_profiles.display_name}</b>
                  <div style={{ fontSize: "0.75rem", color: "#347B63" }}>
                    ⭐ {selectedBookingForTracking.worker_profiles.rating || "4.9"} rating • {selectedBookingForTracking.worker_profiles.city || "Guntur"}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <a
                    href="tel:+919876543210"
                    style={{ background: "#E9EFE9", color: "#142D27", padding: "6px 12px", borderRadius: "8px", textDecoration: "none", fontSize: "0.8rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "4px" }}
                  >
                    <Phone size={13} />
                    <span>Call Worker</span>
                  </a>
                </div>
              </div>
            )}

            {/* Status History Audit Log */}
            <div style={{ borderTop: "1px solid #E9EFE9", paddingTop: "0.85rem", marginBottom: "1rem" }}>
              <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#29342F", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Clock size={13} color="#D6B779" />
                <span>Lifecycle History ({statusTimeline.length} entries)</span>
              </div>
              {statusTimeline.length === 0 ? (
                <div style={{ fontSize: "0.76rem", color: "#6F7C72" }}>
                  Request logged. Updates will appear as the artisan progresses.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "140px", overflowY: "auto" }}>
                  {statusTimeline.map((item, idx) => (
                    <div key={item.id || idx} style={{ background: "#F7F5EF", borderRadius: "8px", padding: "6px 10px", border: "1px solid #DDE4DA", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: "0.78rem", color: "#142D27" }}>
                          {item.to_status}
                        </span>
                        {item.notes && (
                          <div style={{ fontSize: "0.72rem", color: "#6F7C72", marginTop: "1px" }}>
                            {item.notes}
                          </div>
                        )}
                      </div>
                      <span style={{ fontSize: "0.68rem", color: "#8B9E90", whiteSpace: "nowrap", marginLeft: "8px" }}>
                        {item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Recently"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Actions in modal */}
            <div style={{ display: "flex", gap: "10px", marginTop: "0.5rem" }}>
              {["Completed", "Customer Confirmation"].includes(selectedBookingForTracking.status) && selectedBookingForTracking.payment_status !== "Paid" && (
                <button
                  className="cust-btn-book-now"
                  style={{ flex: 1, background: "#D6B779", color: "#142D27" }}
                  onClick={() => {
                    const b = selectedBookingForTracking;
                    setSelectedBookingForTracking(null);
                    setPaymentModalBooking(b);
                  }}
                >
                  <CreditCard size={15} />
                  <span>Confirm Completion & Pay</span>
                </button>
              )}

              {["Pending", "Requested"].includes(selectedBookingForTracking.status) && (
                <button
                  style={{ flex: 1, background: "#fff1f2", color: "#e11d48", border: "1px solid #fecdd3", padding: "10px", borderRadius: "10px", fontWeight: 700, cursor: "pointer" }}
                  onClick={() => handleCancelBooking(selectedBookingForTracking.id)}
                >
                  Cancel Booking
                </button>
              )}

              <button
                className="cust-btn-view-profile"
                style={{ flex: 1 }}
                onClick={() => setSelectedBookingForTracking(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: PAYMENT CONFIRMATION & RECEIPT (Step 9)
          ========================================================================= */}
      {paymentModalBooking && (
        <div className="modal-backdrop" onClick={() => !isConfirmingPayment && setPaymentModalBooking(null)}>
          <div className="modal-card" style={{ maxWidth: "520px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#29342F", margin: 0 }}>
                  Confirm Completion & Record Payment
                </h3>
                <div style={{ fontSize: "0.8rem", color: "#6F7C72" }}>
                  Step 9 — Verify work quality before recording payment.
                </div>
              </div>
              <button onClick={() => setPaymentModalBooking(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6F7C72" }}>
                <X size={20} />
              </button>
            </div>

            {paymentSuccessReceipt ? (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#ecfdf5", color: "#059669", display: "grid", placeItems: "center", margin: "0 auto 10px" }}>
                  <CheckCircle size={30} />
                </div>
                <h4 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#29342F", margin: "0 0 4px" }}>
                  Payment Verified & Receipt Generated!
                </h4>
                <p style={{ fontSize: "0.82rem", color: "#6F7C72", margin: "0 0 1rem" }}>
                  A receipt confirmation has been archived in your booking history.
                </p>

                {/* Printable receipt */}
                <div className="payment-receipt-card">
                  <div style={{ textAlign: "center", borderBottom: "1px solid #DDE4DA", paddingBottom: "10px", marginBottom: "10px" }}>
                    <div style={{ fontWeight: 800, color: "#142D27", fontSize: "1rem" }}>WorkSphere AI — Official Receipt</div>
                    <div style={{ fontSize: "0.72rem", color: "#6F7C72" }}>Direct Worker Settlement</div>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Receipt Reference:</span>
                    <span className="receipt-val">{paymentSuccessReceipt.receiptNo}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Service:</span>
                    <span className="receipt-val">{paymentSuccessReceipt.service}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Technician:</span>
                    <span className="receipt-val">{paymentSuccessReceipt.workerName}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Settlement Mode:</span>
                    <span className="receipt-val">{paymentSuccessReceipt.method}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="receipt-label">Status:</span>
                    <span className="receipt-val" style={{ color: "#347B63" }}>PAID & VERIFIED</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "1rem" }}>
                  <button
                    className="cust-btn-book-now"
                    style={{ flex: 1 }}
                    onClick={() => {
                      const b = paymentModalBooking;
                      setPaymentModalBooking(null);
                      setReviewBooking(b);
                    }}
                  >
                    <span>Rate & Review Worker →</span>
                  </button>
                  <button
                    className="cust-btn-view-profile"
                    style={{ flex: 1 }}
                    onClick={() => setPaymentModalBooking(null)}
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmPayment}>
                <div style={{ background: "#F7F5EF", padding: "12px 14px", borderRadius: "12px", marginBottom: "1rem", fontSize: "0.85rem", color: "#29342F" }}>
                  Did the technician complete the service satisfactorily at your home?
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label className="profile-field-label">Payment Mode</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "6px" }}>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Cash on Completion")}
                      style={{
                        padding: "12px",
                        borderRadius: "10px",
                        border: paymentMethod === "Cash on Completion" ? "2px solid #347B63" : "1px solid #DDE4DA",
                        background: paymentMethod === "Cash on Completion" ? "#E9EFE9" : "#FFFFFF",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        color: "#29342F",
                        cursor: "pointer",
                      }}
                    >
                      💵 Cash to Worker
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod("Direct UPI to Worker")}
                      style={{
                        padding: "12px",
                        borderRadius: "10px",
                        border: paymentMethod === "Direct UPI to Worker" ? "2px solid #347B63" : "1px solid #DDE4DA",
                        background: paymentMethod === "Direct UPI to Worker" ? "#E9EFE9" : "#FFFFFF",
                        fontWeight: 700,
                        fontSize: "0.82rem",
                        color: "#29342F",
                        cursor: "pointer",
                      }}
                    >
                      📱 Direct UPI (GPay/PhonePe)
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label className="profile-field-label">Payment Reference / UTR (Optional)</label>
                  <input
                    type="text"
                    className="profile-field-input"
                    style={{ width: "100%", marginTop: "4px" }}
                    placeholder="e.g. UPI Ref / Cash Handover Note"
                    value={paymentReferenceInput}
                    onChange={(e) => setPaymentReferenceInput(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="cust-btn-book-now"
                  style={{ width: "100%", padding: "12px", fontSize: "0.95rem" }}
                  disabled={isConfirmingPayment}
                >
                  {isConfirmingPayment ? "Verifying..." : "Confirm Work Done & Record Payment"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 5: RATING, REVIEW & DISPUTE MODAL (Step 10)
          ========================================================================= */}
      {reviewBooking && (
        <div className="modal-backdrop" onClick={() => !isSubmittingReview && setReviewBooking(null)}>
          <div className="modal-card" style={{ maxWidth: "500px" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#29342F", margin: 0 }}>
                {isDisputeOpen ? "Report a Problem or Dispute" : "Rate & Review Your Experience"}
              </h3>
              <button onClick={() => setReviewBooking(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6F7C72" }}>
                <X size={20} />
              </button>
            </div>

            {reviewSuccessMsg ? (
              <div className="auth-alert success" style={{ margin: "1rem 0" }}>
                <CheckCircle size={18} />
                <span>{reviewSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitReviewOrDispute}>
                {!isDisputeOpen ? (
                  <>
                    <p style={{ fontSize: "0.85rem", color: "#6F7C72", margin: "0 0 1rem" }}>
                      Share your genuine feedback for {reviewBooking.worker_profiles?.display_name || "the technician"}.
                    </p>

                    {/* Interactive Star Selection */}
                    <div className="star-rating-select">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          className="star-btn"
                          onClick={() => setRating(starVal)}
                        >
                          <Star
                            size={32}
                            fill={starVal <= rating ? "#D6B779" : "none"}
                            color={starVal <= rating ? "#D6B779" : "#cbd5e1"}
                          />
                        </button>
                      ))}
                      <span style={{ fontWeight: 800, color: "#142D27", fontSize: "1.1rem", marginLeft: "8px" }}>
                        {rating}.0
                      </span>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <label className="profile-field-label">Written Feedback</label>
                      <textarea
                        className="profile-field-input"
                        style={{ width: "100%", marginTop: "4px" }}
                        rows={3}
                        placeholder="Was the work done on time? Quality of service..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: "0.85rem", color: "#e11d48", margin: "0 0 1rem" }}>
                      Did something go wrong with this service call? Submit a dispute ticket.
                    </p>

                    <div style={{ marginBottom: "10px" }}>
                      <label className="profile-field-label">Dispute Reason</label>
                      <select
                        className="profile-field-input"
                        style={{ width: "100%", marginTop: "4px" }}
                        value={disputeCategory}
                        onChange={(e) => setDisputeCategory(e.target.value)}
                      >
                        <option value="Service Quality Issue">Service Quality Issue</option>
                        <option value="Delayed or Missed Appointment">Delayed or Missed Appointment</option>
                        <option value="Pricing / Billing Disagreement">Pricing / Billing Disagreement</option>
                        <option value="Unprofessional Worker Conduct">Unprofessional Worker Conduct</option>
                      </select>
                    </div>

                    <div style={{ marginBottom: "1.25rem" }}>
                      <label className="profile-field-label">Dispute Details</label>
                      <textarea
                        className="profile-field-input"
                        style={{ width: "100%", marginTop: "4px" }}
                        rows={3}
                        placeholder="Please describe the issue in detail..."
                        value={disputeDetails}
                        onChange={(e) => setDisputeDetails(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                  <button
                    type="button"
                    onClick={() => setIsDisputeOpen(!isDisputeOpen)}
                    style={{ background: "none", border: "none", color: isDisputeOpen ? "#347B63" : "#e11d48", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}
                  >
                    {isDisputeOpen ? "← Back to Normal Review" : "⚠ Report a Problem / Raise Dispute"}
                  </button>
                </div>

                <button
                  type="submit"
                  className="cust-btn-book-now"
                  style={{ width: "100%", padding: "12px", background: isDisputeOpen ? "#e11d48" : "#142D27" }}
                  disabled={isSubmittingReview}
                >
                  {isSubmittingReview
                    ? "Submitting..."
                    : isDisputeOpen
                    ? "File Official Dispute Ticket"
                    : "Submit Rating & Review"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Inline Customer Auth Dialog */}
      <AuthLoginScreen
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        lang={lang}
      />
    </div>
  );
}
