export default function AvocadoLogo({ size = 58, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Avocado outer shape */}
      <path
        d="M50 5
         C38 5 29 18 22 32
         C14 48 5 65 5 82
         C5 104 24 116 50 116
         C76 116 95 104 95 82
         C95 65 86 48 78 32
         C71 18 62 5 50 5Z"
        fill="#4F703D"
      />

      {/* Avocado flesh */}
      <path
        d="M50 13
         C41 13 34 24 28 36
         C21 50 13 66 13 81
         C13 98 29 108 50 108
         C71 108 87 98 87 81
         C87 66 79 50 72 36
         C66 24 59 13 50 13Z"
        fill="#C9DA83"
      />

      {/* Inner highlight */}
      <path
        d="M43 20
         C35 31 29 44 24 56
         C19 68 17 78 18 86
         C19 94 23 99 29 103
         C23 96 21 88 22 79
         C23 65 29 49 36 36
         C40 28 45 21 49 17Z"
        fill="#E8F0B8"
        opacity="0.7"
      />

      {/* Seed */}
      <circle cx="50" cy="80" r="22" fill="#9B633E" />

      {/* Seed highlight */}
      <circle cx="44" cy="74" r="7" fill="#B98059" opacity="0.55" />

      {/* Leaf */}
      <path
        d="M70 15
         C78 7 89 8 94 13
         C88 20 78 22 70 15Z"
        fill="#82974B"
      />

      <path
        d="M70 15 C77 15 84 13 91 10"
        stroke="#5F7132"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
