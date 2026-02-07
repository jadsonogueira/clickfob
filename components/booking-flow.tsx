"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Key,
  Radio,
  Settings,
  ChevronLeft,
  ChevronRight,
  Check,
  Calendar,
  User,
  Loader2,
  Camera,
  AlertCircle,
  Trash2,
  Plus,
  Minus,
} from "lucide-react";

type ServiceApiItem = {
  id: string;
  name: string;
  price: number;
  active?: boolean; // vem da API
};

type UiService = {
  id: string;
  name: string;
  price: number;
  icon: any; // lucide component
  active: boolean;
};

// mapeia ícone por id (pra manter seu layout)
const ICON_BY_ID: Record<string, any> = {
  "fob-lf": Key,
  "fob-hf": Radio,
  "garage-remote": Settings,
};

const timeSlots = [
  { id: "9-11", label: "9:00 AM - 11:00 AM" },
  { id: "11-13", label: "11:00 AM - 1:00 PM" },
  { id: "13-15", label: "1:00 PM - 3:00 PM" },
  { id: "15-17", label: "3:00 PM - 5:00 PM" },
];

const steps = [
  { id: 1, name: "Items", icon: Key },
  { id: 2, name: "Photos", icon: Camera },
  { id: 3, name: "Date & Time", icon: Calendar },
  { id: 4, name: "Details", icon: User },
  { id: 5, name: "Confirm", icon: Check },
];

type BookingItem = {
  id: string;
  serviceId: string;
  label: string;
  quantity: number;
  photoFront: File | null;
  photoBack: File | null;
  photoFrontPreview: string;
  photoBackPreview: string;
};

type BookingData = {
  items: BookingItem[];
  selectedDate: string;
  selectedTime: string;
  customerName: string;
  customerAddress: string;
  customerUnit: string;
  customerEmail: string;
  customerWhatsapp: string;
  additionalNotes: string;
};

