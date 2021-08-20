export default ({ children }) => {
    if (typeof children !== 'string') {
        throw new Error('Title component may only contain a string.');
    }
    document.title = children;
    return null;
};