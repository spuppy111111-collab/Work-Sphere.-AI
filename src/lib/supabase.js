import { createClient } from "@supabase/supabase-js";
import { SERVICE_CATEGORIES, SERVICE_GROUPS } from "../data/serviceCatalog.js";

const supabaseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_URL) ||
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_URL) ||
  "https://tclpdmokryqyrnotwzek.supabase.co";

const supabaseKey =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY) ||
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== "undefined" && import.meta.env?.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) ||
  (typeof process !== "undefined" && process.env?.VITE_SUPABASE_ANON_KEY) ||
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
// WORKER REGISTRATION ₹25 UPI PAYMENT CONSTANTS & CONFIGURATION
// =========================================================================
export const WORKER_REGISTRATION_FEE_PAISE = 2500; // ₹25 = 2500 paise
export const WORKER_REGISTRATION_FEE_INR = 25;
export const WORKER_UPI_ID = "6281376739@fam";
export const WORKER_UPI_QR_PATH = "/images/worksphere-famx-qr.png";

/**
 * Fetch existing worker registration payment record for a given worker user ID.
 */
export async function getWorkerRegistrationPayment(workerUserId) {
  if (!workerUserId) return { data: null, error: null };
  try {
    const { data, error } = await supabase
      .from("worker_registration_payments")
      .select("*")
      .eq("worker_id", workerUserId)
      .maybeSingle();

    if (error) {
      if (error.code === "42P01" || error.message?.includes("schema cache")) {
        console.warn("worker_registration_payments table not yet created in PostgreSQL schema.");
        return { data: null, error: null, tableMissing: true };
      }
      return { data: null, error };
    }
    return { data, error: null };
  } catch (err) {
    console.warn("Notice fetching worker registration payment:", err);
    return { data: null, error: err };
  }
}

/**
 * Submit or re-submit UPI transaction reference for worker registration.
 * Enforces one-time payment of ₹25 (2500 paise), currency 'INR', method 'manual_upi_famx'.
 * Prevents duplicate submissions and duplicate transaction references.
 */
export async function submitWorkerRegistrationPayment({
  workerId,
  transactionReference,
  receiptUrl = null,
}) {
  if (!workerId) {
    throw new Error("Worker authentication is required to submit payment.");
  }

  const cleanRef = (transactionReference || "").trim();
  if (!cleanRef || cleanRef.length < 6) {
    throw new Error("Please enter a valid UPI transaction reference / UTR (minimum 6 characters).");
  }

  // 1. Check if a payment record already exists for this worker
  const { data: existingPayment, error: fetchErr } = await getWorkerRegistrationPayment(workerId);
  if (fetchErr) {
    throw new Error(fetchErr.message || "Failed to check existing payment record.");
  }

  if (existingPayment) {
    if (existingPayment.payment_status === "verified") {
      throw new Error("Your registration fee has already been verified.");
    }
    if (existingPayment.payment_status === "pending") {
      throw new Error("Your payment is already pending verification. Please wait for administrator review.");
    }

    // If status is 'rejected', allow re-submitting with new transaction reference
    const { data: updated, error: updateErr } = await supabase
      .from("worker_registration_payments")
      .update({
        transaction_reference: cleanRef,
        receipt_url: receiptUrl || existingPayment.receipt_url || null,
        payment_status: "pending",
        rejection_reason: null,
        verified_at: null,
        verified_by: null,
        updated_at: new Date().toISOString(),
      })
      .eq("worker_id", workerId)
      .select()
      .single();

    if (updateErr) {
      if (updateErr.code === "23505" || updateErr.message?.toLowerCase().includes("duplicate")) {
        throw new Error("This UPI transaction reference has already been submitted by another user. Please check your transaction details.");
      }
      throw updateErr;
    }

    return { data: updated, isResubmission: true };
  }

  // 2. Insert new one-time payment record
  const payload = {
    worker_id: workerId,
    amount_paise: WORKER_REGISTRATION_FEE_PAISE,
    currency: "INR",
    payment_method: "manual_upi_famx",
    upi_id: WORKER_UPI_ID,
    transaction_reference: cleanRef,
    receipt_url: receiptUrl || null,
    payment_status: "pending",
  };

  const { data: inserted, error: insertErr } = await supabase
    .from("worker_registration_payments")
    .insert([payload])
    .select()
    .single();

  if (insertErr) {
    if (insertErr.code === "23505" || insertErr.message?.toLowerCase().includes("duplicate") || insertErr.message?.toLowerCase().includes("unique")) {
      if (insertErr.message?.includes("transaction_ref") || insertErr.details?.includes("transaction_ref")) {
        throw new Error("This UPI transaction reference has already been submitted. Please check your transaction details.");
      }
      throw new Error("A registration fee record already exists for this account.");
    }
    throw insertErr;
  }

  return { data: inserted, isResubmission: false };
}

