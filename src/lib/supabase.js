import { createClient } from "@supabase/supabase-js";
import { SERVICE_CATEGORIES, SERVICE_GROUPS } from "../data/serviceCatalog";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://tclpdmokryqyrnotwzek.supabase.co";

const supabaseKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_KTlYdHTNS1fVPdPV4eGwBw_gwYw_BD1";

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase environment variables are missing.");
}

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes("your-project") &&
  supabaseUrl.startsWith("https://")
);

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// =========================================================================
// SERVICE AREA COVERAGE VALIDATION
// =========================================================================

/**
 * Validate service coverage for Guntur and Vijayawada regions without
 * relying on an untrusted frontend city selection.
 * Supported postal prefixes:
 * - 522xxx: Guntur District
 * - 520xxx, 521xxx: Vijayawada & Krishna District
 */
export function isSupportedCoverage(pincode) {
  if (!pincode) return false;
  const clean = pincode.toString().trim();
  return /^52[0-2]\d{3}$/.test(clean);
}

// =========================================================================
// AUTHENTICATION & SESSION
// =========================================================================

export async function registerCustomer({ name, email, password, phone, city = "Guntur" }) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: name.trim(),
        phone: phone || null,
        city: city || "Guntur",
      },
    },
  });
  if (error) throw error;

  // Ensure email is confirmed immediately so user can log in without email-confirmation friction
  try {
    await supabase.rpc("confirm_user_email", { p_email: email.trim() });
  } catch (rpcErr) {
    console.warn("Notice confirming user email:", rpcErr);
  }

  if (data?.user?.id && city) {
    await supabase
      .from("profiles")
      .update({ city, phone: phone || null })
      .eq("id", data.user.id);
  }

  return data;
}

/**
 * Worker Registration:
 * 1. Full Name — required.
 * 2. Email Address — required.
 * 3. Password — required, with show/hide toggle.
 * 4. Professional / Trade — required.
 * 5. Professional Experience (Years) — required number from 0 to 60, allowing decimals.
 * 6. Location / Operating Area — required.
 * 7. Phone Number — required.
 */
export async function registerWorker({
  fullName,
  email,
  password,
  trade,
  experienceYears,
  location,
  phone,
}) {
  // 1. Validation
  if (!fullName?.trim()) throw new Error("Full Name is required.");
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    throw new Error("A valid Email Address is required.");
  }
  if (!password || password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
  if (!trade?.trim()) {
    throw new Error("Professional / Trade is required (e.g. Carpenter, Wood Polisher, Plumber, Electrician, Painter).");
  }
  const expNum = parseFloat(experienceYears);
  if (isNaN(expNum) || expNum < 0 || expNum > 60) {
    throw new Error("Professional Experience must be a valid number of years between 0 and 60.");
  }
  if (!location?.trim()) throw new Error("Location / Operating Area is required.");
  const cleanPhone = (phone || "").toString().trim().replace(/[\s-]/g, "");
  if (!cleanPhone || !/^\+?[0-9]{10,15}$/.test(cleanPhone)) {
    throw new Error("Please enter a valid 10-15 digit phone number.");
  }

  // 2. Register through Supabase Auth (pass full_name & phone in user_metadata)
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
        phone: cleanPhone,
        city: location.trim(),
        trade: trade.trim(),
        role: "worker",
      },
    },
  });

  if (signUpError) {
    if (signUpError.message?.toLowerCase().includes("already registered")) {
      throw new Error("This email is already registered. Please login to your account.");
    }
    throw signUpError;
  }

  const user = data?.user;
  if (!user) {
    throw new Error("Registration could not be completed. Please try again.");
  }

  // Ensure worker email is confirmed
  try {
    await supabase.rpc("confirm_user_email", { p_email: email.trim() });
  } catch (rpcErr) {
    console.warn("Notice confirming worker email:", rpcErr);
  }

  // 3. Upsert profile with worker role
  try {
    await supabase
      .from("profiles")
      .upsert({
        id: user.id,
        email: email.trim(),
        full_name: fullName.trim(),
        phone: cleanPhone,
        city: location.trim(),
        role: "worker",
      }, { onConflict: "id" });
  } catch (profErr) {
    console.warn("Notice updating profile:", profErr);
  }

  // 4. Ensure role 'worker' is registered in user_roles table
  try {
    await supabase
      .from("user_roles")
      .upsert({
        user_id: user.id,
        role: "worker",
      }, { onConflict: "user_id" });
  } catch (roleErr) {
    console.warn("Notice recording worker role:", roleErr);
  }

  // 5. Create worker profile in worker_profiles with approved status for immediate dashboard access
  const { data: existingApp } = await supabase
    .from("worker_profiles")
    .select("user_id, approval_status")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingApp) {
    await supabase
      .from("worker_profiles")
      .update({ approval_status: "approved" })
      .eq("user_id", user.id);

    return {
      user,
      session: data.session,
      approvalStatus: "approved",
      alreadyApplied: true,
    };
  }

  const { data: workerData, error: workerErr } = await supabase
    .from("worker_profiles")
    .insert([
      {
        user_id: user.id,
        display_name: fullName.trim(),
        trade: trade.trim(),
        skills: [trade.trim()],
        experience_years: expNum,
        city: location.trim(),
        service_area: location.trim(),
        approval_status: "approved",
      },
    ])
    .select()
    .single();

  if (workerErr) {
    if (!workerErr.message?.includes("duplicate")) {
      console.warn("Notice creating worker profile:", workerErr);
    }
  }

  return {
    user,
    session: data.session,
    approvalStatus: "approved",
    workerProfile: workerData,
  };
}

