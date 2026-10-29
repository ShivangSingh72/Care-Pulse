/* Icons: outline style, 24x24, drawn to match the reference
   (brain, clipboard-check, lotus, chest X-ray frame, plus box). */

function SvgIcon({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}


/* Main -> Symptoms AI (brain) */
function MainIcon() {
  return (
    <SvgIcon>
      <path d="M9.5 4.5a3 3 0 0 0-3 3 3 3 0 0 0-2 2.8 3 3 0 0 0 1 2.3A3 3 0 0 0 7 17.2a3 3 0 0 0 5 1.3V6.2A3 3 0 0 0 9.5 4.5Z" />
      <path d="M14.5 4.5a3 3 0 0 1 3 3 3 3 0 0 1 2 2.8 3 3 0 0 1-1 2.3 3 3 0 0 1-1 5.6 3 3 0 0 1-5-1.3V6.2a3 3 0 0 1 2.5-1.7Z" />
      <path d="M9 10h1.5M15 10h-1.5M9 14h1.5M15 14h-1.5" />
    </SvgIcon>
  );
}


/* Care Plan -> Care Protocol (clipboard with check) */
function CarePlanIcon() {
  return (
    <SvgIcon>
      <rect x="4.5" y="4.5" width="15" height="16" rx="2.5" />
      <path d="M9 4.5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v.5" />
      <path d="m8.8 13 2.2 2.2 4.2-4.4" />
    </SvgIcon>
  );
}


/* Wellbeing -> Digital Wellbeing (lotus) */
function WellbeingIcon() {
  return (
    <SvgIcon>
      <path d="M12 4c2 2.4 3 4.6 3 7s-1.1 4.6-3 6.2C10.1 15.6 9 13.4 9 11s1-4.6 3-7Z" />
      <path d="M9.2 11.2C6.6 11.3 4.4 12.6 3 15c1.2 2.4 3.4 3.7 6.2 3.8" />
      <path d="M14.8 11.2c2.6.1 4.8 1.4 6.2 3.8-1.2 2.4-3.4 3.7-6.2 3.8" />
      <path d="M9.2 18.8c.9.3 1.8.4 2.8.4s1.9-.1 2.8-.4" />
    </SvgIcon>
  );
}


/* Medical Image -> Chest Radiography AI (X-ray frame with ribcage) */
function MedicalImageIcon() {
  return (
    <SvgIcon>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M12 7v10" />
      <path d="M8.2 9.6c1 .8 2.4 1.2 3.8 1.2s2.8-.4 3.8-1.2" />
      <path d="M8 12.6c1.2.9 2.6 1.4 4 1.4s2.8-.5 4-1.4" />
      <path d="M9 15.5c.9.6 1.9.9 3 .9s2.1-.3 3-.9" />
    </SvgIcon>
  );
}


/* Hospital -> Nearby ER Hospitals (box with plus) */
function HospitalIcon() {
  return (
    <SvgIcon>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="M12 8v8M8 12h8" />
    </SvgIcon>
  );
}


const NAV_ITEMS = [
  {
    id: "main",
    label: "Main",
    icon: MainIcon,
  },
  {
    id: "care-plan",
    label: "Care Plan",
    icon: CarePlanIcon,
  },
  {
    id: "wellbeing",
    label: "Wellbeing",
    icon: WellbeingIcon,
  },
  {
    id: "medical-image",
    label: "Medical Image",
    icon: MedicalImageIcon,
  },
  {
    id: "hospital",
    label: "Hospital",
    icon: HospitalIcon,
  },
];


export default function Sidebar({
  activePage,
  onNavigate,
}) {
  return (
    <aside className="sidebar">

      <p className="sidebar-label">
        CAREPULSE MODULES
      </p>


      <nav className="sidebar-nav">

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;

          const isActive =
            activePage === item.id;

          return (
            <button
              key={item.id}
              type="button"
              className={`sidebar-item ${
                isActive
                  ? "sidebar-item-active"
                  : ""
              }`}
              aria-current={
                isActive ? "page" : undefined
              }
              onClick={() =>
                onNavigate(item.id)
              }
            >

              <span className="sidebar-item-icon">
                <Icon />
              </span>

              <span className="sidebar-item-label">
                {item.label}
              </span>

            </button>
          );
        })}

      </nav>

    </aside>
  );
}
