import '@fontsource-variable/nunito';
import '@fontsource-variable/fredoka';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/inter';
import { createInertiaApp } from '@inertiajs/react';
import { initEcho } from '@/lib/reverb';

initEcho();

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    progress: {
        color: '#4B5563',
    },
});