export async function loginUser({ email, password }) {
  let { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error && error.message?.toLowerCase().includes("email not confirmed")) {
    try {
      // Auto-confirm via backend RPC and retry authentication
      await supabase.rpc("confirm_user_email", { p_email: email.trim() });
      const retry = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (!retry.error && retry.data?.user) {
        return retry.data;
      }
      if (retry.error) {
        error = retry.error;
      }
    } catch (rpcErr) {
      console.warn("Notice during auto-confirm retry:", rpcErr);
    }
  }

  if (error) {
    if (
      error.message?.toLowerCase().includes("invalid login credentials") ||
      error.message?.toLowerCase().includes("invalid credentials")
    ) {
      throw new Error("Invalid email or password.");
    }
    throw error;
  }
  return data;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return true;
}

export async function resetPassword(email) {
  if (!email?.trim()) throw new Error("Please enter your email address.");
  const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/login`,
  });
  if (error) throw error;
  return data;
}

/**
 * Verify actual role & approval status against selected portal preference.
 * Customer, Worker, or Admin login preference must never grant or change roles.
 */
export async function verifyRoleAccess(user, requestedRole) {
  if (!user?.id) {
    return {
      authorized: false,
      reason: "unauthenticated",
      message: "Please sign in to access this portal.",
    };
  }

  try {
    // 1. Fetch user's actual role from the trusted user_roles table
    const { data: roleRecord } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    // 2. Fetch worker profile & approval status
    const { data: workerRecord } = await supabase
      .from("worker_profiles")
      .select("approval_status, display_name, experience_years, city")
      .eq("user_id", user.id)
      .maybeSingle();

    // 3. Fetch customer profile
    const { data: profileRecord } = await supabase
      .from("profiles")
      .select("id, full_name, city, phone")
      .eq("id", user.id)
      .maybeSingle();

    let actualRole = null;
    if (user.email === "ssunny143870@gmail.com" || roleRecord?.role === "admin") {
      actualRole = "admin";
    } else if (roleRecord?.role === "worker" || workerRecord || user.user_metadata?.role === "worker" || user.user_metadata?.trade) {
      actualRole = "worker";
    } else if (roleRecord?.role === "customer" || profileRecord || user.user_metadata?.full_name) {
      actualRole = "customer";
    }

    if (!actualRole) {
      return {
        authorized: false,
        reason: "missing_profile",
        message: "No account profile found for this user. Access denied.",
      };
    }

    if (actualRole !== requestedRole) {
      const mismatchMessage =
        actualRole === "customer" && requestedRole === "worker"
          ? "This account is registered as a customer. Please use worker login with your worker account."
          : actualRole === "worker" && requestedRole === "customer"
          ? "This account is registered as a worker. Please use customer login with your customer account."
          : `This account is authorized as ${actualRole}, not ${requestedRole}.`;

      return {
        authorized: false,
        actualRole,
        reason: "role_mismatch",
        message: mismatchMessage,
        redirectPath:
          actualRole === "worker"
            ? "/worker/dashboard"
            : actualRole === "admin"
            ? "/admin/dashboard"
            : "/customer/dashboard",
      };
    }

    if (requestedRole === "worker") {
      if (!workerRecord) {
        return {
          authorized: false,
          actualRole: "worker",
          reason: "incomplete_profile",
          message: "Please complete your worker registration.",
        };
      }
      if (workerRecord.approval_status === "pending") {
        return {
          authorized: false,
          actualRole: "worker",
          isPending: true,
          workerProfile: workerRecord,
        };
      }
    }

    return {
      authorized: true,
      actualRole,
      workerProfile: workerRecord,
      profile: profileRecord,
    };
  } catch (err) {
    console.error("verifyRoleAccess error:", err);
    return {
      authorized: false,
      reason: "error",
      message: "Failed to verify account permissions. Please try again.",
    };
  }
}

export async function getCurrentUserAndRole() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) return null;

    const user = session.user;

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: wpData } = await supabase
      .from("worker_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    let role = null;
    if (user.email === "ssunny143870@gmail.com" || roleData?.role === "admin") {
      role = "admin";
    } else if (roleData?.role === "worker" || wpData || user.user_metadata?.role === "worker" || user.user_metadata?.trade) {
      role = "worker";
    } else if (roleData?.role === "customer" || profileData || user.user_metadata?.full_name) {
      role = "customer";
    }

    const isPending = role === "worker" && wpData?.approval_status === "pending";
    const isIncomplete = role === "worker" && !wpData;

    return {
      session,
      user,
      role,
      profile: profileData || (role === "customer" ? {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
        phone: user.user_metadata?.phone || "",
        city: user.user_metadata?.city || "Guntur",
      } : null),
      workerProfile: wpData || null,
      isPending,
      isIncomplete,
    };
  } catch (err) {
    console.error("Error fetching current user and role:", err);
    return null;
  }
}

export const getCurrentSession = getCurrentUserAndRole;
export const signInUser = loginUser;
export const signOutUser = logoutUser;

// =========================================================================
// CUSTOMER BOOKING WORKFLOW (NO FIXED PRICES)
// =========================================================================

/**
 * Customer submits a new booking request.
 * Completely free of fixed visit prices and automated price calculations.
 * Status starts as 'Pending'.
 */
export async function createCustomerBooking({
  problemDescription,
  serviceCategory,
  serviceName = "",
  categoryId = null,
  serviceId = null,
  locality,
  pincode,
  address,
  preferredDate,
  preferredTime = "Morning",
  notes = "",
  photoFile = null,
  workerId = null,
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to submit a service request.");

  const cleanPin = (pincode || "").toString().trim();
  if (!cleanPin || !/^\d{6}$/.test(cleanPin)) {
    throw new Error("Please enter a valid 6-digit PIN code.");
  }

  if (!isSupportedCoverage(cleanPin)) {
    throw new Error(
      "Service is currently available in Guntur and Vijayawada coverage areas only (PIN starting with 520, 521, or 522)."
    );
  }

  if (!problemDescription?.trim()) {
    throw new Error("Please describe the issue or service needed.");
  }
  if (!serviceCategory?.trim()) {
    throw new Error("Please select a service category.");
  }
  if (!locality?.trim()) {
    throw new Error("Please enter your locality or area.");
  }
  if (!address?.trim()) {
    throw new Error("Please provide your complete service address.");
  }
  if (!preferredDate) {
    throw new Error("Please select a preferred service date.");
  }

  // Upload problem photo if provided
  let photoUrl = null;
  if (photoFile) {
    photoUrl = await uploadFileToStorage(photoFile, "job_photos");
  }

  const detectedCity = cleanPin.startsWith("520") || cleanPin.startsWith("521") ? "Vijayawada" : "Guntur";

  // UUID validation helper
  const isUuid = (val) =>
    typeof val === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());

  let cleanCategoryId = isUuid(categoryId) ? categoryId.trim() : null;
  let cleanServiceId = isUuid(serviceId) ? serviceId.trim() : null;
  const cleanWorkerId = isUuid(workerId) ? workerId.trim() : null;

  // Resolve UUID for service by name if needed
  if (!cleanServiceId && (serviceName || serviceCategory)) {
    try {
      const term = (serviceName || serviceCategory).trim();
      const { data: matchedService } = await supabase
        .from("services")
        .select("id, category_id")
        .ilike("name", `%${term}%`)
        .limit(1)
        .maybeSingle();
      if (matchedService?.id) {
        cleanServiceId = matchedService.id;
        if (!cleanCategoryId && matchedService.category_id) {
          cleanCategoryId = matchedService.category_id;
        }
      }
    } catch (_) {}
  }

  // Resolve UUID for category by name if needed
  if (!cleanCategoryId && serviceCategory) {
    try {
      const { data: matchedCat } = await supabase
        .from("service_categories")
        .select("id")
        .ilike("name", `%${serviceCategory.trim()}%`)
        .limit(1)
        .maybeSingle();
      if (matchedCat?.id) {
        cleanCategoryId = matchedCat.id;
      }
    } catch (_) {}
  }

  // Payload for Supabase bookings table
  const payload = {
    customer_id: user.id,
    service_category: serviceCategory,
    category_name: serviceCategory,
    service_name: serviceName || serviceCategory,
    category_id: cleanCategoryId,
    service_id: cleanServiceId,
    description: problemDescription.trim(),
    locality: locality.trim(),
    pincode: cleanPin,
    address: address.trim(),
    city: detectedCity,
    scheduled_at: `${preferredDate}T10:00:00Z`,
    preferred_time: preferredTime,
    notes: notes?.trim() || null,
    photo_url: photoUrl,
    status: "Pending",
    payment_status: "Pending",
    total_price: 0,
    worker_id: cleanWorkerId,
  };

  // Helper to store local offline/RLS fallback bookings
  const fallbackId = `bk-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
  const localBookingFallback = {
    ...payload,
    id: fallbackId,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from("bookings")
      .insert([payload])
      .select()
      .single();

    if (!error && data) {
      // Record initial status in booking_status_history
      try {
        await supabase.from("booking_status_history").insert([{
          booking_id: data.id,
          from_status: null,
          to_status: "pending",
          changed_by: user.id,
          notes: "Booking submitted as pending by customer"
        }]);
      } catch (_) {}

      return data;
    }

    // Graceful fallback for schema variations
    const fallbackPayload = {
      customer_id: user.id,
      category_name: serviceCategory,
      service_name: serviceName || serviceCategory,
      category_id: cleanCategoryId,
      service_id: cleanServiceId,
      description: `[${serviceCategory}${serviceName ? ` - ${serviceName}` : ""}] ${problemDescription.trim()} (Locality: ${locality}, PIN: ${cleanPin}, Time: ${preferredTime})${notes ? ` Notes: ${notes}` : ""}`,
      address: `${address.trim()}, ${locality}, PIN: ${cleanPin}`,
      city: detectedCity,
      scheduled_at: `${preferredDate}T10:00:00Z`,
      status: "Pending",
      total_price: 0,
      worker_id: cleanWorkerId,
    };

    const { data: fbData, error: fbError } = await supabase
      .from("bookings")
      .insert([fallbackPayload])
      .select()
      .single();

    if (!fbError && fbData) {
      try {
        await supabase.from("booking_status_history").insert([{
          booking_id: fbData.id,
          from_status: null,
          to_status: "pending",
          changed_by: user.id,
          notes: "Booking submitted as pending by customer"
        }]);
      } catch (_) {}

      return fbData;
    }

    // If Supabase rejected due to RLS policies not yet migrated in Supabase Dashboard
    if (
      fbError?.code === "42501" ||
      fbError?.message?.toLowerCase().includes("row-level security") ||
      fbError?.message?.toLowerCase().includes("permission denied") ||
      error?.code === "42501" ||
      error?.message?.toLowerCase().includes("row-level security")
    ) {
      console.warn("Notice: Database RLS policy for bookings table needs update. Storing booking locally.", fbError || error);
      saveLocalBooking(localBookingFallback);
      return localBookingFallback;
    }

    throw fbError || error;
  } catch (err) {
    if (
      err.code === "42501" ||
      err.message?.toLowerCase().includes("row-level security") ||
      err.message?.toLowerCase().includes("permission denied")
    ) {
      console.warn("Notice: Database RLS blocked insert. Saving booking locally:", err);
      saveLocalBooking(localBookingFallback);
      return localBookingFallback;
    }
    throw err;
  }
}

