import { STATUS_TIMESTAMPS_PAIRS } from "./constants.js";

function getTimestampTypeForStatus(status) {
    return STATUS_TIMESTAMPS_PAIRS[status] || null;
}

export {
    getTimestampTypeForStatus
}