/**
 * Admin: Get all worker registration payments with worker profiles and details.
 */
export async function getAllWorkerPaymentsForAdmin() {
  try {
    const { data: payments, error } = await supabase
      .from("worker_registration_payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      if (error.code === "42P01" || error.message?.includes("schema cache")) {
        console.warn("worker_registration_payments table not yet created.");
        return [];
      }
      throw error;
    }

    if (!payments || payments.length === 0) return [];

    // Fetch matching worker profiles and user profiles
    const workerIds = [...new Set(payments.map((p) => p.worker_id))];
    const { data: workerProfiles } = await supabase
      .from("worker_profiles")
      .select("user_id, display_name, trade, skills, approval_status, city")
      .in("user_id", workerIds);

    const { data: userProfiles } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone")
      .in("id", workerIds);

    const wpMap = new Map((workerProfiles || []).map((wp) => [wp.user_id, wp]));
    const upMap = new Map((userProfiles || []).map((up) => [up.id, up]));

    return payments.map((p) => {
      const wp = wpMap.get(p.worker_id) || {};
      const up = upMap.get(p.worker_id) || {};
      return {
        ...p,
        worker_name: wp.display_name || up.full_name || up.email?.split("@")[0] || "Worker",
        worker_email: up.email || "",
        worker_phone: up.phone || "",
        worker_trade: wp.trade || (Array.isArray(wp.skills) ? wp.skills[0] : wp.skills) || "General",
        worker_approval_status: wp.approval_status || "pending",
        worker_city: wp.city || "Guntur",
      };
    });
  } catch (err) {
    console.error("Error fetching worker registration payments for admin:", err);
    return [];
  }
}

/**
 * Admin: Verify a worker's registration payment.
 */
