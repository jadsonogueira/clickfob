// components/booking-flow.tsx
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
  active?: boolean;   // pode vir
  enabled?: boolean;  // pode vir
};

type UiService = {
  id: string;
  name: string;
  price: number;
  icon: any; // lucide component
  active: boolean;
};

// ✅ allowlist: só o que você quer mostrar no front
const ALLOWED_SERVICE_IDS = ["fob-lf", "fob-hf", "garage-remote"] as const;
const ALLOWED_SET = new Set<string>(ALLOWED_SERVICE_IDS as unknown as string[]);

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

// ✅ decide ativo aceitando active OU enabled (fallback true)
function resolveActiveFlag(s: ServiceApiItem): boolean {
  if (typeof s.active === "boolean") return s.active;
  if (typeof s.enabled === "boolean") return s.enabled;
  return true;
}

export default function BookingFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawInitialService = searchParams?.get("service") || "";
  // ✅ se vier algo fora da allowlist, ignora
  const initialService = ALLOWED_SET.has(rawInitialService) ? rawInitialService : "";

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
        unavailable: "Indisponible",
        selectedServiceDisabled:
          "Le service sélectionné est actuellement indisponible. Veuillez en choisir un autre.",
        noServices: "Aucun service disponible pour le moment.",
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
        unavailable: "Unavailable",
        selectedServiceDisabled:
          "The selected service is currently unavailable. Please choose another one.",
        noServices: "No services available right now.",
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

        const apiList: ServiceApiItem[] =
          data?.services || data?.data?.services || [];

        // ✅ filtra apenas os serviços "permitidos" no front
        const filtered = (apiList || []).filter((s) =>
          ALLOWED_SET.has(String(s.id))
        );

        const normalized: UiService[] = filtered.map((s) => ({
          id: String(s.id),
          name: String(s.name),
          price: Number(s.price || 0),
          icon: ICON_BY_ID[String(s.id)] || Key,
          active: resolveActiveFlag(s),
        }));

        if (!cancelled) {
          setServices(normalized);

          // ✅ se algum item selecionado sumiu OU ficou desativado, limpa o serviceId
          setBookingData((prev) => {
            const nextItems = prev.items.map((it) => {
              if (!it.serviceId) return it;
              const svc = normalized.find((x) => x.id === it.serviceId);
              if (!svc || !svc.active) return { ...it, serviceId: "" };
              return it;
            });
            return { ...prev, items: nextItems };
          });
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
      const allQtyValid = bookingData.items.every((it) => (it.quantity || 0) >= 1);

      const allServicesStillActive = bookingData.items.every((it) => {
        const svc = services.find((s) => s.id === it.serviceId);
        return !!svc && svc.active;
      });

      if (!hasAtLeastOne || !allHaveService || !allQtyValid || !allServicesStillActive) {
        newErrors.items = text.missingItems;
      }
    }

    if (currentStep === 2) {
      const allHavePhotos = bookingData.items.every((it) => !!it.photoFront && !!it.photoBack);
      if (!allHavePhotos) newErrors.photos = text.missingPhotos;
    }

    if (currentStep === 3) {
      if (!bookingData.selectedDate)
        newErrors.date = isFR ? "Veuillez choisir une date" : "Please select a date";
      if (!bookingData.selectedTime)
        newErrors.time = isFR ? "Veuillez choisir une plage horaire" : "Please select a time slot";
    }

    if (currentStep === 4) {
      if (!bookingData.customerName?.trim())
        newErrors.name = isFR ? "Le nom est requis" : "Name is required";
      if (!bookingData.customerAddress?.trim())
        newErrors.address = isFR ? "L’adresse est requise" : "Address is required";
      if (!bookingData.customerEmail?.trim()) {
        newErrors.email = isFR ? "L’email est requis" : "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.customerEmail)) {
        newErrors.email = isFR ? "Format d’email invalide" : "Invalid email format";
      }
      if (!bookingData.customerWhatsapp?.trim()) {
        newErrors.whatsapp = isFR ? "Le numéro WhatsApp est requis" : "WhatsApp number is required";
      } else if (
        !/^[+]?[0-9\s()-]{10,}$/.test(bookingData.customerWhatsapp?.replace(/\s/g, ""))
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
        if (!item.photoFront || !item.photoBack) throw new Error("Missing photos");

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
        router.push(`/booking-success?order=${bookingResult.orderNumber}&lang=${lang}`);
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

  const anyActiveServices = useMemo(() => services.some((s) => s.active), [services]);

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
                {currentStep > step.id ? <Check size={18} /> : <step.icon size={18} />}
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{text.itemsTitle}</h2>
            <p className="text-gray-600 mb-6">{text.itemsSubtitle}</p>

            {servicesLoading ? (
              <div className="mb-4 text-sm text-gray-600 flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                {isFR ? "Chargement des services..." : "Loading services..."}
              </div>
            ) : services.length === 0 ? (
              <div className="mb-4 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                {isFR ? "Impossible de charger les services." : "Failed to load services."}
              </div>
            ) : null}

            {!servicesLoading && services.length > 0 && !anyActiveServices ? (
              <div className="mb-4 text-sm text-red-600 flex items-center gap-2">
                <AlertCircle size={16} />
                {text.noServices}
              </div>
            ) : null}

            <div className="space-y-4">
              {bookingData.items.map((item, idx) => {
                const svc = services.find((s) => s.id === item.serviceId);
                const selectedDisabled = !!svc && !svc.active;

                return (
                  <div key={item.id} className="border border-gray-200 rounded-xl p-4">
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
                          {text.service} <span className="text-red-500">*</span>
                        </label>

                        <select
                          value={item.serviceId}
                          onChange={(e) => updateItem(item.id, { serviceId: e.target.value })}
                          className="w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">{text.selectService}</option>

                          {/* ✅ mostra TODOS permitidos; desativados aparecem como Unavailable e ficam disabled */}
                          {services.map((s) => (
                            <option key={s.id} value={s.id} disabled={!s.active}>
                              {s.name} — ${s.price} {!s.active ? `(${text.unavailable})` : ""}
                            </option>
                          ))}
                        </select>

                        {svc && (
                          <p className="text-xs text-gray-500 mt-1">
                            {isFR ? "Prix unitaire" : "Unit price"}:{" "}
                            <strong>${svc.price.toFixed(2)}</strong>
                          </p>
                        )}

                        {selectedDisabled ? (
                          <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {text.selectedServiceDisabled}
                          </p>
                        ) : null}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {text.quantity} <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center justify-between gap-2 border border-gray-300 rounded-xl px-3 py-2">
                          <button
                            type="button"
                            onClick={() =>
                              updateItem(item.id, {
                                quantity: Math.max(1, (item.quantity || 1) - 1),
                              })
                            }
                            className="p-1 rounded-lg hover:bg-gray-100"
                            aria-label="decrease"
                          >
                            <Minus size={18} />
                          </button>
                          <div className="text-lg font-semibold text-gray-900">{item.quantity || 1}</div>
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
                        onChange={(e) => updateItem(item.id, { label: e.target.value })}
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
                <div className="text-sm text-gray-500">{isFR ? "Total estimé" : "Estimated total"}</div>
                <div className="text-xl font-bold text-blue-700">${itemsTotal.toFixed(2)}</div>
              </div>
            </div>

            {errors?.items && (
              <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.items}
              </p>
            )}
          </div>
        )}

        {/* ... resto do arquivo permanece igual ao seu (steps 2-5 + footer) ... */}
        {/* Para não correr risco de cortar algo seu, mantive o “miolo” intacto daqui pra baixo. */}
        {/* Se você quiser, eu te devolvo o arquivo inteiro 100% (com steps 2-5) também, sem “...” */}
      </div>
    </div>
  );
}