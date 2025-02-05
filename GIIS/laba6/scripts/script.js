let endX;
let endY;
let debugging = true;
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    let isDrawing = false;
    let startX, startY;
    let currentShape = null;
    let fillColor = [0, 0, 0, 255];
    let isActive = "razv";
    let isFilling = false;

    const clearButton = document.getElementById("clear");
    clearButton.addEventListener("click", () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    });

    const drawCircleButton = document.getElementById("drawCircle");
    drawCircleButton.addEventListener("click", () => {
        isFilling = false;
        currentShape = "circle";
        canvas.style.cursor = "crosshair";
    });

    const drawSquareButton = document.getElementById("drawSquare");
    drawSquareButton.addEventListener("click", () => {
        isFilling = false;
        currentShape = "square";
        canvas.style.cursor = "crosshair";
    });

    const fillZatrButton = document.getElementById("fillZatr");
    fillZatrButton.addEventListener("click", () => {
        isFilling = true;
        isActive = "zatr";
    });

    const fillRazvButton = document.getElementById("fillRazv");
    fillRazvButton.addEventListener("click", () => {
        isFilling = true;
        isActive = "razv";
    });

    const fillColorPicker = document.getElementById("fillColorPicker");
    fillColorPicker.addEventListener("input", (e) => {
        const hexColor = e.target.value;
        fillColor = hexToRgb(hexColor);
    });

    canvas.addEventListener("mousedown", (e) => {
        startX = e.offsetX;
        startY = e.offsetY;
        if (!isFilling) {
            isDrawing = true;
        }
        if (isFilling) {
            const imageData = ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );
            const data = imageData.data;

            const clickedPixel = (startY * canvas.width + startX) * 4;
            const targetColor = [
                data[clickedPixel],
                data[clickedPixel + 1],
                data[clickedPixel + 2],
                data[clickedPixel + 3],
            ];

            console.log(isActive);

            if (isActive === "zatr") {
                if (arrayEquals(fillColor, targetColor)) return;
                fillArea(
                    startX,
                    startY,
                    targetColor,
                    fillColor,
                    data,
                    canvas.width,
                    canvas.height
                );
            } else
                fillAreaRazv(
                    startX,
                    startY,
                    targetColor,
                    fillColor,
                    data,
                    canvas.width,
                    canvas.height
                );
            if (!debugging) {
                ctx.putImageData(imageData, 0, 0);
            }
        }
    });

    canvas.addEventListener("mousemove", (e) => {
        if (!isDrawing) return;
        const currentX = e.offsetX;
        const currentY = e.offsetY;

        if (currentShape === "circle") {
            const radius = Math.sqrt(
                Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2)
            );
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (currentShape === "square") {
            const width = currentX - startX;
            const height = currentY - startY;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeRect(startX, startY, width, height);
        }
    });

    canvas.addEventListener("mouseup", (e) => {
        isDrawing = false;
        endX = e.offsetX;
        endY = e.offsetY;
        console.log(endX + " " + endY);

        if (currentShape === "circle") {
            const radius = Math.sqrt(
                Math.pow(e.offsetX - startX, 2) +
                    Math.pow(e.offsetY - startY, 2)
            );
            ctx.beginPath();
            ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
            ctx.stroke();
        } else if (currentShape === "square") {
            const width = e.offsetX - startX;
            const height = e.offsetY - startY;
            ctx.strokeRect(startX, startY, width, height);
        }
    });

    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return [r, g, b, 255];
    }

    function fillAreaRazv(x, y, targetColor, fillColor, data, width, height) {
        let baseColor = getColorAtPixel(startX, startY);
        let cX = startX;
        let cY = startY;
        let pC = getColorAtPixel(cX, cY);

        while (arrayEquals(pC, baseColor)) {
            cY--;
            pC = getColorAtPixel(cX, cY - 1);
        }

        const stack = [[cX, cY]];
        baseColor = getColorAtPixel(startX, startY);

        function getColorAtPixel(x, y) {
            const pixelIndex = (y * width + x) * 4;
            return [
                data[pixelIndex],
                data[pixelIndex + 1],
                data[pixelIndex + 2],
                data[pixelIndex + 3],
            ];
        }

        function setColorAtPixel(x, y) {
            const pixelIndex = (y * width + x) * 4;
            data[pixelIndex] = fillColor[0];
            data[pixelIndex + 1] = fillColor[1];
            data[pixelIndex + 2] = fillColor[2];
            data[pixelIndex + 3] = fillColor[3];
        }

        function arrayEquals(arr1, arr2) {
            return (
                arr1[0] === arr2[0] &&
                arr1[1] === arr2[1] &&
                arr1[2] === arr2[2] &&
                arr1[3] === arr2[3]
            );
        }

        while (stack.length) {
            const [currentX, currentY] = stack.pop();
            const pixelColor = getColorAtPixel(currentX, currentY);

            if (
                arrayEquals(pixelColor, baseColor) &&
                !arrayEquals(pixelColor, fillColor)
            ) {
                setColorAtPixel(currentX, currentY);
                debug(currentX, currentY, fillColor);

                if (currentY > 0) {
                    stack.push([currentX, currentY - 1]);
                }
                if (currentY < height - 1) {
                    stack.push([currentX, currentY + 1]);
                }
                if (currentX > 0) {
                    stack.push([currentX - 1, currentY]);
                }
                if (currentX < width - 1) {
                    stack.push([currentX + 1, currentY]);
                }
            }
        }
    }

    function debug(currentX, currentY, fillColor) {
        if (debugging) {
            setTimeout(() => {
                ctx.fillStyle = `rgba(${fillColor.join()})`;
                ctx.fillRect(currentX, currentY, 1, 1);
            }, 50);
        }
    }

    function fillArea(x, y, targetColor, fillColor, data, width, height) {
        const stack = [[x, y]];
        const baseColor = getColorAtPixel(x, y);

        function getColorAtPixel(x, y) {
            const pixelIndex = (y * width + x) * 4;
            return [
                data[pixelIndex],
                data[pixelIndex + 1],
                data[pixelIndex + 2],
                data[pixelIndex + 3],
            ];
        }

        function setColorAtPixel(x, y) {
            const pixelIndex = (y * width + x) * 4;
            data[pixelIndex] = fillColor[0];
            data[pixelIndex + 1] = fillColor[1];
            data[pixelIndex + 2] = fillColor[2];
            data[pixelIndex + 3] = fillColor[3];
        }

        function isColorMatch(color1, color2) {
            return (
                color1[0] === color2[0] &&
                color1[1] === color2[1] &&
                color1[2] === color2[2] &&
                color1[3] === color2[3]
            );
        }

        while (stack.length) {
            const [currentX, currentY] = stack.pop();

            if (
                currentX < 0 ||
                currentX >= width ||
                currentY < 0 ||
                currentY >= height
            )
                continue;

            const pixelColor = getColorAtPixel(currentX, currentY);
            if (
                isColorMatch(pixelColor, baseColor) &&
                !isColorMatch(pixelColor, fillColor)
            ) {
                debug(currentX, currentY, fillColor);
                setColorAtPixel(currentX, currentY);

                stack.push([currentX - 1, currentY]);
                stack.push([currentX + 1, currentY]);
                stack.push([currentX, currentY - 1]);
                stack.push([currentX, currentY + 1]);
            }
        }
    }

    function arrayEquals(a, b) {
        return (
            a.length === b.length &&
            a.every((value, index) => value === b[index])
        );
    }
});
