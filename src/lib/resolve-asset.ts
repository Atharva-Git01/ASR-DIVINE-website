import fs from 'fs'
import path from 'path'

const IMAGE_FORMATS = ['png', 'jpg', 'jpeg', 'webp', 'avif', 'svg']

/**
 * Finds the first existing file matching public/<dir>/<name>.<ext>
 * Returns the public URL path, or null if none found.
 */
export function resolvePublicImage(dir: string, name: string): string | null {
  for (const ext of IMAGE_FORMATS) {
    const filePath = path.join(process.cwd(), 'public', dir, `${name}.${ext}`)
    if (fs.existsSync(filePath)) return `/${dir}/${name}.${ext}`
  }
  return null
}

/**
 * Finds the first existing file matching public/<name>.<ext>
 * Returns the public URL path, or null if none found.
 */
export function resolvePublicRootImage(name: string): string | null {
  for (const ext of IMAGE_FORMATS) {
    const filePath = path.join(process.cwd(), 'public', `${name}.${ext}`)
    if (fs.existsSync(filePath)) return `/${name}.${ext}`
  }
  return null
}
