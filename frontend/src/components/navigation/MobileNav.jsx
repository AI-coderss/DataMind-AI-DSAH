import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Database,
  Sparkles,
  FileText,
  Calendar,
  Settings
} from "lucide-react";

const TABS = [
  { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "DataSources", label: "Data", icon: Database },
  { id: "AIInsights", label: "AI", icon: Sparkles },
  { id: "Reports", label: "Reports", icon: FileText },
  { id: "Schedules", label: "Schedule", icon: Calendar },
  { id: "Settings", label: "Settings", icon: Settings },
];

export default function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const currentPath = location.pathname;
    const index = TABS.findIndex(tab => currentPath.includes(tab.id));
    if (index !== -1) setActiveIndex(index);
  }, [location]);

  const handleClick = (index) => {
    setActiveIndex(index);
    navigate(createPageUrl(TABS[index].id));
  };

  return (
    <>
      <style>{`
        @media (min-width: 768px) {
          .mobile-nav-wrapper {
            display: none !important;
          }
        }
      `}</style>
      <div className="mobile-nav-wrapper block md:hidden">
        <div className="mobile-navigation">
          <ul>
            {TABS.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = index === activeIndex;

              return (
                <li
                  key={tab.id}
                  className={`mobile-nav-item${isActive ? " active" : ""}`}
                  onClick={() => handleClick(index)}
                >
                  <a href="#!" onClick={(e) => e.preventDefault()}>
                    <span className="nav-icon">
                      <Icon size={24} />
                    </span>
                    <span className="nav-text">{tab.label}</span>
                  </a>
                </li>
              );
            })}
            <div className="mobile-indicator"></div>
          </ul>
        </div>
        <style jsx>{`
          .mobile-nav-wrapper {
            position: fixed;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            justify-content: center;
            padding-bottom: env(safe-area-inset-bottom, 12px);
            z-index: 50;
            padding: 12px;
          }

          .mobile-navigation {
            position: relative;
            width: 100%;
            max-width: 420px;
            height: 70px;
            background: hsl(var(--card));
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            border: 1px solid hsl(var(--border));
          }

          .mobile-navigation ul {
            display: flex;
            width: 100%;
            padding: 0 8px;
            list-style: none;
            margin: 0;
          }

          .mobile-nav-item {
            position: relative;
            flex: 1;
            height: 70px;
            z-index: 1;
            cursor: pointer;
          }

          .mobile-nav-item a {
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            width: 100%;
            height: 100%;
            text-align: center;
            font-weight: 500;
            text-decoration: none;
          }

          .nav-icon {
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
            transition: transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
            color: hsl(var(--muted-foreground));
          }

          .mobile-nav-item.active .nav-icon {
            transform: translateY(-28px);
            color: hsl(var(--primary-foreground));
          }

          .nav-text {
            position: absolute;
            bottom: 8px;
            color: hsl(var(--muted-foreground));
            font-weight: 400;
            font-size: 0.7rem;
            letter-spacing: 0.02em;
            transition: opacity 0.5s cubic-bezier(0.22, 0.61, 0.36, 1),
                        transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
            opacity: 0;
            transform: translateY(20px);
          }

          .mobile-nav-item.active .nav-text {
            opacity: 1;
            transform: translateY(0);
            color: hsl(var(--primary));
          }

          .mobile-indicator {
            position: absolute;
            top: -50%;
            width: 70px;
            height: 70px;
            background: hsl(var(--primary));
            border-radius: 50%;
            border: 6px solid hsl(var(--background));
            transition: transform 0.5s cubic-bezier(0.22, 0.61, 0.36, 1);
          }

          .mobile-indicator::before {
            content: "";
            position: absolute;
            top: 50%;
            left: -22px;
            width: 20px;
            height: 20px;
            background: transparent;
            border-top-right-radius: 20px;
            box-shadow: 1px -10px 0 0 hsl(var(--background));
          }

          .mobile-indicator::after {
            content: "";
            position: absolute;
            top: 50%;
            right: -22px;
            width: 20px;
            height: 20px;
            background: transparent;
            border-top-left-radius: 20px;
            box-shadow: -1px -10px 0 0 hsl(var(--background));
          }

          .mobile-nav-item:nth-child(1).active ~ .mobile-indicator {
            transform: translateX(calc((100vw - 24px) / 6 * 0.5 - 35px));
          }
          .mobile-nav-item:nth-child(2).active ~ .mobile-indicator {
            transform: translateX(calc((100vw - 24px) / 6 * 1.5 - 35px));
          }
          .mobile-nav-item:nth-child(3).active ~ .mobile-indicator {
            transform: translateX(calc((100vw - 24px) / 6 * 2.5 - 35px));
          }
          .mobile-nav-item:nth-child(4).active ~ .mobile-indicator {
            transform: translateX(calc((100vw - 24px) / 6 * 3.5 - 35px));
          }
          .mobile-nav-item:nth-child(5).active ~ .mobile-indicator {
            transform: translateX(calc((100vw - 24px) / 6 * 4.5 - 35px));
          }
          .mobile-nav-item:nth-child(6).active ~ .mobile-indicator {
            transform: translateX(calc((100vw - 24px) / 6 * 5.5 - 35px));
          }

          @media (min-width: 420px) {
            .mobile-nav-item:nth-child(1).active ~ .mobile-indicator {
              transform: translateX(calc(420px / 6 * 0.5 - 35px));
            }
            .mobile-nav-item:nth-child(2).active ~ .mobile-indicator {
              transform: translateX(calc(420px / 6 * 1.5 - 35px));
            }
            .mobile-nav-item:nth-child(3).active ~ .mobile-indicator {
              transform: translateX(calc(420px / 6 * 2.5 - 35px));
            }
            .mobile-nav-item:nth-child(4).active ~ .mobile-indicator {
              transform: translateX(calc(420px / 6 * 3.5 - 35px));
            }
            .mobile-nav-item:nth-child(5).active ~ .mobile-indicator {
              transform: translateX(calc(420px / 6 * 4.5 - 35px));
            }
            .mobile-nav-item:nth-child(6).active ~ .mobile-indicator {
              transform: translateX(calc(420px / 6 * 5.5 - 35px));
            }
          }
        `}</style>
      </div>
    </>
  );
}