const base64Digits = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/"

const HexToBase64 = (hex: string) => {
    let base64 = ""
    let group: number
    for (let i = 0; i < 30; i += 6) {
        group = parseInt(hex.substring(i, i + 6), 16)
        base64 += base64Digits[(group >> 18) & 0x3f]
        base64 += base64Digits[(group >> 12) & 0x3f]
        base64 += base64Digits[(group >> 6) & 0x3f]
        base64 += base64Digits[group & 0x3f]
    }
    group = parseInt(hex.substring(30, 32), 16)
    base64 += base64Digits[(group >> 2) & 0x3f]
    base64 += base64Digits[(group << 4) & 0x3f]
    base64 += "=="
    return base64
}

export const ToBinary = (uuid: string) => {
    if (!uuid || typeof uuid !== "string") {
        throw new Error("Invalid UUID format")
    }

    let hex = uuid.replace(/[{}-]/g, "")
    if (hex.length !== 32) {
        throw new Error("Invalid UUID format after stripping characters")
    }

    try {
        return HexToBase64(hex)
    } catch (error: any) {
        console.error('Original UUID:', uuid);
        console.error('Hex:', hex);
        throw new Error("Failed to create BSON Binary from hex: " + error.message)
    }
}

export const FromBinary = (binary: any) => {
    // Handle Binary object with buffer
    if (binary?.buffer instanceof Uint8Array) {
        // Convert buffer to hex string without reordering
        const hex = Array.from(binary.buffer)
            .map((b: any) => b.toString(16).padStart(2, '0'))
            .join('');

        // Format as UUID
        return [
            hex.substring(0, 8),
            hex.substring(8, 12),
            hex.substring(12, 16),
            hex.substring(16, 20),
            hex.substring(20, 32)
        ].join('-');
    }

    return binary.toString();
}