export async function verifyWorkerPayment({ paymentId, adminId }) {
  if (!paymentId) throw new Error("Payment ID is required.");
  const { data, error } = await supabase
    .from("worker_registration_payments")
    .update({
      payment_status: "verified",
      verified_at: new Date().toISOString(),
      verified_by: adminId || null,
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Admin: Reject a worker's registration payment with a reason.
 */
export async function rejectWorkerPayment({ paymentId, adminId, reason }) {
  if (!paymentId) throw new Error("Payment ID is required.");
  const cleanReason = (reason || "").trim() || "Transaction reference could not be verified in UPI account.";

  const { data, error } = await supabase
    .from("worker_registration_payments")
    .update({
      payment_status: "rejected",
      rejection_reason: cleanReason,
      verified_at: null,
      verified_by: adminId || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", paymentId)
    .select()
    .single();

  if (error) throw error;
  return data;
}


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

  let user = data?.user;
  let session = data?.session;

  if (signUpError && signUpError.message?.toLowerCase().includes("already registered")) {
    // Attempt authentication with existing credentials to allow registered users to complete worker application
    const signInRes = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (signInRes.error || !signInRes.data?.user) {
      throw new Error("This email is already registered. Please enter your correct account password to complete worker registration, or sign in.");
    }
    user = signInRes.data.user;
    session = signInRes.data.session;
  } else if (signUpError) {
    throw signUpError;
  }

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
        full_name: fullName.trim(),
        phone: cleanPhone,
        city: location.trim(),
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
    return {
      user,
      session: session || data?.session,
      approvalStatus: existingApp.approval_status || "pending",
      alreadyApplied: true,
      workerProfile: existingApp,
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
        approval_status: "pending",
      },
    ])
    .select();

  if (workerErr) {
    if (!workerErr.message?.includes("duplicate")) {
      console.warn("Notice creating worker profile:", workerErr);
    }
  }

  return {
    user,
    session: session || data?.session,
    approvalStatus: "pending",
    workerProfile: workerData?.[0] || null,
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

export const AUTHORIZED_ADMIN_EMAIL = "ssunny143870@gmail.com";

/**
 * Fetch and normalize user's role from public.user_roles.
 * Handles multiple rows, case variations, whitespace, and exposes errors explicitly.
 */
export async function getUserRoleFromDatabase(userId) {
  if (!userId) {
    return { role: null, roles: [], error: new Error("Missing user ID.") };
  }

  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) {
      console.error("getUserRoleFromDatabase query error:", error);
      return { role: null, roles: [], error };
    }

    if (!data || data.length === 0) {
      return { role: null, roles: [], error: null };
    }

    const roles = data
      .map((r) => (r.role || "").toLowerCase().trim())
      .filter(Boolean);

    // Role priority: admin > worker > customer
    let role = null;
    if (roles.includes("admin")) {
      role = "admin";
    } else if (roles.includes("worker")) {
      role = "worker";
    } else if (roles.includes("customer")) {
      role = "customer";
    } else if (roles.length > 0) {
      role = roles[0];
    }

    return { role, roles, error: null };
  } catch (err) {
    console.error("Unexpected error in getUserRoleFromDatabase:", err);
    return { role: null, roles: [], error: err };
  }
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

  const cleanEmail = (user.email || "").toLowerCase().trim();

  // Strict enforcement for admin role:
  // 1. Only the designated email is allowed (ssunny143870@gmail.com)
  // 2. The user's ID must have role = 'admin' in public.user_roles
  if (requestedRole === "admin") {
    if (cleanEmail !== AUTHORIZED_ADMIN_EMAIL) {
      return {
        authorized: false,
        reason: "unauthorized_email",
        actualRole: "unauthorized",
        message: `Access denied. Only the authorized administrator account (${AUTHORIZED_ADMIN_EMAIL}) may sign in to the Admin Portal.`,
      };
    }

    try {
      const { role: dbRole, error: roleErr } = await getUserRoleFromDatabase(user.id);

      if (roleErr) {
        return {
          authorized: false,
          reason: "db_error",
          actualRole: "error",
          error: roleErr,
          message: `Database error while querying public.user_roles: ${roleErr.message || "Permission or network error"}.`,
        };
      }

      if (dbRole !== "admin") {
        return {
          authorized: false,
          reason: "unassigned_admin_role",
          actualRole: dbRole || "unassigned",
          userId: user.id,
          email: cleanEmail,
          message: `Authentication succeeded for ${AUTHORIZED_ADMIN_EMAIL}, but this account is not assigned the 'admin' role in public.user_roles.`,
          sqlInstruction: `INSERT INTO public.user_roles (user_id, role) VALUES ('${user.id}', 'admin') ON CONFLICT (user_id) DO UPDATE SET role = 'admin';`,
        };
      }

      return {
        authorized: true,
        actualRole: "admin",
        user,
      };
    } catch (err) {
      console.error("verifyRoleAccess admin check error:", err);
      return {
        authorized: false,
        reason: "error",
        message: "Failed to verify administrator privileges in database.",
      };
    }
  }

  try {
    // 1. Fetch user's actual role from the trusted user_roles table
    const { role: dbRole, error: roleErr } = await getUserRoleFromDatabase(user.id);

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
    if (cleanEmail === AUTHORIZED_ADMIN_EMAIL && dbRole === "admin") {
      actualRole = "admin";
    } else if (dbRole === "worker" || workerRecord) {
      actualRole = "worker";
    } else if (dbRole === "customer" || (profileRecord && !workerRecord && cleanEmail !== AUTHORIZED_ADMIN_EMAIL)) {
      actualRole = "customer";
    } else if (dbRole) {
      actualRole = dbRole;
    }

    if (!actualRole) {
      return {
        authorized: false,
        reason: roleErr ? "db_error" : "missing_profile",
        message: roleErr
          ? `Failed to lookup user roles from database: ${roleErr.message}`
          : "No account profile or role found for this user. Access denied.",
      };
    }

    if (actualRole !== requestedRole) {
      const mismatchMessage =
        actualRole === "customer" && requestedRole === "worker"
          ? "This account is registered as a customer. Please use worker login with your worker account or register as a worker."
          : actualRole === "admin" && requestedRole === "worker"
          ? "This account is registered as an Administrator. Please use the Admin Portal login."
          : actualRole === "worker" && requestedRole === "customer"
          ? "This account is registered as a worker. Please use customer login with your customer account."
          : actualRole === "customer" && requestedRole === "admin"
          ? "This account does not have administrator privileges."
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

      // Check ₹25 Registration Payment status
      let paymentRecord = null;
      try {
        const { data: pRec } = await supabase
          .from("worker_registration_payments")
          .select("*")
          .eq("worker_id", user.id)
          .maybeSingle();
        paymentRecord = pRec || null;
      } catch (_) {}

      const paymentStatus = paymentRecord?.payment_status || "none";
      const isPaymentVerified = paymentStatus === "verified";
      const isApproved = workerRecord.approval_status === "approved";

      // Access to /worker/dashboard requires BOTH payment verified AND approval status approved
      if (!isPaymentVerified) {
        return {
          authorized: false,
          actualRole: "worker",
          reason: paymentStatus === "rejected" ? "payment_rejected" : paymentStatus === "pending" ? "payment_pending" : "payment_required",
          paymentStatus,
          paymentRecord,
          isPaymentVerified: false,
          isApproved,
          workerProfile: workerRecord,
          message: paymentStatus === "rejected"
            ? `Your ₹25 registration payment was rejected: ${paymentRecord?.rejection_reason || "Invalid reference"}. Please resubmit.`
            : paymentStatus === "pending"
            ? "Your ₹25 registration payment is pending administrator verification."
            : "Worker registration fee (₹25) payment is required to proceed.",
        };
      }

      if (!isApproved) {
        return {
          authorized: false,
          actualRole: "worker",
          isPending: true,
          paymentStatus: "verified",
          isPaymentVerified: true,
          isApproved: false,
          workerProfile: workerRecord,
          message: "Your payment has been verified. Your worker application is awaiting admin approval.",
        };
      }

      return {
        authorized: true,
        actualRole: "worker",
        isPaymentVerified: true,
        isApproved: true,
        workerProfile: workerRecord,
        profile: profileRecord,
      };
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
    // 1. Verify user session via getUser and getSession
    let user = null;
    let session = null;

    try {
      const { data: sData } = await supabase.auth.getSession();
      if (sData?.session) {
        session = sData.session;
        user = session.user;
      }
    } catch (_) {}

    if (!user) {
      try {
        const { data: uData, error: uErr } = await supabase.auth.getUser();
        if (!uErr && uData?.user) {
          user = uData.user;
        }
      } catch (_) {}
    }

    if (!user) return null;

    const cleanEmail = (user.email || "").toLowerCase().trim();
    const isTargetAdmin = cleanEmail === AUTHORIZED_ADMIN_EMAIL;

    // Fetch user's role from public.user_roles without fragile maybeSingle
    const { role: dbRole, error: roleErr } = await getUserRoleFromDatabase(user.id);

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
    // Strict admin role verification: user must have authorized admin email AND role === 'admin' in user_roles
    if (isTargetAdmin && dbRole === "admin") {
      role = "admin";
    } else if (dbRole === "worker" || (!isTargetAdmin && wpData)) {
      role = "worker";
    } else if (dbRole === "customer" || (!isTargetAdmin && !wpData && profileData)) {
      role = "customer";
    } else if (dbRole) {
      role = dbRole;
    }

    let paymentData = null;
    if (role === "worker") {
      try {
        const { data: pData } = await supabase
          .from("worker_registration_payments")
          .select("*")
          .eq("worker_id", user.id)
          .maybeSingle();
        paymentData = pData || null;
      } catch (_) {}
    }

    const paymentStatus = paymentData?.payment_status || "none";
    const isPaymentVerified = paymentStatus === "verified";
    const isApproved = wpData?.approval_status === "approved";
    const isPending = role === "worker" && (!isApproved || !isPaymentVerified);
    const isIncomplete = role === "worker" && !wpData;

    return {
      session,
      user,
      role,
      roleError: roleErr || null,
      profile: profileData || (role === "customer" ? {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email?.split("@")[0],
        phone: user.user_metadata?.phone || "",
        city: user.user_metadata?.city || "Guntur",
      } : null),
      workerProfile: wpData || null,
      payment: paymentData,
      paymentStatus,
      isPaymentVerified,
      isApproved,
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
  // 1. Verify active Supabase session (check getUser and inspect session)
  let user = null;
  let userError = null;
  let sessionActive = false;

  try {
    const { data: userData, error: uErr } = await supabase.auth.getUser();
    userError = uErr;
    if (userData?.user) {
      user = userData.user;
    }
  } catch (err) {
    userError = err;
  }

  try {
    const { data: sessionData } = await supabase.auth.getSession();
    sessionActive = Boolean(sessionData?.session);
    if (!user && sessionData?.session?.user) {
      user = sessionData.session.user;
    }
  } catch (_) {}

  // If user is not yet resolved but a session is active in storage, attempt session refresh
  if (!user && sessionActive) {
    try {
      const { data: refData } = await supabase.auth.refreshSession();
      if (refData?.user) {
        user = refData.user;
        userError = null;
      }
    } catch (_) {}
  }

  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    console.log("[createCustomerBooking Auth Check]", {
      hasUser: !!user,
      userId: user?.id,
      sessionActive,
      userError: userError?.message || null,
    });
  }

  if (!user) {
    const safeDetail = (typeof import.meta !== "undefined" && import.meta.env?.DEV && userError?.message)
      ? ` (${userError.message})`
      : "";
    throw new Error(`Please sign in to submit a service request.${safeDetail}`);
  }

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
    try {
      photoUrl = await uploadFileToStorage(photoFile, "job_photos");
    } catch (uploadErr) {
      console.warn("Notice: photo upload skipped or failed:", uploadErr);
    }
  }

  const detectedCity = cleanPin.startsWith("520") || cleanPin.startsWith("521") ? "Vijayawada" : "Guntur";

  // UUID validation helper
  const isUuid = (val) =>
    typeof val === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());

  let cleanCategoryId = isUuid(categoryId) ? categoryId.trim() : null;
  let cleanServiceId = isUuid(serviceId) ? serviceId.trim() : null;

  // Resolve real worker profile UUID (ensures display names are never passed to foreign key)
  let cleanWorkerId = null;
  if (isUuid(workerId)) {
    cleanWorkerId = workerId.trim();
  } else if (typeof workerId === "string" && workerId.trim()) {
    try {
      const { data: matchedWorker } = await supabase
        .from("worker_profiles")
        .select("user_id")
        .ilike("display_name", `%${workerId.trim()}%`)
        .limit(1)
        .maybeSingle();
      if (matchedWorker?.user_id) {
        cleanWorkerId = matchedWorker.user_id;
      }
    } catch (_) {}
  }

  // Validate that cleanWorkerId exists in worker_profiles and is approved + available
  if (cleanWorkerId) {
    try {
      const { data: validWorker, error: wErr } = await supabase
        .from("worker_profiles")
        .select("user_id, display_name, approval_status, is_available")
        .eq("user_id", cleanWorkerId)
        .maybeSingle();

      if (wErr || !validWorker?.user_id) {
        throw new Error("The selected worker profile was not found in the verified database.");
      }

      const isApproved = String(validWorker.approval_status || "").trim().toLowerCase() === "approved";
      const isAvailable = validWorker.is_available === true;

      if (!isApproved || !isAvailable) {
        throw new Error(
          `Worker "${validWorker.display_name || "Selected worker"}" is currently unavailable or awaiting administrator approval. Please select an active available worker.`
        );
      }
    } catch (err) {
      console.error("Worker validation error in createCustomerBooking:", err);
      throw err;
    }
  }

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

  // Standard schema-compliant payload matching actual Supabase bookings table
  const standardPayload = {
    customer_id: user.id,
    category_name: serviceCategory,
    service_name: serviceName || serviceCategory,
    category_id: cleanCategoryId,
    service_id: cleanServiceId,
    description: `[${serviceCategory}${serviceName ? ` - ${serviceName}` : ""}] ${problemDescription.trim()} (Locality: ${locality}, PIN: ${cleanPin}, Time: ${preferredTime})${notes ? ` Notes: ${notes}` : ""}`,
    address: `${address.trim()}, ${locality}, PIN: ${cleanPin}`,
    city: detectedCity,
    scheduled_at: `${preferredDate}T10:00:00Z`,
    status: "pending",
    payment_status: "Pending",
    total_price: 0,
    worker_id: cleanWorkerId,
  };

  let insertedBooking = null;

  const { data, error } = await supabase
    .from("bookings")
    .insert([standardPayload])
    .select()
    .single();

  if (error) {
    console.error("Supabase booking insert error:", error);
    throw error;
  }
  insertedBooking = data;

  if (insertedBooking) {
    saveLocalBooking(insertedBooking);

    try {
      await supabase.from("notifications").insert([{
        recipient_id: user.id,
        title: "Booking Submitted",
        message: `Your request for ${serviceName || serviceCategory} has been submitted. A verified artisan will accept shortly.`,
        booking_id: insertedBooking.id,
      }]);
    } catch (_) {}

    try {
      await supabase.from("booking_status_history").insert([{
        booking_id: insertedBooking.id,
        from_status: null,
        to_status: "pending",
        changed_by: user.id,
        notes: "Booking submitted as pending by customer",
      }]);
    } catch (_) {}

    // Also notify assigned worker if a worker was specifically assigned
    if (cleanWorkerId) {
      try {
        await supabase.from("notifications").insert([{
          recipient_id: cleanWorkerId,
          title: "New Service Request",
          message: `New booking request for ${serviceName || serviceCategory} in ${locality}.`,
          booking_id: insertedBooking.id,
        }]);
      } catch (_) {}
    }

    window.dispatchEvent(
      new CustomEvent("ws_booking_updated", {
        detail: { bookingId: insertedBooking.id, booking: insertedBooking },
      })
    );
    return insertedBooking;
  }

  throw new Error("Failed to insert booking record into Supabase.");
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
      const combined = [...dbBookings, ...localList.filter((b) => !dbIds.has(b.id))];
      return combined.map((b) => ({
        ...b,
        service_category: b.service_category || b.category_name || "General Service",
        service_name: b.service_name || b.service_category || b.category_name || "Service",
        locality: b.locality || b.city || "Guntur",
        status: b.status || "Pending",
        worker_profiles: b.worker_profiles || (b.worker_id ? { display_name: "Assigned Artisan", city: b.city || "Guntur" } : null),
      }));
    }

    const dbBookings = data || [];
    const dbIds = new Set(dbBookings.map((b) => b.id));
    const combined = [...dbBookings, ...localList.filter((b) => !dbIds.has(b.id))];
    return combined.map((b) => ({
      ...b,
      service_category: b.service_category || b.category_name || "General Service",
      service_name: b.service_name || b.service_category || b.category_name || "Service",
      locality: b.locality || b.city || "Guntur",
      status: b.status || "Pending",
      worker_profiles: b.worker_profiles || (b.worker_id ? { display_name: "Assigned Artisan", city: b.city || "Guntur" } : null),
    }));
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
      .in("approval_status", ["approved", "Approved"])
      .eq("is_available", true);

    const { data, error } = await query.order("experience_years", { ascending: false });
    if (error) {
      console.error("Error querying approved workers from Supabase:", error);
      throw error;
    }

    // Exclude workers who are pending, rejected, suspended, offline, unavailable, or missing profile info
    let workers = (data || []).filter((w) => {
      if (!w || !w.user_id || !w.display_name) return false;
      const appStatus = String(w.approval_status || "").trim().toLowerCase();
      return appStatus === "approved" && w.is_available === true;
    });

    // Filter by category:
    // A worker appears under a category ONLY when their saved skills actually include that category (or their trade matches)
    if (category && category !== "all" && category !== "All") {
      const catLower = category.toLowerCase().trim();
      workers = workers.filter((w) => {
        const skillsList = Array.isArray(w.skills)
          ? w.skills.map((s) => (s || "").toLowerCase().trim())
          : [(w.skills || "").toLowerCase().trim()];
        const tradeLower = (w.trade || "").toLowerCase().trim();
        return (
          skillsList.some((s) => s === catLower || s.includes(catLower) || catLower.includes(s)) ||
          tradeLower === catLower ||
          tradeLower.includes(catLower) ||
          catLower.includes(tradeLower)
        );
      });
    }

    // Filter by location / service area
    if (city && city !== "All Cities") {
      const cityLower = city.toLowerCase().trim();
      workers = workers.filter((w) => {
        const wCity = (w.city || "").toLowerCase();
        const wArea = (w.service_area || "").toLowerCase();
        if (cityLower === "guntur") {
          const gunturLocalities = [
            "guntur", "brodipet", "arundelpet", "lakshmipuram", "pattabhipuram",
            "koretipadu", "vidyanagar", "syamalanagar", "gujanagundla", "amaravathi", "old guntur"
          ];
          return gunturLocalities.some((loc) => wCity.includes(loc) || wArea.includes(loc)) || !wCity;
        }
        return wCity.includes(cityLower) || wArea.includes(cityLower);
      });
    }

    // Search filter across name, trade, skills, city, service_area
    if (search && search.trim() !== "") {
      const sLower = search.toLowerCase().trim();
      workers = workers.filter((w) => {
        const nameMatch = (w.display_name || "").toLowerCase().includes(sLower);
        const tradeMatch = (w.trade || "").toLowerCase().includes(sLower);
        const cityMatch = (w.city || "").toLowerCase().includes(sLower);
        const areaMatch = (w.service_area || "").toLowerCase().includes(sLower);
        const skillsMatch = (w.skills || []).some((s) => (s || "").toLowerCase().includes(sLower));
        return nameMatch || tradeMatch || cityMatch || areaMatch || skillsMatch;
      });
    }

    return workers;
  } catch (err) {
    console.error("Notice fetching approved workers:", err);
    throw err;
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

    let dbBookings = [];
    const { data, error } = await query.order("created_at", { ascending: false });
    if (!error && data) {
      dbBookings = data;
    } else if (error) {
      console.warn("Notice: Query with customer profile join returned error, falling back to base bookings:", error.message);
      let fallbackQuery = supabase
        .from("bookings")
        .select("*")
        .in("status", ["Pending", "pending", "Requested", "requested"]);

      if (workerId) {
        fallbackQuery = fallbackQuery.or(`worker_id.is.null,worker_id.eq.${workerId}`);
      } else {
        fallbackQuery = fallbackQuery.is("worker_id", null);
      }

      const { data: fbData } = await fallbackQuery.order("created_at", { ascending: false });
      dbBookings = fbData || [];
    }

    const dbIds = new Set(dbBookings.map((b) => b.id));
    const combined = [...dbBookings, ...localList.filter((b) => !dbIds.has(b.id))];

    // Filter out declined bookings and normalize fields
    return combined
      .filter((b) => !declinedIds.includes(b.id))
      .map((b) => ({
        ...b,
        service_category: b.service_category || b.category_name || "General Service",
        description: b.description || b.problem_description || "Customer service request",
        locality: b.locality || b.city || "Guntur",
        preferred_time: b.preferred_time || "Morning",
        profiles: b.profiles || {
          full_name: b.customer_name || "Customer",
          phone: b.customer_phone || "+91 98765 43210",
          city: b.city || "Guntur",
        },
      }));
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

    const dbBookings = (!error && data) ? data : [];
    const dbIds = new Set(dbBookings.map((b) => b.id));
    const all = [...dbBookings, ...localList.filter((b) => !dbIds.has(b.id))];
    return all.map((b) => ({
      ...b,
      service_category: b.service_category || b.category_name || "General Service",
      location: `${b.locality || b.city || "Guntur"}, Andhra Pradesh`,
      date: b.scheduled_at ? new Date(b.scheduled_at).toLocaleDateString() : (b.preferred_time || "Upcoming"),
      status: b.status || "Accepted",
    }));
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

    const dbBookings = (!error && data) ? data : [];
    const dbIds = new Set(dbBookings.map((b) => b.id));
    const all = [...dbBookings, ...localList.filter((b) => !dbIds.has(b.id))];
    return all.map((b) => ({
      ...b,
      service_category: b.service_category || b.category_name || "General Service",
      location: `${b.locality || b.city || "Guntur"}, Andhra Pradesh`,
      date: b.scheduled_at ? new Date(b.scheduled_at).toLocaleDateString() : "Past Job",
      status: b.status || "Completed",
    }));
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
    const normalizedStatus = status === "In Progress" ? "in_progress" : status === "On the Way" ? "on_the_way" : status;
    await supabase
      .from("bookings")
      .update({ status: normalizedStatus, updated_at: new Date().toISOString() })
      .eq("id", bookingId);

    return { id: bookingId, status: normalizedStatus };
  }
}