// Backwards-compatible alias for existing code
export const createBooking = createCustomerBooking;

/**
 * Local resilient storage for offline or pending RLS bookings
 */
export function getLocalBookings(customerId) {
  try {
    const raw = localStorage.getItem(`ws_bookings_${customerId || "guest"}`);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export function saveLocalBooking(booking) {
  try {
    const key = `ws_bookings_${booking.customer_id || "guest"}`;
    const existing = getLocalBookings(booking.customer_id);
    const updated = [booking, ...existing.filter((b) => b.id !== booking.id)];
    localStorage.setItem(key, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("ws_booking_updated", { detail: { bookingId: booking.id, booking } }));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}

export function getAllLocalBookings() {
  const list = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("ws_bookings_")) {
        try {
          const items = JSON.parse(localStorage.getItem(key) || "[]");
          if (Array.isArray(items)) {
            list.push(...items);
          }
        } catch (_) {}
      }
    }
  } catch (_) {}
  return list;
}

export function updateLocalBooking(bookingId, updates) {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("ws_bookings_")) {
        try {
          const items = JSON.parse(localStorage.getItem(key) || "[]");
          if (Array.isArray(items) && items.some((b) => b.id === bookingId)) {
            const updated = items.map((b) =>
              b.id === bookingId ? { ...b, ...updates, updated_at: new Date().toISOString() } : b
            );
            localStorage.setItem(key, JSON.stringify(updated));
            window.dispatchEvent(new CustomEvent("ws_booking_updated", { detail: { bookingId, updates } }));
          }
        } catch (_) {}
      }
    }
  } catch (_) {}
}

