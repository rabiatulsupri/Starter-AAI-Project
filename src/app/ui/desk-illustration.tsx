// Decorative artwork for the login screen's left half: a simple flat
// desk scene in the mock's sampled palette (docs/specs/02-design.md §8).
// No artwork file was provided, so this is a placeholder — agreed with
// the project owner.
export default function DeskIllustration() {
  return (
    <svg viewBox="0 0 420 380" aria-hidden="true" className="w-full max-w-md">
      {/* backdrop blob and floor */}
      <circle cx="205" cy="185" r="150" fill="#f0f0f0" />
      <rect y="300" width="420" height="4" fill="#e6e6e6" />
      {/* wall clock */}
      <circle cx="330" cy="72" r="16" fill="#ffffff" stroke="#e6e6e6" strokeWidth="3" />
      {/* wall chart */}
      <rect x="72" y="86" width="86" height="66" rx="4" fill="#ffffff" />
      <rect x="84" y="102" width="9" height="40" fill="#a5cef6" />
      <rect x="100" y="114" width="9" height="28" fill="#69acf0" />
      <rect x="116" y="96" width="9" height="46" fill="#0575e6" />
      {/* monitor on the desk */}
      <rect x="176" y="140" width="88" height="58" rx="4" fill="#a5cef6" />
      <rect x="190" y="156" width="8" height="26" fill="#ffffff" />
      <rect x="206" y="164" width="8" height="18" fill="#ffffff" />
      <rect x="222" y="150" width="8" height="32" fill="#ffffff" />
      <rect x="214" y="198" width="12" height="12" fill="#515b60" />
      <rect x="200" y="208" width="40" height="5" rx="2.5" fill="#515b60" />
      {/* desk */}
      <rect x="128" y="214" width="196" height="10" rx="5" fill="#0575e6" />
      <rect x="140" y="224" width="8" height="76" fill="#515b60" />
      <rect x="300" y="224" width="8" height="76" fill="#515b60" />
      {/* chair */}
      <rect x="96" y="176" width="12" height="76" rx="6" fill="#0575e6" />
      <rect x="96" y="244" width="52" height="10" rx="5" fill="#0575e6" />
      <rect x="118" y="254" width="8" height="46" fill="#8495a2" />
      {/* person seated at the desk */}
      <circle cx="150" cy="150" r="16" fill="#515b60" />
      <rect x="132" y="168" width="34" height="54" rx="14" fill="#69acf0" />
      <rect x="168" y="224" width="12" height="56" rx="6" fill="#a5cef6" />
      <rect x="184" y="224" width="12" height="56" rx="6" fill="#a5cef6" />
      <rect x="164" y="280" width="24" height="10" rx="5" fill="#515b60" />
      <rect x="182" y="280" width="24" height="10" rx="5" fill="#515b60" />
      {/* potted plant */}
      <rect x="336" y="258" width="26" height="42" rx="4" fill="#8495a2" />
      <circle cx="349" cy="246" r="16" fill="#69acf0" />
      <circle cx="336" cy="234" r="10" fill="#a5cef6" />
      <circle cx="362" cy="236" r="10" fill="#a5cef6" />
    </svg>
  )
}
