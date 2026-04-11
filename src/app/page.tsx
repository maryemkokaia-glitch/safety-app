import Link from "next/link";
import { Shield, ClipboardCheck, Camera, FileText, ArrowRight, HardHat, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto px-5 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12 sm:mb-20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
              <Shield className="w-6 h-6" />
            </div>
            <span className="text-lg font-bold">SafetyApp</span>
          </div>
          <Link href="/admin">
            <Button className="bg-white text-slate-900 hover:bg-blue-50 shadow-lg shadow-white/10">
              Demo <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>

        {/* Hero */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/10">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-blue-100">Construction Safety Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-5 leading-tight tracking-tight">
            სამშენებლო
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              უსაფრთხოების
            </span>
            <br />
            მართვის სისტემა
          </h1>

          <p className="text-base sm:text-lg text-blue-200/80 mb-8 max-w-md mx-auto leading-relaxed">
            ინსპექციები, ანგარიშები და რეგულაციები — ყველაფერი ერთ აპლიკაციაში
          </p>

          <Link href="/admin">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-blue-50 text-base px-8 shadow-xl shadow-white/10 rounded-2xl">
              შედით დემო ვერსიაში
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-12 sm:mb-16">
          {[
            { num: "6", label: "შაბლონი" },
            { num: "18", label: "რეგულაცია" },
            { num: "3", label: "როლი" },
          ].map(({ num, label }) => (
            <div key={label} className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
              <p className="text-2xl sm:text-3xl font-black text-white">{num}</p>
              <p className="text-xs sm:text-sm text-blue-300/70 mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {[
            { icon: ClipboardCheck, title: "ინსპექციები", desc: "ჩეკლისტები ხარაჩოების, აღჭურვილობისა და PPE-ის შესამოწმებლად", color: "from-blue-500/20 to-blue-600/10" },
            { icon: Camera, title: "ფოტო დოკუმენტაცია", desc: "გადაიღეთ ფოტოები ადგილზე და მიაბით ჩეკლისტის პუნქტს", color: "from-emerald-500/20 to-emerald-600/10" },
            { icon: FileText, title: "PDF ანგარიშები", desc: "ავტომატურად გენერირებული ანგარიშები კლიენტებისთვის", color: "from-violet-500/20 to-violet-600/10" },
            { icon: Shield, title: "რეგულაციები", desc: "საქართველოს კანონები matsne.gov.ge-დან ინტეგრირებული", color: "from-amber-500/20 to-amber-600/10" },
          ].map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className={`bg-gradient-to-br ${color} backdrop-blur-sm rounded-2xl p-5 border border-white/10 hover:border-white/20 transition-all`}>
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold mb-1.5">{title}</h3>
              <p className="text-sm text-blue-200/70 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="mb-16">
          <h2 className="text-center text-xl font-bold mb-8 text-blue-100">როგორ მუშაობს?</h2>
          <div className="space-y-4">
            {[
              { step: "1", title: "შეარჩიეთ შაბლონი", desc: "აირჩიეთ შემოწმების ტიპი და პროექტი" },
              { step: "2", title: "შეავსეთ ჩეკლისტი", desc: "მონიშნეთ ყოველი პუნქტი: უსაფრთხო / გაფრთხილება / დარღვევა" },
              { step: "3", title: "გააზიარეთ ანგარიში", desc: "PDF ანგარიში ავტომატურად იქმნება კლიენტისთვის" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-4 bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-lg font-black shrink-0">
                  {step}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{title}</h3>
                  <p className="text-sm text-blue-200/70 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mb-12">
          <Link href="/admin">
            <Button size="lg" className="bg-white text-slate-900 hover:bg-blue-50 text-base px-10 shadow-xl shadow-white/10 rounded-2xl">
              დაიწყეთ ახლავე
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-blue-300/40 text-xs pb-4">
          <p>&copy; 2024 SafetyApp · matsne.gov.ge</p>
        </div>
      </div>
    </div>
  );
}
