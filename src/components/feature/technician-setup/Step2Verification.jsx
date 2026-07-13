'use client';

import { useEffect, useRef, useState } from 'react';
import { Image as AntImage, Steps, Upload } from 'antd';
import { fptVisionApi, parseVietnameseDate } from '@/apis/fpt-vision.api';
import { getRawFile } from '@/utils/helpers';

const MAX_ID_UPLOADS = 6;
const ID_SIDE_FRONT = 'front';
const ID_SIDE_BACK = 'back';



function createUploadItem(file) {
  const rawFile = getRawFile(file);
  const uid = file?.uid || `${rawFile?.name || 'id-image'}-${rawFile?.lastModified || Date.now()}-${Math.random().toString(36).slice(2)}`;

  return {
    uid,
    name: rawFile?.name || file?.name || 'Ảnh CCCD',
    rawFile,
    side: file?.side || '',
    previewUrl: rawFile instanceof Blob ? URL.createObjectURL(rawFile) : '',
  };
}

export function Step2Verification({ onNext, onPrev, onUpdate, data = {} }) {
  const [citizenIdNumber, setCitizenIdNumber] = useState(data.citizenIdNumber || '');
  const [citizenIdIssueDate, setCitizenIdIssueDate] = useState(data.citizenIdIssueDate?.slice(0, 10) || '');
  const [citizenIdIssuePlace, setCitizenIdIssuePlace] = useState(data.citizenIdIssuePlace || '');
  const [identificationUploads, setIdentificationUploads] = useState(() => (
    (data.identificationUploads || []).map((file) => (file.previewUrl ? file : createUploadItem(file)))
  ));
  const [certificates, setCertificates] = useState(() => (
    data.certificateUploads || []
  ));
  const [scanningId, setScanningId] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [scanError, setScanError] = useState('');
  const identificationUploadsRef = useRef(identificationUploads);

  useEffect(() => {
    identificationUploadsRef.current = identificationUploads;
  }, [identificationUploads]);

  useEffect(() => () => {
    identificationUploadsRef.current.forEach((file) => {
      if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
    });
  }, []);

  const addCertificateCard = () => {
    setCertificates((current) => [
      ...current,
      {
        uid: `new-cert-${Date.now()}`,
        title: '',
        issuedBy: '',
        issuedAt: '',
        mediaUploads: [],
      }
    ]);
  };

  const removeCertificateCard = (index) => {
    setCertificates((current) => current.filter((_, i) => i !== index));
  };

  const updateCertificateField = (index, field, value) => {
    setCertificates((current) => {
      const next = [...current];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addCertificateMedia = (index, files) => {
    setCertificates((current) => {
      const next = [...current];
      const currentMedias = next[index].mediaUploads || [];
      const newMedias = Array.from(files).map((f) => {
        const rawFile = getRawFile(f);
        return {
          uid: f.uid || `${rawFile?.name || 'cert'}-${Date.now()}-${Math.random()}`,
          name: rawFile?.name || f?.name || 'Tệp chứng chỉ',
          rawFile,
          previewUrl: rawFile instanceof Blob ? URL.createObjectURL(rawFile) : f.fileUrl || f.url || '',
        };
      });
      next[index] = {
        ...next[index],
        mediaUploads: [...currentMedias, ...newMedias]
      };
      return next;
    });
  };

  const removeCertificateMedia = (index, mediaUid) => {
    setCertificates((current) => {
      const next = [...current];
      const currentMedias = next[index].mediaUploads || [];
      next[index] = {
        ...next[index],
        mediaUploads: currentMedias.filter((m) => m.uid !== mediaUid)
      };
      return next;
    });
  };

  const clearScanState = () => {
    setScanMessage('');
    setScanError('');
  };

  const frontIdImage = identificationUploads.find((file) => file.side === ID_SIDE_FRONT);
  const backIdImage = identificationUploads.find((file) => file.side === ID_SIDE_BACK);

  const addIdentificationUploads = (files, side = '') => {
    setIdentificationUploads((current) => {
      const currentKeys = new Set(current.map((file) => file.uid || file.name));
      const nextFiles = files
        .map(createUploadItem)
        .map((file) => ({ ...file, side: side || file.side }))
        .filter((file) => file.rawFile instanceof Blob && !currentKeys.has(file.uid));

      if (side && nextFiles.length > 0) {
        const removedSideFiles = current.filter((file) => file.side === side);
        removedSideFiles.forEach((file) => {
          if (file.previewUrl) URL.revokeObjectURL(file.previewUrl);
        });

        return [
          ...current.filter((file) => file.side !== side),
          nextFiles[0],
        ].slice(0, MAX_ID_UPLOADS);
      }

      return [...current, ...nextFiles].slice(0, MAX_ID_UPLOADS);
    });
    clearScanState();
  };

  const removeIdentificationUpload = (uid) => {
    setIdentificationUploads((current) => {
      const removed = current.find((file) => file.uid === uid);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((file) => file.uid !== uid);
    });
    clearScanState();
  };

  const handleNext = () => {
    if (!frontIdImage || !backIdImage) {
      setScanError('Vui lòng tải đủ mặt trước và mặt sau CCCD trước khi tiếp tục.');
      return;
    }

    onUpdate({
      citizenIdNumber,
      citizenIdIssueDate: citizenIdIssueDate ? new Date(citizenIdIssueDate).toISOString() : '',
      citizenIdIssuePlace,
      identificationUploads: identificationUploads.map(getRawFile),
      certificateUploads: certificates.map((c) => ({
        title: c.title || 'Chứng chỉ nghề',
        issuedBy: c.issuedBy || '',
        issuedAt: c.issuedAt || new Date().toISOString().slice(0, 10),
        mediaUploads: c.mediaUploads || [],
      })),
    });
    onNext();
  };

  const handleScanCitizenId = async () => {
    if (!frontIdImage || !backIdImage) {
      setScanError('Vui lòng chọn ở mặt trước và mặt sau CCCD trước khi quét.');
      return;
    }

    try {
      setScanningId(true);
      setScanError('');
      setScanMessage('Đang quét thông tin CCCD...');

      const [frontSide = {}, backSide = {}] = await Promise.all([
        fptVisionApi.recognizeCitizenId(getRawFile(frontIdImage)),
        fptVisionApi.recognizeCitizenId(getRawFile(backIdImage)),
      ]);

      if (frontSide.citizenIdNumber) setCitizenIdNumber(frontSide.citizenIdNumber);

      const parsedIssueDate = parseVietnameseDate(backSide.issueDate);
      const parsedBirthDate = parseVietnameseDate(frontSide.dateOfBirth);
      if (parsedIssueDate) setCitizenIdIssueDate(parsedIssueDate);
      if (backSide.issuePlace) setCitizenIdIssuePlace(backSide.issuePlace);
      if (parsedBirthDate) {
        onUpdate({
          dateOfBirth: parsedBirthDate,
        });
      }

      setScanMessage('Đã quét mặt trước và mặt sau CCCD. Vui lòng kiểm tra lại thông tin trước khi tiếp tục.');
    } catch (error) {
      setScanMessage('');
      setScanError(error.response?.data?.errorMessage || error.message || 'Không thể quét CCCD bằng FPT AI Vision.');
    } finally {
      setScanningId(false);
    }
  };

  const renderIdSideUpload = (side, label, helper, file) => (
    <Upload
      accept="image/*"
      multiple={false}
      showUploadList={false}
      className="[&_.ant-upload]:!block"
      beforeUpload={(file, fileList) => {
        addIdentificationUploads(fileList.length ? fileList : [file], side);
        return Upload.LIST_IGNORE;
      }}
    >
      <div className={
        'relative flex w-full aspect-[1.58] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border p-2 text-center transition-colors hover:border-primary hover:bg-white ' +
        (file ? 'border-primary bg-white' : 'border-dashed border-border-medium bg-background')
      }>
        {file ? (
          <>
            <div
              className="absolute inset-0 z-0"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <AntImage
                src={file.previewUrl}
                alt={label}
                className="h-full w-full rounded-lg object-cover cursor-zoom-in"
                rootClassName="h-full w-full block"
                preview={{ mask: 'Xem ảnh' }}
              />
            </div>
            <div className="absolute left-2 top-2 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-primary shadow-sm pointer-events-none z-10">
              {label}
            </div>
            <button
              type="button"
              className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-white/90 text-error shadow-sm transition-colors hover:bg-error hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                removeIdentificationUpload(file.uid);
              }}
              aria-label={`Xóa ${label}`}
            >
              <span className="material-symbols-outlined text-[17px]">close</span>
            </button>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined mb-2 rounded-full bg-primary-light p-2 text-[22px] text-text-secondary">add_a_photo</span>
            <p className="m-0 text-sm font-bold text-text-secondary">{label}</p>
            <p className="m-0 mt-1 text-xs text-text-tertiary">{helper}</p>
          </div>
        )}
      </div>
    </Upload>
  );

  const idUploadButton = (
    <Upload
      accept="image/*"
      multiple
      showUploadList={false}
      className="[&_.ant-upload]:!block"
      beforeUpload={(file, fileList) => {
        addIdentificationUploads(fileList.length ? fileList : [file]);
        return Upload.LIST_IGNORE;
      }}
    >
      <div className="flex w-full aspect-[1.58] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border-medium bg-background p-3 text-center transition-colors hover:border-primary hover:bg-white">
        <span className="material-symbols-outlined mb-2 rounded-full bg-primary-light p-2 text-[22px] text-text-secondary">add_a_photo</span>
        <p className="m-0 text-sm font-bold text-text-secondary">Thêm ảnh bổ sung</p>
        <p className="m-0 mt-1 text-xs text-text-tertiary">Tối đa {MAX_ID_UPLOADS} ảnh</p>
      </div>
    </Upload>
  );

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border-light bg-surface-bg p-4 shadow-sm md:p-5">
        <Steps
          current={1}
          responsive
          items={[
            { title: 'Thông tin cơ bản', description: 'Dịch vụ và hồ sơ' },
            { title: 'Xác minh', description: 'Giấy tờ cần duyệt' },
            { title: 'Hoàn thiện', description: 'Ảnh và khu vực' },
          ]}
        />
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="space-y-5 xl:col-span-8">
          <section className="rounded-xl border border-border-light bg-surface-bg p-5 shadow-sm">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">badge</span>
                  <h2 className="m-0 text-xl font-bold text-text-secondary">Xác minh CCCD</h2>
                </div>
                <p className="m-0 max-w-3xl text-sm leading-6 text-text-tertiary">
                  Tải mặt trước, mặt sau và ảnh bổ sung nếu cần. Ảnh cần đủ 4 góc, rõ thông tin, dưới 5MB.
                </p>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-primary bg-white px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleScanCitizenId}
                disabled={scanningId || !frontIdImage || !backIdImage}
              >
                <span className="material-symbols-outlined text-[18px]">document_scanner</span>
                {scanningId ? 'Đang quét...' : 'Quét CCCD'}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-text-secondary">Số CCCD</label>
                <input
                  className="w-full rounded-lg border border-border-light px-4 py-2.5 text-sm outline-none focus:border-primary focus-visible:!outline-none focus:!ring-0"
                  value={citizenIdNumber}
                  onChange={(event) => setCitizenIdNumber(event.target.value)}
                  placeholder="012345678901"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-text-secondary">Ngày cấp</label>
                <input
                  className="w-full rounded-lg border border-border-light px-4 py-2.5 text-sm outline-none focus:border-primary focus-visible:!outline-none focus:!ring-0"
                  type="date"
                  value={citizenIdIssueDate}
                  onChange={(event) => setCitizenIdIssueDate(event.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-text-secondary">Nơi cấp</label>
                <input
                  className="w-full rounded-lg border border-border-light px-4 py-2.5 text-sm outline-none focus:border-primary focus-visible:!outline-none focus:!ring-0"
                  value={citizenIdIssuePlace}
                  onChange={(event) => setCitizenIdIssuePlace(event.target.value)}
                  placeholder="Cục CSQLHC về TTXH"
                />
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="m-0 text-sm font-bold text-text-secondary">Ảnh CCCD đã chọn</p>
                  <p className="m-0 text-xs text-text-tertiary">
                    {identificationUploads.length}/{MAX_ID_UPLOADS} ảnh. Nên có ít nhất mặt trước và mặt sau.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {renderIdSideUpload(ID_SIDE_FRONT, 'Mặt trước CCCD', 'Có ảnh chân dung và số CCCD', frontIdImage)}
                {renderIdSideUpload(ID_SIDE_BACK, 'Mặt sau CCCD', 'Có ngày cấp và nơi cấp', backIdImage)}

                {identificationUploads.filter((file) => !file.side).map((file, index) => (
                  <div
                    key={file.uid || file.name}
                    className="relative flex w-full aspect-[1.58] flex-col rounded-xl border border-border-light bg-background p-2"
                  >
                    <div className="relative h-full w-full overflow-hidden rounded-lg bg-white">
                      <AntImage
                        src={file.previewUrl}
                        alt={`Ảnh CCCD ${index + 1}`}
                        className="h-full w-full object-cover cursor-zoom-in"
                        rootClassName="h-full w-full block"
                        preview={{ mask: 'Xem ảnh' }}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-white/90 text-error shadow-sm transition hover:bg-error-light cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeIdentificationUpload(file.uid);
                        }}
                        aria-label={`Xóa ảnh CCCD ${index + 1}`}
                      >
                        <span className="material-symbols-outlined text-[17px]">close</span>
                      </button>
                    </div>
                  </div>
                ))}

                {identificationUploads.length < MAX_ID_UPLOADS && idUploadButton}
              </div>
            </div>

            {(scanMessage || scanError) && (
              <p className={`m-0 mt-4 rounded-lg px-3 py-2 text-sm font-medium ${scanError ? 'bg-error-light text-error' : 'bg-success-light text-success'}`}>
                {scanError || scanMessage}
              </p>
            )}
          </section>

          <section className="rounded-xl border border-border-light bg-surface-bg p-5 shadow-sm space-y-6">
            <div className="flex items-center justify-between gap-3 border-b border-border-light pb-4">
              <div>
                <h3 className="m-0 text-lg font-bold text-text-secondary">Chứng chỉ nghề nghiệp</h3>
                <p className="m-0 mt-1 text-sm text-text-tertiary">Tùy chọn, thêm một hoặc nhiều chứng chỉ chuyên môn của bạn.</p>
              </div>
              <button
                type="button"
                onClick={addCertificateCard}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:opacity-90 active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                Thêm chứng chỉ
              </button>
            </div>

            {certificates.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-medium bg-background p-8 text-center text-sm font-semibold text-text-tertiary">
                Chưa có chứng chỉ được thêm. Bấm nút Thêm chứng chỉ để bắt đầu bổ sung thông tin.
              </div>
            ) : (
              <div className="space-y-6">
                {certificates.map((cert, index) => (
                  <div key={cert.uid || index} className="relative rounded-xl border border-border-light bg-background p-5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-border-light/60 pb-3">
                      <span className="text-sm font-bold text-primary">Chứng chỉ #{index + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeCertificateCard(index)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-error border-none bg-transparent hover:bg-error-light px-2.5 py-1.5 rounded-md cursor-pointer transition"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        Xóa chứng chỉ
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-[0.06em]">Tên chứng chỉ</label>
                        <input
                          className="w-full rounded-lg border border-border-light px-3 py-2 text-sm outline-none focus:border-primary focus-visible:!outline-none focus:!ring-0 bg-white"
                          value={cert.title || ''}
                          onChange={(e) => updateCertificateField(index, 'title', e.target.value)}
                          placeholder="Ví dụ: Chứng chỉ Điện Lạnh"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-[0.06em]">Nơi cấp</label>
                        <input
                          className="w-full rounded-lg border border-border-light px-3 py-2 text-sm outline-none focus:border-primary focus-visible:!outline-none focus:!ring-0 bg-white"
                          value={cert.issuedBy || ''}
                          onChange={(e) => updateCertificateField(index, 'issuedBy', e.target.value)}
                          placeholder="Ví dụ: Trường Cao đẳng Nghề"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-[0.06em]">Ngày cấp</label>
                        <input
                          className="w-full rounded-lg border border-border-light px-3 py-2 text-sm outline-none focus:border-primary focus-visible:!outline-none focus:!ring-0 bg-white"
                          type="date"
                          value={cert.issuedAt?.slice(0, 10) || ''}
                          onChange={(e) => updateCertificateField(index, 'issuedAt', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-bold text-text-secondary uppercase tracking-[0.06em]">Ảnh/Tệp đính kèm</label>
                        <Upload
                          accept="image/*,.pdf"
                          multiple
                          showUploadList={false}
                          beforeUpload={(file, fileList) => {
                            addCertificateMedia(index, fileList.length ? fileList : [file]);
                            return Upload.LIST_IGNORE;
                          }}
                        >
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-md border border-border-medium bg-white px-3 py-1.5 text-xs font-bold text-text-secondary hover:border-primary hover:text-primary transition cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">upload_file</span>
                            Tải lên tệp
                          </button>
                        </Upload>
                      </div>

                      {(cert.mediaUploads || []).length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                          {(cert.mediaUploads || []).map((file) => {
                            const isPdf = file.name?.toLowerCase().endsWith('.pdf');
                            return (
                              <div key={file.uid} className="relative aspect-[1.45] overflow-hidden rounded-xl border border-border-light bg-background shadow-sm group">
                                {file.previewUrl && !isPdf ? (
                                  <AntImage
                                    src={file.previewUrl}
                                    alt={file.name}
                                    className="h-full w-full object-cover cursor-zoom-in"
                                    rootClassName="h-full w-full block"
                                    preview={{ mask: 'Xem ảnh' }}
                                  />
                                ) : (
                                  <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center bg-white cursor-pointer" onClick={() => file.previewUrl && window.open(file.previewUrl, '_blank')}>
                                    <span className="material-symbols-outlined text-[28px] text-text-tertiary mb-1">
                                      {isPdf ? 'picture_as_pdf' : 'description'}
                                    </span>
                                    <span className="block truncate w-full text-xs font-semibold text-text-secondary px-1">
                                      {file.name}
                                    </span>
                                    <span className="text-[10px] text-text-tertiary mt-0.5 uppercase tracking-wider font-bold">
                                      {isPdf ? 'Tệp PDF' : 'Tài liệu'}
                                    </span>
                                  </div>
                                )}

                                {/* Delete Button */}
                                <button
                                  type="button"
                                  onClick={() => removeCertificateMedia(index, file.uid)}
                                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border border-white/80 bg-white/95 text-error shadow-md transition hover:bg-error-light cursor-pointer"
                                  aria-label={`Xóa ${file.name}`}
                                >
                                  <span className="material-symbols-outlined text-[16px]">close</span>
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="m-0 text-xs text-text-tertiary bg-white/40 px-3 py-2 rounded-lg border border-dashed border-border-light">Chưa tải lên tệp đính kèm cho chứng chỉ này.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <div className="flex items-center justify-between py-4">
            <button className="flex items-center gap-2 border-none bg-transparent font-body text-text-tertiary transition-colors hover:text-text-secondary" onClick={onPrev}>
              <span className="material-symbols-outlined">arrow_back</span>
              Quay lại thông tin hồ sơ
            </button>
            <button className="rounded-full border-none bg-primary px-8 py-3 font-body-bold text-white shadow-md transition-transform active:scale-95" onClick={handleNext}>
              Tiếp tục
            </button>
          </div>
        </div>

        <aside className="xl:col-span-4">
          <div className="sticky top-24 space-y-6">
            <div className="rounded-xl border border-border-light bg-surface-bg p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-success">lock</span>
                <h3 className="m-0 text-lg font-bold text-text-secondary">Bảo mật hồ sơ</h3>
              </div>
              <p className="m-0 text-sm leading-6 text-text-tertiary">
                Tài liệu cá nhân chỉ dùng để xác minh hồ sơ thợ và không hiển thị công khai cho khách hàng.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