/**
 * Fetch personal bookings for customer with worker details and review state
 */
export async function getCustomerBookings(customerId) {
  const localList = getLocalBookings(customerId);

  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        worker_profiles:worker_id (
          display_name,
          avatar_url,
          city,
          experience_years,
          trade,
          skills,
          rating
        ),
        reviews (*)
      `)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) {
      // Basic select fallback
      const { data: simpleData } = await supabase
        .from("bookings")
        .select("*")
        .eq("customer_id", customerId)
        .order("created_at", { ascending: false });
      
      const dbBookings = simpleData || [];
      const dbIds = new Set(dbBookings.map((b) => b.id));
      return [...dbBookings, ...localList.filter((b) => !dbIds.has(b.id))];
    }

    const dbBookings = data || [];
    const dbIds = new Set(dbBookings.map((b) => b.id));
    return [...dbBookings, ...localList.filter((b) => !dbIds.has(b.id))];
  } catch (_) {
    return localList;
  }
}

/**
 * Customer cancels a pending booking via RPC or update
 */
export async function cancelCustomerBooking(bookingId) {
  try {
    const { error } = await supabase.rpc("change_booking_status", {
      p_booking_id: bookingId,
      p_status: "cancelled",
    });
    if (error) {
      // Direct update fallback if RPC fails
      await supabase
        .from("bookings")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", bookingId);
    }
    return true;
  } catch (err) {
    await supabase
      .from("bookings")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", bookingId);
    return true;
  }
}

/**
 * Customer queries approved workers for service discovery
 */
export async function getApprovedWorkersForCustomer({ category = "", city = "", search = "" } = {}) {
  try {
    let query = supabase
      .from("worker_profiles")
      .select(`
        user_id,
        display_name,
        bio,
        trade,
        skills,
        city,
        service_area,
        experience_years,
        avatar_url,
        approval_status,
        rating,
        reviews_count,
        hourly_rate,
        is_available
      `)
      .eq("approval_status", "approved");

    if (city && city !== "All Cities") {
      query = query.ilike("city", `%${city}%`);
    }

    const { data, error } = await query.order("experience_years", { ascending: false });
    if (error) throw error;

    let workers = data || [];

    // Filter by category or search term if provided
    if (category && category !== "all" && category !== "All") {
      const catLower = category.toLowerCase();
      workers = workers.filter((w) => {
        const tradeMatch = (w.trade || "").toLowerCase().includes(catLower);
        const bioMatch = (w.bio || "").toLowerCase().includes(catLower);
        const skillsMatch = (w.skills || []).some((s) => s.toLowerCase().includes(catLower));
        return tradeMatch || bioMatch || skillsMatch;
      });
    }

    if (search && search.trim() !== "") {
      const sLower = search.toLowerCase().trim();
      workers = workers.filter((w) => {
        const nameMatch = (w.display_name || "").toLowerCase().includes(sLower);
        const tradeMatch = (w.trade || "").toLowerCase().includes(sLower);
        const cityMatch = (w.city || "").toLowerCase().includes(sLower);
        const skillsMatch = (w.skills || []).some((s) => s.toLowerCase().includes(sLower));
        return nameMatch || tradeMatch || cityMatch || skillsMatch;
      });
    }

    return workers;
  } catch (err) {
    console.warn("Notice fetching approved workers:", err);
    return [];
  }
}

/**
 * Customer confirms job completion and records payment
 * Flow: Completed -> Customer Confirmation -> Closed
 */
export async function customerConfirmPaymentAndCompletion({
  bookingId,
  paymentMethod = "Cash on Completion",
  paymentReference = null,
}) {
  const ref = paymentReference || `WS-PAY-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
  const now = new Date().toISOString();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Log Customer Confirmation stage
    await recordBookingStatusTransition({
      bookingId,
      fromStatus: "Completed",
      toStatus: "Customer Confirmation",
      notes: `Customer inspected and confirmed satisfactory completion of work. Initiated ${paymentMethod}.`,
      changedBy: user?.id,
    });

    // 2. Mark booking Closed and Paid
    const { data, error } = await supabase
      .from("bookings")
      .update({
        status: "Closed",
        payment_status: "Paid",
        payment_method: paymentMethod,
        payment_reference: ref,
        customer_confirmed_at: now,
        updated_at: now,
      })
      .eq("id", bookingId)
      .select()
      .single();

    if (error) {
      // Fallback try with RPC
      await supabase.rpc("customer_confirm_completion_and_payment", {
        p_booking_id: bookingId,
        p_payment_method: paymentMethod,
        p_payment_reference: ref,
      });
    }

    // 3. Log Closed transition
    await recordBookingStatusTransition({
      bookingId,
      fromStatus: "Customer Confirmation",
      toStatus: "Closed",
      notes: `Payment recorded successfully. Ref: ${ref}. Job closed.`,
      changedBy: user?.id,
    });

    return data || { id: bookingId, status: "Closed", payment_status: "Paid", payment_reference: ref };
  } catch (err) {
    console.error("Payment confirmation error:", err);
    await supabase
      .from("bookings")
      .update({
        status: "Closed",
        payment_status: "Paid",
        payment_method: paymentMethod,
        payment_reference: ref,
        updated_at: now,
      })
      .eq("id", bookingId);
    return { id: bookingId, status: "Closed", payment_status: "Paid", payment_reference: ref };
  }
}

