import Location from "@/common/classes/Location.js";

export const color = {
    MAIN: '#457b9d',
    LIGHT: '#a8dadc',
    DARK: '#1d3557',
    BACKGROUND: '#f1faee',
    CONTRAST: '#e63946',
}

export const serviceType = {
    NONE: -1,
    HELP_DELIVER: 0,
    HELP_BUY: 1,
    OTHERS: 2,
}

export const defaultLocation = new Location({
    longitude: 116.347236349,
    latitdue: 39.981800698,
    name: "北京航空航天大学",
    address: "北京市海淀区学院路37号"
})

