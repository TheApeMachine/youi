import { loader } from "@/lib/loader";

/** Ref type for referencing HTML elements */
export type Ref = { current: HTMLElement | null };

/** Creates a new Ref */
export const createRef = (): Ref => ({ current: null });

/** Configuration interface for Component */
interface ComponentConfig<Props = any, LoaderData = any> {
    loader?: (props: Props) => Record<string, Promise<any>>;
    loading?: () => Promise<Node | JSX.Element>;
    error?: (error: any) => Promise<Node | JSX.Element>;
    effect?: (context: Props & { rootElement: HTMLElement; data?: LoaderData }) => void | (() => void);
    render: (props: Props) => Promise<Node | JSX.Element> | Node | JSX.Element;
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
        return (Component as ComponentCreator).create<Props>(
            async (props: Props): Promise<Node | JSX.Element> => {
                try {
                    if (config.loader) {
                        if (config.loading) {
                            return await config.loading();
                        }

                        const requests = config.loader(props);
                        const { state, results } = await loader(requests);

                        if (state === "error") {
                            throw results;
                        }

                        const propsWithData = {
                            ...props,
                            data: results as LoaderData
                        };

                        const result = await config.render(propsWithData);

                        const rootElement = result instanceof DocumentFragment
                            ? result.firstElementChild as HTMLElement
                            : result as HTMLElement;

                        if (config.effect && rootElement) {
                            const observer = new MutationObserver((_, obs) => {
                                if (rootElement.isConnected) {
                                    config.effect!({
                                        ...propsWithData,
                                        rootElement
                                    });
                                    obs.disconnect();
                                }
                            });

                            observer.observe(document.body, {
                                childList: true,
                                subtree: true
                            });
                        }

                        return result;
                    }

                    const result = await config.render(props);

                    const rootElement = result instanceof DocumentFragment
                        ? result.firstElementChild as HTMLElement
                        : result as HTMLElement;

                    if (config.effect && rootElement) {
                        const observer = new MutationObserver((_, obs) => {
                            if (rootElement.isConnected) {
                                config.effect!({
                                    ...props,
                                    rootElement
                                });
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
                        return await config.error(error);
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