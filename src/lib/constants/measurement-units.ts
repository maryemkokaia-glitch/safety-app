import type { ActionSheetOption } from "@/components/ui/action-sheet";

export const measurementUnits: ActionSheetOption[] = [
  { value: "dB", label: "dB — ხმაური", icon: "🔊", description: "დეციბელი — ხმაურის დონე" },
  { value: "ლუქსი", label: "ლუქსი — განათება", icon: "💡", description: "განათების ინტენსივობა" },
  { value: "°C", label: "°C — ტემპერატურა", icon: "🌡️", description: "ჰაერის ტემპერატურა ცელსიუსით" },
  { value: "%RH", label: "%RH — ტენიანობა", icon: "💧", description: "ფარდობითი ტენიანობა" },
  { value: "მ/წმ", label: "მ/წმ — ჰაერის მოძრაობის სიჩქარე", icon: "💨", description: "ჰაერის მოძრაობა მეტრი/წამში" },
  { value: "mg/m³", label: "mg/m³ — საწარმოო მტვერი", icon: "🏭", description: "მტვრის კონცენტრაცია მილიგრამი/კუბ.მეტრი" },
  { value: "ppm", label: "ppm — ქიმიური ნივთიერებები", icon: "⚗️", description: "ქიმიური ნივთიერებების შემცველობა" },
  { value: "mg/L", label: "mg/L — ქიმიური კონცენტრაცია", icon: "🧪", description: "ხსნარში კონცენტრაცია" },
  { value: "μSv/h", label: "μSv/h — რადიაცია", icon: "☢️", description: "რადიაციის დონე მიკროსივერტი/საათი" },
  { value: "Pa", label: "Pa — წნევა", icon: "🎛️", description: "ატმოსფერული წნევა პასკალებში" },
  { value: "%", label: "% — პროცენტი", icon: "📊", description: "პროცენტული მაჩვენებელი" },
  { value: "pH", label: "pH — მჟავიანობა", icon: "🔬", description: "წყლის/ხსნარის მჟავიანობა" },
];