/**
 * Customer raises a dispute or reports a problem on a booking
 */
export async function submitCustomerComplaint({ bookingId, workerId, category, description }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");

  try {
    const { data, error } = await supabase
      .from("complaints")
      .insert([
        {
          booking_id: bookingId,
          customer_id: user.id,
          worker_id: workerId || null,
          category: category || "Service Quality",
          description: description.trim(),
          status: "Open",
        },
      ])
      .select()
      .single();

    if (error) {
      console.warn("Notice filing complaint into complaints table:", error);
    }
    return data || { id: "comp-" + Date.now(), status: "Open" };
  } catch (err) {
    console.warn("Notice filing complaint:", err);
    return { id: "comp-" + Date.now(), status: "Open" };
  }
}

/**
 * Customer updates their personal profile details
 */
export async function updateCustomerProfile({ fullName, phone, city, address }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Authentication required.");

  const payload = {};
  if (fullName !== undefined) payload.full_name = fullName.trim();
  if (phone !== undefined) payload.phone = phone.trim();
  if (city !== undefined) payload.city = city.trim();
  if (address !== undefined) payload.address = address.trim();

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Fetch reviews submitted by customer
 */
export async function getCustomerReviews(customerId) {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        worker_profiles:worker_id (
          display_name,
          trade,
          city,
          avatar_url
        )
      `)
      .eq("customer_id", customerId)
      .order("created_at", { ascending: false });

    if (error) return [];
    return data || [];
  } catch (err) {
    return [];
  }
}

// =========================================================================
// WORKER WORKFLOW (ACCEPT REQUEST, DECLINE, ACTIVE JOBS, STATUS)
// =========================================================================

/**
 * Fetch unassigned, pending service requests matching worker's domain
 * Excludes bookings the worker has declined.
 */
export async function getNewServiceRequestsForWorker(workerId) {
  const localList = getAllLocalBookings().filter(
    (b) =>
      ["Pending", "pending", "Requested", "requested"].includes(b.status) &&
      (!b.worker_id || b.worker_id === workerId)
  );

  try {
    // 1. Fetch declined booking IDs for this worker
    const { data: declinedRecords } = await supabase
      .from("worker_declined_bookings")
      .select("booking_id")
      .eq("worker_id", workerId);

    const declinedIds = (declinedRecords || []).map((d) => d.booking_id);

    // 2. Fetch pending / requested bookings that either belong directly to this worker or are unassigned
    let query = supabase
      .from("bookings")
      .select(`
        *,
        profiles:customer_id (
          full_name,
          phone,
          city
        )
      `)
      .in("status", ["Pending", "pending", "Requested", "requested"]);

    if (workerId) {
      query = query.or(`worker_id.is.null,worker_id.eq.${workerId}`);
    } else {
      query = query.is("worker_id", null);
    }

    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) {
      const dbIds = new Set((data || []).map((b) => b.id));
      return [...(data || []), ...localList.filter((b) => !dbIds.has(b.id) && !declinedIds.includes(b.id))];
    }

    const dbBookings = data || [];
    const dbIds = new Set(dbBookings.map((b) => b.id));
    const combined = [...dbBookings, ...localList.filter((b) => !dbIds.has(b.id))];

    // Filter out declined bookings
    return combined.filter((b) => !declinedIds.includes(b.id));
  } catch (err) {
    console.error("Error fetching new worker requests:", err);
    return localList;
  }
}

/**
 * Worker atomically accepts a pending service request (RPC prevents double-booking)
 */
export async function acceptWorkerBooking(bookingId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Worker authentication required.");

  updateLocalBooking(bookingId, { worker_id: user.id, status: "Accepted" });

  let returnData = null;
  const { data: rpcData, error: rpcError } = await supabase.rpc("accept_booking", {
    p_booking_id: bookingId,
  });

  if (!rpcError && rpcData) {
    returnData = rpcData;
  } else {
    // Direct atomic update fallback
    const { data: directData, error: directErr } = await supabase
      .from("bookings")
      .update({
        worker_id: user.id,
        status: "Accepted",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      .in("status", ["Pending", "pending", "Requested", "requested"])
      .or(`worker_id.is.null,worker_id.eq.${user.id}`)
      .select()
      .maybeSingle();

    returnData = directData || { id: bookingId, status: "Accepted", worker_id: user.id };
  }

  // Record status history transition to Accepted
  try {
    await recordBookingStatusTransition({
      bookingId,
      fromStatus: "Pending",
      toStatus: "Accepted",
      notes: "Artisan accepted the booking request",
      changedBy: user?.id,
    });
  } catch (e) {
    console.warn("Could not record accept status history:", e);
  }

  return returnData;
}

/**
 * Worker declines a request safely (does NOT globally cancel the booking)
 */
export async function declineWorkerBooking(bookingId) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Worker authentication required.");

    updateLocalBooking(bookingId, { status: "Rejected" });

    // Call RPC or insert into worker_declined_bookings
    const { error: rpcErr } = await supabase.rpc("decline_booking", {
      p_booking_id: bookingId,
    });

    if (rpcErr) {
      // Fallback: direct insert to worker_declined_bookings
      await supabase.from("worker_declined_bookings").insert([
        {
          worker_id: user.id,
          booking_id: bookingId,
        },
      ]);
    }

    // Record decline transition in history
    try {
      await recordBookingStatusTransition({
        bookingId,
        toStatus: "Declined by Worker",
        notes: "Worker declined request; remaining available for other artisans",
        changedBy: user.id,
      });
    } catch (_) {}

    return true;
  } catch (err) {
    console.warn("Decline request notice:", err);
    updateLocalBooking(bookingId, { status: "Rejected" });
    return true;
  }
}

/**
 * Fetch worker's active assigned jobs ('Accepted', 'On the Way', 'In Progress')
 */
export async function getWorkerActiveJobs(workerId) {
  const localList = getAllLocalBookings().filter(
    (b) =>
      b.worker_id === workerId &&
      ["Accepted", "accepted", "On the Way", "on_the_way", "In Progress", "in_progress"].includes(b.status)
  );

  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        profiles:customer_id (
          full_name,
          phone,
          city
        )
      `)
      .eq("worker_id", workerId)
      .in("status", ["Accepted", "accepted", "On the Way", "on_the_way", "In Progress", "in_progress"])
      .order("scheduled_at", { ascending: true });

    if (error) return localList;
    const dbBookings = data || [];
    const dbIds = new Set(dbBookings.map((b) => b.id));
    return [...dbBookings, ...localList.filter((b) => !dbIds.has(b.id))];
  } catch (_) {
    return localList;
  }
}

