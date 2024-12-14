interface RouterMessage {
    type: 'navigate' | 'updateIsland' | 'getState' | 'init';
    payload: any;
    id?: string;
}

interface RouterState {
    currentSlide: string;
    currentIsland?: string;
    slideHistory: string[];
    islandStates: Map<string, any>;
}

const createRouterWorker = () => {
    let state: RouterState = {
        currentSlide: '',
        slideHistory: [],
        islandStates: new Map()
    };

    const postResponse = (type: string, payload: any, id?: string) => {
        self.postMessage({ type, payload, id });
    };

    const handleNavigation = async (payload: { path: string }, id?: string) => {
        console.log('[Worker] Handling navigation:', payload);
        const path = payload.path || '/';
        const segments = path.split('/').filter(Boolean);

        // First segment is the slide, but for islands we want the last segment
        const targetIsland = segments.length > 2 ? segments[2] : undefined;
        const targetSlide = targetIsland ? `islands/${targetIsland}` : (segments[0] || 'home');

        // Update state
        state.currentSlide = targetSlide;
        state.currentIsland = targetIsland;

        if (!state.slideHistory.includes(targetSlide)) {
            state.slideHistory.push(targetSlide);
        }

        // Format payload to match updateView expectations
        postResponse('updateView', {
            content: targetSlide,
            target: targetIsland ? `[data-island="${segments[1]}"]` : 'body',
            params: { id: segments[1] }
        }, id);
    };

    const handleUpdateIsland = async (payload: { slide: string; island: string; value: any }, id?: string) => {
        const { slide, island, value } = payload;

        // Store island state
        if (!state.islandStates.has(slide)) {
            state.islandStates.set(slide, new Map());
        }

        const slideIslands = state.islandStates.get(slide);
        slideIslands.set(island, value);

        // Notify main thread of island update
        postResponse('islandUpdated', {
            slide,
            island,
            data: value
        }, id);
    };

    const handleGetState = (id?: string) => {
        postResponse('state', state, id);
    };

    const handleMessage = async (event: MessageEvent<RouterMessage>) => {
        const { type, payload, id } = event.data;

        try {
            switch (type) {
                case 'init':
                    postResponse('ready', { success: true }, id);
                    break;
                case 'navigate':
                    await handleNavigation(payload, id);
                    break;
                case 'updateIsland':
                    await handleUpdateIsland(payload, id);
                    break;
                case 'getState':
                    handleGetState(id);
                    break;
                default:
                    throw new Error(`Unknown message type: ${type}`);
            }
        } catch (error) {
            console.error('Worker error:', error);
            postResponse('error', {
                error: error instanceof Error ? error.message : 'Unknown error'
            }, id);
        }
    };

    self.onmessage = handleMessage;
};

createRouterWorker(); 