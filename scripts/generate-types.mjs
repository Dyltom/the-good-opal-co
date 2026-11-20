import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const typesFile = 'src/types/payload-types.ts'

execFileSync('payload', ['generate:types'], { stdio: 'inherit' })
const withoutDocComments = readFileSync(typesFile, 'utf8').replace(/^[ \t]*\/\*\*[\s\S]*?\*\/\n/gm, '')
writeFileSync(typesFile, withoutDocComments)
execFileSync('prettier', ['--write', typesFile], { stdio: 'inherit' })
