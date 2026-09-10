const PREPARED_PACKAGE_URL = '/demo-data/model-soups-v1.demo.json'

export async function fetchPreparedPackage(): Promise<unknown> {
  const response = await fetch(PREPARED_PACKAGE_URL)
  if (!response.ok) {
    throw new Error('Could not load the prepared review for this manuscript.')
  }
  return response.json()
}