// Backwards-compatible alias
export const changeBookingStatus = ({ bookingId, status }) =>
  updateWorkerJobStatus(bookingId, status);

export async function getWorkerProfile(userId) {
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from("worker_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw error;
    return data || null;
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
    const rawSkills = Array.isArray(skills) ? skills : [skills];
    // Deduplicate and filter out empty / invalid entries
    const cleanSkills = Array.from(
      new Set(
        rawSkills
          .map((s) => (typeof s === "string" ? s.trim() : ""))
          .filter(Boolean)
      )
    );
    payload.skills = cleanSkills;
    if (cleanSkills.length > 0) {
      payload.trade = cleanSkills[0];
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

  // 1. Check whether a worker profile already exists for this user
  const { data: existingProfile } = await supabase
    .from("worker_profiles")
    .select("*")
    .eq("user_id", targetId)
    .maybeSingle();

  // 2. If the profile does not exist, insert a new worker profile record
  if (!existingProfile) {
    const displayName =
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "Artisan Worker";

    const insertPayload = {
      user_id: targetId,
      display_name: displayName,
      trade: payload.trade || "General",
      skills: payload.skills || [],
      city: user?.user_metadata?.city || "Guntur",
      service_area: payload.service_area || user?.user_metadata?.city || "All Guntur",
      experience_years: payload.experience_years !== undefined ? payload.experience_years : 2,
      approval_status: "approved",
      is_available: payload.is_available !== undefined ? payload.is_available : true,
      bio: payload.bio || "",
    };

    let { data: insertedRows, error: insertErr } = await supabase
      .from("worker_profiles")
      .insert([insertPayload])
      .select();

    if (insertErr && insertErr.code === "42501") {
      // If RLS policy enforces 'pending' for initial insert
      insertPayload.approval_status = "pending";
      const retry = await supabase
        .from("worker_profiles")
        .insert([insertPayload])
        .select();
      insertedRows = retry.data;
      insertErr = retry.error;
    }

    if (insertErr) throw insertErr;
    return insertedRows?.[0] || insertPayload;
  }

  // 3. If the profile exists, update it cleanly
  const { data: updatedRows, error: updateErr } = await supabase
    .from("worker_profiles")
    .update(payload)
    .eq("user_id", targetId)
    .select();

  if (updateErr) throw updateErr;

  const result = (updatedRows && updatedRows.length > 0)
    ? updatedRows[0]
    : { ...existingProfile, ...payload };

  return result;
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
    .select();

  if (error) throw error;
  return data?.[0] || null;
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
  let profileList = [];
  try {
    const { data: profiles, error: pError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (!pError && profiles) {
      profileList = profiles;
    }
  } catch (_) {}

  let roleMap = {};
  try {
    const { data: roles } = await supabase.from("user_roles").select("*");
    roles?.forEach((r) => {
      roleMap[r.user_id] = r.role;
    });
  } catch (_) {}

  // Gather unique customers from bookings if profiles table was previously empty
  const knownUserIds = new Set(profileList.map((p) => p.id));
  try {
    const { data: bookings } = await supabase
      .from("bookings")
      .select("customer_id, profiles (id, full_name, phone, city)");
    bookings?.forEach((b) => {
      if (b.customer_id && !knownUserIds.has(b.customer_id)) {
        knownUserIds.add(b.customer_id);
        profileList.push({
          id: b.customer_id,
          full_name: b.profiles?.full_name || "Customer",
          phone: b.profiles?.phone || "",
          city: b.profiles?.city || "Guntur",
          role: "customer",
          created_at: new Date().toISOString(),
        });
      }
    });
  } catch (_) {}

  // Also include customers from local shared bookings
  const localList = getAllLocalBookings();
  localList.forEach((b) => {
    if (b.customer_id && !knownUserIds.has(b.customer_id)) {
      knownUserIds.add(b.customer_id);
      profileList.push({
        id: b.customer_id,
        full_name: b.customer_name || "Customer",
        phone: b.customer_phone || "",
        city: b.city || "Guntur",
        role: "customer",
        created_at: b.created_at || new Date().toISOString(),
      });
    }
  });

  return profileList.map((p) => ({
    ...p,
    role: roleMap[p.id] || p.role || "customer",
  }));
}

export async function getAllWorkerProfilesForAdmin() {
  try {
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
        is_available,
        hourly_rate,
        rating,
        trade,
        profiles (
          id,
          full_name,
          phone,
          city
        )
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      return data.map((w) => ({
        ...w,
        availability: w.availability || (w.is_available ? "Available" : "Busy"),
        approval_status: (w.approval_status || "approved").toLowerCase(),
      }));
    }

    // Fallback: select all columns directly without join
    const { data: fbData } = await supabase.from("worker_profiles").select("*");
    return (fbData || []).map((w) => ({
      ...w,
      availability: w.availability || (w.is_available ? "Available" : "Busy"),
      approval_status: (w.approval_status || "approved").toLowerCase(),
    }));
  } catch (err) {
    console.warn("Notice loading worker profiles for admin:", err);
    return [];
  }
}

export const getAllWorkerApplicationsForAdmin = getAllWorkerProfilesForAdmin;

export async function getAllBookingsForAdmin() {
  const localList = getAllLocalBookings();
  try {
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        *,
        profiles:customer_id (
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

    const dbBookings = (!error && data) ? data : [];
    const dbIds = new Set(dbBookings.map((b) => b.id));
    const all = [...dbBookings, ...localList.filter((b) => !dbIds.has(b.id))];

    // Normalize properties for AdminDashboard consumption
    return all.map((b) => {
      const normStatus = (b.status || "Pending").trim();
      const capitalizedStatus =
        normStatus.charAt(0).toUpperCase() + normStatus.slice(1);

      return {
        ...b,
        booking_code: b.booking_code || `WS-${(b.id || "").toString().replace(/[^a-zA-Z0-9]/g, "").substring(0, 8).toUpperCase()}`,
        service_category: b.service_category || b.category_name || "General Service",
        service_name: b.service_name || b.service_category || b.category_name || "Service",
        locality: b.locality || b.city || "Guntur",
        customer_name: b.profiles?.full_name || b.customer_name || "Customer",
        customer_phone: b.profiles?.phone || b.customer_phone || "+91 98765 43210",
        worker_name: b.worker_profiles?.display_name || b.worker_name || (b.worker_id ? "Assigned Artisan" : "Unassigned"),
        status: capitalizedStatus,
      };
    });
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

  // Normalize status string if needed to satisfy database check constraints
  let normalizedStatus = toStatus;
  if (toStatus === "In Progress") normalizedStatus = "in_progress";
  if (toStatus === "On the Way") normalizedStatus = "on_the_way";

  // 1. Update status on bookings table
  const updatePayload = {
    status: normalizedStatus,
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
