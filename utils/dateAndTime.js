export const isValidDate = (dateString) => {
    const date = new Date(dateString); 
    return date instanceof Date;
}

