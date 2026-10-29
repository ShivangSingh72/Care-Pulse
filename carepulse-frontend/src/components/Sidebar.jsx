function MainIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 12h4l2-5 4 10 2-5h6" />
    </svg>
  );
}


function CarePlanIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}


function WellbeingIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.8 8.6c0 5.4-8.8 11-8.8 11s-8.8-5.6-8.8-11A4.8 4.8 0 0 1 8 4c1.7 0 3.2.9 4 2.2A4.7 4.7 0 0 1 16 4a4.8 4.8 0 0 1 4.8 4.6z" />
    </svg>
  );
}


function MedicalImageIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M21 16l-5-5-6 6-2-2-5 5" />
    </svg>
  );
}


function HospitalIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
      <path d="M3 21h18" />
      <path d="M12 7v6M9 10h6" />
      <path d="M9 21v-3h6v3" />
    </svg>
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