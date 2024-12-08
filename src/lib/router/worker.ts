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
        console.log('Worker posting response:', { type, payload, id });
        self.postMessage({ type, payload, id });
    };

    const handleNavigation = async (payload: { path: string }, id?: string) => {
        console.log('Worker handling navigation:', payload);
        const path = payload.path || '/';
        const segments = path.split('/').filter(Boolean);

        // First segment is always the slide
        const targetSlide = segments[0] || 'home';
        const targetIsland = segments[1];

        console.log('Resolved target:', { targetSlide, targetIsland });

        // Update state
        state.currentSlide = targetSlide;
        state.currentIsland = targetIsland;

        if (!state.slideHistory.includes(targetSlide)) {
            state.slideHistory.push(targetSlide);
        }

        // Notify main thread to update the view
        postResponse('updateView', {
            slide: targetSlide,
            island: targetIsland,
            isNew: !state.islandStates.has(targetSlide)
        }, id);
    };

    const handleUpdateIsland = async (payload: { slide: string; island: string; value: any }, id?: string) => {
        console.log('Worker handling island update:', payload);
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
        console.log('Worker getting state');
        postResponse('state', state, id);
    };

    const handleMessage = async (event: MessageEvent<RouterMessage>) => {
        const { type, payload, id } = event.data;
        console.log('Worker received message:', { type, payload, id });

        try {
            switch (type) {
                case 'init':
                    console.log('Worker initializing');
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