export const graphqlConfig = {
    uri: 'http://localhost:8080/graphql',
    options: {
        method: 'POST',
        headers: {
            'Content-type': 'application/json',
            'Accept': 'application/json',
        }
    }
};