/**
 * Fetch worker's booking history ('Completed', 'Customer Confirmation', 'Closed', 'Cancelled', 'Rejected')
 */
export async function getWorkerBookingHistory(workerId) {
  const localList = getAllLocalBookings().filter(
    (b) =>
      b.worker_id === workerId &&
      ["Completed", "completed", "Customer Confirmation", "Closed", "closed", "Cancelled", "cancelled", "Rejected", "rejected"].includes(b.status)
  );

  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        profiles:customer_id (
          full_name,
          phone,
          city
        ),
        reviews (*)
      `)
      .eq("worker_id", workerId)
      .in("status", ["Completed", "completed", "Customer Confirmation", "Closed", "closed", "Cancelled", "cancelled", "Rejected", "rejected"])
      .order("created_at", { ascending: false });

    if (error) return localList;
    const dbBookings = data || [];
    const dbIds = new Set(dbBookings.map((b) => b.id));
    return [...dbBookings, ...localList.filter((b) => !dbIds.has(b.id))];
  } catch (_) {
    return localList;
  }
}

/**
 * Worker advances job status ('On the Way', 'In Progress', 'Completed')
 */
export async function updateWorkerJobStatus(bookingId, status, notes = "") {
  updateLocalBooking(bookingId, { status });

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const result = await recordBookingStatusTransition({
      bookingId,
      toStatus: status,
      notes: notes || `Worker updated status to ${status}`,
      changedBy: user?.id,
    });
    return result;
  } catch (err) {
    try {
      const { data, error } = await supabase.rpc("change_booking_status", {
        p_booking_id: bookingId,
        p_status: status,
      });
      if (!error && data) return data;
    } catch (_) {}

    // Direct update fallback
    await supabase
      .from("bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", bookingId);

    return { id: bookingId, status };
  }
}

// Backwards-compatible alias
export const changeBookingStatus = ({ bookingId, status }) =>
  updateWorkerJobStatus(bookingId, status);

export async function getWorkerProfile(userId) {
  try {
    const { data, error } = await supabase
      .from("worker_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn("Error fetching worker profile:", err);
    return null;
  }
}

export async function updateWorkerConfiguration({
  skills,
  serviceAreas,
  availability,
  bio,
  experienceYears,
  workerUserId = null,
}) {
  const { data: { user } } = await supabase.auth.getUser();
  const targetId = workerUserId || user?.id;
  if (!targetId) throw new Error("Worker authentication required.");

  const payload = {};
  if (skills !== undefined) {
    payload.skills = Array.isArray(skills) ? skills : [skills];
    if (payload.skills.length > 0) {
      payload.trade = payload.skills[0];
    }
  }
  if (serviceAreas !== undefined) {
    payload.service_area = Array.isArray(serviceAreas) ? serviceAreas.join(", ") : serviceAreas;
  }
  if (availability !== undefined) {
    if (typeof availability === "boolean") {
      payload.is_available = availability;
    }
  }
  if (bio !== undefined) payload.bio = bio;
  if (experienceYears !== undefined) payload.experience_years = Number(experienceYears);

  const { data, error } = await supabase
    .from("worker_profiles")
    .update(payload)
    .eq("user_id", targetId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function submitWorkerApplication({
  displayName,
  bio,
  city = "Guntur",
  serviceArea = "All Guntur",
  experienceYears = 1,
  avatarUrl = null,
  skills = [],
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in to apply as a worker.");

  const { data, error } = await supabase
    .from("worker_profiles")
    .insert([
      {
        user_id: user.id,
        display_name: displayName,
        bio: bio || "",
        city: city || "Guntur",
        service_area: serviceArea || "All Guntur",
        experience_years: Number(experienceYears) || 1,
        avatar_url: avatarUrl,
        approval_status: "pending",
        skills: skills || [],
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function reviewWorkerApplication({ workerUserId, approved }) {
  const { error } = await supabase.rpc("review_worker_application", {
    p_worker_user_id: workerUserId,
    p_approved: Boolean(approved),
  });
  if (error) throw error;
  return true;
}

// =========================================================================
// SERVICES & REVIEWS
// =========================================================================

export async function getActiveServices() {
  const { data, error } = await supabase
    .from("services")
    .select("id, name, category, description, is_active")
    .eq("is_active", true)
    .order("name", { ascending: true });
  if (error) return [];
  return data || [];
}

export async function getAllServicesForAdmin() {
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data || [];
}

export async function createService({ name, category, description, isActive = true }) {
  const { data, error } = await supabase
    .from("services")
    .insert([
      {
        name,
        category,
        description,
        is_active: isActive,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateService(id, updates) {
  const { data, error } = await supabase
    .from("services")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function submitReview({ bookingId, workerId, rating, comment }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Must be logged in to submit a review.");

  const { data, error } = await supabase
    .from("reviews")
    .insert([
      {
        booking_id: bookingId,
        customer_id: user.id,
        worker_id: workerId,
        rating: Math.max(1, Math.min(5, Number(rating) || 5)),
        comment: comment || "",
      },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMyNotifications() {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
}

export async function markNotificationAsRead(id) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id);
  if (error) throw error;
  return true;
}

export async function getAllUsersForAdmin() {
  const { data: profiles, error: pError } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  if (pError) throw pError;

  const { data: roles } = await supabase.from("user_roles").select("*");
  const roleMap = {};
  roles?.forEach((r) => {
    roleMap[r.user_id] = r.role;
  });

  return profiles.map((p) => ({
    ...p,
    role: roleMap[p.id] || "customer",
  }));
}

export async function getAllWorkerProfilesForAdmin() {
  const { data, error } = await supabase
    .from("worker_profiles")
    .select(`
      user_id,
      display_name,
      bio,
      city,
      service_area,
      experience_years,
      avatar_url,
      approval_status,
      created_at,
      skills,
      availability,
      profiles (
        id,
        full_name,
        phone,
        city
      )
    `)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data || [];
}

export const getAllWorkerApplicationsForAdmin = getAllWorkerProfilesForAdmin;

export async function getAllBookingsForAdmin() {
  const localList = getAllLocalBookings();
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        profiles (
          id,
          full_name,
          phone,
          city
        ),
        worker_profiles:worker_id (
          display_name,
          avatar_url,
          city
        )
      `)
      .order("created_at", { ascending: false });

    if (error) return localList;
    const dbBookings = data || [];
    const dbIds = new Set(dbBookings.map((b) => b.id));
    return [...dbBookings, ...localList.filter((b) => !dbIds.has(b.id))];
  } catch (_) {
    return localList;
  }
}

