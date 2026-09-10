export function isPdfFile(file: File) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
}

export function createPaperObjectUrl(file: File) {
  return URL.createObjectURL(file)
}

export function revokePaperObjectUrl(url?: string) {
  if (url?.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}
