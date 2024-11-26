import { jsx } from "@/lib/template";
import { Component } from "@/lib/ui/Component";
import { OrgChartNode } from "./types";

interface NodeContentProps {
    data: OrgChartNode;
    width: number;
    height: number;
}

export const NodeContent = Component<NodeContentProps>({
    effect: ({ data, width, height }) => {
        const imageDiffVert = 25 + 2;
        const container = document.querySelector(
            ".node-container"
        ) as HTMLElement;
        const content = document.querySelector(
            ".content-container"
        ) as HTMLElement;
        const idContainer = document.querySelector(
            ".id-container"
        ) as HTMLElement;
        const imageContainer = document.querySelector(
            ".image-container"
        ) as HTMLElement;
        const nameContainer = document.querySelector(
            ".name-container"
        ) as HTMLElement;
        const positionContainer = document.querySelector(
            ".position-container"
        ) as HTMLElement;

        if (container) {
            Object.assign(container.style, {
                width: `${width}px`,
                height: `${height}px`,
                paddingTop: `${imageDiffVert - 2}px`,
                paddingLeft: "1px",
                paddingRight: "1px"
            });
        }

        if (content) {
            Object.assign(content.style, {
                fontFamily: "Inter, sans-serif",
                marginLeft: "-1px",
                width: `${width - 2}px`,
                height: `${height - imageDiffVert}px`,
                borderRadius: "10px",
                border:
                    data._highlighted || data._upToTheRootHighlighted
                        ? "5px solid #E27396"
                        : "1px solid #E4E2E9"
            });
        }

        if (idContainer) {
            Object.assign(idContainer.style, {
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "5px",
                marginRight: "8px"
            });
        }

        if (imageContainer) {
            Object.assign(imageContainer.style, {
                marginTop: `${-imageDiffVert - 20}px`,
                marginLeft: "15px",
                borderRadius: "100px",
                width: "50px",
                height: "50px"
            });
        }

        if (nameContainer) {
            Object.assign(nameContainer.style, {
                fontSize: "15px",
                color: "#08011E",
                marginLeft: "20px",
                marginTop: "10px"
            });
        }

        if (positionContainer) {
            Object.assign(positionContainer.style, {
                color: "#716E7B",
                marginLeft: "20px",
                marginTop: "3px",
                fontSize: "10px"
            });
        }
    },
    render: ({ data }) => (
        <div class="node-container">
            <div class="content-container">
                <div class="id-container">#{data.id}</div>
                <div class="image-container"></div>
                <div class="image-wrapper" style={{ marginTop: "-45px" }}>
                    <img src={data.image} />
                </div>
                <div class="name-container">{data.name}</div>
                <div class="position-container">{data.position}</div>
            </div>
        </div>
    )
});