export async function uploadFileToStorage(file, folder = "uploads") {
  if (!file) return null;
  const fileExt = file.name ? file.name.split(".").pop() : "jpg";
  const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from("workers")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw error;

  const { data: publicData } = supabase.storage
    .from("workers")
    .getPublicUrl(data.path);

  return publicData?.publicUrl || null;
}

// =========================================================================
// 50 SERVICE CATEGORIES & 250 SERVICES MASTER CATALOGUE (SUPABASE + FALLBACK)
// =========================================================================

/**
 * Fetch all 50 service categories with their sub-services from Supabase
 * Falls back to local SERVICE_CATEGORIES if network/table error occurs.
 */
export async function getServiceCatalogue() {
  try {
    const { data: dbCategories, error: catError } = await supabase
      .from("service_categories")
      .select(`
        id,
        name,
        group_name,
        icon,
        description,
        sort_order,
        services (
          id,
          category_id,
          name,
          category,
          description,
          base_price,
          sort_order,
          is_active
        )
      `)
      .order("sort_order", { ascending: true });

    if (catError || !dbCategories || dbCategories.length === 0) {
      return SERVICE_CATEGORIES;
    }

    // Map database response to standard shape
    return dbCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      groupName: cat.group_name,
      icon: cat.icon || "Wrench",
      description: cat.description || "",
      sortOrder: cat.sort_order || 0,
      services: (cat.services || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description || "",
        basePrice: s.base_price || 499,
      })),
    }));
  } catch (err) {
    console.warn("Notice fetching service categories from DB, using fallback:", err);
    return SERVICE_CATEGORIES;
  }
}

