import { OpenPanel } from '@openpanel/web';

// Cookieless tracking against the self-hosted OpenPanel. Off when GPC or Do Not Track is on.
const clientId = import.meta.env.VITE_OPENPANEL_CLIENT_ID as string | undefined;
const apiUrl = import.meta.env.VITE_OPENPANEL_API_URL as string | undefined;
const optedOut = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true || navigator.doNotTrack === '1';

export const trackingOn = Boolean(clientId) && !optedOut;

const op = trackingOn ? new OpenPanel({ clientId: clientId!, apiUrl, trackScreenViews: true, trackOutgoingLinks: true }) : null;

export function track(name: string, properties?: Record<string, string | number>) {
  op?.track(name, properties);
}
