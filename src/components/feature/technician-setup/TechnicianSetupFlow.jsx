"use client";

import { useCallback, useEffect, useState } from "react";
import { App } from "antd";
import { workerProfileApi } from "@/apis/worker-profile.api";
import { userApi } from "@/apis/user.api";
import { WORKER_STATUS } from "@/constants/enums";
import { normalizeGender, getRawFile } from "@/utils/helpers";
import { Step1BasicInfo } from "./Step1BasicInfo";
import { Step2Verification } from "./Step2Verification";
import { Step3Portfolio } from "./Step3Portfolio";
import { TechnicianStatus } from "./TechnicianStatus";

async function convertUrlToFile(url, defaultName = "image.jpg") {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const mimeType = blob.type || "image/jpeg";
    const extension = mimeType.split("/")[1] || "jpg";
    const filename = defaultName.includes(".")
      ? defaultName
      : `${defaultName}.${extension}`;
    return new File([blob], filename, { type: mimeType });
  } catch (error) {
    console.error("Error converting URL to File:", error);
    return null;
  }
}

async function mapCertificateUploadsForApi(certificates = []) {
  return Promise.all(
    certificates.map(async (certificate, certIndex) => {
      const mediaUploads = await Promise.all(
        (certificate.mediaUploads || []).map(async (file, mediaIndex) => {
          const raw = getRawFile(file);
          if (raw instanceof Blob) return raw;

          const url = file?.fileUrl || file?.previewUrl || file?.url;
          if (typeof url === "string" && url.startsWith("http")) {
            return convertUrlToFile(
              url,
              file.name || `certificate-${certIndex}-${mediaIndex}`,
            );
          }

          return null;
        }),
      );

      return {
        title: certificate.title || "Chứng chỉ nghề",
        issuedBy: certificate.issuedBy || "",
        issuedAt: certificate.issuedAt || new Date().toISOString().slice(0, 10),
        mediaUploads: mediaUploads.filter(Boolean),
      };
    }),
  );
}

function mapProfileToSetupData(profile) {
  const services = profile?.services || [];
  // Profile address can come as a single object or the first item of an array
  const addr =
    profile?.address ||
    (Array.isArray(profile?.addresses) ? profile.addresses[0] : null);

  // API returns gender as string ('Male','Female','Other') — normalize to numeric for the dropdown
  function normalizeGender(g) {
    if (g === null || g === undefined || g === "") return "";
    if (g === 0 || g === 1 || g === 2) return g; // already numeric
    if (typeof g === "string") {
      const lower = g.toLowerCase();
      if (lower === "male") return 0;
      if (lower === "female") return 1;
      return 2;
    }
    return Number(g);
  }

  const idImages = profile?.identificationImages || [];
  const identificationUploads = idImages.map((img, index) => ({
    uid: img.id || `id-img-${index}`,
    name: `Ảnh CCCD ${index + 1}`,
    side: index === 0 ? "front" : index === 1 ? "back" : "",
    previewUrl: img.fileUrl || img.url,
  }));

  const certs = profile?.certificates || [];
  const certificateUploads = certs.map((cert, certIndex) => ({
    title: cert.title || "Chứng chỉ nghề",
    issuedBy: cert.issuedBy || "",
    issuedAt: cert.issuedAt ? cert.issuedAt.slice(0, 10) : "",
    mediaUploads: (cert.certificateImage || []).map((img, index) => ({
      uid: img.id || `cert-img-${certIndex}-${index}`,
      name: cert.title || "Chứng chỉ nghề",
      fileUrl: img.fileUrl || img.url,
      previewUrl: img.fileUrl || img.url,
    })),
  }));

  const portImages = profile?.portfolioImages || [];
  const portfolioUploads = portImages.map((img, index) => ({
    uid: img.id || `portfolio-img-${index}`,
    name: `Ảnh công trình ${index + 1}`,
    previewUrl: img.fileUrl || img.url,
  }));

  return {
    fullName: profile?.fullName || "",
    phone: profile?.phone || "",
    dateOfBirth: profile?.dateOfBirth || "",
    gender: normalizeGender(profile?.gender),
    target: profile?.email || profile?.phone || "",
    bio: profile?.bio || "",
    experienceYears: profile?.experienceYears || 1,
    maxDistanceKm: profile?.maxDistanceKm || 25,
    citizenIdNumber: profile?.citizenIdNumber || "",
    citizenIdIssueDate: profile?.citizenIdIssueDate || "",
    citizenIdIssuePlace: profile?.citizenIdIssuePlace || "",
    address: addr
      ? {
          label: addr.label || "",
          city: addr.city || "",
          district: addr.district || "",
          ward: addr.ward || "",
          detail: addr.detail || "",
          lat: addr.lat ?? "",
          lng: addr.lng ?? "",
          isDefault: addr.isDefault ?? false,
        }
      : undefined,
    selectedCategoryIds: services
      .map((service) => service.categoryId)
      .filter(Boolean),
    workerService: services.map((service) => ({
      categoryId: service.categoryId,
      categoryName: service.categoryName,
      basePrice: service.basePrice,
      isPrimary: service.isPrimary,
    })),
    identificationUploads,
    certificateUploads,
    portfolioUploads,
  };
}

