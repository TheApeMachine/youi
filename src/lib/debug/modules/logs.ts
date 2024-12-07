import { DebugModuleSetup, DebugModuleContext } from '../types';
import { createJsonViewer } from '../jsonview';

export const setup: DebugModuleSetup = {
    name: 'Logs',
    description: 'View and filter application logs',
    setup: async (context: DebugModuleContext) => {
        const section = document.createElement('div');
        section.className = 'debug-section logs';

        let logs: any[] = [];
        let expandedEntries = new Set<string>();

        const renderStackTrace = (entry: any) => {
            return entry.stack
                ? `<div class="debug-stack-trace">${entry.stack}</div>`
                : '';
        };

        const getDetailsContent = (entry: any) => {
            if (typeof entry.details === 'object') {
                return `<div class="debug-json" data-json='${JSON.stringify(entry.details)}'></div>`;
            }
            return `<pre>${entry.details}</pre>`;
        };

        const updateDisplay = () => {
            const html = logs.map(entry => {
                const time = entry.timestamp
                    ? entry.timestamp.split('T')[1].split('.')[0]
                    : 'unknown';

                const isExpanded = expandedEntries.has(entry.id);

                return `
                <div class="debug-entry">
                    <div class="debug-entry-header" data-id="${entry.id}">
                        <span class="debug-timestamp">[${time}]</span>
                        <span class="debug-category" data-type="${entry.type}">${entry.category}</span>
                        <span class="debug-summary">${entry.summary}</span>
                    </div>
                    ${isExpanded ? `
                        <div class="debug-details">
                            ${getDetailsContent(entry)}
                            ${renderStackTrace(entry)}
                        </div>
                    ` : ''}
                </div>
            `;
            }).join('');

            section.innerHTML = html;

            // Initialize JSON viewers
            section.querySelectorAll('.debug-json').forEach(jsonContainer => {
                const jsonData = JSON.parse(jsonContainer.getAttribute('data-json') ?? '{}');
                createJsonViewer(jsonData, {
                    initialExpandDepth: 1,
                    showTypes: true,
                    theme: 'dark'
                })(jsonContainer as HTMLElement);
            });
        };

        // Add log entry click handler
        section.addEventListener('click', (e) => {
            const header = (e.target as Element).closest('.debug-entry-header');
            if (header) {
                const id = header.getAttribute('data-id');
                if (id) {
                    if (expandedEntries.has(id)) {
                        expandedEntries.delete(id);
                    } else {
                        expandedEntries.add(id);
                    }
                    updateDisplay();
                }
            }
        });

        // Subscribe to logs
        const handleLog = (entry: any) => {
            logs.unshift(entry);
            if (logs.length > 200) logs.pop();
            updateDisplay();
        };

        context.addLog = handleLog;

        return {
            component: section,
            cleanup: () => {
                logs = [];
                expandedEntries.clear();
            }
        };
    }
}; 