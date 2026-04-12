import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, ClipboardCheck, Check } from "lucide-react";
import { t, type Lang, type TranslationKey } from "@/lib/i18n";

interface ValuePropsSectionProps {
  lang: Lang;
}

export function ValuePropsSection({ lang }: ValuePropsSectionProps) {
  const tr = (key: TranslationKey) => t(key, lang);

  const clientBenefits: TranslationKey[] = [
    "landing.client_benefit_1",
    "landing.client_benefit_2",
    "landing.client_benefit_3",
    "landing.client_benefit_4",
  ];

  const expertBenefits: TranslationKey[] = [
    "landing.expert_benefit_1",
    "landing.expert_benefit_2",
    "landing.expert_benefit_3",
    "landing.expert_benefit_4",
  ];

  return (
    <section className="py-12 lg:py-20 px-5 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Client Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-navy-800" />
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-navy-800" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{tr("landing.for_clients")}</h3>
                  <Badge variant="info">{tr("landing.free_badge")}</Badge>
                </div>
              </div>
              <ul className="space-y-3">
                {clientBenefits.map((key) => (
                  <li key={key} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-navy-800 mt-0.5 shrink-0" />
                    {tr(key)}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Expert Card */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{tr("landing.for_experts")}</h3>
                  <Badge variant="warning">{tr("landing.pro_badge")}</Badge>
                </div>
              </div>
              <ul className="space-y-3">
                {expertBenefits.map((key) => (
                  <li key={key} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <Check className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    {tr(key)}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
