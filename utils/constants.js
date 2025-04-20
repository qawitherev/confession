const REACT_TYPES = ["Relate", "Not-Relate"]
const TIMESTAMP_TYPES = ['Publish', 'Reject', 'Delete'];
const STATUS = ['Pending', 'Published', 'Rejected', 'Deleted'];
const USER_TYPES = ['Admin', 'User'];

const STATUS_TIMESTAMPS_PAIRS = {
    'Published': 'Publish',
    'Rejected': 'Reject',
    'Deleted': 'Delete',
}


const WINDOW_MINUTES = 15;
const LIMIT_GENERAL = 100; 
const LIMIT_AUTH = 5; 
const LIMIT_READ = 200; 
const LIMIT_WRITE = 30; 


export {
    REACT_TYPES, 
    TIMESTAMP_TYPES, 
    STATUS, 
    USER_TYPES, 
    STATUS_TIMESTAMPS_PAIRS, 
    WINDOW_MINUTES,
    LIMIT_GENERAL,  
    LIMIT_AUTH,
    LIMIT_READ,
    LIMIT_WRITE
}