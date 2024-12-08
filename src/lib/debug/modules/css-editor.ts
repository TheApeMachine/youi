import { DebugModuleSetup, DebugModuleContext } from '../types';

interface Range {
    min: number;
    max: number;
    unit?: string;
    step?: number;
}

interface TransformProperties {
    translate: {
        x: Range;
        y: Range;
        z: Range;
    };
    rotate: {
        x: Range;
        y: Range;
        z: Range;
    };
    scale: {
        x: Range;
        y: Range;
        z: Range;
    };
    skew: {
        x: Range;
        y: Range;
    };
    perspective: Range;
}

type TransformPropKey = keyof TransformProperties;
type AxisKey<T extends TransformPropKey> = keyof TransformProperties[T];

interface StyleControl {
    property: string;
    type: 'slider' | 'color' | 'select' | 'number' | 'text' | 'compound-spacing' |
    'compound-border' | 'compound-shadow' | 'filter' | 'compound-transform';
    options?: string[];
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    properties?: ['all', 'top', 'right', 'bottom', 'left'] | ['x', 'y', 'blur', 'spread'];
    units?: string[];
    widthRange?: { min: number; max: number };
    styles?: string[];
    ranges?: Record<string, Range>;
    presets?: string[];
    transformProps?: TransformProperties;
}

interface StyleGroup {
    name: string;
    controls: StyleControl[];
}

