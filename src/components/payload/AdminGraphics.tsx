import Image from 'next/image'

export function AdminLogo() {
  return <Image src="/logo.png" alt="The Good Opal Co" width={180} height={180} priority />
}

export function AdminIcon() {
  return <Image src="/favicon-32x32.png" alt="The Good Opal Co" width={28} height={28} />
}
