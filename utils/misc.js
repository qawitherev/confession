const { STATUS_TIMESTAMPS_PAIRS } = require("./constants");

function getTimestampTypeForStatus(status) {
    return STATUS_TIMESTAMPS_PAIRS[status] || null;
}

module.exports = {
    getTimestampTypeForStatus
}