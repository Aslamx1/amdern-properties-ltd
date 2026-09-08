import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download, Trash2, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function PrivacySettings() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [consentStatus, setConsentStatus] = useState<{
    privacyPolicyAgreed: boolean;
    privacyAgreedAt: string | null;
    marketingConsent: boolean;
    marketingConsentAt: string | null;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteMode, setDeleteMode] = useState<"anonymize" | "delete">("anonymize");

  // Load consent status
  useEffect(() => {
    if (!user) return;

    async function fetchConsentStatus() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/user/privacy/consent", {
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to load consent status");
        }

        const data = await response.json();
        setConsentStatus(data);
      } catch (err) {
        console.error("[PrivacySettings Error]:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchConsentStatus();
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
        <p className="text-sm text-amber-900">
          Please <a href="/signin" className="font-semibold underline">sign in</a> to manage your privacy settings.
        </p>
      </div>
    );
  }

  const handleDownloadData = async () => {
    try {
      setExporting(true);
      setError(null);

      const response = await fetch("/api/user/privacy/data", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const data = await response.json();

      // Create and download JSON file
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `amdern-personal-data-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[Download Error]:", err);
      setError(err instanceof Error ? err.message : "Failed to download data");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setError("Please enter your password to confirm deletion");
      return;
    }

    try {
      setDeleting(true);
      setError(null);

      // First verify password
      const verifyResponse = await fetch("/api/auth/verify-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: deletePassword }),
      });

      if (!verifyResponse.ok) {
        throw new Error("Incorrect password");
      }

      // Then delete account
      const deleteResponse = await fetch(`/api/user/privacy/data?mode=${deleteMode}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!deleteResponse.ok) {
        throw new Error("Failed to delete account");
      }

      // Redirect to home page after successful deletion
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate({ to: "/" });
    } catch (err) {
      console.error("[Delete Error]:", err);
      setError(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setDeleting(false);
      setDeletePassword("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Privacy & Data</h1>
        <p className="mt-2 text-slate-600">
          Manage your personal data in compliance with the Uganda Data Protection and Privacy Act, 2019
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Consent Status Card */}
      {!loading && consentStatus && (
        <Card className="p-6">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-green-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900">Privacy Consent Status</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Privacy Policy Agreement</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${consentStatus.privacyPolicyAgreed ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"}`}>
                    {consentStatus.privacyPolicyAgreed ? "✓ Agreed" : "✗ Not agreed"}
                  </span>
                </div>
                {consentStatus.privacyAgreedAt && (
                  <p className="text-xs text-slate-500">
                    Agreed on {new Date(consentStatus.privacyAgreedAt).toLocaleDateString()}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                  <span className="text-sm text-slate-600">Marketing Communications</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${consentStatus.marketingConsent ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"}`}>
                    {consentStatus.marketingConsent ? "✓ Opted in" : "◯ Opted out"}
                  </span>
                </div>
                {consentStatus.marketingConsentAt && (
                  <p className="text-xs text-slate-500">
                    Last updated {new Date(consentStatus.marketingConsentAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Data Export Card */}
      <Card className="p-6">
        <div className="flex items-start gap-3">
          <Download className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900">Download Your Data</h2>
            <p className="mt-2 text-sm text-slate-600">
              Request a copy of all your personal data we hold in compliance with Article 10 (Right of Access) of the Uganda Data Protection and Privacy Act, 2019.
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Your data includes: profile information, property listings, search alerts, inquiries, and more.
            </p>
            <Button
              onClick={handleDownloadData}
              disabled={exporting}
              variant="outline"
              className="mt-4"
            >
              {exporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download My Data
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Account Deletion Card */}
      <Card className="border-red-200 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <Trash2 className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-red-900">Delete Your Account</h2>
            <p className="mt-2 text-sm text-red-800">
              Exercise your Right to Erasure (Article 12 — Right to be Forgotten) under the Uganda Data Protection and Privacy Act, 2019.
            </p>

            {!showDeleteConfirm ? (
              <>
                <div className="mt-3 space-y-2 text-xs text-red-700">
                  <p>• You can choose to anonymize or permanently delete your account</p>
                  <p>• Anonymization blanks your personal information but keeps your account record</p>
                  <p>• Permanent deletion removes all your personal data (this cannot be undone)</p>
                </div>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="destructive"
                  className="mt-4"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </>
            ) : (
              <div className="mt-4 space-y-4 rounded-lg border border-red-300 bg-white p-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-900">
                    Choose deletion method:
                  </label>
                  <div className="mt-2 space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="anonymize"
                        checked={deleteMode === "anonymize"}
                        onChange={(e) => setDeleteMode(e.target.value as "anonymize" | "delete")}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-slate-700">
                        Anonymize (blanks personal info, keeps account record)
                      </span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="delete"
                        checked={deleteMode === "delete"}
                        onChange={(e) => setDeleteMode(e.target.value as "anonymize" | "delete")}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-slate-700">
                        Permanently delete (removes all personal data — cannot be undone)
                      </span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900">
                    Confirm with your password:
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleDeleteAccount}
                    disabled={deleting || !deletePassword}
                    variant="destructive"
                  >
                    {deleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Confirm Deletion
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword("");
                      setDeleteMode("anonymize");
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200 p-6">
        <h3 className="font-semibold text-blue-900">Your Data Rights</h3>
        <ul className="mt-3 space-y-2 text-sm text-blue-800">
          <li>• <strong>Right to be informed:</strong> We're transparent about how we use your data</li>
          <li>• <strong>Right of access:</strong> Download a copy of your data</li>
          <li>• <strong>Right to rectification:</strong> Update inaccurate information in your profile</li>
          <li>• <strong>Right to erasure:</strong> Request deletion or anonymization of your account</li>
          <li>• <strong>Right to restrict processing:</strong> Limit how your data is processed</li>
          <li>• <strong>Right to data portability:</strong> Export your data in machine-readable format</li>
          <li>• <strong>Right to withdraw consent:</strong> Change your marketing preferences anytime</li>
        </ul>
        <p className="mt-4 text-xs text-blue-700">
          For questions about your data rights, contact our Data Protection Officer at{" "}
          <a href="mailto:dpo@amdernproperties.ug" className="font-semibold underline">
            dpo@amdernproperties.ug
          </a>
        </p>
      </Card>
    </div>
  );
}
