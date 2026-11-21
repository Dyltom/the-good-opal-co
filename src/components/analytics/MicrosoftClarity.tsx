'use client'

import Script from 'next/script'

const PROJECT_ID = /^[a-z0-9]{4,20}$/i

export function MicrosoftClarity() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim()

  if (!projectId || !PROJECT_ID.test(projectId) || process.env.NODE_ENV !== 'production') {
    return null
  }

  return (
    <Script id="microsoft-clarity" strategy="afterInteractive">
      {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${projectId}");window.clarity("consent");`}
    </Script>
  )
}
