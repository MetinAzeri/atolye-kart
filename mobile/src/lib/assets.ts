const ASSET_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export function assetUrl(path: string) {
  return `${ASSET_BASE_URL}/${path}`;
}
