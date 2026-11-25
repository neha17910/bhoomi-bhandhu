import React from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  BookOpen,
  Compass,
  FileCheck2,
  HeartHandshake,
  HelpCircle,
  Landmark,
  MessageSquare,
  Search,
  Shield,
  User,
  Warehouse,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const MODULES = [
  {
    to: "/schemes",
    title: "Government Schemes",
    desc: "Browse PM-KISAN, subsidies, irrigation & organic support.",
    icon: BookOpen,
  },
  {
    to: "/eligibility",
    title: "Eligibility Checker",
    desc: "4-step check to find schemes suited to your farm.",
    icon: FileCheck2,
  },
  {
    to: "/warehouses",
    title: "Storage & Warehouses",
    desc: "Search godowns by capacity and request storage.",
    icon: Warehouse,
  },
  {
    to: "/insurance",
    title: "Crop Insurance",
    desc: "Plain-language guide to PMFBY and weather cover.",
    icon: Shield,
  },
  {
    to: "/loans",
    title: "Financial & Loans",
    desc: "Compare KCC, equipment, and agri-infrastructure loans.",
    icon: Landmark,
  },
  {
    to: "/crop-advisor",
    title: "Location-Based Crop Advisor",
    desc: "Type your location to fetch live weather and crop predictions.",
    icon: Compass,
  },
  {
    to: "/chat",
    title: "AI Farmer Chat",
    desc: "Multi-turn assistant with Fast and Deep Reasoning modes.",
    icon: MessageSquare,
  },
  {
    to: "/wellbeing",
    title: "Farmer Well-Being",
    desc: "Calm breathing tool, articles, and toll-free helplines.",
    icon: HeartHandshake,
  },
  {
    to: "/search",
    title: "Global Search",
    desc: "Search across all schemes, loans, storage, and FAQs.",
    icon: Search,
  },
  {
    to: "/notifications",
    title: "Notifications",
    desc: "Saved scheme alerts and storage booking updates.",
    icon: Bell,
  },
  {
    to: "/help",
    title: "Help & Support",
    desc: "Search FAQs or submit a direct support request.",
    icon: HelpCircle,
  },
  {
    to: "/profile",
    title: "Profile & History",
    desc: "Manage farm details, saved items, and account role.",
    icon: User,
  },
];

export function ServicesHubPage() {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-[#1B2A20]">
          {t("services.title")}
        </h1>
        <p className="text-sm text-[#4A5A4F] mt-1">
          {t("services.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.to}
              to={mod.to}
              className="bg-white rounded-2xl border border-[#2D6A4F]/15 p-5 hover:border-[#2D6A4F] transition-colors flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-[#EAF4EE] text-[#2D6A4F] flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-base text-[#1B2A20]">
                  {mod.title}
                </h2>
                <p className="text-sm text-[#4A5A4F] mt-1 leading-relaxed">
                  {mod.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
