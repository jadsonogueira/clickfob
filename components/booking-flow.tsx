"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Key, Radio, Settings, ChevronLeft, ChevronRight, Check, Upload, Calendar, User, Loader2, Camera, AlertCircle } from "lucide-react";

const services = [
  { id: "fob-lf", name: "Fob Low Frequency (LF)", price: 35, icon: Key },
  { id: "fob-hf", name: "Fob High Frequency (HF)", price: 60, icon: Radio },
  { id: "garage-remote", name: "Garage Remote", price: 80, icon: Settings },
];

const timeSlots = [
  { id: "9-11", label: "9:00 AM - 11:00 AM" },
  { id: "11-13", label: "11:00 AM - 1:00 PM" },
  { id: "13-15", label: "1:00 PM - 3:00 PM" },
  { id: "15-17", label: "3:00 PM - 5:00 PM" },
];

const steps = [
  { id: 1, name: "Service", icon: Key },
  { id: 2, name: "Photos", icon: Camera },
  { id: 3, name: "Date & Time", icon: Calendar },
  { id: 4, name: "Details", icon: User },
  { id: 5, name: "Confirm", icon: Check },
];

interface BookingData {
  serviceId: string;
  photoFront: File | null;
  photoBack: File | null;
  photoFrontPreview: string;
  photoBackPreview: string;
  selectedDate: string;
  selectedTime: string;
  customerName: string;
  customerAddress: string;
  customerUnit: string;
  customerEmail: string;
  customerWhatsapp: string;
  additionalNotes: string;
}

