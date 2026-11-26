import { BlockList, isIP } from 'node:net'

const CLOUDFLARE_RANGES = [
  '173.245.48.0/20',
  '103.21.244.0/22',
  '103.22.200.0/22',
  '103.31.4.0/22',
  '141.101.64.0/18',
  '108.162.192.0/18',
  '190.93.240.0/20',
  '188.114.96.0/20',
  '197.234.240.0/22',
  '198.41.128.0/17',
  '162.158.0.0/15',
  '104.16.0.0/13',
  '104.24.0.0/14',
  '172.64.0.0/13',
  '131.0.72.0/22',
  '2400:cb00::/32',
  '2606:4700::/32',
  '2803:f800::/32',
  '2405:b500::/32',
  '2405:8100::/32',
  '2a06:98c0::/29',
  '2c0f:f248::/32',
]

const cloudflare = new BlockList()
for (const range of CLOUDFLARE_RANGES) {
  const [network = '', prefix = ''] = range.split('/')
  cloudflare.addSubnet(network, Number(prefix), isIP(network) === 6 ? 'ipv6' : 'ipv4')
}

function ipFamily(address: string): 'ipv4' | 'ipv6' | null {
  const version = isIP(address)
  return version === 4 ? 'ipv4' : version === 6 ? 'ipv6' : null
}

export function clientIp(headers: Headers): string {
  const peer =
    headers.get('x-real-ip')?.trim() || headers.get('x-forwarded-for')?.split(',').at(-1)?.trim()
  const peerFamily = peer ? ipFamily(peer) : null
  if (!peer || !peerFamily) return 'unknown'

  const original = headers.get('cf-connecting-ip')?.trim()
  return original && ipFamily(original) && cloudflare.check(peer, peerFamily) ? original : peer
}
