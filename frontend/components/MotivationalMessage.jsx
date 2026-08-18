export default function MotivationalMessage({ size = 58, className = "" }) {
  return (



    
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
{/* Soft background */}
                    <circle cx="32" cy="32" r="30" fill="#EEF4E5" />

                    {/* Envelope body */}
                    <rect
                      x="11"
                      y="23"
                      width="42"
                      height="30"
                      rx="7"
                      fill="#8EAA68"
                    />

                    {/* Message card */}
                    <rect
                      x="19"
                      y="12"
                      width="26"
                      height="30"
                      rx="5"
                      fill="#FFFDF5"
                      stroke="#DCE7CC"
                      strokeWidth="1.5"
                    />

                    {/* Heart on message */}
                    <path
                      d="M32 31
       C31.3 30.3 25 26.2 25 21.9
       C25 19.3 27 17.5 29.5 17.5
       C31 17.5 32.1 18.3 33 19.5
       C33.9 18.3 35 17.5 36.5 17.5
       C39 17.5 41 19.3 41 21.9
       C41 26.2 34.7 30.3 34 31
       C33.4 31.5 32.6 31.5 32 31Z"
                      fill="#6F9B6F"
                    />

                    {/* Envelope left flap */}
                    <path
                      d="M11 29
       L29 42
       C30.8 43.3 33.2 43.3 35 42
       L53 29
       V46
       C53 49.9 49.9 53 46 53
       H18
       C14.1 53 11 49.9 11 46
       V29Z"
                      fill="#78975A"
                    />

                    {/* Envelope front flap */}
                    <path
                      d="M12.5 50
       L27.8 36.8
       C30.2 34.7 33.8 34.7 36.2 36.8
       L51.5 50
       C50.2 51.9 48.2 53 45.7 53
       H18.3
       C15.8 53 13.8 51.9 12.5 50Z"
                      fill="#A8BF7D"
                    />

                    {/* Sparkle top-left */}
                    <path
                      d="M13 14
       C13.5 17 15 18.5 18 19
       C15 19.5 13.5 21 13 24
       C12.5 21 11 19.5 8 19
       C11 18.5 12.5 17 13 14Z"
                      fill="#9BB56D"
                    />

                    {/* Sparkle top-right */}
                    <path
                      d="M51 10
       C51.4 12.4 52.6 13.6 55 14
       C52.6 14.4 51.4 15.6 51 18
       C50.6 15.6 49.4 14.4 47 14
       C49.4 13.6 50.6 12.4 51 10Z"
                      fill="#C3D58E"
                    />

                    {/* Small sparkle */}
                    <circle cx="55" cy="24" r="2" fill="#8EAA68" />
                  </svg>


  );
}