export default function BookingFlow() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialService = searchParams?.get("service") || "";

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [bookingData, setBookingData] = useState<BookingData>({
    serviceId: initialService,
    photoFront: null,
    photoBack: null,
    photoFrontPreview: "",
    photoBackPreview: "",
    selectedDate: "",
    selectedTime: "",
    customerName: "",
    customerAddress: "",
    customerUnit: "",
    customerEmail: "",
    customerWhatsapp: "",
    additionalNotes: "",
  });

  const selectedService = services.find((s) => s.id === bookingData.serviceId);

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

  const handleFileChange = (type: "front" | "back", file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "front") {
        setBookingData((prev) => ({
          ...prev,
          photoFront: file,
          photoFrontPreview: reader.result as string,
        }));
      } else {
        setBookingData((prev) => ({
          ...prev,
          photoBack: file,
          photoBackPreview: reader.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1 && !bookingData.serviceId) {
      newErrors.service = "Please select a service";
    }

    if (currentStep === 2) {
      if (!bookingData.photoFront) newErrors.photoFront = "Front photo is required";
      if (!bookingData.photoBack) newErrors.photoBack = "Back photo is required";
    }

    if (currentStep === 3) {
      if (!bookingData.selectedDate) newErrors.date = "Please select a date";
      if (!bookingData.selectedTime) newErrors.time = "Please select a time slot";
    }

    if (currentStep === 4) {
      if (!bookingData.customerName?.trim()) newErrors.name = "Name is required";
      if (!bookingData.customerAddress?.trim()) newErrors.address = "Address is required";
      if (!bookingData.customerEmail?.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(bookingData.customerEmail)) {
        newErrors.email = "Invalid email format";
      }
      if (!bookingData.customerWhatsapp?.trim()) {
        newErrors.whatsapp = "WhatsApp number is required";
      } else if (!/^[+]?[0-9\s()-]{10,}$/.test(bookingData.customerWhatsapp?.replace(/\s/g, ""))) {
        newErrors.whatsapp = "Invalid phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Upload photos first
      const formData = new FormData();
      if (bookingData.photoFront) formData.append("front", bookingData.photoFront);
      if (bookingData.photoBack) formData.append("back", bookingData.photoBack);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();

      if (!uploadData?.success) {
        throw new Error("Failed to upload photos");
      }

      // Create booking
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId: bookingData.serviceId,
          bookingDate: bookingData.selectedDate,
          bookingTime: bookingData.selectedTime,
          customerName: bookingData.customerName,
          customerAddress: bookingData.customerAddress,
          customerUnit: bookingData.customerUnit,
          customerEmail: bookingData.customerEmail,
          customerWhatsapp: bookingData.customerWhatsapp,
          additionalNotes: bookingData.additionalNotes,
          photoFrontPath: uploadData.frontPath,
          photoBackPath: uploadData.backPath,
        }),
      });

      const bookingResult = await bookingRes.json();

      if (bookingResult?.success) {
        router.push(`/booking-success?order=${bookingResult.orderNumber}`);
      } else {
        throw new Error(bookingResult?.error || "Failed to create booking");
      }
    } catch (error) {
      console.error("Booking error:", error);
      setErrors({ submit: "Failed to complete booking. Please try again." });
    } finally {
      setIsLoading(false);
    }
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
              {index < steps?.length - 1 && (
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
        {/* Step 1: Service Selection */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Your Service</h2>
            <p className="text-gray-600 mb-6">Choose the service you need</p>

            <div className="space-y-4">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => setBookingData((prev) => ({ ...prev, serviceId: service.id }))}
                  className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                    bookingData.serviceId === service.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl ${
                        bookingData.serviceId === service.id
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <service.icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-lg font-bold text-blue-600">${service.price}.00</p>
                    </div>
                    {bookingData.serviceId === service.id && (
                      <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                        <Check size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {errors?.service && (
              <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                <AlertCircle size={14} /> {errors.service}
              </p>
            )}
          </div>
        )}

        {/* Step 2: Photo Upload */}
        {currentStep === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Photos</h2>
            <p className="text-gray-600 mb-6">
              Please upload clear photos of your fob/remote (front and back)
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Front Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Front Photo <span className="text-red-500">*</span>
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    bookingData.photoFrontPreview
                      ? "border-blue-500 bg-blue-50"
                      : errors?.photoFront
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {bookingData.photoFrontPreview ? (
                    <div className="relative aspect-video">
                      <img
                        src={bookingData.photoFrontPreview}
                        alt="Front preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setBookingData((prev) => ({
                            ...prev,
                            photoFront: null,
                            photoFrontPreview: "",
                          }))
                        }
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Click to upload front photo</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange("front", e.target.files?.[0] || null)}
                      />
                    </label>
                  )}
                </div>
                {errors?.photoFront && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.photoFront}
                  </p>
                )}
              </div>

              {/* Back Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Back Photo <span className="text-red-500">*</span>
                </label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    bookingData.photoBackPreview
                      ? "border-blue-500 bg-blue-50"
                      : errors?.photoBack
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {bookingData.photoBackPreview ? (
                    <div className="relative aspect-video">
                      <img
                        src={bookingData.photoBackPreview}
                        alt="Back preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setBookingData((prev) => ({
                            ...prev,
                            photoBack: null,
                            photoBackPreview: "",
                          }))
                        }
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">Click to upload back photo</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileChange("back", e.target.files?.[0] || null)}
                      />
                    </label>
                  )}
                </div>
                {errors?.photoBack && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.photoBack}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Date & Time */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select Date & Time</h2>
            <p className="text-gray-600 mb-6">Choose your preferred appointment slot</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={getDateMin()}
                  value={bookingData.selectedDate}
                  onChange={(e) => {
                    const date = e.target.value;
                    if (isWeekday(date)) {
                      setBookingData((prev) => ({ ...prev, selectedDate: date, selectedTime: "" }));
                    } else {
                      setErrors((prev) => ({ ...prev, date: "Please select Monday to Saturday only" }));
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {errors?.date && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle size={14} /> {errors.date}
                  </p>
                )}
                <p className="text-sm text-gray-500 mt-1">Available: Monday to Saturday</p>
              </div>

              {bookingData.selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Time Slot <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {timeSlots.map((slot) => {
                      const isBooked = bookedSlots?.includes?.(slot.id);
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          disabled={isBooked}
                          onClick={() =>
                            setBookingData((prev) => ({ ...prev, selectedTime: slot.id }))
                          }
                          className={`p-4 rounded-xl border-2 transition-all ${
                            bookingData.selectedTime === slot.id
                              ? "border-blue-600 bg-blue-50 text-blue-700"
                              : isBooked
                              ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className="font-medium">{slot.label}</span>
                          {isBooked && <span className="block text-xs mt-1">Booked</span>}
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
              )}

              {bookingData.selectedDate && bookingData.selectedTime && (
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-blue-800 font-medium">
                    Selected: {formatDate(bookingData.selectedDate)} at{" "}
                    {timeSlots.find((s) => s.id === bookingData.selectedTime)?.label}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Customer Details */}
        {currentStep === 4 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Information</h2>
            <p className="text-gray-600 mb-6">Please provide your contact details</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bookingData.customerName}
                  onChange={(e) =>
                    setBookingData((prev) => ({ ...prev, customerName: e.target.value }))
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors?.name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="John Doe"
                />
                {errors?.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complete Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={bookingData.customerAddress}
                  onChange={(e) =>
                    setBookingData((prev) => ({ ...prev, customerAddress: e.target.value }))
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors?.address ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="123 Main Street, Toronto, ON"
                />
                {errors?.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit/Buzzer Number <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={bookingData.customerUnit}
                  onChange={(e) =>
                    setBookingData((prev) => ({ ...prev, customerUnit: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Unit 123 / Buzzer 456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={bookingData.customerEmail}
                  onChange={(e) =>
                    setBookingData((prev) => ({ ...prev, customerEmail: e.target.value }))
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors?.email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="john@example.com"
                />
                {errors?.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={bookingData.customerWhatsapp}
                  onChange={(e) =>
                    setBookingData((prev) => ({ ...prev, customerWhatsapp: e.target.value }))
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors?.whatsapp ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="+1 (416) 123-4567"
                />
                {errors?.whatsapp && (
                  <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={bookingData.additionalNotes}
                  onChange={(e) =>
                    setBookingData((prev) => ({ ...prev, additionalNotes: e.target.value }))
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special instructions or information..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Confirmation */}
        {currentStep === 5 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirm Your Booking</h2>
            <p className="text-gray-600 mb-6">Please review your booking details</p>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Service</h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-900">{selectedService?.name}</span>
                  <span className="text-xl font-bold text-blue-600">
                    ${selectedService?.price}.00
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Date & Time</h3>
                <p className="text-gray-900">{formatDate(bookingData.selectedDate)}</p>
                <p className="text-gray-600">
                  {timeSlots.find((s) => s.id === bookingData.selectedTime)?.label}
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Contact Information</h3>
                <div className="space-y-1">
                  <p className="text-gray-900">{bookingData.customerName}</p>
                  <p className="text-gray-600">{bookingData.customerAddress}</p>
                  {bookingData.customerUnit && (
                    <p className="text-gray-600">Unit/Buzzer: {bookingData.customerUnit}</p>
                  )}
                  <p className="text-gray-600">{bookingData.customerEmail}</p>
                  <p className="text-gray-600">{bookingData.customerWhatsapp}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3">Uploaded Photos</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Front</p>
                    <img
                      src={bookingData.photoFrontPreview}
                      alt="Front"
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Back</p>
                    <img
                      src={bookingData.photoBackPreview}
                      alt="Back"
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {bookingData.additionalNotes && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Additional Notes</h3>
                  <p className="text-gray-600">{bookingData.additionalNotes}</p>
                </div>
              )}
            </div>

            {errors?.submit && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {errors.submit}
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
            >
              <ChevronLeft size={20} /> Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Continue <ChevronRight size={20} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Processing...
                </>
              ) : (
                <>
                  <Check size={20} /> Confirm Booking
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
