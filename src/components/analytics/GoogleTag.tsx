const MEASUREMENT_ID = /^G-[A-Z0-9]+$/

export function googleTagScript(id: string): string {
  return `(function(){if(location.pathname.indexOf('/quote')===0)return;window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied'});try{if(JSON.parse(localStorage.getItem('cookie-consent')||'{}').analytics===true)gtag('consent','update',{ad_storage:'granted',ad_user_data:'granted',analytics_storage:'granted'})}catch(e){}gtag('set','url_passthrough',true);gtag('js',new Date());gtag('config','${id}');function load(){var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id=${id}';document.head.appendChild(s)}if(document.readyState==='complete')load();else addEventListener('load',function(){(window.requestIdleCallback||setTimeout)(load)})})()`
}

export function GoogleTag() {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim()
  if (!id || !MEASUREMENT_ID.test(id) || process.env.NODE_ENV !== 'production') return null
  return <script id="google-tag" dangerouslySetInnerHTML={{ __html: googleTagScript(id) }} />
}
