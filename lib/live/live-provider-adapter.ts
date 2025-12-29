/**
 * Live Provider Adapter
 * Centralized logic for generating meeting links and room configurations
 * for various providers (Jitsi, Zoom, Google Meet, etc).
 */

import { createJitsiRoom } from './jitsi';

export type LiveProvider = 'jitsi' | 'daily' | 'zoom' | 'google-meet' | 'custom';

export interface ProviderRoomConfig {
    roomUrl: string;
    meetingId?: string;
    provider: LiveProvider;
    isEmbeddable: boolean;
}

/**
 * Generate room configuration based on provider
 */
export function getProviderRoomConfig(params: {
    provider: LiveProvider;
    roomName: string;
    meetingLink?: string; // For custom/external links
    meetingId?: string;   // For Zoom/Meet if applicable
    isModerator?: boolean;
}): ProviderRoomConfig {
    const { provider, roomName, meetingLink, meetingId, isModerator } = params;

    switch (provider) {
        case 'jitsi':
            const jitsi = createJitsiRoom({
                roomName,
                isModerator,
            });
            return {
                roomUrl: jitsi.roomUrl,
                provider: 'jitsi',
                isEmbeddable: true,
            };

        case 'zoom':
            return {
                roomUrl: meetingLink || '',
                meetingId: meetingId,
                provider: 'zoom',
                isEmbeddable: false, // Zoom Web SDK requires different handling than simple iframe
            };

        case 'google-meet':
            return {
                roomUrl: meetingLink || '',
                provider: 'google-meet',
                isEmbeddable: false, // Google Meet usually opens in new tab
            };

        case 'custom':
            return {
                roomUrl: meetingLink || '',
                provider: 'custom',
                isEmbeddable: false,
            };

        default:
            return {
                roomUrl: '',
                provider: 'custom',
                isEmbeddable: false,
            };
    }
}

/**
 * Check if a provider's output should be opened in a new tab
 */
export function shouldOpenInNewTab(provider: LiveProvider): boolean {
    return ['zoom', 'google-meet', 'custom'].includes(provider);
}