export function TechnicianSetupFlow() {
  const { message } = App.useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [setupData, setSetupData] = useState({});
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo(0, 0);
    }
  };

  const loadProfile = useCallback(async () => {
    try {
      setLoadingProfile(true);
      const [userResponse, workerResponse] = await Promise.allSettled([
        userApi.getProfile(),
        workerProfileApi.getMe(),
      ]);

      const currentUser =
        userResponse.status === "fulfilled" ? userResponse.value : null;
      const response =
        workerResponse.status === "fulfilled" ? workerResponse.value : null;

      if (response?.id) {
        setProfile(response);
        setSetupData((current) => ({
          ...current,
          ...mapProfileToSetupData({ ...currentUser, ...response }),
        }));

        const isRejected = response.status === WORKER_STATUS.REJECTED;
        setIsEditMode(isRejected);
        setCurrentStep(4);
      } else {
        setProfile(null);
        setIsEditMode(false);
        setSetupData((current) => ({
          ...current,
          fullName: current.fullName || currentUser?.fullName || "",
          phone: current.phone || currentUser?.phone || "",
          dateOfBirth: current.dateOfBirth || currentUser?.dateOfBirth || "",
          gender: current.gender ?? currentUser?.gender ?? "",
          target:
            current.target || currentUser?.email || currentUser?.phone || "",
        }));
        setCurrentStep(1);
      }
    } catch {
      setProfile(null);
      setIsEditMode(false);
      setCurrentStep(1);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(loadProfile);
  }, [loadProfile]);

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
    scrollToTop();
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    scrollToTop();
  };

  const handleUpdateData = (data) => {
    setSetupData((prev) => ({ ...prev, ...data }));
  };

  // ── First-time registration ──────────────────────────────────────────────
  const handleSubmitProfile = async (finalData = {}) => {
    const payload = { ...setupData, ...finalData };

    try {
      if (
        !payload.fullName ||
        !payload.phone ||
        !payload.dateOfBirth ||
        payload.gender === "" ||
        payload.gender === undefined ||
        payload.gender === null
      ) {
        message.error(
          "Vui lòng bổ sung họ tên, số điện thoại, ngày sinh và giới tính trước khi gửi hồ sơ.",
        );
        setCurrentStep(1);
        scrollToTop();
        return;
      }

      setSubmitting(true);
      await userApi.updateProfile({
        fullName: payload.fullName,
        phone: payload.phone,
        dateOfBirth: payload.dateOfBirth.slice(0, 10),
        gender: Number(payload.gender),
      });
      await workerProfileApi.register(payload);
      message.success("Đã gửi hồ sơ thợ để xét duyệt");
      handleUpdateData(finalData);
      await loadProfile();
      setCurrentStep(4);
      scrollToTop();
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Không thể gửi hồ sơ thợ",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Update after rejection ───────────────────────────────────────────────
  const handleUpdateProfile = async (finalData = {}) => {
    const payload = { ...setupData, ...finalData };

    try {
      setSubmitting(true);

      // 1. Update user personal info
      if (payload.fullName || payload.phone || payload.dateOfBirth) {
        await userApi.updateProfile({
          fullName: payload.fullName,
          phone: payload.phone,
          dateOfBirth: payload.dateOfBirth?.slice(0, 10),
          gender:
            payload.gender !== "" && payload.gender !== undefined
              ? Number(payload.gender)
              : undefined,
        });
      }

      // 2. Update worker profile core fields (address is required by the API)
      await workerProfileApi.updateMe({
        phone: payload.phone || undefined,
        bio: payload.bio || undefined,
        experienceYears: Number(payload.experienceYears) || 0,
        maxDistanceKm: Number(payload.maxDistanceKm) || 0,
        address: payload.address
          ? {
              label: payload.address.label || undefined,
              city: payload.address.city || "",
              district: payload.address.district || "",
              ward: payload.address.ward || "",
              detail: payload.address.detail || "",
              lat:
                payload.address.lat !== undefined &&
                payload.address.lat !== null &&
                payload.address.lat !== ""
                  ? Number(payload.address.lat)
                  : undefined,
              lng:
                payload.address.lng !== undefined &&
                payload.address.lng !== null &&
                payload.address.lng !== ""
                  ? Number(payload.address.lng)
                  : undefined,
              isDefault: payload.address.isDefault ?? false,
            }
          : undefined,
        services: (payload.workerService || []).map((s) => ({
          categoryId: s.categoryId,
          basePrice: Number(s.basePrice) || 0,
          isPrimary: Boolean(s.isPrimary),
        })),
      });

      // 3. Update identification images + CCCD fields (only if changed, to prevent empty image payload errors)
      const originalIdNumber = profile?.citizenIdNumber || "";
      const originalIdIssueDate =
        profile?.citizenIdIssueDate?.slice(0, 10) || "";
      const originalIdIssuePlace = profile?.citizenIdIssuePlace || "";

      const currentIdNumber = payload.citizenIdNumber || "";
      const currentIdIssueDate = payload.citizenIdIssueDate?.slice(0, 10) || "";
      const currentIdIssuePlace = payload.citizenIdIssuePlace || "";

      const hasNewImages = (payload.identificationUploads || []).some((f) => {
        const raw = getRawFile(f);
        return raw instanceof Blob;
      });

      const originalImagesCount = profile?.identificationImages?.length || 0;
      const currentImagesCount = (payload.identificationUploads || []).length;
      const imagesChanged =
        hasNewImages || originalImagesCount !== currentImagesCount;

      const hasIdChanges =
        currentIdNumber !== originalIdNumber ||
        currentIdIssueDate !== originalIdIssueDate ||
        currentIdIssuePlace !== originalIdIssuePlace ||
        imagesChanged;

      if (hasIdChanges) {
        const mappedIdUploads = await Promise.all(
          (payload.identificationUploads || []).map(async (file, index) => {
            const raw = getRawFile(file);
            if (raw instanceof Blob) return raw;
            if (
              typeof file?.previewUrl === "string" &&
              file.previewUrl.startsWith("http")
            ) {
              const converted = await convertUrlToFile(
                file.previewUrl,
                file.name || `cccd-${index}`,
              );
              if (converted) return converted;
            }
            return null;
          }),
        ).then((results) => results.filter(Boolean));

        if (
          mappedIdUploads.length ||
          currentIdNumber ||
          currentIdIssueDate ||
          currentIdIssuePlace
        ) {
          await workerProfileApi.updateIdentificationImages({
            citizenIdNumber: currentIdNumber || undefined,
            citizenIdIssueDate: currentIdIssueDate
              ? new Date(currentIdIssueDate).toISOString()
              : undefined,
            citizenIdIssuePlace: currentIdIssuePlace || undefined,
            images: mappedIdUploads,
          });
        }
      }

      // 4. Update certificates
      if (payload.certificateUploads?.length) {
        const certificateDtos = await mapCertificateUploadsForApi(
          payload.certificateUploads,
        );
        await workerProfileApi.updateCertificates(certificateDtos);
      }

      // 5. Upload new portfolio images (if any)
      const portfolioUploads = (
        payload.portfolioUploads ||
        finalData.portfolioUploads ||
        []
      ).filter((f) => {
        const raw = f?.rawFile || f?.originFileObj || f;
        return raw instanceof Blob;
      });
      if (portfolioUploads.length) {
        await workerProfileApi.uploadPortfolioImages(portfolioUploads);
      }

      message.success("Đã cập nhật và gửi lại hồ sơ để xét duyệt.");
      handleUpdateData(finalData);
      await loadProfile();
      scrollToTop();
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          error.message ||
          "Không thể cập nhật hồ sơ",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full px-5 py-5 md:px-7 lg:px-8">
      {loadingProfile ? (
        <div className="rounded-xl border border-border-light bg-surface-bg p-8 text-center text-sm font-semibold text-text-tertiary shadow-sm">
          Đang kiểm tra hồ sơ thợ...
        </div>
      ) : (
        <>
          {/* Edit-mode banner shown only while navigating steps */}
          {isEditMode && currentStep !== 4 && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-error/20 bg-error/5 px-5 py-3 shadow-sm">
              <span className="material-symbols-outlined text-error text-[22px]">
                edit_note
              </span>
              <div className="flex-1 min-w-0">
                <p className="m-0 text-sm font-bold text-error">
                  Hồ sơ bị từ chối — đang chỉnh sửa để gửi lại
                </p>
                <p className="m-0 mt-0.5 text-xs text-text-tertiary">
                  Lý do:{" "}
                  <span className="font-semibold text-text-secondary">
                    {profile?.rejectReason || "Chưa có lý do chi tiết"}
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="shrink-0 text-xs font-semibold text-text-secondary hover:text-primary"
              >
                Xem trạng thái
              </button>
            </div>
          )}

          {currentStep === 1 && (
            <Step1BasicInfo
              onNext={handleNext}
              onUpdate={handleUpdateData}
              data={setupData}
            />
          )}
          {currentStep === 2 && (
            <Step2Verification
              onNext={handleNext}
              onPrev={handlePrev}
              onUpdate={handleUpdateData}
              data={setupData}
            />
          )}
          {currentStep === 3 && (
            <Step3Portfolio
              onSubmit={isEditMode ? handleUpdateProfile : handleSubmitProfile}
              onPrev={handlePrev}
              onUpdate={handleUpdateData}
              data={setupData}
              submitting={submitting}
              isEditMode={isEditMode}
            />
          )}
          {currentStep === 4 && (
            <TechnicianStatus
              profile={profile}
              onRefresh={loadProfile}
              onStartEdit={
                isEditMode
                  ? () => {
                      setCurrentStep(1);
                      scrollToTop();
                    }
                  : undefined
              }
            />
          )}
        </>
      )}
    </div>
  );
}