function makeId() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cryptoAny: any = globalThis.crypto;
    if (cryptoAny?.randomUUID) return cryptoAny.randomUUID();
  } catch {
    // ignore
  }
  return `itm_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export default function BookingFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialService = searchParams?.get("service") || "";
  const lang =
    (searchParams?.get("lang") || "en").toLowerCase() === "fr" ? "fr" : "en";
  const isFR = lang === "fr";

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authorizationAccepted, setAuthorizationAccepted] = useState(false);

  // ✅ services vindo do backend
  const [services, setServices] = useState<UiService[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  const text = isFR
    ? {
        back: "Retour",
        continue: "Continuer",
        confirm: "Confirmer la réservation",
        processing: "Traitement...",
        itemsTitle: "Articles à copier",
        itemsSubtitle:
          "Ajoutez un ou plusieurs types. Une seule série de photos par type, même si vous demandez plusieurs copies.",
        addItem: "Ajouter un autre type",
        removeItem: "Supprimer",
        label: "Étiquette (optionnel)",
        labelPh: "ex : Porte d'entrée, Garage, Ascenseur",
        service: "Service",
        quantity: "Quantité",
        photosTitle: "Téléverser des photos",
        photosSubtitle:
          "Pour chaque article, téléversez des photos claires du recto et du verso.",
        front: "Recto",
        backSide: "Verso",
        change: "Changer",
        required: "Requis",
        selectService: "Choisissez un service",
        dateTitle: "Date et heure",
        detailsTitle: "Vos informations",
        confirmTitle: "Confirmer",
        authLabel:
          "Je confirme être un utilisateur autorisé de ce porte-clés et comprendre que la duplication est soumise à la compatibilité technique.",
        authHint:
          "En confirmant, vous acceptez nos Conditions d’utilisation et notre Politique de confidentialité.",
        terms: "Conditions d’utilisation",
        privacy: "Politique de confidentialité",
        mustAccept: "Veuillez confirmer l’autorisation avant de finaliser.",
        missingItems: "Ajoutez au moins un article et sélectionnez un service.",
        missingPhotos: "Chaque article doit avoir une photo recto et verso.",
      }
    : {
        back: "Back",
        continue: "Continue",
        confirm: "Confirm Booking",
        processing: "Processing...",
        itemsTitle: "Items to copy",
        itemsSubtitle:
          "Add one or more item types. One set of photos per type, even if you request multiple copies.",
        addItem: "Add another fob type",
        removeItem: "Remove",
        label: "Label (optional)",
        labelPh: "e.g., Front Door, Garage, Elevator",
        service: "Service",
        quantity: "Quantity",
        photosTitle: "Upload Photos",
        photosSubtitle:
          "For each item, upload clear photos of the front and back.",
        front: "Front",
        backSide: "Back",
        change: "Change",
        required: "Required",
        selectService: "Select a service",
        dateTitle: "Date & Time",
        detailsTitle: "Your Details",
        confirmTitle: "Confirm",
        authLabel:
          "I confirm that I am an authorized user of this key fob and understand that duplication is subject to technical compatibility.",
        authHint:
          "By confirming, you agree to our Terms & Conditions and Privacy Policy.",
        terms: "Terms & Conditions",
        privacy: "Privacy Policy",
        mustAccept: "Please confirm authorization before submitting.",
        missingItems: "Add at least one item and select a service.",
        missingPhotos: "Each item must have a front and back photo.",
      };

  const [bookingData, setBookingData] = useState<BookingData>(() => {
    const firstItem: BookingItem = {
      id: makeId(),
      serviceId: initialService,
      label: "",
      quantity: 1,
      photoFront: null,
      photoBack: null,
      photoFrontPreview: "",
      photoBackPreview: "",
    };

    return {
      items: [firstItem],
      selectedDate: "",
      selectedTime: "",
      customerName: "",
      customerAddress: "",
      customerUnit: "",
      customerEmail: "",
      customerWhatsapp: "",
      additionalNotes: "",
    };
  });

  // ✅ carregar services do backend
  useEffect(() => {
    let cancelled = false;

    async function loadServices() {
      setServicesLoading(true);
      try {
        const res = await fetch("/api/services", { cache: "no-store" });
        const data = await res.json();

        const apiList: ServiceApiItem[] = data?.services || data?.data?.services || [];
        const normalized: UiService[] = (apiList || []).map((s) => ({
          id: String(s.id),
          name: String(s.name),
          price: Number(s.price || 0),
          icon: ICON_BY_ID[String(s.id)] || Key,
          active: s.active !== false, // default true
        }));

        if (!cancelled) {
          setServices(normalized);
        }
      } catch {
        if (!cancelled) setServices([]);
      } finally {
        if (!cancelled) setServicesLoading(false);
      }
    }

    loadServices();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeServices = useMemo(() => {
    return services.filter((s) => s.active);
  }, [services]);

  const itemsTotal = useMemo(() => {
    return bookingData.items.reduce((sum, item) => {
      const svc = services.find((s) => s.id === item.serviceId);
      const unit = svc?.price ?? 0;
      return sum + unit * Math.max(1, item.quantity || 1);
    }, 0);
  }, [bookingData.items, services]);

  const fetchBookedSlots = useCallback(async (date: string) => {
    try {
      const res = await fetch(`/api/bookings/availability?date=${date}`);
      const data = await res.json();
      setBookedSlots(data?.bookedSlots ?? []);
    } catch {
      setBookedSlots([]);
    }
  }, []);

  useEffect(() => {
    if (bookingData.selectedDate) {
      fetchBookedSlots(bookingData.selectedDate);
    }
  }, [bookingData.selectedDate, fetchBookedSlots]);

  const updateItem = (id: string, patch: Partial<BookingItem>) => {
    setBookingData((prev) => ({
      ...prev,
      items: prev.items.map((it) => (it.id === id ? { ...it, ...patch } : it)),
    }));
  };

  const addItem = () => {
    setBookingData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: makeId(),
          serviceId: "",
          label: "",
          quantity: 1,
          photoFront: null,
          photoBack: null,
          photoFrontPreview: "",
          photoBackPreview: "",
        },
      ],
    }));
  };

  const removeItem = (id: string) => {
    setBookingData((prev) => {
      const next = prev.items.filter((it) => it.id !== id);
      return { ...prev, items: next.length ? next : prev.items };
    });
  };

  const handleFileChange = (
    itemId: string,
    side: "front" | "back",
    file: File | null
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (side === "front") {
        updateItem(itemId, {
          photoFront: file,
          photoFrontPreview: reader.result as string,
        });
      } else {
        updateItem(itemId, {
          photoBack: file,
          photoBackPreview: reader.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      const hasAtLeastOne = bookingData.items.length > 0;
      const allHaveService = bookingData.items.every((it) => !!it.serviceId);
      const allQtyValid = bookingData.items.every(
        (it) => (it.quantity || 0) >= 1
      );

      // ✅ também valida se o serviceId ainda existe e está ativo
      const allServicesStillActive = bookingData.items.every((it) => {
        const svc = services.find((s) => s.id === it.serviceId);
        return !!svc && svc.active;
      });

      if (
        !hasAtLeastOne ||
        !allHaveService ||
        !allQtyValid ||
        !allServicesStillActive
      ) {
        newErrors.items = text.missingItems;
      }
    }

    if (currentStep === 2) {
      const allHavePhotos = bookingData.items.every(
        (it) => !!it.photoFront && !!it.photoBack
      );
      if (!allHavePhotos) newErrors.photos = text.missingPhotos;
    }

    if (currentStep === 3) {
      if (!bookingData.selectedDate)
        newErrors.date = isFR
          ? "Veuillez choisir une date"
          : "Please select a date";
      if (!bookingData.selectedTime)
        newErrors.time = isFR
          ? "Veuillez choisir une plage horaire"
          : "Please select a time slot";
    }

    if (currentStep === 4) {
      if (!bookingData.customerName?.trim())
        newErrors.name = isFR ? "Le nom est requis" : "Name is required";
      if (!bookingData.customerAddress?.trim())
        newErrors.address = isFR
          ? "L’adresse est requise"
          : "Address is required";
      if (!bookingData.customerEmail?.trim()) {
        newErrors.email = isFR ? "L’email est requis" : "Email is required";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.customerEmail)
      ) {
        newErrors.email = isFR
          ? "Format d’email invalide"
          : "Invalid email format";
      }
      if (!bookingData.customerWhatsapp?.trim()) {
        newErrors.whatsapp = isFR
          ? "Le numéro WhatsApp est requis"
          : "WhatsApp number is required";
      } else if (
        !/^[+]?[0-9\s()-]{10,}$/.test(
          bookingData.customerWhatsapp?.replace(/\s/g, "")
        )
      ) {
        newErrors.whatsapp = isFR ? "Numéro invalide" : "Invalid phone number";
      }
    }

    if (currentStep === 5 && !authorizationAccepted) {
      newErrors.authorization = text.mustAccept;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const getDateMin = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const isWeekday = (dateString: string) => {
    const date = new Date(dateString + "T12:00:00");
    const day = date.getDay();
    return day >= 1 && day <= 6;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString + "T12:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubmit = async () => {
    if (!authorizationAccepted) {
      setErrors((prev) => ({ ...prev, authorization: text.mustAccept }));
      return;
    }

    if (!validateStep()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const uploadedItems = [] as Array<{
        serviceId: string;
        serviceName: string;
        unitPrice: number;
        quantity: number;
        label?: string;
        photoFrontUrl: string;
        photoBackUrl: string;
      }>;

      for (const item of bookingData.items) {
        const svc = services.find((s) => s.id === item.serviceId);
        if (!svc || !svc.active) throw new Error("Invalid service in items");
        if (!item.photoFront || !item.photoBack)
          throw new Error("Missing photos");

        const formData = new FormData();
        formData.append("front", item.photoFront);
        formData.append("back", item.photoBack);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (!uploadData?.success) {
          throw new Error(uploadData?.error || "Failed to upload photos");
        }

        uploadedItems.push({
          serviceId: item.serviceId,
          serviceName: svc.name,
          unitPrice: svc.price,
          quantity: Math.max(1, item.quantity || 1),
          label: item.label?.trim() || undefined,
          photoFrontUrl: uploadData.frontPath,
          photoBackUrl: uploadData.backPath,
        });
      }

      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: uploadedItems,
          bookingDate: bookingData.selectedDate,
          bookingTime: bookingData.selectedTime,
          customerName: bookingData.customerName,
          customerAddress: bookingData.customerAddress,
          customerUnit: bookingData.customerUnit,
          customerEmail: bookingData.customerEmail,
          customerWhatsapp: bookingData.customerWhatsapp,
          additionalNotes: bookingData.additionalNotes,
        }),
      });

      const bookingResult = await bookingRes.json();
      if (bookingResult?.success) {
        router.push(
          `/booking-success?order=${bookingResult.orderNumber}&lang=${lang}`
        );
      } else {
        throw new Error(bookingResult?.error || "Failed to create booking");
      }
    } catch (error) {
      console.error("Booking error:", error);
      setErrors({
        submit: isFR
          ? "Échec de la réservation. Réessayez."
          : "Failed to complete booking. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  currentStep >= step.id
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                {currentStep > step.id ? (
                  <Check size={18} />
                ) : (
                  <step.icon size={18} />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`hidden sm:block w-16 lg:w-24 h-1 mx-2 ${
                    currentStep > step.id ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="hidden sm:flex justify-between mt-2">
          {steps.map((step) => (
            <span
              key={step.id}
              className={`text-xs font-medium ${
                currentStep >= step.id ? "text-blue-600" : "text-gray-400"
              }`}
            >
              {step.name}
            </span>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
        {/* Step 1: Items */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {text.itemsTitle}
            </h2>
            <p className="text-gray-600 mb-6">{text.itemsSubtitle}</p>

            {servicesLoading ? (
              <div className="mb-4 text-sm text-gray-600 flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                {isFR ? "Chargement des services..." : "Loading services..."}
              </div>
            ) : services.length === 0 ? (
              <div className="mb-4 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                {isFR
                  ? "Impossible de charger les services."
                  : "Failed to load services."}
              </div>
            ) : null}

            <div className="space-y-4">
              {bookingData.items.map((item, idx) => {
                const svc = services.find((s) => s.id === item.serviceId);
                return (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="text-sm font-semibold text-gray-800">
                        {isFR ? `Article ${idx + 1}` : `Item ${idx + 1}`}
                      </div>
                      {bookingData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} /> {text.removeItem}
                        </button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {text.service}{" "}
                          <span className="text-red-500">*</span>
                        </label>

                        <select
                          value={item.serviceId}
                          onChange={(e) =>
                            updateItem(item.id, { serviceId: e.target.value })
                          }
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">{text.selectService}</option>

                          {/* ✅ somente ativos */}
                          {activeServices.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} — ${s.price}
                            </option>
                          ))}
                        </select>

                        {svc && (
                          <p className="text-xs text-gray-500 mt-1">
                            {isFR ? "Prix unitaire" : "Unit price"}:{" "}
                            <strong>${svc.price.toFixed(2)}</strong>
                          </p>
                        )}

                        {!servicesLoading && services.length > 0 && activeServices.length === 0 ? (
                          <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {isFR
                              ? "Aucun service disponible pour le moment."
                              : "No services available right now."}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {text.quantity}{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center justify-between gap-2 border border-gray-300 rounded-xl px-3 py-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(item.id, {
                                quantity: Math.max(
                                  1,
                                  (item.quantity || 1) - 1
                                ),
                              })
                            }
                            className="p-1 rounded-lg hover:bg-gray-100"
                            aria-label="decrease"
                          >
                            <Minus size={18} />
                          </button>
                          <div className="text-lg font-semibold text-gray-900">
                            {item.quantity || 1}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(item.id, {
                                quantity: (item.quantity || 1) + 1,
                              })
                            }
                            className="p-1 rounded-lg hover:bg-gray-100"
                            aria-label="increase"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {text.label}
                      </label>
                      <input
                        value={item.label}
                        onChange={(e) =>
                          updateItem(item.id, { label: e.target.value })
                        }
                        placeholder={text.labelPh}
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={addItem}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium"
              >
                <Plus size={18} /> {text.addItem}
              </button>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {isFR ? "Total estimé" : "Estimated total"}
                </div>
                <div className="text-xl font-bold text-blue-700">
                  ${itemsTotal.toFixed(2)}
                </div>
              </div>
            </div>

            {errors?.items && (
              <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.items}
              </p>
            )}
          </div>
        )}

        {/* Step 2... (o resto do arquivo permanece igual ao seu, só trocando services.find etc - já está acima) */}
        {/* A partir daqui, seu código segue igual ao que você mandou, sem precisar de mais mudanças. */}

        {/* Step 2: Photos (per item) */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {text.photosTitle}
            </h2>
            <p className="text-gray-600 mb-6">{text.photosSubtitle}</p>

            <div className="space-y-4">
              {bookingData.items.map((item, idx) => {
                const svc = services.find((s) => s.id === item.serviceId);
                const title =
                  item.label?.trim() ||
                  svc?.name ||
                  (isFR ? `Article ${idx + 1}` : `Item ${idx + 1}`);
                return (
                  <div
                    key={item.id}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {isFR ? "Copies" : "Copies"}:{" "}
                          <strong>{item.quantity || 1}</strong>
                        </div>
                      </div>
                      {svc && (
                        <div className="text-sm text-blue-700 font-bold">
                          ${svc.price.toFixed(2)} ea
                        </div>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Front */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">
                            {text.front}{" "}
                            <span className="text-red-500">*</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {text.required}
                          </div>
                        </div>

                        {item.photoFrontPreview ? (
                          <div className="space-y-3">
                            <img
                              src={item.photoFrontPreview}
                              alt="front preview"
                              className="w-full max-h-48 object-contain rounded-lg bg-white"
                            />
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileChange(
                                    item.id,
                                    "front",
                                    e.target.files?.[0] || null
                                  )
                                }
                              />
                              {text.change}
                            </label>
                          </div>
                        ) : (
                          <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 bg-white">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleFileChange(
                                  item.id,
                                  "front",
                                  e.target.files?.[0] || null
                                )
                              }
                            />
                            <div className="flex flex-col items-center gap-2 text-gray-600">
                              <Camera size={28} />
                              <span className="text-sm">
                                {isFR ? "Téléverser une photo" : "Upload photo"}
                              </span>
                            </div>
                          </label>
                        )}
                      </div>

                      {/* Back */}
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium text-gray-900">
                            {text.backSide}{" "}
                            <span className="text-red-500">*</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {text.required}
                          </div>
                        </div>

                        {item.photoBackPreview ? (
                          <div className="space-y-3">
                            <img
                              src={item.photoBackPreview}
                              alt="back preview"
                              className="w-full max-h-48 object-contain rounded-lg bg-white"
                            />
                            <label className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer">
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) =>
                                  handleFileChange(
                                    item.id,
                                    "back",
                                    e.target.files?.[0] || null
                                  )
                                }
                              />
                              {text.change}
                            </label>
                          </div>
                        ) : (
                          <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 bg-white">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleFileChange(
                                  item.id,
                                  "back",
                                  e.target.files?.[0] || null
                                )
                              }
                            />
                            <div className="flex flex-col items-center gap-2 text-gray-600">
                              <Camera size={28} />
                              <span className="text-sm">
                                {isFR ? "Téléverser une photo" : "Upload photo"}
                              </span>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {errors?.photos && (
              <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.photos}
              </p>
            )}
          </div>
        )}

        {/* Step 3: Date & Time */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {text.dateTitle}
            </h2>
            <p className="text-gray-600 mb-6">
              {isFR
                ? "Choisissez une date et une plage horaire."
                : "Choose a date and a time slot."}
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isFR ? "Date" : "Date"}
                </label>
                <input
                  type="date"
                  min={getDateMin()}
                  value={bookingData.selectedDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBookingData((prev) => ({
                      ...prev,
                      selectedDate: val,
                      selectedTime: "",
                    }));
                  }}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors?.date && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.date}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isFR ? "Plage horaire" : "Time slot"}
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {timeSlots.map((slot) => {
                    const isBooked = bookedSlots.includes(slot.id);
                    const isSelected = bookingData.selectedTime === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        disabled={isBooked}
                        onClick={() =>
                          setBookingData((prev) => ({
                            ...prev,
                            selectedTime: slot.id,
                          }))
                        }
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isBooked
                            ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                            : isSelected
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="font-semibold">{slot.label}</div>
                        {isBooked && (
                          <div className="text-xs mt-1">
                            {isFR ? "Réservé" : "Booked"}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                {errors?.time && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.time}
                  </p>
                )}
              </div>

              {bookingData.selectedDate && (
                <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <strong>{isFR ? "Sélection" : "Selection"}:</strong>{" "}
                  {formatDate(bookingData.selectedDate)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Details */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {text.detailsTitle}
            </h2>
            <p className="text-gray-600 mb-6">
              {isFR
                ? "Entrez vos informations de contact."
                : "Enter your contact details."}
            </p>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isFR ? "Nom" : "Name"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  value={bookingData.customerName}
                  onChange={(e) =>
                    setBookingData((p) => ({
                      ...p,
                      customerName: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors?.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isFR ? "WhatsApp" : "WhatsApp"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  value={bookingData.customerWhatsapp}
                  onChange={(e) =>
                    setBookingData((p) => ({
                      ...p,
                      customerWhatsapp: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors?.whatsapp && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.whatsapp}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isFR ? "Adresse" : "Address"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  value={bookingData.customerAddress}
                  onChange={(e) =>
                    setBookingData((p) => ({
                      ...p,
                      customerAddress: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors?.address && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.address}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isFR ? "Unité / Interphone" : "Unit / Buzzer"}
                </label>
                <input
                  value={bookingData.customerUnit}
                  onChange={(e) =>
                    setBookingData((p) => ({
                      ...p,
                      customerUnit: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isFR ? "Email" : "Email"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  value={bookingData.customerEmail}
                  onChange={(e) =>
                    setBookingData((p) => ({
                      ...p,
                      customerEmail: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors?.email && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.email}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isFR
                    ? "Notes (optionnel)"
                    : "Additional notes (optional)"}
                </label>
                <textarea
                  value={bookingData.additionalNotes}
                  onChange={(e) =>
                    setBookingData((p) => ({
                      ...p,
                      additionalNotes: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Confirm */}
        {currentStep === 5 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {text.confirmTitle}
            </h2>
            <p className="text-gray-600 mb-6">
              {isFR
                ? "Vérifiez les détails et confirmez."
                : "Review the details and confirm."}
            </p>

            <div className="space-y-4">
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="font-semibold text-gray-900 mb-2">
                  {isFR ? "Résumé" : "Summary"}
                </div>
                <div className="space-y-2">
                  {bookingData.items.map((it) => {
                    const svc = services.find((s) => s.id === it.serviceId);
                    const name = it.label?.trim() || svc?.name || it.serviceId;
                    const unit = svc?.price ?? 0;
                    const qty = Math.max(1, it.quantity || 1);
                    return (
                      <div
                        key={it.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="text-gray-700">
                          {name} × {qty}
                        </div>
                        <div className="font-semibold text-gray-900">
                          ${(unit * qty).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-gray-700 font-semibold">
                    {isFR ? "Total" : "Total"}
                  </div>
                  <div className="text-blue-700 text-xl font-bold">
                    ${itemsTotal.toFixed(2)}
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {isFR ? "TVH 13% peut s’appliquer." : "13% HST may apply."}
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={authorizationAccepted}
                    onChange={(e) => setAuthorizationAccepted(e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-sm text-gray-900 font-medium">
                      {text.authLabel}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {text.authHint}{" "}
                      <Link
                        href={`/terms?lang=${lang}`}
                        className="text-blue-600 hover:underline"
                      >
                        {text.terms}
                      </Link>{" "}
                      ·{" "}
                      <Link
                        href={`/privacy?lang=${lang}`}
                        className="text-blue-600 hover:underline"
                      >
                        {text.privacy}
                      </Link>
                    </div>
                  </div>
                </label>
                {errors?.authorization && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.authorization}
                  </p>
                )}
              </div>

              {errors?.submit && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.submit}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Footer nav */}
        <div className="mt-8 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all ${
              currentStep === 1 || isLoading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
          >
            <ChevronLeft size={18} /> {text.back}
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isLoading}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all"
            >
              {text.continue} <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !authorizationAccepted}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${
                isLoading || !authorizationAccepted
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 text-white"
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> {text.processing}
                </>
              ) : (
                <>
                  <Check size={18} /> {text.confirm}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}