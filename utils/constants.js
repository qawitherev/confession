const REACT_TYPES = ["Relate", "Not-Relate"]
const TIMESTAMP_TYPES = ['Publish', 'Reject', 'Delete'];
const STATUS = ['Pending', 'Published', 'Rejected', 'Deleted'];
const USER_TYPES = ['Admin', 'User'];

const STATUS_TIMESTAMPS_PAIRS = {
    'Published': 'Publish',
    'Rejected': 'Reject',
    'Deleted': 'Delete',
}


module.exports = {
    REACT_TYPES, 
    TIMESTAMP_TYPES, 
    STATUS, 
    USER_TYPES, 
    STATUS_TIMESTAMPS_PAIRS
}