const STYLE_GROUPS: StyleGroup[] = [
    {
        name: 'Layout',
        controls: [
            {
                property: 'padding',
                type: 'compound-spacing',
                properties: ['all', 'top', 'right', 'bottom', 'left'],
                units: ['px', 'rem', 'em', '%'],
                min: 0,
                max: 100
            },
            {
                property: 'margin',
                type: 'compound-spacing',
                properties: ['all', 'top', 'right', 'bottom', 'left'],
                units: ['px', 'rem', 'em', '%'],
                min: -100,
                max: 100
            },
            { property: 'width', type: 'text' },
            { property: 'height', type: 'text' },
        ]
    },
    {
        name: 'Typography',
        controls: [
            { property: 'font-size', type: 'number', min: 0, max: 100, unit: 'px' },
            { property: 'line-height', type: 'number', min: 0, max: 3, unit: 'em' },
            { property: 'font-weight', type: 'select', options: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'] },
        ]
    },
    {
        name: 'Colors',
        controls: [
            { property: 'color', type: 'color' },
            { property: 'background-color', type: 'color' },
        ]
    },
    {
        name: 'Borders',
        controls: [
            {
                property: 'border',
                type: 'compound-border',
                properties: ['all', 'top', 'right', 'bottom', 'left'],
                widthRange: { min: 0, max: 20 },
                styles: ['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge'],
                units: ['px', 'rem', 'em']
            },
            { property: 'border-radius', type: 'number', min: 0, max: 100, unit: 'px' },
        ]
    },
    {
        name: 'Flexbox',
        controls: [
            { property: 'display', type: 'select', options: ['flex', 'inline-flex'] },
            { property: 'flex-direction', type: 'select', options: ['row', 'row-reverse', 'column', 'column-reverse'] },
            { property: 'justify-content', type: 'select', options: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'] },
            { property: 'align-items', type: 'select', options: ['stretch', 'flex-start', 'flex-end', 'center', 'baseline'] },
            { property: 'flex-wrap', type: 'select', options: ['nowrap', 'wrap', 'wrap-reverse'] },
            { property: 'gap', type: 'number', min: 0, max: 100, unit: 'px' },
            { property: 'flex-grow', type: 'number', min: 0, max: 10 },
            { property: 'flex-shrink', type: 'number', min: 0, max: 10 },
            { property: 'flex-basis', type: 'text' },
        ]
    },
    {
        name: 'Grid',
        controls: [
            { property: 'display', type: 'select', options: ['grid', 'inline-grid'] },
            { property: 'grid-template-columns', type: 'text' },
            { property: 'grid-template-rows', type: 'text' },
            { property: 'grid-gap', type: 'number', min: 0, max: 100, unit: 'px' },
            { property: 'grid-column', type: 'text' },
            { property: 'grid-row', type: 'text' },
            { property: 'justify-items', type: 'select', options: ['start', 'end', 'center', 'stretch'] },
            { property: 'align-items', type: 'select', options: ['start', 'end', 'center', 'stretch'] },
        ]
    },
    {
        name: 'Box Shadow',
        controls: [
            {
                property: 'box-shadow',
                type: 'compound-shadow',
                properties: ['x', 'y', 'blur', 'spread'],
                ranges: {
                    x: { min: -50, max: 50 },
                    y: { min: -50, max: 50 },
                    blur: { min: 0, max: 100 },
                    spread: { min: -50, max: 50 }
                },
                units: ['px', 'rem', 'em'],
                presets: ['none', 'inner', 'outer']
            }
        ]
    },
    {
        name: 'Filters',
        controls: [
            { property: 'blur', type: 'filter', min: 0, max: 20, unit: 'px' },
            { property: 'brightness', type: 'filter', min: 0, max: 200, unit: '%' },
            { property: 'contrast', type: 'filter', min: 0, max: 200, unit: '%' },
            { property: 'grayscale', type: 'filter', min: 0, max: 100, unit: '%' },
            { property: 'hue-rotate', type: 'filter', min: 0, max: 360, unit: 'deg' },
            { property: 'invert', type: 'filter', min: 0, max: 100, unit: '%' },
            { property: 'opacity', type: 'filter', min: 0, max: 100, unit: '%' },
            { property: 'saturate', type: 'filter', min: 0, max: 200, unit: '%' },
            { property: 'sepia', type: 'filter', min: 0, max: 100, unit: '%' }
        ]
    },
    {
        name: 'Transform',
        controls: [
            {
                property: 'transform',
                type: 'compound-transform',
                transformProps: {
                    translate: {
                        x: { min: -100, max: 100, unit: 'px' },
                        y: { min: -100, max: 100, unit: 'px' },
                        z: { min: -100, max: 100, unit: 'px' }
                    },
                    rotate: {
                        x: { min: -180, max: 180, unit: 'deg' },
                        y: { min: -180, max: 180, unit: 'deg' },
                        z: { min: -180, max: 180, unit: 'deg' }
                    },
                    scale: {
                        x: { min: 0, max: 2, step: 0.1 },
                        y: { min: 0, max: 2, step: 0.1 },
                        z: { min: 0, max: 2, step: 0.1 }
                    },
                    skew: {
                        x: { min: -90, max: 90, unit: 'deg' },
                        y: { min: -90, max: 90, unit: 'deg' }
                    },
                    perspective: { min: 0, max: 1000, unit: 'px' }
                }
            },
            {
                property: 'transform-origin',
                type: 'select',
                options: [
                    'center', 'top left', 'top center', 'top right',
                    'center left', 'center center', 'center right',
                    'bottom left', 'bottom center', 'bottom right'
                ]
            }
        ]
    }
];

export const setup: DebugModuleSetup = {
    name: 'CSS Editor',
    description: 'Live CSS editor with element picker',
    setup: async ({ addLog, container }) => {
        const content = document.createElement('div');
        content.className = 'css-editor-content';

        // Create UI elements
        const pickerBtn = document.createElement('button');
        pickerBtn.className = 'css-picker-btn';
        pickerBtn.textContent = '🎯 Pick Element';

        const stylePanel = document.createElement('div');
        stylePanel.className = 'css-style-panel';

        const elementInfo = document.createElement('div');
        elementInfo.className = 'css-element-info';

        content.appendChild(pickerBtn);
        content.appendChild(elementInfo);
        content.appendChild(stylePanel);

        let selectedElement: HTMLElement | null = null;
        let isPicking = false;

        const createStyleControl = (control: StyleControl) => {
            const container = document.createElement('div');
            container.className = 'css-control';

            const label = document.createElement('label');
            label.textContent = control.property;
            container.appendChild(label);

            let input: HTMLInputElement | HTMLSelectElement;

            switch (control.type) {
                case 'color': {
                    const colorInput = document.createElement('input');
                    colorInput.type = 'color';
                    input = colorInput;
                    break;
                }

                case 'select': {
                    const selectInput = document.createElement('select');
                    control.options?.forEach(option => {
                        const opt = document.createElement('option');
                        opt.value = option;
                        opt.textContent = option;
                        selectInput.appendChild(opt);
                    });
                    input = selectInput;
                    break;
                }

                case 'slider':
                case 'number': {
                    const numberInput = document.createElement('input');
                    numberInput.type = control.type === 'slider' ? 'range' : 'number';
                    if (control.min !== undefined) numberInput.min = control.min.toString();
                    if (control.max !== undefined) numberInput.max = control.max.toString();
                    input = numberInput;
                    break;
                }

                case 'compound-spacing': {
                    const spacingControl = document.createElement('div');
                    spacingControl.className = 'css-compound-control';

                    const header = document.createElement('div');
                    header.className = 'css-compound-header';

                    // Unit selector
                    const unitSelect = document.createElement('select');
                    unitSelect.className = 'css-unit-select';
                    control.units?.forEach(unit => {
                        const option = document.createElement('option');
                        option.value = unit;
                        option.textContent = unit;
                        unitSelect.appendChild(option);
                    });

                    header.appendChild(label);
                    header.appendChild(unitSelect);
                    spacingControl.appendChild(header);

                    const slidersContainer = document.createElement('div');
                    slidersContainer.className = 'css-sliders-container';

                    // Create sliders for each property
                    const sliders: Record<string, HTMLInputElement> = {};

                    control.properties?.forEach(prop => {
                        const sliderContainer = document.createElement('div');
                        sliderContainer.className = 'css-slider-container';

                        const sliderLabel = document.createElement('label');
                        sliderLabel.className = 'css-slider-label';
                        sliderLabel.textContent = prop;

                        const sliderInput = document.createElement('input');
                        sliderInput.type = 'range';
                        sliderInput.min = control.min?.toString() ?? '0';
                        sliderInput.max = control.max?.toString() ?? '100';
                        sliderInput.className = 'css-slider-input';

                        const valueDisplay = document.createElement('input');
                        valueDisplay.type = 'number';
                        valueDisplay.className = 'css-value-display';
                        valueDisplay.min = control.min?.toString() ?? '0';
                        valueDisplay.max = control.max?.toString() ?? '100';

                        sliders[prop] = sliderInput;

                        // Sync slider and number input
                        sliderInput.addEventListener('input', () => {
                            valueDisplay.value = sliderInput.value;
                            updateStyles();
                        });

                        valueDisplay.addEventListener('input', () => {
                            sliderInput.value = valueDisplay.value;
                            updateStyles();
                        });

                        sliderContainer.appendChild(sliderLabel);
                        sliderContainer.appendChild(sliderInput);
                        sliderContainer.appendChild(valueDisplay);
                        slidersContainer.appendChild(sliderContainer);
                    });

                    spacingControl.appendChild(slidersContainer);

                    // Function to update styles
                    const updateStyles = () => {
                        if (!selectedElement) return;
                        const unit = unitSelect.value;

                        // If "all" slider changes, update all other sliders
                        if (sliders.all && document.activeElement === sliders.all) {
                            const value = sliders.all.value;
                            Object.values(sliders).forEach(slider => {
                                slider.value = value;
                                (slider.nextElementSibling as HTMLInputElement).value = value;
                            });
                        }

                        // Update the actual CSS properties
                        control.properties?.forEach(prop => {
                            if (prop === 'all') return; // Skip the "all" property as it's just for control
                            const value = sliders[prop].value;
                            const property = `${control.property}-${prop}`;
                            selectedElement!.style.setProperty(property, `${value}${unit}`);
                        });
                    };

                    unitSelect.addEventListener('change', updateStyles);

                    return spacingControl;
                }

                case 'compound-border': {
                    const borderControl = document.createElement('div');
                    borderControl.className = 'css-compound-control';

                    const header = document.createElement('div');
                    header.className = 'css-compound-header';
                    header.appendChild(label);
                    borderControl.appendChild(header);

                    const controlsContainer = document.createElement('div');
                    controlsContainer.className = 'css-border-controls';

                    // Create controls for each border side
                    const controls: Record<string, { width: HTMLInputElement; style: HTMLSelectElement; color: HTMLInputElement }> = {};

                    control.properties?.forEach(prop => {
                        const sideContainer = document.createElement('div');
                        sideContainer.className = 'css-border-side';

                        const sideLabel = document.createElement('label');
                        sideLabel.className = 'css-border-label';
                        sideLabel.textContent = prop;
                        sideContainer.appendChild(sideLabel);

                        const inputsContainer = document.createElement('div');
                        inputsContainer.className = 'css-border-inputs';

                        // Width input
                        const widthInput = document.createElement('input');
                        widthInput.type = 'number';
                        widthInput.min = control.widthRange?.min?.toString() ?? '0';
                        widthInput.max = control.widthRange?.max?.toString() ?? '20';
                        widthInput.className = 'css-border-width';

                        // Style select
                        const styleSelect = document.createElement('select');
                        styleSelect.className = 'css-border-style';
                        control.styles?.forEach(style => {
                            const option = document.createElement('option');
                            option.value = style;
                            option.textContent = style;
                            styleSelect.appendChild(option);
                        });

                        // Color input
                        const colorInput = document.createElement('input');
                        colorInput.type = 'color';
                        colorInput.className = 'css-border-color';

                        controls[prop] = { width: widthInput, style: styleSelect, color: colorInput };

                        inputsContainer.appendChild(widthInput);
                        inputsContainer.appendChild(styleSelect);
                        inputsContainer.appendChild(colorInput);
                        sideContainer.appendChild(inputsContainer);
                        controlsContainer.appendChild(sideContainer);

                        // Update handler
                        const updateBorder = () => {
                            if (!selectedElement) return;
                            const width = widthInput.value + 'px';
                            const style = styleSelect.value;
                            const color = colorInput.value;

                            if (prop === 'all') {
                                selectedElement.style.border = `${width} ${style} ${color}`;
                                // Update other controls
                                control.properties?.forEach(p => {
                                    if (p !== 'all') {
                                        controls[p].width.value = widthInput.value;
                                        controls[p].style.value = style;
                                        controls[p].color.value = color;
                                    }
                                });
                            } else {
                                const property = `border-${prop}`;
                                selectedElement.style.setProperty(property, `${width} ${style} ${color}`);
                            }
                        };

                        widthInput.addEventListener('input', updateBorder);
                        styleSelect.addEventListener('change', updateBorder);
                        colorInput.addEventListener('input', updateBorder);
                    });

                    borderControl.appendChild(controlsContainer);
                    return borderControl;
                }

                case 'compound-shadow': {
                    const shadowControl = document.createElement('div');
                    shadowControl.className = 'css-compound-control';

                    const header = document.createElement('div');
                    header.className = 'css-compound-header';
                    header.appendChild(label);

                    const controlsContainer = document.createElement('div');
                    controlsContainer.className = 'css-shadow-controls';

                    // Create inputs for x, y, blur, spread
                    ['X Offset', 'Y Offset', 'Blur', 'Spread'].forEach((name, i) => {
                        const inputContainer = document.createElement('div');
                        inputContainer.className = 'css-shadow-input';

                        const inputLabel = document.createElement('label');
                        inputLabel.textContent = name;

                        const input = document.createElement('input');
                        input.type = 'range';
                        input.min = '-50';
                        input.max = i === 2 ? '100' : '50'; // Larger range for blur
                        input.className = 'css-shadow-slider';

                        const valueDisplay = document.createElement('input');
                        valueDisplay.type = 'number';
                        valueDisplay.className = 'css-shadow-value';

                        inputContainer.appendChild(inputLabel);
                        inputContainer.appendChild(input);
                        inputContainer.appendChild(valueDisplay);
                        controlsContainer.appendChild(inputContainer);

                        // Sync slider and number input
                        input.addEventListener('input', () => {
                            valueDisplay.value = input.value;
                            updateShadow();
                        });

                        valueDisplay.addEventListener('input', () => {
                            input.value = valueDisplay.value;
                            updateShadow();
                        });
                    });

                    // Color picker
                    const colorContainer = document.createElement('div');
                    colorContainer.className = 'css-shadow-color-container';

                    const colorLabel = document.createElement('label');
                    colorLabel.textContent = 'Color';

                    const colorInput = document.createElement('input');
                    colorInput.type = 'color';
                    colorInput.className = 'css-shadow-color';

                    colorContainer.appendChild(colorLabel);
                    colorContainer.appendChild(colorInput);

                    // Inset toggle
                    const insetContainer = document.createElement('div');
                    insetContainer.className = 'css-shadow-inset-container';

                    const insetLabel = document.createElement('label');
                    insetLabel.textContent = 'Inset';

                    const insetToggle = document.createElement('input');
                    insetToggle.type = 'checkbox';
                    insetToggle.className = 'css-shadow-inset';

                    insetContainer.appendChild(insetLabel);
                    insetContainer.appendChild(insetToggle);

                    controlsContainer.appendChild(colorContainer);
                    controlsContainer.appendChild(insetContainer);

                    const updateShadow = () => {
                        if (!selectedElement) return;
                        const inputs = shadowControl.querySelectorAll('.css-shadow-slider');
                        const color = (colorInput).value;
                        const inset = insetToggle.checked ? 'inset ' : '';
                        const shadow = `${inset}${(inputs[0] as HTMLInputElement).value}px ${(inputs[1] as HTMLInputElement).value}px ${(inputs[2] as HTMLInputElement).value}px ${(inputs[3] as HTMLInputElement).value}px ${color}`;
                        selectedElement.style.boxShadow = shadow;
                    };

                    colorInput.addEventListener('input', updateShadow);
                    insetToggle.addEventListener('change', updateShadow);

                    shadowControl.appendChild(header);
                    shadowControl.appendChild(controlsContainer);
                    return shadowControl;
                }

                case 'filter': {
                    const filterControl = document.createElement('div');
                    filterControl.className = 'css-control';

                    const inputContainer = document.createElement('div');
                    inputContainer.className = 'css-filter-input';

                    const input = document.createElement('input');
                    input.type = 'range';
                    input.min = control.min?.toString() ?? '0';
                    input.max = control.max?.toString() ?? '100';
                    input.className = 'css-filter-slider';

                    const valueDisplay = document.createElement('input');
                    valueDisplay.type = 'number';
                    valueDisplay.min = control.min?.toString() ?? '0';
                    valueDisplay.max = control.max?.toString() ?? '100';
                    valueDisplay.className = 'css-filter-value';

                    const updateFilter = () => {
                        if (!selectedElement) return;
                        const value = input.value + (control.unit ?? '');
                        const currentFilters = selectedElement.style.filter.split(' ').filter(f => !f.startsWith(control.property));
                        currentFilters.push(`${control.property}(${value})`);
                        selectedElement.style.filter = currentFilters.join(' ').trim();
                    };

                    input.addEventListener('input', () => {
                        valueDisplay.value = input.value;
                        updateFilter();
                    });

                    valueDisplay.addEventListener('input', () => {
                        input.value = valueDisplay.value;
                        updateFilter();
                    });

                    filterControl.appendChild(label);
                    inputContainer.appendChild(input);
                    inputContainer.appendChild(valueDisplay);
                    filterControl.appendChild(inputContainer);
                    return filterControl;
                }

                case 'compound-transform': {
                    const transformControl = document.createElement('div');
                    transformControl.className = 'css-compound-control';

                    const header = document.createElement('div');
                    header.className = 'css-compound-header';
                    header.appendChild(label);

                    const controlsContainer = document.createElement('div');
                    controlsContainer.className = 'css-transform-controls';

                    const updateTransform = () => {
                        if (!selectedElement) return;
                        const translateInputs = transformControl.querySelectorAll('.translate-input');
                        const rotateInputs = transformControl.querySelectorAll('.rotate-input');
                        const scaleInputs = transformControl.querySelectorAll('.scale-input');
                        const skewInputs = transformControl.querySelectorAll('.skew-input');

                        const translate = `translate3d(${(translateInputs[0] as HTMLInputElement).value}px, ${(translateInputs[1] as HTMLInputElement).value}px, ${(translateInputs[2] as HTMLInputElement).value}px)`;
                        const rotate = `rotate3d(${(rotateInputs[0] as HTMLInputElement).value}deg, ${(rotateInputs[1] as HTMLInputElement).value}deg, ${(rotateInputs[2] as HTMLInputElement).value}deg)`;
                        const scale = `scale3d(${(scaleInputs[0] as HTMLInputElement).value}, ${(scaleInputs[1] as HTMLInputElement).value}, ${(scaleInputs[2] as HTMLInputElement).value})`;
                        const skew = `skew(${(skewInputs[0] as HTMLInputElement).value}deg, ${(skewInputs[1] as HTMLInputElement).value}deg)`;

                        selectedElement.style.transform = `${translate} ${rotate} ${scale} ${skew}`;
                    };

                    if (control.transformProps) {
                        // Create transform groups
                        const groups = [
                            { name: 'Translate', axes: ['X', 'Y', 'Z'], prop: 'translate', className: 'translate-input', unit: 'px' },
                            { name: 'Rotate', axes: ['X', 'Y', 'Z'], prop: 'rotate', className: 'rotate-input', unit: 'deg' },
                            { name: 'Scale', axes: ['X', 'Y', 'Z'], prop: 'scale', className: 'scale-input', unit: '' },
                            { name: 'Skew', axes: ['X', 'Y'], prop: 'skew', className: 'skew-input', unit: 'deg' }
                        ];

                        groups.forEach(group => {
                            const groupContainer = document.createElement('div');
                            groupContainer.className = 'css-transform-group';

                            const groupLabel = document.createElement('div');
                            groupLabel.className = 'css-transform-group-label';
                            groupLabel.textContent = group.name;
                            groupContainer.appendChild(groupLabel);

                            group.axes.forEach(axis => {
                                const container = document.createElement('div');
                                container.className = 'css-transform-input-container';

                                const axisLabel = document.createElement('label');
                                axisLabel.textContent = axis;

                                const sliderContainer = document.createElement('div');
                                sliderContainer.className = 'css-transform-slider-container';

                                const slider = document.createElement('input');
                                slider.type = 'range';
                                slider.className = `css-transform-slider ${group.className}`;

                                const valueDisplay = document.createElement('input');
                                valueDisplay.type = 'number';
                                valueDisplay.className = `css-transform-value ${group.className}`;

                                const props = control.transformProps?.[group.prop as TransformPropKey];
                                if (props && 'x' in props) {
                                    const axisKey = axis.toLowerCase() as keyof typeof props;
                                    const axisProps = props[axisKey];
                                    if ('min' in axisProps) {
                                        slider.min = axisProps.min.toString();
                                        valueDisplay.min = axisProps.min.toString();
                                    }
                                    if ('max' in axisProps) {
                                        slider.max = axisProps.max.toString();
                                        valueDisplay.max = axisProps.max.toString();
                                    }
                                    if ('step' in axisProps) {
                                        slider.step = axisProps.step?.toString() ?? '1';
                                        valueDisplay.step = axisProps.step?.toString() ?? '1';
                                    }
                                }

                                // Sync slider and number input
                                slider.addEventListener('input', () => {
                                    valueDisplay.value = slider.value;
                                    updateTransform();
                                });

                                valueDisplay.addEventListener('input', () => {
                                    slider.value = valueDisplay.value;
                                    updateTransform();
                                });

                                const unitLabel = document.createElement('span');
                                unitLabel.className = 'css-transform-unit';
                                unitLabel.textContent = group.unit;

                                container.appendChild(axisLabel);
                                sliderContainer.appendChild(slider);
                                sliderContainer.appendChild(valueDisplay);
                                if (group.unit) sliderContainer.appendChild(unitLabel);
                                container.appendChild(sliderContainer);
                                groupContainer.appendChild(container);
                            });

                            controlsContainer.appendChild(groupContainer);
                        });
                    }

                    transformControl.appendChild(header);
                    transformControl.appendChild(controlsContainer);
                    return transformControl;
                }

                default: {
                    const textInput = document.createElement('input');
                    textInput.type = 'text';
                    input = textInput;
                }
            }

            input.className = 'css-control-input';
            container.appendChild(input);

            // Add change handler
            input.addEventListener('change', (e) => {
                if (!selectedElement) return;
                const value = (e.target as HTMLInputElement | HTMLSelectElement).value;
                const finalValue = control.unit ? `${value}${control.unit}` : value;
                selectedElement.style.setProperty(control.property, finalValue);
            });

            return container;
        };

        const updateStyleControls = () => {
            if (!selectedElement) {
                stylePanel.innerHTML = '<p>No element selected</p>';
                return;
            }

            stylePanel.innerHTML = '';
            const styles = window.getComputedStyle(selectedElement);

            STYLE_GROUPS.forEach(group => {
                const groupContainer = document.createElement('details');
                groupContainer.className = 'css-group';
                // Open the first group by default
                groupContainer.open = group === STYLE_GROUPS[0];

                const summary = document.createElement('summary');
                summary.textContent = group.name;
                groupContainer.appendChild(summary);

                const controlsContainer = document.createElement('div');
                controlsContainer.className = 'css-group-controls';

                group.controls.forEach(control => {
                    const controlElement = createStyleControl(control);

                    if (control.type === 'compound-spacing') {
                        // Handle compound spacing controls
                        const sliders = controlElement.querySelectorAll('.css-slider-input');
                        const valueDisplays = controlElement.querySelectorAll('.css-value-display');
                        const unitSelect = controlElement.querySelector('.css-unit-select');

                        // Get the current unit from any direction (e.g., padding-top)
                        const sampleValue = styles.getPropertyValue(`${control.property}-top`);
                        const currentUnit = RegExp(/[a-z%]+$/).exec(sampleValue)?.[0] ?? 'px';
                        if (unitSelect) {
                            (unitSelect as HTMLSelectElement).value = currentUnit;
                        }

                        // Set initial values for each direction
                        control.properties?.forEach((prop, index) => {
                            if (prop === 'all') {
                                // Set "all" to the top value as default
                                const topValue = parseFloat(styles.getPropertyValue(`${control.property}-top`)) ?? 0;
                                (sliders[index] as HTMLInputElement).value = topValue.toString();
                                (valueDisplays[index] as HTMLInputElement).value = topValue.toString();
                            } else {
                                const value = parseFloat(styles.getPropertyValue(`${control.property}-${prop}`)) ?? 0;
                                (sliders[index] as HTMLInputElement).value = value.toString();
                                (valueDisplays[index] as HTMLInputElement).value = value.toString();
                            }
                        });
                    } else if (control.type === 'compound-border') {
                        // Handle compound border controls
                        const controls = controlElement.querySelectorAll('.css-border-side');

                        control.properties?.forEach((prop, index) => {
                            const container = controls[index];
                            const widthInput = container.querySelector('.css-border-width') as HTMLInputElement;
                            const styleSelect = container.querySelector('.css-border-style') as HTMLSelectElement;
                            const colorInput = container.querySelector('.css-border-color') as HTMLInputElement;

                            if (prop === 'all') {
                                // Get values from top border as default
                                const borderTop = styles.getPropertyValue('border-top');
                                const [width, style, color] = borderTop.split(' ');

                                widthInput.value = (parseFloat(width) || 0).toString();
                                styleSelect.value = style || 'none';
                                colorInput.value = color || '#000000';
                            } else {
                                const border = styles.getPropertyValue(`border-${prop}`);
                                const [width, style, color] = border.split(' ');

                                widthInput.value = (parseFloat(width) || 0).toString();
                                styleSelect.value = style || 'none';
                                colorInput.value = color || '#000000';
                            }
                        });
                    } else if (control.type === 'compound-shadow') {
                        // Handle shadow controls
                        const inputs = controlElement.querySelectorAll('.css-shadow-input input');
                        const colorInput = controlElement.querySelector('.css-shadow-color') as HTMLInputElement;
                        const insetToggle = controlElement.querySelector('.css-shadow-inset') as HTMLInputElement;

                        // Parse current box-shadow
                        const shadow = styles.getPropertyValue('box-shadow');
                        const [offsetX, offsetY, blur, spread, color] = shadow.split(' ');
                        const isInset = shadow.includes('inset');

                        // Set initial values
                        (inputs[0] as HTMLInputElement).value = (parseFloat(offsetX) || 0).toString();
                        (inputs[1] as HTMLInputElement).value = (parseFloat(offsetY) || 0).toString();
                        (inputs[2] as HTMLInputElement).value = (parseFloat(blur) || 0).toString();
                        (inputs[3] as HTMLInputElement).value = (parseFloat(spread) || 0).toString();
                        colorInput.value = color || '#000000';
                        insetToggle.checked = isInset;
                    } else if (control.type === 'filter') {
                        // Handle filter controls
                        const input = controlElement.querySelector('.css-filter-input input') as HTMLInputElement;
                        const currentFilters = styles.getPropertyValue('filter').split(' ');
                        const filterValue = currentFilters.find(f => f.startsWith(control.property));

                        if (filterValue) {
                            const value = parseFloat(RegExp(/\d+/).exec(filterValue)?.[0] ?? '0');
                            input.value = value.toString();
                        } else {
                            input.value = '0';
                        }
                    } else if (control.type === 'compound-transform') {
                        // Handle transform controls
                        const transformGroups = controlElement.querySelectorAll('.css-transform-group');
                        const transform = styles.getPropertyValue('transform');

                        // Parse current transform values
                        const translate = RegExp(/translate3d\((.*?)\)/).exec(transform)?.[1].split(',').map(parseFloat) || [0, 0, 0];
                        const rotate = RegExp(/rotate3d\((.*?)\)/).exec(transform)?.[1].split(',').map(parseFloat) || [0, 0, 0];
                        const scale = RegExp(/scale3d\((.*?)\)/).exec(transform)?.[1].split(',').map(parseFloat) || [1, 1, 1];
                        const skew = RegExp(/skew\((.*?)\)/).exec(transform)?.[1].split(',').map(parseFloat) || [0, 0];

                        // Update translate controls
                        const translateInputs = transformGroups[0].querySelectorAll('input');
                        translateInputs[0].value = translate[0].toString();
                        translateInputs[1].value = translate[1].toString();
                        translateInputs[2].value = translate[2].toString();

                        // Update rotate controls
                        const rotateInputs = transformGroups[1].querySelectorAll('input');
                        rotateInputs[0].value = rotate[0].toString();
                        rotateInputs[1].value = rotate[1].toString();
                        rotateInputs[2].value = rotate[2].toString();

                        // Update scale controls
                        const scaleInputs = transformGroups[2].querySelectorAll('input');
                        scaleInputs[0].value = scale[0].toString();
                        scaleInputs[1].value = scale[1].toString();
                        scaleInputs[2].value = scale[2].toString();

                        // Update skew controls
                        const skewInputs = transformGroups[3].querySelectorAll('input');
                        skewInputs[0].value = skew[0].toString();
                        skewInputs[1].value = skew[1].toString();
                    } else {
                        // Handle regular controls
                        const input = controlElement.querySelector('.css-control-input') as HTMLInputElement;
                        const currentValue = styles.getPropertyValue(control.property);

                        if (control.type === 'color') {
                            const rgb = currentValue.match(/\d+/g);
                            if (rgb) {
                                const hex = '#' + rgb.map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
                                input.value = hex;
                            }
                        } else {
                            input.value = currentValue.replace(control.unit ?? '', '');
                        }
                    }

                    controlsContainer.appendChild(controlElement);
                });

                groupContainer.appendChild(controlsContainer);
                stylePanel.appendChild(groupContainer);
            });
        };

        const updateElementInfo = () => {
            if (!selectedElement) {
                elementInfo.innerHTML = '<p>No element selected</p>';
                return;
            }

            const classes = Array.from(selectedElement.classList).join('.');
            const id = selectedElement.id ? `#${selectedElement.id}` : '';
            elementInfo.innerHTML = `
                <div>Selected: ${selectedElement.tagName.toLowerCase()}${id}${classes ? `.${classes}` : ''}</div>
            `;
        };

        // Element picker functionality
        pickerBtn.addEventListener('click', () => {
            isPicking = !isPicking;
            pickerBtn.classList.toggle('active', isPicking);
            document.body.style.cursor = isPicking ? 'crosshair' : '';
        });

        const handleMouseOver = (e: MouseEvent) => {
            if (!isPicking) return;
            e.preventDefault();
            e.stopPropagation();

            const target = e.target as HTMLElement;
            if (target === content || content.contains(target)) return;

            // Remove highlight from previous element
            document.querySelectorAll('.css-picker-highlight').forEach(el =>
                el.classList.remove('css-picker-highlight')
            );

            target.classList.add('css-picker-highlight');
        };

        const handleClick = (e: MouseEvent) => {
            if (!isPicking) return;
            e.preventDefault();
            e.stopPropagation();

            const target = e.target as HTMLElement;
            if (target === content || content.contains(target)) return;

            selectedElement = target;
            isPicking = false;
            pickerBtn.classList.remove('active');
            document.body.style.cursor = '';

            document.querySelectorAll('.css-picker-highlight').forEach(el =>
                el.classList.remove('css-picker-highlight')
            );

            updateElementInfo();
            updateStyleControls();
        };

        document.addEventListener('mouseover', handleMouseOver);
        document.addEventListener('click', handleClick, true);

        return {
            component: content,
            cleanup: () => {
                document.removeEventListener('mouseover', handleMouseOver);
                document.removeEventListener('click', handleClick, true);
            }
        };
    }
}; 