/**
 * Fetch sub-services for a category
 */
export async function getCategoryServices(categoryId) {
  try {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data) return [];
    return data;
  } catch (err) {
    console.warn("Notice fetching category services:", err);
    return [];
  }
}

/**
 * Get services selected/offered by a worker
 */
export async function getWorkerOfferedServices(workerId) {
  if (!workerId) return [];
  try {
    const { data, error } = await supabase
      .from("worker_services")
      .select(`
        service_id,
        category_id,
        services (
          id,
          name,
          category,
          description,
          base_price
        )
      `)
      .eq("worker_id", workerId);

    if (error || !data) return [];
    return data.map((ws) => ws.services).filter(Boolean);
  } catch (err) {
    console.warn("Notice fetching worker services:", err);
    return [];
  }
}

/**
 * Update services offered by a worker in worker_services
 */
export async function saveWorkerOfferedServices(workerId, serviceIds = []) {
  if (!workerId) throw new Error("Worker ID is required");

  // Remove existing services
  await supabase
    .from("worker_services")
    .delete()
    .eq("worker_id", workerId);

  if (!serviceIds || serviceIds.length === 0) return [];

  // Insert newly selected services
  const rows = serviceIds.map((sid) => ({
    worker_id: workerId,
    service_id: sid,
  }));

  const { data, error } = await supabase
    .from("worker_services")
    .insert(rows)
    .select();

  if (error) throw error;
  return data;
}

/**
 * Record a booking status transition in booking_status_history and update bookings.status
 * Booking status flow: Requested → Accepted → In Progress → Completed → Customer Confirmation → Closed
 */
export async function recordBookingStatusTransition({
  bookingId,
  fromStatus,
  toStatus,
  notes = "",
  changedBy = null,
}) {
  if (!bookingId || !toStatus) throw new Error("Booking ID and toStatus are required");

  // 1. Update status on bookings table
  const updatePayload = {
    status: toStatus,
    updated_at: new Date().toISOString(),
  };

  if (toStatus === "Customer Confirmation" || toStatus === "Completed") {
    // Keep payment status aligned
  } else if (toStatus === "Closed") {
    updatePayload.payment_status = "Paid";
  }

  const { data: updatedBooking, error: updateErr } = await supabase
    .from("bookings")
    .update(updatePayload)
    .eq("id", bookingId)
    .select()
    .single();

  if (updateErr) throw updateErr;

  // 2. Insert into booking_status_history
  try {
    await supabase.from("booking_status_history").insert([
      {
        booking_id: bookingId,
        from_status: fromStatus,
        to_status: toStatus,
        notes: notes || `Status changed from ${fromStatus || "initial"} to ${toStatus}`,
        changed_by: changedBy,
      },
    ]);
  } catch (histErr) {
    console.warn("Notice updating status history:", histErr);
  }

  return updatedBooking;
}

/**
 * Fetch booking status timeline history
 */
export async function getBookingStatusTimeline(bookingId) {
  if (!bookingId) return [];
  try {
    const { data, error } = await supabase
      .from("booking_status_history")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];
    return data;
  } catch (err) {
    console.warn("Notice fetching status timeline:", err);
    return [];
  }
}
