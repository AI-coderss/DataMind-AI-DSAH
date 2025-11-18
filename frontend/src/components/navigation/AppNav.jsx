import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Database,
  MessageSquare,
  FileText,
  Calendar,
  Settings
} from "lucide-react";

const menuItems = [
  { id: "Dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "DataSources", label: "Data", icon: Database },
  { id: "AIChat", label: "AI Chat", icon: MessageSquare },
  { id: "Reports", label: "Reports", icon: FileText },
  { id: "Schedules", label: "Schedules", icon: Calendar },
  { id: "Settings", label: "Settings", icon: Settings },
];

export default function AppNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const currentPath = location.pathname;
    const index = menuItems.findIndex(item => currentPath.includes(item.id));
    if (index !== -1) setActiveIndex(index);
  }, [location]);

  const handleClick = (index, id) => {
    setActiveIndex(index);
    navigate(createPageUrl(id));
  };

  return (
    <div className="app-nav-wrapper">
      <nav className="app-navbar glass-card">
        <ul className="app-menu-list">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = index === activeIndex;

            return (
              <motion.li 
                key={item.id} 
                className="app-menu-item"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <motion.button
                  onClick={() => handleClick(index, item.id)}
                  className={`app-menu-link ${isActive ? "is-active" : ""}`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <motion.div
                    animate={isActive ? { 
                      rotate: [0, -10, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Icon className="app-menu-icon" />
                  </motion.div>
                  <span className="app-menu-name">{item.label}</span>
                </motion.button>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      <style jsx>{`
        .app-nav-wrapper {
          position: fixed;
          left: 0;
          bottom: 0;
          width: 100%;
          height: 3.5rem;
          z-index: 100;
          padding: 0 1rem;
        }

        .app-navbar {
          display: grid;
          align-content: center;
          width: 100%;
          height: 100%;
          border-top-left-radius: 1.5rem;
          border-top-right-radius: 1.5rem;
          box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .app-menu-list {
          display: flex;
          align-items: center;
          justify-content: space-around;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .app-menu-item {
          flex: 1;
          height: 3.5rem;
        }

        .app-menu-link {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          border: none;
          outline: none;
          background: none;
          cursor: pointer;
          color: var(--ink-muted);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 0.5rem;
          position: relative;
        }

        .app-menu-link:hover {
          color: var(--primary);
        }

        :root[data-theme="light"] .app-menu-link:hover {
          background: rgba(99, 102, 241, 0.1);
        }

        :root[data-theme="dark"] .app-menu-link:hover {
          background: rgba(6, 182, 212, 0.15);
        }

        :root[data-theme="light"] .app-menu-link.is-active {
          background: #6366f1;
          color: white;
        }

        :root[data-theme="dark"] .app-menu-link.is-active {
          background: #06b6d4;
          color: #0f172a;
        }

        .app-menu-icon {
          width: 1.25rem;
          height: 1.25rem;
          margin-bottom: 0.15rem;
        }

        .app-menu-name {
          font-size: 0.625rem;
          font-weight: 500;
          line-height: 1;
          text-transform: capitalize;
          display: none;
        }

        @media only screen and (min-width: 360px) {
          .app-menu-name {
            display: block;
          }
        }

        @media only screen and (min-width: 576px) {
          .app-menu-list {
            justify-content: center;
            column-gap: 3rem;
          }
          .app-menu-name {
            font-size: 0.7rem;
          }
        }

        @media only screen and (min-width: 768px) {
          .app-nav-wrapper {
            position: relative;
            left: auto;
            bottom: auto;
            width: auto;
            height: auto;
            padding: 0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          }

          .app-navbar {
            border-radius: 0;
            box-shadow: none;
            border-bottom: 1px solid var(--border);
          }

          .app-menu-list {
            flex-direction: row;
            justify-content: center;
            column-gap: 3rem;
            padding: 1rem 0;
          }

          .app-menu-item {
            flex: none;
            height: auto;
          }

          .app-menu-link {
            flex-direction: row;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 0.5rem;
          }

          :root[data-theme="light"] .app-menu-link:hover {
            background: rgba(99, 102, 241, 0.1);
          }

          :root[data-theme="dark"] .app-menu-link:hover {
            background: rgba(6, 182, 212, 0.15);
          }

          :root[data-theme="light"] .app-menu-link.is-active {
            background: #6366f1;
            color: white;
          }

          :root[data-theme="dark"] .app-menu-link.is-active {
            background: #06b6d4;
            color: #0f172a;
          }

          .app-menu-icon {
            width: 1.25rem;
            height: 1.25rem;
            margin-bottom: 0;
          }

          .app-menu-name {
            font-size: 1rem;
            display: block;
          }
        }
      `}</style>
    </div>
  );
}