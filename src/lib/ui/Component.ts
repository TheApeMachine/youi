import { loader } from "../loader";

/** Ref type for referencing HTML elements */
export type Ref = { current: HTMLElement | null };

/** Creates a new Ref */
export const createRef = (): Ref => ({ current: null });

/** Configuration interface for Component */
interface ComponentConfig<Props = any, LoaderData = any> {
    loader?: () => Record<string, Promise<any>>;
    loading?: () => Promise<Node | JSX.Element>;
    error?: (error: any) => Promise<Node | JSX.Element>;
    effect?: (props: Props & { data?: LoaderData }) => void;
    render: (props: Props & { data?: LoaderData }) => Promise<Node | JSX.Element> | Node | JSX.Element;
}

/** Creator interface for Component */
type ComponentCreator = {
    create: <Props>(
        render: (props: Props) => Promise<Node | JSX.Element> | Node | JSX.Element
    ) => (props: Props) => JSX.Element;
};

/** Component utility */
export const Component = Object.assign(
    <Props = any, LoaderData = Record<string, any>>(config: ComponentConfig<Props, LoaderData>) => {
        return (Component as ComponentCreator).create<Props & { data?: LoaderData }>(
            async (props: Props): Promise<Node | JSX.Element> => {
                try {
                    if (config.loader) {
                        if (config.loading) {
                            return await config.loading();
                        }

                        // Execute the loader function to get the requests
                        const requests = config.loader();
                        const { state, results } = await loader(requests);

                        if (state === "error") {
                            throw results;
                        }

                        const propsWithData = {
                            ...props,
                            data: results as LoaderData
                        };

                        const renderedElement = await config.render(propsWithData);

                        // Set up effect after render if needed
                        const rootElement = renderedElement instanceof DocumentFragment
                            ? renderedElement.firstElementChild as HTMLElement
                            : renderedElement as HTMLElement;

                        if (config.effect && rootElement) {
                            const observer = new MutationObserver((_, obs) => {
                                if (rootElement.isConnected) {
                                    config.effect!(propsWithData);
                                    obs.disconnect();
                                }
                            });

                            observer.observe(document.body, {
                                childList: true,
                                subtree: true
                            });
                        }

                        return renderedElement;
                    }

                    const propsWithoutData = { ...props, data: undefined };
                    const result = await config.render(propsWithoutData);

                    const rootElement = result instanceof DocumentFragment
                        ? result.firstElementChild as HTMLElement
                        : result as HTMLElement;

                    if (config.effect && rootElement) {
                        const observer = new MutationObserver((_, obs) => {
                            if (rootElement.isConnected) {
                                config.effect!(propsWithoutData);
                                obs.disconnect();
                            }
                        });

                        observer.observe(document.body, {
                            childList: true,
                            subtree: true
                        });
                    }

                    return result;
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ?
                        error.message :
                        'An unknown error occurred';

                    if (config.error) {
                        const errorElement = await config.error(error);
                        return errorElement;
                    } else {
                        return document.createTextNode(`Error: ${errorMessage}`);
                    }
                }
            }
        );
    },
    {
        create: <Props>(
            render: (props: Props) => Promise<Node | JSX.Element> | Node | JSX.Element
        ) => (props: Props): JSX.Element => {
            return render(props);
        }
    }
);